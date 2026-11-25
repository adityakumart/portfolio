import { Filter } from 'mongodb';
import { IBooking, BookingStatus } from '@portfolio/shared-types';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { safeRegex } from '../../../common/utils/security/regex.util';
import {
  IRRStatusReportResponse,
  IRRStatusReportSummary,
} from './rr-report.model';

export interface IRRStatusReportQueryParams {
  periodType?: string;
  month?: string | number;
  year?: string | number;
  from?: string;
  to?: string;
  vehicleRegNo?: string;
  status?: string;
  paymentStatus?: string;
  depositType?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
}

export class RRReportService {
  /**
   * Helper to parse DD-MM-YYYY or ISO strings to boundary ISO timestamps
   */
  private static parseDMY(dStr: string, isEnd = false): string {
    const trimmed = dStr.trim();
    const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmy) {
      const dd = dmy[1].padStart(2, '0');
      const mm = dmy[2].padStart(2, '0');
      const yyyy = dmy[3];
      return isEnd
        ? `${yyyy}-${mm}-${dd}T23:59:59.999Z`
        : `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }
    return isEnd ? `${trimmed}T23:59:59.999Z` : `${trimmed}T00:00:00.000Z`;
  }

  /**
   * Status Reports & Fleet Performance Analytics
   */
  static async getStatusReport(
    params: IRRStatusReportQueryParams,
  ): Promise<IRRStatusReportResponse> {
    const bookingCol = await RRDb.getBookingsCol();
    const vehCol = await RRDb.getVehiclesCol();

    const {
      periodType,
      month,
      year,
      from,
      to,
      vehicleRegNo,
      status,
      paymentStatus,
      depositType,
      search,
      page,
      limit,
    } = params;

    const andConditions: Filter<IBooking>[] = [];

    // Filter out soft-deleted bookings by default unless querying cancelled records or all
    const hasCancelledStatus =
      typeof status === 'string' &&
      (status.includes('cancelled') || status === 'all');
    if (!hasCancelledStatus) {
      andConditions.push({ isDeleted: { $ne: true } });
    }

    // Date range calculations based on periodType:
    let startIso: string | null = null;
    let endIso: string | null = null;

    const targetYear = parseInt(String(year || new Date().getFullYear()), 10);

    if (periodType === 'monthly') {
      const targetMonth = parseInt(
        String(month || new Date().getMonth() + 1),
        10,
      );
      const mm = String(targetMonth).padStart(2, '0');
      const lastDay = new Date(targetYear, targetMonth, 0).getDate();
      const lastDayStr = String(lastDay).padStart(2, '0');
      startIso = `${targetYear}-${mm}-01T00:00:00.000Z`;
      endIso = `${targetYear}-${mm}-${lastDayStr}T23:59:59.999Z`;
    } else if (periodType === 'yearly') {
      startIso = `${targetYear}-01-01T00:00:00.000Z`;
      endIso = `${targetYear}-12-31T23:59:59.999Z`;
    } else if (from || to) {
      if (typeof from === 'string' && from.trim()) {
        startIso = this.parseDMY(from, false);
      }
      if (typeof to === 'string' && to.trim()) {
        endIso = this.parseDMY(to, true);
      }
    }

    if (startIso || endIso) {
      const dateOrClauses: Filter<IBooking>[] = [];
      const createdCond: Record<string, string> = {};
      if (startIso) createdCond['$gte'] = startIso;
      if (endIso) createdCond['$lte'] = endIso;
      dateOrClauses.push({ createdAt: createdCond as unknown as string });

      const pickupCond: Record<string, string> = {};
      if (startIso) pickupCond['$gte'] = startIso.slice(0, 10);
      if (endIso) pickupCond['$lte'] = endIso;
      dateOrClauses.push({ pickupDateTime: pickupCond as unknown as string });

      andConditions.push({ $or: dateOrClauses });
    }

    // Vehicle specific filter
    if (
      vehicleRegNo &&
      typeof vehicleRegNo === 'string' &&
      vehicleRegNo.trim() &&
      vehicleRegNo !== 'all'
    ) {
      andConditions.push({ vehicleRegNo: vehicleRegNo.trim() });
    }

    // Status filter
    if (
      status &&
      typeof status === 'string' &&
      status.trim() &&
      status !== 'all'
    ) {
      const statuses = status
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as BookingStatus[];
      if (statuses.length === 1) {
        andConditions.push({ status: statuses[0] });
      } else if (statuses.length > 1) {
        andConditions.push({ status: { $in: statuses } });
      }
    }

    // Payment status filter
    if (paymentStatus === 'settled') {
      andConditions.push({
        $or: [
          { pendingAmount: { $in: ['0', '0.00', '', null] } },
          { pendingAmount: '0' },
        ],
      } as Filter<IBooking>);
    } else if (paymentStatus === 'pending') {
      andConditions.push({
        pendingAmount: { $nin: ['0', '0.00', '', null] },
      } as Filter<IBooking>);
    }

    // Deposit type filter
    if (
      depositType &&
      typeof depositType === 'string' &&
      depositType.trim() &&
      depositType !== 'all'
    ) {
      andConditions.push({ depositType: depositType.trim() });
    }

    // Free text search
    if (search && typeof search === 'string' && search.trim()) {
      const sRegex = safeRegex(search.trim(), 'i');
      andConditions.push({
        $or: [
          { id: { $regex: sRegex } },
          { vehicleRegNo: { $regex: sRegex } },
          { vehicleName: { $regex: sRegex } },
          { vehicleManufacturer: { $regex: sRegex } },
          { renterFirstName: { $regex: sRegex } },
          { renterSecondName: { $regex: sRegex } },
          { renterPhone: { $regex: sRegex } },
        ],
      });
    }

    const queryFilter: Filter<IBooking> =
      andConditions.length > 0 ? { $and: andConditions } : {};

    // Fetch all matching records to compute complete KPI aggregates
    const allMatching = await bookingCol
      .find(queryFilter)
      .sort({ createdAt: -1 })
      .toArray();

    // Compute metrics
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalKilometers = 0;
    let totalDurationHours = 0;
    let activeBookings = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;
    let reservedBookings = 0;

    for (const b of allMatching) {
      if (b.status === 'active') activeBookings++;
      else if (b.status === 'completed') completedBookings++;
      else if (b.status === 'cancelled') cancelledBookings++;
      else if (b.status === 'reserved') reservedBookings++;

      // Revenue and payments (exclude cancelled from revenue calculations)
      if (b.status !== 'cancelled') {
        const rev =
          parseFloat(
            String(b.finalRentalAmount || '0').replace(/[^0-9.-]/g, ''),
          ) || 0;
        const paid =
          parseFloat(String(b.amountPaid || '0').replace(/[^0-9.-]/g, '')) || 0;
        const pending =
          parseFloat(
            String(b.pendingAmount || '0').replace(/[^0-9.-]/g, ''),
          ) || 0;
        totalRevenue += rev;
        totalPaid += paid;
        totalPending += pending;

        const dur = parseFloat(String(b.durationHours || '0')) || 0;
        totalDurationHours += dur;

        const odoStart = parseFloat(String(b.vehicleOdometerStart || '0')) || 0;
        const odoEnd = parseFloat(String(b.vehicleOdometerEnd || '0')) || 0;
        if (odoEnd > odoStart) {
          totalKilometers += odoEnd - odoStart;
        }
      }
    }

    // Utilization estimation based on fleet vehicles count
    const totalFleetCount =
      (await vehCol.countDocuments({ isDeleted: { $ne: true } })) || 1;
    let daysInPeriod = 30;
    if (periodType === 'yearly') daysInPeriod = 365;
    else if (startIso && endIso) {
      const diffMs = Math.abs(
        new Date(endIso).getTime() - new Date(startIso).getTime(),
      );
      daysInPeriod = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }
    const maxFleetHours = totalFleetCount * daysInPeriod * 24;
    const fleetUtilizationRate =
      maxFleetHours > 0
        ? Math.min(
            100,
            Math.round((totalDurationHours / maxFleetHours) * 100 * 10) / 10,
          )
        : 0;

    const summary: IRRStatusReportSummary = {
      totalBookings: allMatching.length,
      activeBookings,
      completedBookings,
      cancelledBookings,
      reservedBookings,
      totalRevenue: Math.round(totalRevenue),
      totalPaid: Math.round(totalPaid),
      totalPending: Math.round(totalPending),
      totalKilometers: Math.round(totalKilometers),
      totalDurationHours: Math.round(totalDurationHours),
      fleetUtilizationRate,
    };

    // Apply pagination
    const pageNum = Math.max(1, parseInt(String(page || 1), 10));
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(String(limit || 15), 10)),
    );
    const totalRecords = allMatching.length;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedBookings = allMatching.slice(startIndex, startIndex + limitNum);

    return {
      success: true,
      summary,
      bookings: pagedBookings,
      totalRecords,
      currentPage: pageNum,
      totalPages,
    };
  }

  /**
   * Log export/download action
   */
  static async logReportDownload(
    format: string,
    filterSummary: string,
    staffId: string,
    staffName: string,
  ): Promise<void> {
    const fmt = String(format || 'PDF').toUpperCase();
    await RRLogService.logActivity(
      `Status Report Downloaded (${fmt})`,
      staffId || 'system',
      staffName,
      `Staff member ${staffName} downloaded ${fmt} Status Report with parameters: ${
        filterSummary || 'Default Filter'
      }.`,
    );
  }
}
