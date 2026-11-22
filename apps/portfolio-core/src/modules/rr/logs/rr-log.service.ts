import { Filter } from 'mongodb';
import { IBooking } from '@portfolio/shared-types';
import { RRDb } from '../common/rr-db.util';
import { ILog } from './rr-log.model';

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
   */
  static async getLogs(limit = 100): Promise<ILog[]> {
    const logsCol = await RRDb.getLogsCol();
    return await logsCol
      .find({})
      .sort({ timestamp: -1, _id: -1 })
      .limit(limit)
      .toArray();
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
