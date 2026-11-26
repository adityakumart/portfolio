import { Request, Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRFeedbackService } from './rr-feedback.service';
import { handleFeedbackScreenshotUpload } from '../storage/rr-storage.controller';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRFeedbackController {
  static uploadScreenshot = handleFeedbackScreenshotUpload;

  static async submitFeedback(req: IRRRequest, res: Response): Promise<void> {
    try {
      const staffId = req.userId || 'STAFF';
      const doc = await RRFeedbackService.submitFeedback(req.body, staffId, req.userRole);
      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for helping us improve!',
        data: doc,
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('Invalid') || msg.includes('between 10 and 1000')) {
        res.status(400).json({ error: 'Bad Request', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async getMyFeedback(req: IRRRequest, res: Response): Promise<void> {
    try {
      const staffId = req.userId || '';
      const data = await RRFeedbackService.getMyFeedback(staffId);
      res.json({ success: true, data });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getFeedbackStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await RRFeedbackService.getFeedbackStats();
      res.json({ success: true, stats });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getFeedbacks(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { status, page, issueType, search, limit, skip } = req.query;
      const result = await RRFeedbackService.getFeedbacks({
        status: typeof status === 'string' ? status : undefined,
        page: typeof page === 'string' ? page : undefined,
        issueType: typeof issueType === 'string' ? issueType : undefined,
        search: typeof search === 'string' ? search : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
        skip: skip !== undefined ? Number(skip) : undefined,
      });
      res.json({
        success: true,
        total: result.total,
        data: result.data,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async updateFeedbackStatus(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      const updated = await RRFeedbackService.updateFeedbackStatus(
        id,
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: `Feedback ticket status updated to "${req.body.status}".`,
        data: updated,
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('Invalid status')) {
        res.status(400).json({ error: 'Bad Request', message: msg });
        return;
      }
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async deleteFeedback(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id']);
      await RRFeedbackService.deleteFeedback(
        id,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({ success: true, message: 'Feedback deleted successfully.' });
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
