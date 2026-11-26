import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRReportService } from './rr-report.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRReportController {
  static async getStatusReport(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRReportService.getStatusReport(req.query);
      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async logReportDownload(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { format, filterSummary } = req.body;
      const staffName = req.user?.name || req.userId || 'Staff';
      await RRReportService.logReportDownload(
        format,
        filterSummary,
        req.userId || 'system',
        staffName,
      );
      res.json({ success: true, message: 'Report download logged successfully.' });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
