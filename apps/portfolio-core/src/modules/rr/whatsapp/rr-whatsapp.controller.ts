import { Request, Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRWhatsAppService } from './rr-whatsapp.service';
import { RRNotificationSchedulerService } from './rr-notification-scheduler.service';
import { RRLogService } from '../logs/rr-log.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRWhatsAppController {
  static async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await RRWhatsAppService.getConfig();
      res.json(config);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async saveConfig(req: IRRRequest, res: Response): Promise<void> {
    try {
      const updated = await RRWhatsAppService.saveConfig(req.body, req.userId || 'admin');
      await RRLogService.logActivity(
        'UPDATE_WHATSAPP_CONFIG',
        req.userId,
        req.userRole || 'admin',
        'Updated WhatsApp configuration and message templates.',
      );
      res.json({ success: true, message: 'WhatsApp configuration updated successfully.', config: updated });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async testDispatch(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        res.status(400).json({ error: 'Bad Request', message: 'Phone number and message text are required.' });
        return;
      }

      const config = await RRWhatsAppService.getConfig();
      const result = await RRWhatsAppService.dispatchViaGateway(phone, message, config);

      await RRLogService.logActivity(
        'TEST_WHATSAPP_DISPATCH',
        req.userId,
        req.userRole || 'admin',
        `Sent test WhatsApp message to ${phone} via ${result.provider}. Result: ${result.success ? 'Success' : result.error}`,
      );

      res.json({
        success: result.success,
        provider: result.provider,
        message: result.success ? 'Test WhatsApp message sent successfully.' : result.error,
        messageId: result.messageId,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async runSchedulerSweep(req: IRRRequest, res: Response): Promise<void> {
    try {
      const stats = await RRNotificationSchedulerService.runAutomatedNotificationSweep();
      res.json({
        success: true,
        message: 'Automated notification sweep completed successfully.',
        stats,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
