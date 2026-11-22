import { Response } from 'express';
import { IRRRequest } from '../rr.middleware';
import { RRCustomerService } from './rr-customer.service';
import { BillingService } from './billing.service';
import { RegularCustomer } from './rr-customer.model';
import { connectMongoose } from '../../../common/config/mongoose';
import { safeRegex } from '../../../common/utils/security/regex.util';
import { RRLogService } from '../logs/rr-log.service';
import {
  ICreateCustomerDTO,
  IUpdateCustomerDTO,
  ICustomerListResponse,
} from '@portfolio/shared-types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RRCustomerController {
  static async createCustomer(req: IRRRequest, res: Response): Promise<void> {
    try {
      const result = await RRCustomerService.createCustomer(
        req.body as ICreateCustomerDTO,
        req.userId,
        req.userRole,
      );
      res.status(201).json(result);
    } catch (err: unknown) {
      console.error('CustomerController.createCustomer error:', err);
      const msg = getErrorMessage(err);
      if (msg.includes('Validation') || msg.includes('required') || msg.includes('Invalid')) {
        res.status(400).json({ error: 'Validation Error', message: msg });
        return;
      }
      if (msg.includes('Conflict') || msg.includes('already in use') || msg.includes('already exists')) {
        res.status(409).json({ error: 'Conflict', message: msg });
        return;
      }
      res.status(500).json({ error: 'Internal Server Error', message: msg });
    }
  }

  static async getCustomers(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 10));
      const search = typeof req.query['search'] === 'string' ? req.query['search'].trim() : '';

      const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

      if (search) {
        const regex = safeRegex(search, 'i');
        filter['$or'] = [
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { email: regex },
          { membershipId: regex },
        ];
      }

      const total = await RegularCustomer.countDocuments(filter);
      const docs = await RegularCustomer.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const responsePayload: ICustomerListResponse = {
        customers: docs.map((doc) => doc.toMaskedJSON()),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };

      res.status(200).json(responsePayload);
    } catch (err: unknown) {
      console.error('CustomerController.getCustomers error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getCustomersAutocomplete(req: IRRRequest, res: Response): Promise<void> {
    try {
      const q = typeof req.query['q'] === 'string' ? req.query['q'].trim() : '';
      const items = await RRCustomerService.autocomplete(q);
      res.status(200).json(items);
    } catch (err: unknown) {
      console.error('CustomerController.getCustomersAutocomplete error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async getCustomerById(req: IRRRequest, res: Response): Promise<void> {
    try {
      const rawId = req.params['id'];
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId || '');
      const customer = await RRCustomerService.getCustomerById(id);

      if (!customer) {
        res.status(404).json({ error: 'Not Found', message: 'Customer record not found' });
        return;
      }

      res.status(200).json(customer);
    } catch (err: unknown) {
      console.error('CustomerController.getCustomerById error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async updateCustomer(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const rawId = req.params['id'];
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId || '');
      const body = req.body as IUpdateCustomerDTO;

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      const customer = await RegularCustomer.findOne({
        isDeleted: { $ne: true },
        $or: isMongoId ? [{ _id: id }, { membershipId: id.toUpperCase() }] : [{ membershipId: id.toUpperCase() }],
      });

      if (!customer) {
        res.status(404).json({ error: 'Not Found', message: 'Customer record not found' });
        return;
      }

      // Apply updates
      if (body.firstName !== undefined) customer.firstName = body.firstName.trim();
      if (body.lastName !== undefined) customer.lastName = body.lastName.trim();
      if (body.fatherName !== undefined) customer.fatherName = body.fatherName.trim();
      if (body.address !== undefined) customer.address = body.address.trim();
      if (body.altPhone !== undefined) customer.altPhone = body.altPhone.trim();
      if (body.membershipTier !== undefined) customer.membershipTier = body.membershipTier;
      if (body.discountRate !== undefined && Number.isFinite(body.discountRate)) {
        const rate = Number(body.discountRate);
        if (rate < 0 || rate > 30) {
          res.status(400).json({ error: 'Validation Error', message: 'Discount rate must be between 0% and 30%' });
          return;
        }
        customer.discountRate = rate;
      }
      if (body.maxDiscountAmount !== undefined) {
        if (
          body.maxDiscountAmount !== null &&
          (Number(body.maxDiscountAmount) <= 0 || !Number.isInteger(Number(body.maxDiscountAmount)))
        ) {
          res.status(400).json({ error: 'Validation Error', message: 'Max discount amount must be a positive integer' });
          return;
        }
        customer.maxDiscountAmount =
          body.maxDiscountAmount && Number(body.maxDiscountAmount) > 0
            ? Math.round(Number(body.maxDiscountAmount))
            : undefined;
      }
      if (body.startDate !== undefined) {
        customer.startDate = new Date(body.startDate);
      }
      if (body.durationMonths !== undefined) {
        customer.durationMonths = Number(body.durationMonths);
      }
      if (body.endDate !== undefined) {
        customer.endDate = new Date(body.endDate);
      } else if (body.durationMonths !== undefined) {
        const base = customer.startDate ? new Date(customer.startDate) : new Date();
        const end = new Date(base);
        end.setMonth(end.getMonth() + (customer.durationMonths ?? 12));
        customer.endDate = end;
      }
      if (body.isActive !== undefined) customer.isActive = body.isActive;

      // Phone update check
      if (body.phone && body.phone !== customer.phone) {
        if (!/^[6-9]\d{9}$/.test(body.phone.trim())) {
          res.status(400).json({ error: 'Validation Error', message: 'Invalid 10-digit phone number' });
          return;
        }
        const duplicatePhone = await RegularCustomer.findOne({
          _id: { $ne: customer._id },
          phone: body.phone.trim(),
          isDeleted: { $ne: true },
        });
        if (duplicatePhone) {
          res.status(409).json({ error: 'Conflict', message: 'Phone number already in use by another member' });
          return;
        }
        customer.phone = body.phone.trim();
      }

      // Email update check
      if (body.email !== undefined) {
        const cleanEmail = body.email ? body.email.trim().toLowerCase() : '';
        if (cleanEmail) {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
            res.status(400).json({ error: 'Validation Error', message: 'Invalid email address' });
            return;
          }
          if (cleanEmail !== (customer.email ? customer.email.toLowerCase() : '')) {
            const duplicateEmail = await RegularCustomer.findOne({
              _id: { $ne: customer._id },
              email: cleanEmail,
              isDeleted: { $ne: true },
            });
            if (duplicateEmail) {
              res.status(409).json({ error: 'Conflict', message: 'Email address already in use by another member' });
              return;
            }
          }
          customer.email = cleanEmail;
        } else {
          customer.email = undefined;
        }
      }

      // KYC updates if provided
      if (body.aadhar && body.aadhar !== '[Aadhaar Redacted]') {
        const cleanAadhaar = body.aadhar.replace(/\s/g, '');
        if (/^\d{12}$/.test(cleanAadhaar)) {
          customer.aadhar = cleanAadhaar;
        }
      }

      if (body.dl && body.dl !== '[DL Redacted]') {
        const cleanDL = body.dl.replace(/[\s-]/g, '').toUpperCase();
        if (/^[A-Za-z0-9]{15,16}$/.test(cleanDL)) {
          customer.dl = cleanDL;
        }
      }

      await customer.save();

      res.status(200).json(customer.toMaskedJSON());

      RRLogService.logActivity(
        `Updated Customer Membership ${customer.membershipId}`,
        req.userId || 'STAFF',
        req.userRole || 'employee',
        `Updated customer record for ${customer.firstName} ${customer.lastName}`,
      ).catch((logErr) => {
        console.error('[AuditLog] Failed to log customer update:', logErr);
      });
    } catch (err: unknown) {
      console.error('CustomerController.updateCustomer error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async deleteCustomer(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const rawId = req.params['id'];
      const id = String(Array.isArray(rawId) ? rawId[0] : rawId || '');

      const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
      const customer = await RegularCustomer.findOne({
        isDeleted: { $ne: true },
        $or: isMongoId ? [{ _id: id }, { membershipId: id.toUpperCase() }] : [{ membershipId: id.toUpperCase() }],
      });

      if (!customer) {
        res.status(404).json({ error: 'Not Found', message: 'Customer record not found' });
        return;
      }

      customer.isDeleted = true;
      await customer.save();

      res.status(200).json({
        success: true,
        message: `Membership ${customer.membershipId} removed successfully.`,
      });

      RRLogService.logActivity(
        `Deleted Customer Membership ${customer.membershipId}`,
        req.userId || 'ADMIN',
        req.userRole || 'admin',
        `Soft-deleted membership profile for ${customer.firstName} ${customer.lastName}`,
      ).catch((logErr) => {
        console.error('[AuditLog] Failed to log customer deletion:', logErr);
      });
    } catch (err: unknown) {
      console.error('CustomerController.deleteCustomer error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }

  static async checkDiscount(req: IRRRequest, res: Response): Promise<void> {
    try {
      const identifier = String(req.query['identifier'] || '').trim();
      const amount = Number(req.query['rentalAmount']) || 0;

      const discountResult = await BillingService.calculateMembershipDiscount(identifier, amount);
      res.status(200).json(discountResult);
    } catch (err: unknown) {
      console.error('CustomerController.checkDiscount error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: getErrorMessage(err) });
    }
  }
}
