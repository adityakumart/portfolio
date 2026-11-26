import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRLogService } from './rr-log.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRLogController {
  static async getLogs(req: IRRRequest, res: Response): Promise<void> {
    try {
      const limit = Math.min(500, Math.max(1, Number(req.query['limit']) || 100));
      const logs = await RRLogService.getLogs(limit);
      res.json(logs);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getDashboardStats(req: IRRRequest, res: Response): Promise<void> {
    try {
      const stats = await RRLogService.getDashboardStats();
      res.json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
