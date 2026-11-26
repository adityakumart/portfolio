import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRVehicleService } from './rr-vehicle.service';
import { handleVehicleImageUpload } from '../storage/rr-storage.controller';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRVehicleController {
  static uploadImage = handleVehicleImageUpload;

  static async getVehicles(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { search, limit, autocomplete, fields, includeDeleted } = req.query;
      const list = await RRVehicleService.getVehicles({
        search: typeof search === 'string' ? search : undefined,
        limit: limit !== undefined ? String(limit) : undefined,
        autocomplete: autocomplete !== undefined ? String(autocomplete) : undefined,
        fields: typeof fields === 'string' ? fields : undefined,
        includeDeleted: includeDeleted !== undefined ? String(includeDeleted) : undefined,
      });
      res.json(list);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getBookingVehiclesAutocomplete(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { q, query, search, limit, status } = req.query;
      const searchQuery = (q || query || search || '') as string;
      const list = await RRVehicleService.getBookingVehiclesAutocomplete({
        search: searchQuery,
        limit: limit !== undefined ? String(limit) : undefined,
        status: typeof status === 'string' ? status : undefined,
      });
      res.json(list);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async createVehicle(req: IRRRequest, res: Response): Promise<void> {
    try {
      const newVehicle = await RRVehicleService.createVehicle(
        req.body,
        req.userId || 'system',
        req.userRole || 'admin',
      );
      res.status(201).json(newVehicle);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('already exists')) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async updateVehicle(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RRVehicleService.updateVehicle(
        id,
        req.body,
        req.userId || 'system',
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

  static async deleteVehicle(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      await RRVehicleService.deleteVehicle(
        id,
        req.userId || 'system',
        req.userRole || 'admin',
      );
      res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      if (msg.includes('Cannot delete vehicle while it is currently in an active booking')) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async checkAvailability(req: IRRRequest, res: Response): Promise<void> {
    try {
      const regNo = String(req.params['id'] || '');
      const result = await RRVehicleService.checkAvailability(regNo);
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
}
