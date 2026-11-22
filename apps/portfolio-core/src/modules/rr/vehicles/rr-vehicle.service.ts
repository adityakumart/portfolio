import { Filter, Document } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { IVehicle } from './rr-vehicle.model';
import { BookingStatus } from '../bookings/rr-booking.model';
import { safeRegex, escapeRegex } from '../../../common/utils/security/regex.util';

export class RRVehicleService {
  /**
   * Fetches list of vehicles with filtering and optional autocomplete projection.
   */
  static async getVehicles(options: {
    search?: string;
    limit?: string | number;
    autocomplete?: string | boolean;
    fields?: string;
    includeDeleted?: string | boolean;
  }): Promise<IVehicle[] | Array<Record<string, unknown>>> {
    const col = await RRDb.getVehiclesCol();
    const filter: Filter<IVehicle> = {};

    if (options.includeDeleted !== 'true' && options.includeDeleted !== true) {
      filter.isDeleted = { $ne: true };
    }

    if (options.search && typeof options.search === 'string' && options.search.trim()) {
      const searchRegex = safeRegex(options.search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { manufacturer: { $regex: searchRegex } },
        { regNo: { $regex: searchRegex } },
      ];
    }

    const isAutocomplete = options.autocomplete === 'true' || options.autocomplete === true || options.fields === 'autocomplete';
    const projection = isAutocomplete
      ? { regNo: 1, name: 1, manufacturer: 1, _id: 0 }
      : undefined;

    let cursor = col
      .find(filter, projection ? { projection } : {})
      .sort({ manufacturer: 1, name: 1 });

    if (options.limit) {
      const limitNum = typeof options.limit === 'number' ? options.limit : parseInt(options.limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        cursor = cursor.limit(limitNum);
      }
    }

    const list = await cursor.toArray();

    if (isAutocomplete) {
      return list.map((v) => ({
        regNo: v.regNo,
        name: v.name,
        manufacturer: v.manufacturer,
        vehicleRegNo: v.regNo,
        vehicleName: v.name,
        vehicleManufacturer: v.manufacturer,
      }));
    }

    return list;
  }

  /**
   * Retrieves distinct vehicles from bookings collection for reservation autocomplete.
   */
  static async getBookingVehiclesAutocomplete(options: {
    search?: string;
    limit?: string | number;
    status?: string;
  }): Promise<Array<Record<string, unknown>>> {
    const col = await RRDb.getBookingsCol();

    const match: Filter<Document> = {
      vehicleRegNo: { $exists: true, $nin: [null, ''] },
      isDeleted: { $ne: true },
    };

    if (options.search && typeof options.search === 'string' && options.search.trim()) {
      const searchRegex = safeRegex(options.search.trim(), 'i');
      match.$or = [
        { vehicleRegNo: { $regex: searchRegex } },
        { vehicleName: { $regex: searchRegex } },
        { vehicleManufacturer: { $regex: searchRegex } },
      ];
    }

    if (options.status && typeof options.status === 'string' && options.status.trim()) {
      const statuses = options.status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as BookingStatus[];
      if (statuses.length === 1) {
        match['status'] = statuses[0];
      } else if (statuses.length > 1) {
        match['status'] = { $in: statuses };
      }
    }

    const pipeline: Document[] = [
      { $match: match },
      {
        $group: {
          _id: { $toUpper: '$vehicleRegNo' },
          regNo: { $first: '$vehicleRegNo' },
          name: { $first: '$vehicleName' },
          manufacturer: { $first: '$vehicleManufacturer' },
        },
      },
      {
        $sort: { manufacturer: 1, name: 1, regNo: 1 },
      },
      {
        $project: {
          _id: 0,
          regNo: 1,
          name: { $ifNull: ['$name', ''] },
          manufacturer: { $ifNull: ['$manufacturer', ''] },
          vehicleRegNo: '$regNo',
          vehicleName: { $ifNull: ['$name', ''] },
          vehicleManufacturer: { $ifNull: ['$manufacturer', ''] },
        },
      },
    ];

    if (options.limit) {
      const limitNum = typeof options.limit === 'number' ? options.limit : parseInt(options.limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        pipeline.push({ $limit: limitNum });
      }
    }

    return await col.aggregate(pipeline).toArray();
  }

  /**
   * Fetches single vehicle by plate registration number.
   */
  static async getVehicleByRegNo(regNo: string): Promise<IVehicle | null> {
    const col = await RRDb.getVehiclesCol();
    return await col.findOne({ regNo, isDeleted: { $ne: true } });
  }

  /**
   * Registers a new vehicle into the fleet.
   */
  static async createVehicle(
    data: Omit<IVehicle, 'createdAt'>,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<IVehicle> {
    const col = await RRDb.getVehiclesCol();

    const existing = await col.findOne({
      regNo: { $regex: new RegExp(`^${escapeRegex(data.regNo)}$`, 'i') },
    });

    if (existing) {
      if (existing.isDeleted) {
        await col.updateOne(
          { _id: existing._id },
          {
            $set: {
              ...data,
              regNo: data.regNo.toUpperCase().trim(),
              isDeleted: false,
              deletedAt: null,
              deletedBy: null,
              updatedAt: new Date().toISOString(),
            },
          },
        );
        const restored = (await col.findOne({ _id: existing._id }))!;
        RRLogService.logActivity(
          `Restored vehicle ${data.regNo}`,
          performedBy,
          performedRole,
          `Previously soft-deleted vehicle ${data.regNo} restored and updated.`,
        ).catch((logErr) => console.error('[AuditLog] Failed to log vehicle restore:', logErr));
        return restored;
      }
      throw new Error(`Vehicle with plate ${data.regNo} already exists.`);
    }

    const newVehicle: IVehicle = {
      ...data,
      regNo: data.regNo.toUpperCase().trim(),
      createdAt: new Date().toISOString(),
    };

    await col.insertOne(newVehicle);

    RRLogService.logActivity(
      `Added vehicle ${newVehicle.regNo}`,
      performedBy,
      performedRole,
      `Vehicle added: ${newVehicle.manufacturer} ${newVehicle.name} (${newVehicle.model}, ${newVehicle.fuelType}, Odometer: ${newVehicle.odometer} km)`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log added vehicle:', logErr));

    return newVehicle;
  }

  /**
   * Updates an existing vehicle's attributes.
   */
  static async updateVehicle(
    regNo: string,
    updateData: Record<string, unknown>,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<IVehicle> {
    const col = await RRDb.getVehiclesCol();
    const vehicle = await col.findOne({ regNo });
    if (!vehicle || vehicle.isDeleted) {
      throw new Error('Vehicle not found or has been deleted');
    }

    delete updateData['_id'];
    delete updateData['regNo'];
    delete updateData['createdAt'];

    const modifiedFields = Object.keys(updateData).filter((k) => k !== 'updatedAt');

    await col.updateOne(
      { regNo },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    const updated = (await col.findOne({ regNo }))!;

    RRLogService.logActivity(
      `Modified vehicle ${regNo}`,
      performedBy,
      performedRole,
      `Vehicle ${vehicle.manufacturer} ${vehicle.name} updated: [${modifiedFields.join(', ') || 'details modified'}]`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log modified vehicle:', logErr));

    return updated;
  }

  /**
   * Soft-deletes a vehicle from active fleet if not currently in a rental booking.
   */
  static async deleteVehicle(
    regNo: string,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<{ message: string }> {
    const col = await RRDb.getVehiclesCol();
    const vehicle = await col.findOne({ regNo });
    if (!vehicle || vehicle.isDeleted) {
      throw new Error('Vehicle not found');
    }

    if (['in_booking', 'rented'].includes(vehicle.status) || vehicle.bookingId) {
      throw new Error('Cannot delete vehicle while it is currently in an active booking or rented.');
    }

    await col.updateOne(
      { regNo },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: performedBy,
          allowBooking: false,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    RRLogService.logActivity(
      `Soft-deleted vehicle ${regNo}`,
      performedBy,
      performedRole,
      `Vehicle soft-deleted from fleet: ${vehicle.manufacturer} ${vehicle.name} (${vehicle.model})`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log soft-deleted vehicle:', logErr));

    return { message: `Vehicle ${regNo} deleted successfully.` };
  }

  /**
   * Checks operational availability for a vehicle plate.
   */
  static async checkAvailability(
    regNo: string,
  ): Promise<{ regNo: string; isAvailable: boolean; status: string }> {
    const col = await RRDb.getVehiclesCol();
    const vehicle = await col.findOne({ regNo, isDeleted: { $ne: true } });
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    const isAvailable = vehicle.status === 'available';
    return { regNo, isAvailable, status: vehicle.status };
  }
}
