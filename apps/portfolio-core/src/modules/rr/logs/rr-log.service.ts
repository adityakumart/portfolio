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
}
