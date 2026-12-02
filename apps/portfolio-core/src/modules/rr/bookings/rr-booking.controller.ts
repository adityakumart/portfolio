import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRBookingService } from './rr-booking.service';
import { RRVehicleService } from '../vehicles/rr-vehicle.service';
import { RRWhatsAppService } from '../whatsapp/rr-whatsapp.service';
import { RRDb } from '../common/rr-db.util';
import { IRRWhatsAppTemplateId } from '@portfolio/shared-types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRBookingController {
  static async autoCloseIdleAdvance(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRBookingService.autoCloseIdleAdvanceBookings();
      res.json({
        success: true,
        message: `Auto-closed ${result.closedCount} idle advance bookings`,
        ...result,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getBookings(req: IRRRequest, res: Response): Promise<void> {
    try {
      const {
        status,
        search,
        vehicleRegNo,
        vehicle,
        phone,
        customer,
        page,
        limit,
        from,
        to,
        paginate,
        all,
        includeDeleted,
        history,
      } = req.query;

      const result = await RRBookingService.getBookings(
        {
          status: typeof status === 'string' ? status : undefined,
          search: typeof search === 'string' ? search : undefined,
          vehicle: typeof (vehicle || vehicleRegNo) === 'string' ? ((vehicle || vehicleRegNo) as string) : undefined,
          customer: typeof (customer || phone) === 'string' ? ((customer || phone) as string) : undefined,
          page: page !== undefined ? Number(page) : undefined,
          limit: limit !== undefined ? Number(limit) : undefined,
          from: typeof from === 'string' ? from : undefined,
          to: typeof to === 'string' ? to : undefined,
          paginate: paginate !== undefined ? String(paginate) : undefined,
          all: all !== undefined ? String(all) : undefined,
          includeDeleted: includeDeleted !== undefined ? String(includeDeleted) : undefined,
          history: history !== undefined ? String(history) : undefined,
        },
        req.userId,
        req.userRole,
      );
      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getBookingVehiclesAutocomplete(req: IRRRequest, res: Response): Promise<void> {
    try {
      const { q, query, search } = req.query;
      const searchQuery = (q || query || search || '') as string;
      const list = await RRVehicleService.getBookingVehiclesAutocomplete({
        search: searchQuery,
      });
      res.json(list);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async createBooking(req: IRRRequest, res: Response): Promise<void> {
    try {
      const originHeader = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
      const refererHeader = Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer;
      const clientBaseUrl = originHeader || refererHeader || undefined;

      const newBooking = await RRBookingService.createBooking(
        req.body,
        req.userId,
        req.userRole,
        clientBaseUrl,
      );
      res.status(201).json(newBooking);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (
        msg.includes('already has an active') ||
        msg.includes('schedule conflict') ||
        msg.includes('overlapping') ||
        msg.includes('not available') ||
        msg.includes('under maintenance')
      ) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async deleteBooking(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const result = await RRBookingService.deleteBooking(id, req.body, req.userId, req.userRole);
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

  static async closeAdvanceBooking(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const updated = await RRBookingService.closeAdvanceBooking(id, req.body, req.userId, req.userRole);
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

  static async updateBooking(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const originHeader = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
      const refererHeader = Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer;
      const clientBaseUrl = originHeader || refererHeader || undefined;

      const updated = await RRBookingService.updateBooking(
        id,
        req.body,
        req.userId,
        req.userRole,
        clientBaseUrl,
      );
      res.json(updated);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      if (msg.includes('Conflict') || msg.includes('overlap')) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async recordCustomerIntimation(req: IRRRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params['id'] || '');
      const result = await RRBookingService.recordCustomerIntimation(id, req.body, req.userId, req.userRole);
      res.json(result);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg.includes('not found')) {
        res.status(404).json({ error: 'Not Found', message: msg });
        return;
      }
      if (msg.includes('required')) {
        res.status(400).json({ error: 'Bad Request', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async previewWhatsApp(req: IRRRequest, res: Response): Promise<void> {
    try {
      const bookingId = String(req.params['id'] || '');
      const templateType = (req.query['templateType'] as IRRWhatsAppTemplateId) || 'active_reminder';
      const customText = req.query['customText'] as string | undefined;

      const bookingsCol = await RRDb.getBookingsCol();
      const booking = await bookingsCol.findOne({ id: bookingId, isDeleted: { $ne: true } });

      if (!booking) {
        res.status(404).json({ error: 'Not Found', message: `Booking #${bookingId} not found.` });
        return;
      }

      const config = await RRWhatsAppService.getConfig();
      const clientBaseUrl = (req.headers.origin as string) || (req.headers.referer as string) || undefined;

      const preview = RRWhatsAppService.compileMessage(
        booking,
        templateType,
        config,
        customText,
        clientBaseUrl,
      );

      res.json({
        success: true,
        bookingId,
        templateType,
        template: config.templates[templateType],
        ...preview,
        generalSettings: config.generalSettings,
        provider: config.provider,
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async sendWhatsApp(req: IRRRequest, res: Response): Promise<void> {
    try {
      const bookingId = String(req.params['id'] || '');
      const { templateType, customText } = req.body;

      if (!templateType) {
        res.status(400).json({ error: 'Bad Request', message: 'templateType is required.' });
        return;
      }

      const empCol = await RRDb.getEmployeesCol();
      const staff = await empCol.findOne({ id: req.userId });
      const staffName = staff ? `${staff.firstName} ${staff.lastName}`.trim() : (req.userId || 'Staff');
      const originHeader = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
      const refererHeader = Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer;
      const clientBaseUrl = originHeader || refererHeader || undefined;

      const result = await RRWhatsAppService.sendBookingNotification(bookingId, templateType, {
        customText,
        sentBy: req.userId,
        sentByName: staffName,
        sentByRole: req.userRole || 'employee',
        isAutomated: false,
        baseUrl: clientBaseUrl,
      });

      res.json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
