import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRHomeContentService } from './rr-home-content.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRHomeContentController {
  static async getHomeContent(req: IRRRequest, res: Response): Promise<void> {
    try {
      const content = await RRHomeContentService.getHomeContent();
      res.json(content);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async updateHomeContent(req: IRRRequest, res: Response): Promise<void> {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== 'object') {
        res.status(400).json({ error: 'Bad Request', message: 'Payload is required' });
        return;
      }
      const staffId = req.userId || req.user?.id || 'ADMIN';
      const content = await RRHomeContentService.updateHomeContent(
        payload,
        staffId,
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: 'Homepage content saved successfully',
        content,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async resetHomeContent(req: IRRRequest, res: Response): Promise<void> {
    try {
      const staffId = req.userId || req.user?.id || 'ADMIN';
      const content = await RRHomeContentService.resetHomeContent(
        staffId,
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: 'Homepage content restored to factory defaults',
        content,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
