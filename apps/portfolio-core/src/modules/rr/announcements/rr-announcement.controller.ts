import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRAnnouncementService } from './rr-announcement.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRAnnouncementController {
  static async getAnnouncementsAndTicker(req: IRRRequest, res: Response): Promise<void> {
    try {
      const data = await RRAnnouncementService.getAnnouncementsAndTicker();
      res.json(data);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async updateTicker(req: IRRRequest, res: Response): Promise<void> {
    try {
      const ticker = await RRAnnouncementService.updateTicker(
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: 'Marquee announcement ticker updated successfully.',
        ticker,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async createAnnouncement(req: IRRRequest, res: Response): Promise<void> {
    try {
      const created = await RRAnnouncementService.createAnnouncement(
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.status(201).json({
        success: true,
        message: 'Announcement item published successfully.',
        item: created,
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('Title and description are required')) {
        res.status(400).json({ error: 'Bad Request', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async updateAnnouncement(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RRAnnouncementService.updateAnnouncement(
        id,
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: 'Announcement item updated successfully.',
        item: updated,
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async toggleAnnouncement(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const result = await RRAnnouncementService.toggleAnnouncement(
        id,
        req.body?.isActive,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json(result);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async deleteAnnouncement(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      await RRAnnouncementService.deleteAnnouncement(
        id,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({ success: true, message: 'Announcement item deleted successfully.' });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }
}
