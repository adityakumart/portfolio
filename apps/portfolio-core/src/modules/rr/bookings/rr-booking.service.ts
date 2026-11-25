import { Filter, Document } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { IBooking, BookingStatus, ICustomerIntimation } from './rr-booking.model';
import { IVehicle } from '../vehicles/rr-vehicle.model';
import { BillingService } from '../customers/billing.service';
import { RRWhatsAppService } from '../whatsapp/rr-whatsapp.service';
import { safeRegex } from '../../../common/utils/security/regex.util';
import { IRRWhatsAppTemplateId } from '@portfolio/shared-types';

export class RRBookingService {
  /**
   * Sweeps and auto-closes advance reservations idle for > 2 hours past scheduled pickup time.
   */
  static async autoCloseIdleAdvanceBookings(): Promise<{
    closedCount: number;
    closedBookingIds: string[];
  }> {
    try {
      const bookingCol = await RRDb.getBookingsCol();
      const vehCol = await RRDb.getVehiclesCol();

      const twoHoursAgoMs = Date.now() - 2 * 60 * 60 * 1000;

      const reservedBookings = await bookingCol
        .find({
          status: 'reserved',
          isDeleted: { $ne: true },
        })
        .toArray();

      const overdueBookings = reservedBookings.filter((b) => {
        if (!b.pickupDateTime) return false;
        const pickupMs = new Date(b.pickupDateTime).getTime();
        return !isNaN(pickupMs) && pickupMs < twoHoursAgoMs;
      });

      if (overdueBookings.length === 0) {
        return { closedCount: 0, closedBookingIds: [] };
      }

      const closedBookingIds: string[] = [];
      const nowIso = new Date().toISOString();

      for (const booking of overdueBookings) {
        await bookingCol.updateOne(
          { id: booking.id },
          {
            $set: {
              status: 'cancelled',
              isDeleted: true,
              isClosed: true,
              autoClosed: true,
              autoClosedAt: nowIso,
              closedAt: nowIso,
              closedBy: 'system',
              closedByName: 'Automated System Sweeper',
              closedByRole: 'system',
              closeReason:
                'Auto-closed: Inactivity for more than 2 hours after scheduled booking date and time',
              deletedAt: nowIso,
              deletedBy: 'system',
              deletedByName: 'Automated System Sweeper',
              deletedByRole: 'system',
              deletionReason:
                'Auto-closed: Inactivity for more than 2 hours after scheduled booking date and time',
              isAdvanceReturned: false,
              updatedAt: nowIso,
            },
          },
        );

        if (booking.vehicleRegNo) {
          const veh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
          if (veh && (veh.bookingId === booking.id || veh.status === 'reserved')) {
            await vehCol.updateOne(
              { regNo: booking.vehicleRegNo },
              {
                $set: {
                  status: 'available',
                  bookingId: null,
                  updatedAt: nowIso,
                },
              },
            );
          }
        }

        closedBookingIds.push(booking.id);

        await RRLogService.logActivity(
          `Auto-closed idle advance booking ${booking.id}`,
          'system',
          'system',
          `Advance booking ${booking.id} for vehicle ${booking.vehicleRegNo} was automatically closed due to 2+ hours idle past scheduled pickup (${booking.pickupDateTime}). Customer: ${booking.renterFirstName} ${booking.renterSecondName} (${booking.renterPhone}) | Advance Paid: ₹${booking.amountPaid || '0'}.`,
        );
      }

      return { closedCount: closedBookingIds.length, closedBookingIds };
    } catch (err) {
      console.error(
        '[RRBookingService.autoCloseIdleAdvanceBookings] Error running auto-close sweep:',
        err,
      );
      return { closedCount: 0, closedBookingIds: [] };
    }
  }

  /**
   * Retrieves bookings matching query filters with role-based scoping and pagination.
   */
  static async getBookings(
    queryOptions: {
      status?: string;
      vehicle?: string;
      customer?: string;
      from?: string;
      to?: string;
      search?: string;
      page?: string | number;
      limit?: string | number;
      paginate?: string | boolean;
      all?: string | boolean;
      includeDeleted?: string | boolean;
      history?: string | boolean;
    },
    userId?: string,
    userRole?: string,
  ): Promise<
    | IBooking[]
    | {
        bookings: IBooking[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
  > {
    const statusParam = queryOptions.status;
    if (
      !statusParam ||
      (typeof statusParam === 'string' &&
        (statusParam.includes('reserved') || statusParam.includes('cancelled')))
    ) {
      await this.autoCloseIdleAdvanceBookings().catch((err) =>
        console.error('[AutoCloseSweep] Failed to auto-close idle advance bookings:', err),
      );
    }

    const col = await RRDb.getBookingsCol();
    const andConditions: Filter<IBooking>[] = [];

    const hasCancelledStatus =
      typeof statusParam === 'string' && statusParam.includes('cancelled');
    if (queryOptions.includeDeleted !== 'true' && !hasCancelledStatus) {
      andConditions.push({ isDeleted: { $ne: true } });
    }

    if (statusParam && typeof statusParam === 'string' && statusParam.trim()) {
      const statuses = statusParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as BookingStatus[];
      if (statuses.length === 1) {
        andConditions.push({ status: statuses[0] });
      } else if (statuses.length > 1) {
        andConditions.push({ status: { $in: statuses } });
      }
    }

    if (queryOptions.vehicle && typeof queryOptions.vehicle === 'string' && queryOptions.vehicle.trim()) {
      const vRegex = safeRegex(queryOptions.vehicle.trim(), 'i');
      andConditions.push({
        $or: [
          { vehicleRegNo: { $regex: vRegex } },
          { vehicleName: { $regex: vRegex } },
          { vehicleManufacturer: { $regex: vRegex } },
        ],
      });
    }

    if (queryOptions.customer && typeof queryOptions.customer === 'string' && queryOptions.customer.trim()) {
      const cRegex = safeRegex(queryOptions.customer.trim(), 'i');
      andConditions.push({
        $or: [
          { renterFirstName: { $regex: cRegex } },
          { renterSecondName: { $regex: cRegex } },
          { renterPhone: { $regex: cRegex } },
          { renterEmail: { $regex: cRegex } },
        ],
      });
    }

    if (queryOptions.from || queryOptions.to) {
      const dateOrClauses: Filter<IBooking>[] = [];
      const fromStr = queryOptions.from && queryOptions.from.trim() ? queryOptions.from.trim() : null;
      const toStr = queryOptions.to && queryOptions.to.trim() ? queryOptions.to.trim() : null;

      const createdCond: Record<string, string> = {};
      if (fromStr) createdCond['$gte'] = `${fromStr}T00:00:00.000Z`;
      if (toStr) createdCond['$lte'] = `${toStr}T23:59:59.999Z`;
      dateOrClauses.push({ createdAt: createdCond as unknown as string });

      const pickupCond: Record<string, string> = {};
      if (fromStr) pickupCond['$gte'] = fromStr;
      if (toStr) pickupCond['$lte'] = `${toStr}T23:59:59.999Z`;
      dateOrClauses.push({ pickupDateTime: pickupCond as unknown as string });

      andConditions.push({ $or: dateOrClauses });
    }

    if (queryOptions.search && typeof queryOptions.search === 'string' && queryOptions.search.trim()) {
      const sRegex = safeRegex(queryOptions.search.trim(), 'i');
      andConditions.push({
        $or: [
          { id: { $regex: sRegex } },
          { vehicleRegNo: { $regex: sRegex } },
          { vehicleName: { $regex: sRegex } },
          { renterFirstName: { $regex: sRegex } },
          { renterSecondName: { $regex: sRegex } },
          { renterPhone: { $regex: sRegex } },
          { renterEmail: { $regex: sRegex } },
        ],
      });
    }

    if (userRole !== 'admin') {
      const statusStr = typeof statusParam === 'string' ? statusParam : '';
      const isHistoryFilter =
        (statusStr && (statusStr.includes('completed') || statusStr.includes('cancelled'))) ||
        queryOptions.history === 'true';
      if (isHistoryFilter) {
        andConditions.push({
          $or: [{ bookedBy: userId }, { endedBy: userId }],
        });
      } else {
        andConditions.push({
          $or: [
            { status: { $nin: ['completed', 'cancelled'] } },
            { bookedBy: userId },
            { endedBy: userId },
          ],
        });
      }
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};
    const isPaginated =
      queryOptions.paginate === 'true' ||
      queryOptions.page !== undefined ||
      queryOptions.limit !== undefined;

    if (!isPaginated || queryOptions.all === 'true') {
      return await col
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(1000)
        .toArray();
    }

    const pageNum = Math.max(1, Number(queryOptions.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(queryOptions.limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      col.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limitNum).toArray(),
      col.countDocuments(query),
    ]);

    return {
      bookings,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Fetches single booking by ID.
   */
  static async getBookingById(bookingId: string): Promise<IBooking | null> {
    const col = await RRDb.getBookingsCol();
    return await col.findOne({ id: bookingId });
  }

  /**
   * Creates a rental booking or advance reservation with schedule conflict checks.
   */
  static async createBooking(
    bookingData: Omit<IBooking, 'id' | 'createdAt'>,
    userId = 'RRA001',
    userRole = 'employee',
    clientBaseUrl?: string,
  ): Promise<IBooking> {
    const bookingCol = await RRDb.getBookingsCol();
    const vehCol = await RRDb.getVehiclesCol();
    const empCol = await RRDb.getEmployeesCol();

    const selectedVehicle = await vehCol.findOne({
      regNo: bookingData.vehicleRegNo,
      isDeleted: { $ne: true },
    });
    if (!selectedVehicle) {
      throw new Error('Vehicle not found or no longer active');
    }

    const isAdvanceReservation = bookingData.status === 'reserved';

    if (userRole === 'employee' && bookingData.pickupDateTime) {
      const pickupTime = new Date(bookingData.pickupDateTime).getTime();
      const nowBuffer = Date.now() - 5 * 60 * 1000;
      if (!isNaN(pickupTime) && pickupTime < nowBuffer) {
        throw new Error(
          'Backdated bookings are allowed for Manager and Admin roles only. Employees cannot select dates in the past.',
        );
      }
    }

    if (isAdvanceReservation) {
      if (!bookingData.pickupDateTime || !bookingData.returnDateTime) {
        throw new Error('Pickup and return schedule are required for reservations.');
      }
      const reqStart = new Date(bookingData.pickupDateTime).getTime();
      const reqEnd = new Date(bookingData.returnDateTime).getTime();

      if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
        throw new Error('Return date & time must be after pickup date & time.');
      }

      const activeBooking = await bookingCol.findOne({
        vehicleRegNo: bookingData.vehicleRegNo,
        status: 'active',
        isDeleted: { $ne: true },
      });
      if (activeBooking && activeBooking.returnDateTime) {
        const activeEnd = new Date(activeBooking.returnDateTime).getTime();
        if (reqStart < activeEnd) {
          throw new Error(
            `Vehicle currently has an active rental until ${activeBooking.returnDateTime}. Reservation pickup must be after current active rental return.`,
          );
        }
      }

      const existingReservations = await bookingCol
        .find({
          vehicleRegNo: bookingData.vehicleRegNo,
          status: 'reserved',
          isDeleted: { $ne: true },
        })
        .toArray();

      for (const resv of existingReservations) {
        const rStart = new Date(resv.pickupDateTime).getTime();
        const rEnd = new Date(resv.returnDateTime).getTime();
        if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
          throw new Error(
            `Reservation dates overlap with an existing advance booking (${resv.pickupDateTime} to ${resv.returnDateTime}).`,
          );
        }
      }

      const targetAvailDate = selectedVehicle.availableBy || selectedVehicle.nextAvailableDate;
      if (['maintenance', 'contract', 'in_contract'].includes(selectedVehicle.status) && targetAvailDate) {
        const nextAvail = new Date(targetAvailDate).getTime();
        if (!isNaN(nextAvail) && reqStart < nextAvail) {
          throw new Error(
            `Vehicle is currently in ${selectedVehicle.status} and next available on ${targetAvailDate}. Reservation pickup must be on or after next available date.`,
          );
        }
      }
    } else {
      if (['in_booking', 'rented', 'contract'].includes(selectedVehicle.status)) {
        throw new Error('Vehicle is already booked/rented.');
      }

      if (bookingData.pickupDateTime && bookingData.returnDateTime) {
        const reqStart = new Date(bookingData.pickupDateTime).getTime();
        const reqEnd = new Date(bookingData.returnDateTime).getTime();

        if (!isNaN(reqStart) && !isNaN(reqEnd) && reqEnd > reqStart) {
          const existingReservations = await bookingCol
            .find({
              vehicleRegNo: bookingData.vehicleRegNo,
              status: 'reserved',
              isDeleted: { $ne: true },
            })
            .toArray();

          for (const resv of existingReservations) {
            const rStart = new Date(resv.pickupDateTime).getTime();
            const rEnd = new Date(resv.returnDateTime).getTime();
            if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
              throw new Error(
                `Rental schedule overlaps with an existing advance booking (${resv.pickupDateTime} to ${resv.returnDateTime}).`,
              );
            }
          }
        }
      }
    }

    const count = await bookingCol.countDocuments();
    const bookingId = 'RRB' + String(count + 1).padStart(3, '0');

    const staff = await empCol.findOne({ id: userId });
    const staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : userId;
    const staffRole = userRole || staff?.role || 'employee';

    const newBooking: IBooking = {
      ...bookingData,
      id: bookingId,
      status: isAdvanceReservation ? 'reserved' : bookingData.status || 'active',
      bookedBy: userId,
      bookedByName: staffName,
      bookedByRole: staffRole,
      createdAt: new Date().toISOString(),
    };

    await bookingCol.insertOne(newBooking);

    if (newBooking.renterPhone) {
      BillingService.recordCustomerBooking(newBooking.renterPhone).catch((err: unknown) => {
        console.warn('Could not update customer booking count:', (err as Error).message);
      });
    }

    if (!isAdvanceReservation) {
      await vehCol.updateOne(
        { regNo: bookingData.vehicleRegNo },
        {
          $set: {
            status: 'in_booking',
            bookingId: bookingId || null,
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }

    const notificationType: IRRWhatsAppTemplateId = isAdvanceReservation
      ? 'reserve_booking'
      : 'new_booking';
    RRWhatsAppService.getConfig()
      .then((waConfig) => {
        const shouldSend = isAdvanceReservation
          ? waConfig.generalSettings.sendAutomaticReserveConfirmation
          : waConfig.generalSettings.sendAutomaticNewBooking;

        if (shouldSend) {
          RRWhatsAppService.sendBookingNotification(bookingId, notificationType, {
            isAutomated: true,
            sentBy: userId,
            sentByName: staffName,
            sentByRole: staffRole,
            baseUrl: clientBaseUrl,
          }).catch((waErr) =>
            console.error(
              `[WhatsApp] Failed to dispatch ${notificationType} for ${bookingId}:`,
              waErr,
            ),
          );
        }
      })
      .catch((cfgErr) => console.error('[WhatsApp] Failed to load config:', cfgErr));

    RRLogService.logActivity(
      isAdvanceReservation ? `Created advance booking ${bookingId}` : `Started booking ${bookingId}`,
      userId,
      userRole,
      isAdvanceReservation
        ? `Advance booking created (${bookingId}) for ${newBooking.renterFirstName} ${newBooking.renterSecondName} (${newBooking.renterPhone}) | Vehicle: ${newBooking.vehicleRegNo} | Schedule: ${newBooking.pickupDateTime} to ${newBooking.returnDateTime} | Advance Paid: ₹${newBooking.amountPaid || '0'}`
        : `Booking started for customer ${newBooking.renterFirstName} ${newBooking.renterSecondName} (${newBooking.renterPhone}) | Vehicle: ${newBooking.vehicleRegNo} (${selectedVehicle.manufacturer} ${selectedVehicle.name}) | Pickup: ${newBooking.pickupDateTime} | Return: ${newBooking.returnDateTime} | Total: ₹${newBooking.finalRentalAmount}`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log booking start:', logErr));

    return newBooking;
  }

  /**
   * Soft-deletes a booking and releases the vehicle back to inventory.
   */
  static async deleteBooking(
    bookingId: string,
    body: {
      deletionReason?: string;
      reasonForDeletion?: string;
      returnAmount?: string | number;
      returnAmountMode?: string;
    },
    userId = 'admin',
    userRole = 'admin',
  ): Promise<{ message: string }> {
    const bookingCol = await RRDb.getBookingsCol();
    const vehCol = await RRDb.getVehiclesCol();
    const empCol = await RRDb.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found');
    }

    const deletionReason = body.deletionReason || body.reasonForDeletion || null;
    const returnAmount = body.returnAmount !== undefined ? String(body.returnAmount) : null;
    const returnAmountMode = body.returnAmountMode || null;

    const hasDeletionDetails = Boolean(deletionReason && returnAmountMode);
    if (booking.status !== 'reserved' && userRole !== 'admin' && !hasDeletionDetails) {
      throw new Error(
        'Only administrators can delete active or completed rental agreements without deletion details.',
      );
    }

    let deleterName = 'Administrator';
    let deleterRole = userRole || 'admin';
    if (userId && userId !== 'admin') {
      const emp = await empCol.findOne({ id: userId });
      if (emp) {
        deleterName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || deleterName;
        deleterRole = emp.role || deleterRole;
      }
    }

    await bookingCol.updateOne(
      { id: bookingId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: userId,
          deletedByName: deleterName,
          deletedByRole: deleterRole,
          status: 'cancelled',
          deletionReason,
          returnAmount,
          returnAmountMode,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (booking.vehicleRegNo) {
      const veh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
      if (
        veh &&
        (veh.bookingId === bookingId ||
          veh.status === 'in_booking' ||
          veh.status === 'reserved')
      ) {
        await vehCol.updateOne(
          { regNo: booking.vehicleRegNo },
          {
            $set: {
              status: 'available',
              bookingId: null,
              updatedAt: new Date().toISOString(),
            },
          },
        );
      }
    }

    const auditDetail = [
      `Booking ${bookingId} deleted.`,
      deletionReason ? `Reason: "${deletionReason}".` : '',
      returnAmount !== null ? `Refund: ₹${returnAmount} via ${returnAmountMode || 'N/A'}.` : '',
      `Customer: ${booking.renterFirstName} ${booking.renterSecondName} | Vehicle: ${booking.vehicleRegNo}`,
    ]
      .filter(Boolean)
      .join(' ');

    RRLogService.logActivity(
      `Deleted active booking ${bookingId}`,
      userId,
      deleterRole,
      auditDetail,
    ).catch((logErr) => console.error('[AuditLog] Failed to log booking delete:', logErr));

    return { message: `Booking ${bookingId} deleted successfully.` };
  }

  /**
   * Manually closes an advance reservation with checkbook/refund tracking.
   */
  static async closeAdvanceBooking(
    bookingId: string,
    body: {
      closeReason?: string;
      isAdvanceReturned?: boolean | string;
      advanceReturnAmount?: string | number;
      advanceReturnMode?: string;
    },
    userId = 'admin',
    userRole = 'admin',
  ): Promise<IBooking> {
    const bookingCol = await RRDb.getBookingsCol();
    const vehCol = await RRDb.getVehiclesCol();
    const empCol = await RRDb.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found or has already been closed/deleted');
    }

    if (booking.status !== 'reserved') {
      throw new Error(
        'Only advance reservations in reserved status can be closed via this action.',
      );
    }

    const closeReason = body.closeReason || 'Customer requested cancellation';
    const isAdvanceReturned =
      body.isAdvanceReturned === true || body.isAdvanceReturned === 'true';
    const advanceReturnAmount = isAdvanceReturned
      ? String(body.advanceReturnAmount ?? booking.amountPaid ?? '0')
      : '0';
    const advanceReturnMode = isAdvanceReturned
      ? body.advanceReturnMode || 'Original method'
      : null;

    let closerName = 'Administrator';
    let closerRole = userRole || 'admin';
    if (userId && userId !== 'admin') {
      const emp = await empCol.findOne({ id: userId });
      if (emp) {
        closerName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || closerName;
        closerRole = emp.role || closerRole;
      }
    }

    await bookingCol.updateOne(
      { id: bookingId },
      {
        $set: {
          isDeleted: true,
          status: 'cancelled',
          isClosed: true,
          closedAt: new Date().toISOString(),
          closedBy: userId,
          closedByName: closerName,
          closedByRole: closerRole,
          closeReason,
          deletedAt: new Date().toISOString(),
          deletedBy: userId,
          deletedByName: closerName,
          deletedByRole: closerRole,
          deletionReason: closeReason,
          isAdvanceReturned,
          advanceReturnAmount,
          advanceReturnMode,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    if (booking.vehicleRegNo) {
      const veh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
      if (veh && (veh.bookingId === bookingId || veh.status === 'reserved')) {
        await vehCol.updateOne(
          { regNo: booking.vehicleRegNo },
          {
            $set: {
              status: 'available',
              bookingId: null,
              updatedAt: new Date().toISOString(),
            },
          },
        );
      }
    }

    const updated = (await bookingCol.findOne({ id: bookingId }))!;

    const refundText = isAdvanceReturned
      ? `Advance refunded: ₹${advanceReturnAmount} via ${advanceReturnMode}.`
      : 'Advance retained / not refunded.';

    RRLogService.logActivity(
      `Closed advance booking ${bookingId}`,
      userId,
      closerRole,
      `Advance reservation ${bookingId} for vehicle ${booking.vehicleRegNo} was closed. Reason: "${closeReason}". ${refundText} Customer: ${booking.renterFirstName} ${booking.renterSecondName} (${booking.renterPhone})`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log advance booking close:', logErr));

    return updated;
  }

  /**
   * Updates an existing booking, recalculating charges and releasing vehicles upon completion.
   */
  static async updateBooking(
    bookingId: string,
    updateData: Record<string, unknown>,
    userId = 'RRA001',
    userRole = 'employee',
    clientBaseUrl?: string,
  ): Promise<IBooking> {
    const bookingCol = await RRDb.getBookingsCol();
    const vehCol = await RRDb.getVehiclesCol();
    const empCol = await RRDb.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found or has been deleted');
    }

    delete updateData['_id'];
    delete updateData['id'];
    delete updateData['createdAt'];

    if (userRole === 'employee' && updateData['pickupDateTime']) {
      const newPickupTime = new Date(updateData['pickupDateTime'] as string).getTime();
      const existingPickupTime = booking.pickupDateTime
        ? new Date(booking.pickupDateTime).getTime()
        : 0;
      if (newPickupTime !== existingPickupTime) {
        const nowBuffer = Date.now() - 5 * 60 * 1000;
        if (!isNaN(newPickupTime) && newPickupTime < nowBuffer) {
          throw new Error(
            'Backdated bookings are allowed for Manager and Admin roles only. Employees cannot select dates in the past.',
          );
        }
      }
    }

    if (
      updateData['status'] === 'active' ||
      (booking.status === 'active' &&
        (updateData['pickupDateTime'] || updateData['returnDateTime']))
    ) {
      const pTime = (updateData['pickupDateTime'] || booking.pickupDateTime) as string;
      const rTime = (updateData['returnDateTime'] || booking.returnDateTime) as string;
      const vehReg = (updateData['vehicleRegNo'] || booking.vehicleRegNo) as string;

      if (pTime && rTime && vehReg) {
        const reqStart = new Date(pTime).getTime();
        const reqEnd = new Date(rTime).getTime();

        if (!isNaN(reqStart) && !isNaN(reqEnd) && reqEnd > reqStart) {
          const otherReservations = await bookingCol
            .find({
              vehicleRegNo: vehReg,
              id: { $ne: bookingId },
              status: 'reserved',
              isDeleted: { $ne: true },
            })
            .toArray();

          for (const resv of otherReservations) {
            const rStart = new Date(resv.pickupDateTime).getTime();
            const rEnd = new Date(resv.returnDateTime).getTime();
            if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
              throw new Error(
                `Schedule overlaps with an existing advance booking (${resv.pickupDateTime} to ${resv.returnDateTime}).`,
              );
            }
          }
        }
      }
    }

    const isClosing = updateData['status'] === 'completed' || updateData['status'] === 'cancelled';
    let enderName: string | undefined = undefined;
    let enderRole: string | undefined = undefined;
    if (isClosing) {
      const staff = await empCol.findOne({ id: userId });
      enderName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : userId;
      enderRole = userRole || staff?.role || 'employee';
    }

    const setDoc: Record<string, unknown> = { ...updateData };
    if (isClosing) {
      setDoc['endedAt'] = updateData['endedAt'] || new Date().toISOString();
      setDoc['endedBy'] = userId;
      setDoc['endedByName'] = enderName;
      setDoc['endedByRole'] = enderRole;
    }

    await bookingCol.updateOne({ id: bookingId }, { $set: setDoc });

    if (updateData['status'] === 'completed') {
      const vehicleUpdateDoc: Partial<IVehicle> = {
        status: 'available',
        bookingId: null,
        updatedAt: new Date().toISOString(),
      };

      const finalOdo = updateData['vehicleOdometerEnd'] || booking.vehicleOdometerEnd;
      if (finalOdo !== undefined && finalOdo !== null && String(finalOdo).trim() !== '') {
        vehicleUpdateDoc.odometer = String(finalOdo);
      }

      await vehCol.updateOne({ regNo: booking.vehicleRegNo }, { $set: vehicleUpdateDoc });
    } else if (updateData['status'] === 'cancelled') {
      const curVeh = await vehCol.findOne({ regNo: booking.vehicleRegNo });
      if (curVeh && curVeh.bookingId === bookingId) {
        await vehCol.updateOne(
          { regNo: booking.vehicleRegNo },
          {
            $set: {
              status: 'available',
              bookingId: null,
              updatedAt: new Date().toISOString(),
            },
          },
        );
      }
    } else if (booking.status === 'reserved' && updateData['status'] === 'active') {
      await vehCol.updateOne(
        { regNo: booking.vehicleRegNo },
        {
          $set: {
            status: 'in_booking',
            bookingId: bookingId || null,
            updatedAt: new Date().toISOString(),
          },
        },
      );
    }

    const updated = (await bookingCol.findOne({ id: bookingId }))!;

    if (updateData['status'] === 'completed') {
      const damagesNote =
        Number(updateData['damagesTotal'] || 0) > 0
          ? ` | Damages: ₹${updateData['damagesTotal']}`
          : '';
      const fineNote =
        Number(updateData['nonIntimationFine'] || 0) > 0
          ? ` | Late/Non-intimation Fine: ₹${updateData['nonIntimationFine']}`
          : '';
      const odoNote = updateData['vehicleOdometerEnd']
        ? ` | Final Odo: ${updateData['vehicleOdometerEnd']} km`
        : '';

      RRWhatsAppService.getConfig()
        .then((waConfig) => {
          if (waConfig.generalSettings.sendAutomaticEndBookingInvoice) {
            RRWhatsAppService.sendBookingNotification(bookingId, 'end_booking_invoice', {
              isAutomated: true,
              sentBy: userId,
              sentByName: userRole || 'Staff',
              baseUrl: clientBaseUrl,
            }).catch((waErr) =>
              console.error(
                `[WhatsApp] Failed to dispatch end booking invoice for ${bookingId}:`,
                waErr,
              ),
            );
          }
        })
        .catch((cfgErr) => console.error('[WhatsApp] Failed to load config:', cfgErr));

      RRLogService.logActivity(
        `Ended booking ${bookingId}`,
        userId,
        userRole,
        `Booking completed for vehicle ${booking.vehicleRegNo}${odoNote} | Final Settlement: ₹${updateData['finalRentalAmount'] || booking.finalRentalAmount} | Paid: ₹${updateData['amountPaid'] || booking.amountPaid}${damagesNote}${fineNote}`,
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking completion:', logErr));
    } else if (updateData['status'] === 'cancelled') {
      RRLogService.logActivity(
        `Cancelled booking ${bookingId}`,
        userId,
        userRole,
        `Booking cancelled for vehicle ${booking.vehicleRegNo}. Customer: ${booking.renterFirstName} ${booking.renterSecondName}`,
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking cancellation:', logErr));
    } else {
      const modifiedFields = [
        updateData['returnDateTime'] && updateData['returnDateTime'] !== booking.returnDateTime
          ? `Return: ${updateData['returnDateTime']}`
          : null,
        updateData['durationDays'] !== undefined ? `Days: ${updateData['durationDays']}` : null,
        updateData['durationHours'] !== undefined ? `Hours: ${updateData['durationHours']}` : null,
        updateData['finalRentalAmount'] !== undefined
          ? `Final: ₹${updateData['finalRentalAmount']}`
          : null,
        updateData['amountPaid'] !== undefined ? `Paid: ₹${updateData['amountPaid']}` : null,
        updateData['pendingAmount'] !== undefined
          ? `Pending: ₹${updateData['pendingAmount']}`
          : null,
        updateData['totalKmLimit'] !== undefined
          ? `Limit: ${updateData['totalKmLimit']} km`
          : null,
      ]
        .filter(Boolean)
        .join(', ');

      RRLogService.logActivity(
        `Modified booking ${bookingId}`,
        userId,
        userRole,
        `Booking modified for vehicle ${booking.vehicleRegNo}: [${modifiedFields || 'Details updated'}]`,
      ).catch((logErr) => console.error('[AuditLog] Failed to log booking modification:', logErr));
    }

    return updated;
  }

  /**
   * Records a customer intimation (reason, expected return date) on an active rental agreement.
   */
  static async recordCustomerIntimation(
    bookingId: string,
    body: {
      intimationType: string;
      notes: string;
      expectedReturnDateTime?: string;
    },
    userId = 'STAFF',
    userRole = 'employee',
  ): Promise<{ intimation: ICustomerIntimation; booking: IBooking }> {
    const { intimationType, notes, expectedReturnDateTime } = body;

    if (!intimationType || !notes) {
      throw new Error('intimationType and notes are required.');
    }

    const bookingCol = await RRDb.getBookingsCol();
    const empCol = await RRDb.getEmployeesCol();

    const booking = await bookingCol.findOne({ id: bookingId });
    if (!booking || booking.isDeleted) {
      throw new Error('Booking not found or has been deleted');
    }

    const staff = await empCol.findOne({ id: userId });
    const staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : userId;

    const intimationRecord: ICustomerIntimation = {
      id: 'INT-' + Date.now(),
      intimationType,
      notes,
      expectedReturnDateTime: expectedReturnDateTime || undefined,
      recordedBy: userId,
      recordedByName: staffName,
      recordedByRole: userRole,
      recordedAt: new Date().toISOString(),
    };

    const updateDoc: Record<string, unknown> = {
      $push: { intimations: intimationRecord },
      $set: {
        lastIntimation: intimationRecord,
        updatedAt: new Date().toISOString(),
      },
    };

    if (expectedReturnDateTime) {
      (updateDoc['$set'] as Record<string, unknown>)['returnDateTime'] = expectedReturnDateTime;
    }

    await bookingCol.updateOne({ id: bookingId }, updateDoc);
    const updated = (await bookingCol.findOne({ id: bookingId }))!;

    const logDetails = `Booking ${bookingId} (${booking.vehicleRegNo}) | Customer: ${booking.renterFirstName} ${booking.renterSecondName} (${booking.renterPhone}) | Reason: ${intimationType.toUpperCase()} | Note: "${notes}"${expectedReturnDateTime ? ` | New Expected Return: ${expectedReturnDateTime}` : ''}`;
    RRLogService.logActivity(
      `Customer Intimation: ${bookingId}`,
      userId,
      userRole,
      logDetails,
    ).catch((logErr) => console.error('[AuditLog] Failed to log customer intimation:', logErr));

    return { intimation: intimationRecord, booking: updated };
  }
}
