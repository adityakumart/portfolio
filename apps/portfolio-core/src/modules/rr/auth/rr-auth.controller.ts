import { Request, Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRAuthService } from './rr-auth.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRAuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await RRAuthService.login(req.body);
      res.status(result.status).json(result.data);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async changePassword(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRAuthService.changePassword(req.userId!, req.body);
      res.status(result.status).json(result.data);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async logout(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRAuthService.logout(req.userId!, req.userRole);
      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getPermissions(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRAuthService.getPermissions(req.userId!);
      res.status(result.status).json(result.data);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
