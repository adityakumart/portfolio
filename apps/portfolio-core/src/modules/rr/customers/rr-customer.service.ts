import { connectMongoose } from '../../../common/config/mongoose';
import { RegularCustomer, IRegularCustomerDocument } from './rr-customer.model';
import { BillingService } from './billing.service';
import { RRLogService } from '../logs/rr-log.service';
import { safeRegex } from '../../../common/utils/security/regex.util';
import {
  ICreateCustomerDTO,
  IUpdateCustomerDTO,
  ICustomerListResponse,
  ICustomerAutocompleteItem,
  ICustomerMembershipDiscount,
  IRegularCustomerMasked,
} from '@portfolio/shared-types';

export class RRCustomerService {
  /**
   * Queries customer by unique identifier (phone or email).
   */
  static async findCustomer(identifier: string): Promise<IRegularCustomerDocument | null> {
    return BillingService.findCustomer(identifier);
  }

  /**
   * Calculates membership discount for a rental transaction.
   */
  static async calculateMembershipDiscount(
    identifier: string,
    baseRentalAmount: number,
  ): Promise<ICustomerMembershipDiscount> {
    return BillingService.calculateMembershipDiscount(identifier, baseRentalAmount);
  }

  /**
   * Seeds demo customer members if none exist.
   */
  static async seedInitialRegularCustomers(): Promise<void> {
    return BillingService.seedInitialRegularCustomers();
  }

  /**
   * Lists customer memberships with search, pagination, and status filters.
   */
  static async listCustomers(
    search = '',
    tier?: string,
    status?: string,
    page = 1,
    limit = 10,
  ): Promise<ICustomerListResponse> {
    await connectMongoose();
    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (search.trim()) {
      const regex = safeRegex(search.trim(), 'i');
      filter['$or'] = [
        { firstName: regex },
        { lastName: regex },
        { phone: regex },
        { email: regex },
        { membershipId: regex },
      ];
    }

    if (tier && tier !== 'all') {
      filter['membershipTier'] = tier;
    }

    if (status && status !== 'all') {
      filter['isActive'] = status === 'active';
    }

    const total = await RegularCustomer.countDocuments(filter);
    const customers = await RegularCustomer.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      customers: customers.map((c) => c.toMaskedJSON()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves single customer by ID or membership ID.
   */
  static async getCustomerById(idOrMembershipId: string): Promise<IRegularCustomerMasked | null> {
    await connectMongoose();
    const customer = await RegularCustomer.findOne({
      $or: [{ _id: idOrMembershipId }, { membershipId: idOrMembershipId }],
      isDeleted: { $ne: true },
    });
    return customer ? customer.toMaskedJSON() : null;
  }

  /**
   * Creates a new regular customer membership.
   */
  static async createCustomer(
    body: ICreateCustomerDTO,
    performedBy = 'STAFF',
    role = 'employee',
  ): Promise<IRegularCustomerMasked> {
    await connectMongoose();

    const cleanEmail = body.email?.trim().toLowerCase();
    const orConditions: Array<Record<string, unknown>> = [{ phone: body.phone.trim() }];
    if (cleanEmail) {
      orConditions.push({ email: cleanEmail });
    }

    const existing = await RegularCustomer.findOne({
      isDeleted: { $ne: true },
      $or: orConditions,
    });

    if (existing) {
      const conflictField = existing.phone === body.phone.trim() ? 'Phone number' : 'Email address';
      throw new Error(`${conflictField} is already registered to membership ID ${existing.membershipId}`);
    }

    const totalCount = await RegularCustomer.countDocuments();
    const membershipId = `RRC${String(totalCount + 1).padStart(3, '0')}`;

    let discountRate = body.discountRate !== undefined ? Number(body.discountRate) : 10;
    const tier = body.membershipTier || 'regular';
    if (body.discountRate === undefined) {
      if (tier === 'silver') discountRate = 15;
      else if (tier === 'gold') discountRate = 20;
      else if (tier === 'platinum') discountRate = 25;
    }
    discountRate = Math.min(30, Math.max(0, discountRate));

    const startDate = body.startDate ? new Date(body.startDate) : new Date();
    const durationMonths = body.durationMonths && Number(body.durationMonths) > 0 ? Number(body.durationMonths) : 12;
    let endDate: Date;
    if (body.endDate) {
      endDate = new Date(body.endDate);
    } else {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);
    }

    const maxDiscountAmount =
      body.maxDiscountAmount && Number(body.maxDiscountAmount) > 0
        ? Math.round(Number(body.maxDiscountAmount))
        : undefined;

    const newCustomer = new RegularCustomer({
      membershipId,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      fatherName: body.fatherName.trim(),
      phone: body.phone.trim(),
      altPhone: body.altPhone?.trim() || '',
      email: cleanEmail || undefined,
      aadhar: body.aadhar?.replace(/\s/g, ''),
      dl: body.dl?.replace(/[\s-]/g, '').toUpperCase(),
      address: body.address.trim(),
      membershipTier: tier,
      discountRate,
      maxDiscountAmount,
      startDate,
      endDate,
      durationMonths,
      totalBookings: 0,
      isActive: true,
    });

    await newCustomer.save();

    RRLogService.logActivity(
      `Created Customer Membership ${membershipId}`,
      performedBy,
      role,
      `Registered regular customer ${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.phone}) | Tier: ${tier.toUpperCase()}`
    ).catch((err) => console.error('[AuditLog] Failed to log customer creation:', err));

    return newCustomer.toMaskedJSON();
  }

  /**
   * Autocompletes customer records matching phone, name, or membership ID.
   */
  static async autocomplete(query: string): Promise<ICustomerAutocompleteItem[]> {
    await connectMongoose();
    const cleanQuery = query.trim();
    const now = new Date();

    const andConditions: Array<Record<string, unknown>> = [
      { isDeleted: { $ne: true } },
      { isActive: { $ne: false } },
      {
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gt: now } },
        ],
      },
    ];

    if (cleanQuery) {
      const regex = safeRegex(cleanQuery, 'i');
      andConditions.push({
        $or: [
          { membershipId: regex },
          { firstName: regex },
          { lastName: regex },
          { phone: regex },
          { email: regex },
        ],
      });
    }

    const docs = await RegularCustomer.find({ $and: andConditions })
      .select('_id membershipId firstName lastName endDate')
      .sort({ firstName: 1, membershipId: 1 })
      .limit(20)
      .lean()
      .exec();

    return (
      docs as Array<{ _id: unknown; membershipId: string; firstName: string; lastName: string; endDate?: Date }>
    ).map((d) => ({
      _id: String(d._id),
      membershipId: d.membershipId,
      name: `${d.firstName} ${d.lastName}`.trim(),
      endDate: d.endDate ? new Date(d.endDate).toISOString() : undefined,
    }));
  }
}
