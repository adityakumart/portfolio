import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RREmployeeService } from './rr-employee.service';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RREmployeeController {
  static async getEmployees(req: IRRRequest, res: Response): Promise<void> {
    try {
      const includeDeleted = req.query['includeDeleted'] === 'true';
      const list = await RREmployeeService.getEmployees(includeDeleted);
      res.json(list);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async createEmployee(req: IRRRequest, res: Response): Promise<void> {
    try {
      const newEmployee = await RREmployeeService.createEmployee(
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.status(201).json(newEmployee);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async activateEmployee(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RREmployeeService.activateEmployee(
        id,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json(updated);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async resetPassword(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RREmployeeService.resetPassword(
        id,
        req.body?.temporaryPassword,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({
        success: true,
        message: updated.message,
        temporaryPassword: updated.temporaryPassword,
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

  static async updateEmployee(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RREmployeeService.updateEmployee(
        id,
        req.body,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json(updated);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async deleteEmployee(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      await RREmployeeService.deleteEmployee(
        id,
        req.userId || 'admin',
        req.userRole || 'admin',
      );
      res.json({ success: true, message: 'Employee deactivated successfully' });
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
