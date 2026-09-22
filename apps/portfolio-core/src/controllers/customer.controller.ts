import { Response } from 'express';
import { IRRRequest } from '../app/rr/rr.middleware';
import { connectMongoose } from '../config/mongoose';
import { RegularCustomer } from '../models/regular-customer.model';
import { BillingService } from '../services/billing.service';
import { RRService } from '../app/rr/rr.service';
import {
  ICreateCustomerDTO,
  IUpdateCustomerDTO,
  ICustomerListResponse,
  ICustomerAutocompleteItem,
} from '@portfolio/shared-types';

/**
 * Controller managing Customer Membership and KYC RESTful endpoints.
 * Guarantees that sensitive KYC numbers are never leaked unmasked in responses.
 */
export class CustomerController {
  /**
   * POST /api/rr/customers
   * Registers a new regular customer member with validated KYC.
   */
  static async createCustomer(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const body = req.body as ICreateCustomerDTO;

      // 1. Server-side validation
      const errors: string[] = [];
      if (!body.firstName?.trim()) errors.push('First name is required');
      if (!body.lastName?.trim()) errors.push('Last name is required');
      if (!body.fatherName?.trim()) errors.push("Father's name is required");
      if (!body.address?.trim()) errors.push('Address is required');

      // Phone validation (10-digit Indian mobile)
      if (!body.phone || !/^[6-9]\d{9}$/.test(body.phone.trim())) {
        errors.push('Phone number must be a valid 10-digit Indian mobile number');
      }

      // Alternate phone validation if present
      if (body.altPhone && !/^[6-9]\d{9}$/.test(body.altPhone.trim())) {
        errors.push('Alternate phone must be a valid 10-digit mobile number');
      }

      // Email validation
      if (
        !body.email ||
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(body.email.trim())
      ) {
        errors.push('Valid email address is required');
      }

      // Aadhaar format validation (12 digits or redacted placeholder)
      const cleanAadhaar = body.aadhar?.trim();
      if (!cleanAadhaar) {
        errors.push('Aadhaar number is required');
      } else if (cleanAadhaar !== '[Aadhaar Redacted]' && !/^\d{12}$/.test(cleanAadhaar.replace(/\s/g, ''))) {
        errors.push('Aadhaar number must contain exactly 12 numeric digits');
      }

      // Driving License format validation (15-16 alphanumeric or redacted placeholder)
      const cleanDL = body.dl?.trim();
      if (!cleanDL) {
        errors.push('Driving License number is required');
      } else if (cleanDL !== '[DL Redacted]' && !/^[A-Za-z0-9]{15,16}$/.test(cleanDL.replace(/[\s-]/g, ''))) {
        errors.push('Driving License must be 15 to 16 alphanumeric characters');
      }

      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation Failed', details: errors });
        return;
      }

      // 2. Duplicate checks (Phone & Email)
      const existing = await RegularCustomer.findOne({
        isDeleted: { $ne: true },
        $or: [
          { phone: body.phone.trim() },
          { email: body.email.trim().toLowerCase() },
        ],
      });

      if (existing) {
        const conflictField = existing.phone === body.phone.trim() ? 'Phone number' : 'Email address';
        res.status(409).json({
          error: 'Conflict',
          message: `${conflictField} is already registered to membership ID ${existing.membershipId}`,
        });
        return;
      }

      // 3. Generate sequential Membership ID
      const totalCount = await RegularCustomer.countDocuments();
      const membershipId = `RRC${String(totalCount + 1).padStart(3, '0')}`;

      // Default discount rate per tier
      let discountRate = body.discountRate ?? 10;
      const tier = body.membershipTier || 'regular';
      if (!body.discountRate) {
        if (tier === 'silver') discountRate = 15;
        else if (tier === 'gold') discountRate = 20;
        else if (tier === 'platinum') discountRate = 25;
      }

      // 4. Create and save model (encryption handled automatically via Mongoose pre-save hook)
      const newCustomer = new RegularCustomer({
        membershipId,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        fatherName: body.fatherName.trim(),
        phone: body.phone.trim(),
        altPhone: body.altPhone?.trim() || '',
        email: body.email.trim().toLowerCase(),
        aadhar: cleanAadhaar?.replace(/\s/g, ''),
        dl: cleanDL?.replace(/[\s-]/g, '').toUpperCase(),
        address: body.address.trim(),
        membershipTier: tier,
        discountRate,
        totalBookings: 0,
        isActive: true,
      });

      await newCustomer.save();

      // Log activity
      await RRService.logActivity(
        `Created Customer Membership ${membershipId}`,
        req.userId || 'STAFF',
        req.userRole || 'employee',
        `Registered regular customer ${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.phone}) | Tier: ${tier.toUpperCase()}`
      );

      // Return masked representation
      res.status(201).json(newCustomer.toMaskedJSON());
    } catch (err: unknown) {
      console.error('CustomerController.createCustomer error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * GET /api/rr/customers
   * Returns a paginated list of regular customers with masked KYC data.
   */
  static async getCustomers(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query['limit']) || 10));
      const search = typeof req.query['search'] === 'string' ? req.query['search'].trim() : '';

      const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

      if (search) {
        const regex = new RegExp(search, 'i');
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
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * GET /api/rr/customers/autocomplete
   * Lightweight endpoint returning strictly ID and Name for fast dropdown selection.
   */
  static async getCustomersAutocomplete(req: IRRRequest, res: Response): Promise<void> {
    try {
      await connectMongoose();
      const q = typeof req.query['q'] === 'string' ? req.query['q'].trim() : '';

      const filter: Record<string, unknown> = {
        isDeleted: { $ne: true },
        isActive: { $ne: false },
      };

      if (q) {
        const regex = new RegExp(q, 'i');
        filter['$or'] = [
          { membershipId: regex },
          { firstName: regex },
          { lastName: regex },
        ];
      }

      const docs = await RegularCustomer.find(filter)
        .select('_id membershipId firstName lastName')
        .sort({ firstName: 1, membershipId: 1 })
        .limit(20)
        .lean()
        .exec();

      const items: ICustomerAutocompleteItem[] = (
        docs as Array<{ _id: unknown; membershipId: string; firstName: string; lastName: string }>
      ).map((d) => ({
        _id: String(d._id),
        membershipId: d.membershipId,
        name: `${d.firstName} ${d.lastName}`.trim(),
      }));

      res.status(200).json(items);
    } catch (err: unknown) {
      console.error('CustomerController.getCustomersAutocomplete error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * GET /api/rr/customers/:id
   * Retrieves a single customer record by MongoDB ID or Membership ID.
   */
  static async getCustomerById(req: IRRRequest, res: Response): Promise<void> {
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
        res.status(404).json({ error: 'Not Found', message: 'Customer membership record not found' });
        return;
      }

      res.status(200).json(customer.toMaskedJSON());
    } catch (err: unknown) {
      console.error('CustomerController.getCustomerById error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * PUT /api/rr/customers/:id
   * Updates customer membership profile.
   */
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
        customer.discountRate = body.discountRate;
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
      if (body.email && body.email.toLowerCase() !== customer.email) {
        const cleanEmail = body.email.trim().toLowerCase();
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
          res.status(400).json({ error: 'Validation Error', message: 'Invalid email address' });
          return;
        }
        const duplicateEmail = await RegularCustomer.findOne({
          _id: { $ne: customer._id },
          email: cleanEmail,
          isDeleted: { $ne: true },
        });
        if (duplicateEmail) {
          res.status(409).json({ error: 'Conflict', message: 'Email address already in use by another member' });
          return;
        }
        customer.email = cleanEmail;
      }

      // KYC updates if provided
      if (body.aadhar && body.aadhar !== '[Aadhaar Redacted]') {
        const cleanAadhaar = body.aadhar.replace(/\s/g, '');
        if (/^\d{12}$/.test(cleanAadhaar)) {
          customer.aadhar = cleanAadhaar; // Pre-save hook will encrypt
        }
      }

      if (body.dl && body.dl !== '[DL Redacted]') {
        const cleanDL = body.dl.replace(/[\s-]/g, '').toUpperCase();
        if (/^[A-Za-z0-9]{15,16}$/.test(cleanDL)) {
          customer.dl = cleanDL; // Pre-save hook will encrypt
        }
      }

      await customer.save();

      await RRService.logActivity(
        `Updated Customer Membership ${customer.membershipId}`,
        req.userId || 'STAFF',
        req.userRole || 'employee',
        `Updated customer record for ${customer.firstName} ${customer.lastName}`
      );

      res.status(200).json(customer.toMaskedJSON());
    } catch (err: unknown) {
      console.error('CustomerController.updateCustomer error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * DELETE /api/rr/customers/:id
   * Soft deletes a customer membership record.
   */
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

      await RRService.logActivity(
        `Deleted Customer Membership ${customer.membershipId}`,
        req.userId || 'ADMIN',
        req.userRole || 'admin',
        `Soft-deleted membership profile for ${customer.firstName} ${customer.lastName}`
      );

      res.status(200).json({
        success: true,
        message: `Membership ${customer.membershipId} removed successfully.`,
      });
    } catch (err: unknown) {
      console.error('CustomerController.deleteCustomer error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }

  /**
   * GET /api/rr/customers/billing/discount
   * Dedicated checkout query endpoint to calculate membership discount for a transaction.
   */
  static async checkDiscount(req: IRRRequest, res: Response): Promise<void> {
    try {
      const identifier = String(req.query['identifier'] || '').trim();
      const amount = Number(req.query['rentalAmount']) || 0;

      const discountResult = await BillingService.calculateMembershipDiscount(identifier, amount);
      res.status(200).json(discountResult);
    } catch (err: unknown) {
      console.error('CustomerController.checkDiscount error:', err);
      res.status(500).json({ error: 'Internal Server Error', message: (err as Error).message });
    }
  }
}
