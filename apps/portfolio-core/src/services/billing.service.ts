import { connectMongoose } from '../config/mongoose';
import { RegularCustomer, IRegularCustomerDocument } from '../models/regular-customer.model';
import { ICustomerMembershipDiscount } from '@portfolio/shared-types';

/**
 * Enterprise Billing & Membership Checkout Service.
 *
 * Encapsulates all discount calculation, membership lookup, and transaction
 * enrichment business logic, completely decoupling financial calculations
 * from Express routes and HTTP controllers.
 */
export class BillingService {
  /**
   * Queries the RegularCustomer database by unique identifier (phone or email).
   */
  static async findCustomer(identifier: string): Promise<IRegularCustomerDocument | null> {
    await connectMongoose();
    return await RegularCustomer.findByPhoneOrEmail(identifier);
  }

  /**
   * Calculates and returns the membership discount breakdown for a given customer identifier
   * and base rental amount.
   *
   * Mathematical logic:
   * 1. discountRate = customer.discountRate (configured percentage, e.g. 10%)
   * 2. discountAmount = round((baseRentalAmount * discountRate) / 100)
   * 3. finalRentalAmount = max(0, baseRentalAmount - discountAmount)
   */
  static async calculateMembershipDiscount(
    identifier: string,
    baseRentalAmount: number
  ): Promise<ICustomerMembershipDiscount> {
    const validAmount = Number.isFinite(baseRentalAmount) && baseRentalAmount > 0 ? baseRentalAmount : 0;

    if (!identifier || !identifier.trim()) {
      return {
        isRegularCustomer: false,
        discountRate: 0,
        discountAmount: 0,
        originalAmount: validAmount,
        finalRentalAmount: validAmount,
        message: 'No customer identifier provided.',
      };
    }

    await connectMongoose();
    const customer = await RegularCustomer.findByPhoneOrEmail(identifier);

    if (!customer || !customer.isActive) {
      return {
        isRegularCustomer: false,
        discountRate: 0,
        discountAmount: 0,
        originalAmount: validAmount,
        finalRentalAmount: validAmount,
        message: customer && !customer.isActive ? 'Customer membership is inactive.' : 'Customer not registered as regular member.',
      };
    }

    // Check if membership end date has passed
    if (customer.endDate && new Date(customer.endDate).getTime() < Date.now()) {
      return {
        isRegularCustomer: false,
        discountRate: 0,
        discountAmount: 0,
        originalAmount: validAmount,
        finalRentalAmount: validAmount,
        endDate: customer.endDate ? new Date(customer.endDate).toISOString() : undefined,
        message: `Customer membership expired on ${new Date(customer.endDate).toLocaleDateString()}. Regular discount unavailable.`,
      };
    }

    // Determine configured discount rate (allows 0 to 30%)
    const discountRate = Math.min(30, Math.max(0, customer.discountRate > 0 ? customer.discountRate : 10));

    // Mathematical discount calculation:
    // Amount = (Total * Rate) / 100, rounded to nearest INR
    let discountAmount = Math.round((validAmount * discountRate) / 100);

    // Enforce max discount ceiling (if maxDiscountAmount is set, discount cannot exceed it)
    if (customer.maxDiscountAmount && customer.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, customer.maxDiscountAmount);
    }

    const finalRentalAmount = Math.max(0, validAmount - discountAmount);

    return {
      isRegularCustomer: true,
      customerId: String(customer._id),
      membershipId: customer.membershipId,
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      phone: customer.phone,
      email: customer.email,
      membershipTier: customer.membershipTier,
      discountRate,
      maxDiscountAmount: customer.maxDiscountAmount,
      discountAmount,
      originalAmount: validAmount,
      finalRentalAmount,
      endDate: customer.endDate ? new Date(customer.endDate).toISOString() : undefined,
      message:
        customer.maxDiscountAmount && customer.maxDiscountAmount > 0
          ? `Verified ${customer.membershipTier.toUpperCase()} Member! ${discountRate}% discount (capped up to ₹${customer.maxDiscountAmount}): ₹${discountAmount} applied.`
          : `Verified ${customer.membershipTier.toUpperCase()} Member! Automatic ${discountRate}% discount (₹${discountAmount}) applied.`,
    };
  }

  /**
   * Increments the booking counter for a regular customer.
   */
  static async recordCustomerBooking(identifier: string): Promise<void> {
    await connectMongoose();
    const customer = await RegularCustomer.findByPhoneOrEmail(identifier);
    if (customer) {
      customer.totalBookings = (customer.totalBookings || 0) + 1;
      // Auto-upgrade tier based on booking milestones
      if (customer.totalBookings >= 20 && customer.membershipTier !== 'platinum') {
        customer.membershipTier = 'platinum';
        customer.discountRate = 25;
      } else if (customer.totalBookings >= 10 && customer.membershipTier === 'regular') {
        customer.membershipTier = 'gold';
        customer.discountRate = 20;
      } else if (customer.totalBookings >= 5 && customer.membershipTier === 'regular') {
        customer.membershipTier = 'silver';
        customer.discountRate = 15;
      }
      await customer.save();
    }
  }

  /**
   * Mock seed initialization.
   * Uses strictly compliant placeholders like '[Aadhaar Redacted]' per security specification.
   */
  static async seedInitialRegularCustomers(): Promise<void> {
    try {
      await connectMongoose();
      const count = await RegularCustomer.countDocuments();
      if (count === 0) {
        console.log('[BillingService] Seeding initial regular membership customers...');
        const initialMembers = [
          {
            membershipId: 'RRC001',
            firstName: 'Aditya',
            lastName: 'Kumar',
            fatherName: 'Anil Kumar',
            phone: '9876543210',
            altPhone: '9876543211',
            email: 'aditya.member@rams-cars.com',
            aadhar: '[Aadhaar Redacted]',
            dl: '[DL Redacted]',
            address: 'Road No. 12, Banjara Hills, Hyderabad, TS 500034',
            membershipTier: 'gold',
            discountRate: 20,
            maxDiscountAmount: 1000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // ~6 months
            durationMonths: 6,
            totalBookings: 12,
            isActive: true,
          },
          {
            membershipId: 'RRC002',
            firstName: 'Suresh',
            lastName: 'Rao',
            fatherName: 'Venkat Rao',
            phone: '9123456789',
            altPhone: '',
            email: 'suresh.rao@rams-cars.com',
            aadhar: '[Aadhaar Redacted]',
            dl: '[DL Redacted]',
            address: 'Main Road, Kakinada, AP 533001',
            membershipTier: 'regular',
            discountRate: 10,
            maxDiscountAmount: 500,
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // ~1 year
            durationMonths: 12,
            totalBookings: 3,
            isActive: true,
          },
        ];

        for (const member of initialMembers) {
          const doc = new RegularCustomer(member);
          await doc.save();
        }
        console.log('[BillingService] Successfully seeded regular membership customers.');
      }
    } catch (err: unknown) {
      console.error('[BillingService] Error seeding regular customers:', (err as Error).message);
    }
  }
}
