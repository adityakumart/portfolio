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
      const { from, to, page, limit, search, all } = req.query;
      const result = await RRLogService.getLogs({
        from: typeof from === 'string' ? from : undefined,
        to: typeof to === 'string' ? to : undefined,
        page: page !== undefined ? Number(page) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
        search: typeof search === 'string' ? search : undefined,
        all: all === 'true' ? 'true' : undefined,
      });
      res.json(result);
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
