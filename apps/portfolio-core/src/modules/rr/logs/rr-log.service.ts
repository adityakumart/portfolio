import { Filter } from 'mongodb';
import { IBooking, ILogsResponse } from '@portfolio/shared-types';
import { RRDb } from '../common/rr-db.util';
import { ILog } from './rr-log.model';
import { safeRegex } from '../../../common/utils/security/regex.util';

export interface IRRLogQueryOptions {
  from?: string;
  to?: string;
  page?: number | string;
  limit?: number | string;
  search?: string;
  all?: string | boolean;
}

export class RRLogService {
  /**
   * Records an audit log entry for RoadReady administrative / operational events.
   */
  static async logActivity(
    action: string,
    performedBy?: string,
    role?: string,
    details?: string,
  ): Promise<ILog | null> {
    try {
      const logsCol = await RRDb.getLogsCol();
      const safeUser = performedBy || 'system';
      const safeRole = role || 'admin';
      const newLog: ILog = {
        action,
        performedBy: safeUser,
        role: safeRole,
        user: safeUser,
        time: new Date().toLocaleString(),
        timestamp: new Date(),
        details,
      };
      await logsCol.insertOne(newLog);
      return newLog;
    } catch (err) {
      console.error(`[RRLogService.logActivity] Error writing activity log for "${action}":`, err);
      return null;
    }
  }

  /**
   * Fetches recent activity logs sorted descending by timestamp.
   * Supports pagination, date range filtering, search, and full dump mode.
   */
  static async getLogs(
    options?: number | IRRLogQueryOptions,
  ): Promise<ILog[] | ILogsResponse> {
    const logsCol = await RRDb.getLogsCol();

    if (typeof options === 'number') {
      return await logsCol
        .find({})
        .sort({ timestamp: -1, _id: -1 })
        .limit(options)
        .toArray();
    }

    const query: Filter<ILog> = {};

    if (options?.from || options?.to) {
      const timeCond: Record<string, Date> = {};
      if (options.from) {
        timeCond['$gte'] = new Date(`${options.from}T00:00:00`);
      }
      if (options.to) {
        timeCond['$lte'] = new Date(`${options.to}T23:59:59.999`);
      }
      query['timestamp'] = timeCond as unknown as Date;
    }

    if (options?.search && typeof options.search === 'string' && options.search.trim()) {
      const searchRegex = safeRegex(options.search.trim(), 'i');
      query.$or = [
        { action: { $regex: searchRegex } },
        { performedBy: { $regex: searchRegex } },
        { role: { $regex: searchRegex } },
        { details: { $regex: searchRegex } },
      ];
    }

    if (options?.all === 'true' || options?.all === true) {
      return await logsCol
        .find(query)
        .sort({ timestamp: -1, _id: -1 })
        .limit(1000)
        .toArray();
    }

    const pageNum = Math.max(1, Number(options?.page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(options?.limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      logsCol.find(query).sort({ timestamp: -1, _id: -1 }).skip(skip).limit(limitNum).toArray(),
      logsCol.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    };
  }

  /**
   * Fetches dashboard fleet and booking metrics.
   */
  static async getDashboardStats(): Promise<{
    totalFleet: number;
    maintenance: number;
    available: number;
    contract: number;
    activeBookings: number;
    pendingPayments: number;
    reserved: number;
  }> {
    const vehCol = await RRDb.getVehiclesCol();
    const bookingCol = await RRDb.getBookingsCol();

    const [
      totalFleet,
      maintenance,
      available,
      contract,
      activeBookings,
      pendingPayments,
      reserved,
    ] = await Promise.all([
      vehCol.countDocuments({ isDeleted: { $ne: true } }),
      vehCol.countDocuments({ status: 'maintenance', isDeleted: { $ne: true } }),
      vehCol.countDocuments({ status: 'available', isDeleted: { $ne: true } }),
      vehCol.countDocuments({
        status: { $in: ['contract', 'in_contract'] },
        isDeleted: { $ne: true },
      }),
      bookingCol.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
      bookingCol.countDocuments({
        status: 'active',
        isDeleted: { $ne: true },
        pendingAmount: { $nin: ['0', '', null] },
      } as Filter<IBooking>),
      bookingCol.countDocuments({ status: 'reserved', isDeleted: { $ne: true } }),
    ]);

    return {
      totalFleet,
      maintenance,
      available,
      contract,
      activeBookings,
      pendingPayments,
      reserved,
    };
  }
}
