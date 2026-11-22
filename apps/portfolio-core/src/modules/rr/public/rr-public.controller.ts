import { Request, Response } from 'express';
import { Filter } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { IVehicle } from '../vehicles/rr-vehicle.model';
import { RRWhatsAppService } from '../whatsapp/rr-whatsapp.service';
import { RRHomeContentService } from '../home-content/rr-home-content.service';
import { RRAnnouncementService } from '../announcements/rr-announcement.service';
import { safeRegex } from '../../../common/utils/security/regex.util';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRPublicController {
  static async getPublicVehicles(req: Request, res: Response): Promise<void> {
    try {
      const col = await RRDb.getVehiclesCol();
      const { search, limit } = req.query;

      const filter: Filter<IVehicle> = {
        isDeleted: { $ne: true },
        allowBooking: { $ne: false },
        status: { $nin: ['maintenance', 'contract', 'in_contract'] },
      };

      if (search && typeof search === 'string' && search.trim()) {
        const searchRegex = safeRegex(search.trim(), 'i');
        filter.$or = [
          { name: { $regex: searchRegex } },
          { manufacturer: { $regex: searchRegex } },
          { type: { $regex: searchRegex } },
        ];
      }

      let cursor = col
        .find(filter)
        .project({
          _id: 1,
          name: 1,
          manufacturer: 1,
          model: 1,
          type: 1,
          color: 1,
          seating: 1,
          fuelType: 1,
          images: 1,
          status: 1,
          pricing: 1,
          extraKmPrice: 1,
          extraHourPrice: 1,
          allowBooking: 1,
        })
        .sort({ name: 1 });

      if (limit && !isNaN(Number(limit))) {
        cursor = cursor.limit(Number(limit));
      }

      const list = await cursor.toArray();
      res.json(list);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getPublicAnnouncements(req: Request, res: Response): Promise<void> {
    try {
      const { ticker, items } = await RRAnnouncementService.getAnnouncementsAndTicker();
      const activeItems = items.filter((item) => item.isActive);
      res.json({ ticker, items: activeItems });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getPublicHomeContent(req: Request, res: Response): Promise<void> {
    try {
      const content = await RRHomeContentService.getHomeContent();
      res.json(content);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getPublicInvoice(req: Request, res: Response): Promise<void> {
    try {
      const token = String(req.params['token'] || '');
      if (!token) {
        res.status(400).json({ error: 'Bad Request', message: 'Invoice token is required.' });
        return;
      }

      const verification = RRWhatsAppService.verifyInvoiceToken(token);
      if (!verification.valid) {
        if (verification.isExpired) {
          res.status(410).json({
            expired: true,
            error: 'Invoice Link Expired',
            message:
              verification.error ||
              'This invoice link has expired. Digital invoice links are active for 24 hours only. Please contact RoadReady support for an updated invoice copy.',
          });
          return;
        }
        res.status(401).json({
          expired: false,
          error: 'Invalid Token',
          message: verification.error || 'Invalid or tampered invoice link.',
        });
        return;
      }

      const bookingsCol = await RRDb.getBookingsCol();
      const booking = await bookingsCol.findOne(
        { id: verification.bookingId, isDeleted: { $ne: true } },
        {
          projection: {
            id: 1,
            renterFirstName: 1,
            renterSecondName: 1,
            renterPhone: 1,
            renterEmail: 1,
            renterAadhar: 1,
            renterDL: 1,
            vehicleRegNo: 1,
            vehicleName: 1,
            vehicleManufacturer: 1,
            vehicleModel: 1,
            pickupDateTime: 1,
            returnDateTime: 1,
            returnDateTimeActual: 1,
            durationDays: 1,
            durationHours: 1,
            totalRentalAmount: 1,
            discount: 1,
            discountType: 1,
            finalRentalAmount: 1,
            amountPaid: 1,
            pendingAmount: 1,
            paymentMode: 1,
            status: 1,
            createdAt: 1,
            endedAt: 1,
            cleanlinessFee: 1,
            extraKmsTravelled: 1,
            extraKmFee: 1,
            extraHoursTaken: 1,
            extraHourFee: 1,
            damages: 1,
            damagesTotal: 1,
            challanaTollFinesTotal: 1,
            nonIntimationFine: 1,
            totalAdditionalFees: 1,
          },
        },
      );

      if (!booking) {
        res.status(404).json({ error: 'Not Found', message: 'Invoice record not found.' });
        return;
      }

      const config = await RRWhatsAppService.getConfig();

      res.json({
        success: true,
        booking,
        company: {
          name: config.generalSettings.companyName,
          supportPhone: config.generalSettings.supportPhoneNumber,
          depotAddress: config.generalSettings.depotAddress,
        },
        verifiedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
