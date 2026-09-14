import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarX,
  lucideX,
  lucideCheckCircle,
  lucideCheck,
  lucidePlus,
  lucideTrash2,
  lucideAlertCircle,
  lucideClock,
  lucideGauge,
  lucideShieldAlert,
  lucideReceipt,
  lucideSparkles,
  lucideInfo,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking, IVehicle, IVehiclePricing, IDamageItem } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';

export interface EndBookingDialogContext {
  booking: IBooking;
  vehicles?: IVehicle[];
}

export type EndBookingScenario = 'case1' | 'case2' | 'case3' | 'case4_1' | 'case4_2';

@Component({
  selector: 'app-rr-end-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideCalendarX,
      lucideX,
      lucideCheckCircle,
      lucideCheck,
      lucidePlus,
      lucideTrash2,
      lucideAlertCircle,
      lucideClock,
      lucideGauge,
      lucideShieldAlert,
      lucideReceipt,
      lucideSparkles,
      lucideInfo,
    }),
  ],
  templateUrl: './end-booking-dialog.component.html',
})
export class RREndBookingDialogComponent implements OnInit {
  protected readonly Number = Number;
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<EndBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private invoicePdf = inject(RRInvoicePdfService);
  isSubmitting = signal(false);

  booking = signal<IBooking | null>(null);
  vehicle = signal<IVehicle | null>(null);

  // Active validation scenario (Case 1, 2, 3, 4.1, 4.2)
  activeScenario = signal<EndBookingScenario>('case1');

  // Fields state
  endBookingFields = {
    // Top fields
    odometerEnd: '',
    returnDateTimeActual: '',

    // Cleanliness Fee
    cleanlinessChoice: 'none' as 'none' | '500' | '1000' | 'custom',
    customCleanlinessAmount: '' as number | '',
    cleanlinessFee: 0,

    // Extra KMs and Extra Hrs
    extraKmRate: 0,
    extraHourRate: 0,
    actualDistanceDriven: 0,
    extraKms: 0,
    extraKmFee: 0,
    extraHours: 0,
    extraHourFee: 0,

    // Case 4.2 Extension / Slab Recalculation
    recalculateSlabMode: false,
    slabExtraKmAllowance: 0,
    slabExtraRent: 0,
    effectiveKmLimit: 0,

    // Damages
    damagesTotal: 0,

    // Challana / Toll
    challanaAmount: '' as number | '',
    tollAmount: '' as number | '',
    finesAmount: '' as number | '',
    challanaTollFinesTotal: 0,

    // Rent & Balance Pending
    totalRentAmount: 0,
    discountAmount: 0,
    finalRentAmount: 0,
    paidAmount: 0,
    basePendingAmount: 0,

    // Late / Non-Intimation Fine (only when both KMs & hours exceeded, default 1000, no cap)
    applyNonIntimationFine: false,
    nonIntimationFine: 1000 as number | '',

    // Summary totals
    totalAdditionalFees: 0,
    finalTotalPayable: 0,
    balancePending: 0,

    // Settlement
    settleNow: true,
    paymentMode: 'Cash' as 'Cash' | 'UPI' | 'Card' | 'Net Banking',
  };

  // Dynamic Damages list
  damages: IDamageItem[] = [];

  isOdometerEndInvalid(): boolean {
    if (
      this.endBookingFields.odometerEnd === '' ||
      this.endBookingFields.odometerEnd === null ||
      this.endBookingFields.odometerEnd === undefined
    ) {
      return false;
    }
    const endOdo = Number(this.endBookingFields.odometerEnd);
    const startOdo = Number(this.booking()?.vehicleOdometerStart) || 0;
    return isNaN(endOdo) || endOdo < startOdo;
  }

  getActualDurationText(): string {
    const startStr = this.booking()?.pickupDateTime || this.booking()?.createdAt;
    const endStr = this.endBookingFields.returnDateTimeActual;
    if (!startStr || !endStr) return '';

    const start = new Date(startStr);
    const end = new Date(endStr);
    let diffMs = end.getTime() - start.getTime();

    if (isNaN(diffMs) || diffMs <= 0) {
      return '0 mins';
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    diffMs -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    diffMs -= hours * (1000 * 60 * 60);

    const mins = Math.floor(diffMs / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (mins > 0 || parts.length === 0) {
      parts.push(`${mins} ${mins === 1 ? 'min' : 'mins'}`);
    }

    if (parts.length === 1) {
      return parts[0];
    }
    if (parts.length === 2) {
      return `${parts[0]} and ${parts[1]}`;
    }
    return `${parts[0]} ${parts[1]} and ${parts[2]}`;
  }

  ngOnInit() {
    if (this.data?.booking) {
      const b = this.data.booking;
      this.booking.set(b);

      // Match vehicle
      if (this.data.vehicles && this.data.vehicles.length > 0) {
        const matchedVeh = this.data.vehicles.find((v) => v.regNo === b.vehicleRegNo);
        if (matchedVeh) {
          this.vehicle.set(matchedVeh);
        }
      }

      // Initialize default rates
      this.endBookingFields.extraKmRate = Number(b.extraKmPrice) || (this.vehicle() ? Number(this.vehicle()?.extraKmPrice) : 0) || 0;
      this.endBookingFields.extraHourRate = Number(b.extraHourPrice) || (this.vehicle() ? Number(this.vehicle()?.extraHourPrice) : 0) || 0;

      // Initialize default return time to current local time
      this.endBookingFields.returnDateTimeActual = this.formatDateTimeLocal(new Date());

      // Base rent values
      this.endBookingFields.totalRentAmount = Number(b.totalRentalAmount) || 0;
      this.endBookingFields.discountAmount = Number(b.discount) || 0;
      this.endBookingFields.finalRentAmount = Number(b.finalRentalAmount) || 0;
      this.endBookingFields.paidAmount = Number(b.amountPaid) || 0;
      this.endBookingFields.basePendingAmount = Number(b.pendingAmount) || (this.endBookingFields.finalRentAmount - this.endBookingFields.paidAmount);

      this.calculateEndBookingFees();
    }
  }

  formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  }

  // --- Cleanliness Choice Handlers ---
  setCleanlinessChoice(choice: 'none' | '500' | '1000' | 'custom') {
    this.endBookingFields.cleanlinessChoice = choice;
    if (choice === '500') {
      this.endBookingFields.cleanlinessFee = 500;
    } else if (choice === '1000') {
      this.endBookingFields.cleanlinessFee = 1000;
    } else if (choice === 'none') {
      this.endBookingFields.cleanlinessFee = 0;
    } else {
      this.endBookingFields.cleanlinessFee = Number(this.endBookingFields.customCleanlinessAmount) || 0;
    }
    this.calculateEndBookingFees();
  }

  onCustomCleanlinessChange() {
    if (this.endBookingFields.cleanlinessChoice === 'custom') {
      this.endBookingFields.cleanlinessFee = Math.max(0, Number(this.endBookingFields.customCleanlinessAmount) || 0);
      this.calculateEndBookingFees();
    }
  }

  // --- Damages Handlers ---
  addDamage() {
    const newDamage: IDamageItem = {
      id: 'dmg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      description: '',
      amount: '' as any,
      confirmed: true,
    };
    this.damages.push(newDamage);
    this.calculateEndBookingFees();
  }

  removeDamage(id: string) {
    this.damages = this.damages.filter((d) => d.id !== id);
    this.calculateEndBookingFees();
  }

  toggleDamageConfirm(damage: IDamageItem) {
    damage.confirmed = !damage.confirmed;
  }

  // --- Non-Intimation Fine ---
  onToggleNonIntimationFine() {
    if (this.endBookingFields.applyNonIntimationFine) {
      if (!this.endBookingFields.nonIntimationFine) {
        this.endBookingFields.nonIntimationFine = 1000;
      }
    } else {
      this.endBookingFields.nonIntimationFine = '';
    }
    this.calculateEndBookingFees();
  }

  onNonIntimationFineInput() {
    if (Number(this.endBookingFields.nonIntimationFine) < 0) {
      this.endBookingFields.nonIntimationFine = 0;
    }
    this.calculateEndBookingFees();
  }

  // --- Slab calculation algorithms ---
  calculateSlabRent(hours: number, pricing?: IVehiclePricing): number {
    if (!pricing || hours <= 0) return 0;
    let remaining = hours;
    let totalRent = 0;

    const p23 = Number(pricing.h23?.price || 0);
    const p11 = Number(pricing.h11?.price || 0);
    const p3 = Number(pricing.h3?.price || 0);
    const p1 = Number(pricing.h1?.price || 0);

    if (remaining >= 24) {
      const count = Math.floor(remaining / 24);
      totalRent += count * p23;
      remaining -= count * 24;
    }
    if (remaining >= 12) {
      const count = Math.floor(remaining / 12);
      totalRent += count * p11;
      remaining -= count * 12;
    }
    if (remaining >= 4) {
      const count = Math.floor(remaining / 4);
      totalRent += count * p3;
      remaining -= count * 4;
    }
    if (remaining > 0) {
      totalRent += remaining * p1;
    }
    return totalRent;
  }

  calculateSlabKm(hours: number, pricing?: IVehiclePricing): number {
    if (!pricing || hours <= 0) return 0;
    let remaining = hours;
    let totalKm = 0;

    const km23 = Number(pricing.h23?.km || 0);
    const km11 = Number(pricing.h11?.km || 0);
    const km3 = Number(pricing.h3?.km || 0);

    if (remaining >= 24) {
      const count = Math.floor(remaining / 24);
      totalKm += count * km23;
      remaining -= count * 24;
    }
    if (remaining >= 12) {
      const count = Math.floor(remaining / 12);
      totalKm += count * km11;
      remaining -= count * 12;
    }
    if (remaining >= 4) {
      const count = Math.floor(remaining / 4);
      totalKm += count * km3;
      remaining -= count * 4;
    }
    if (remaining > 0) {
      totalKm += km3;
    }
    return totalKm;
  }

  // --- Main Calculation & Validation Engine ---
  calculateEndBookingFees() {
    const b = this.booking();
    if (!b) return;

    const startOdo = Number(b.vehicleOdometerStart) || 0;
    const endOdo = Number(this.endBookingFields.odometerEnd) || 0;
    const baseKmLimit = Number(b.totalKmLimit) || 0;

    // 1. Distance driven
    const distanceDriven = endOdo > startOdo ? endOdo - startOdo : 0;
    this.endBookingFields.actualDistanceDriven = distanceDriven;

    // 2. Extra hours driven
    let rawHoursExceeded = 0;
    if (this.endBookingFields.returnDateTimeActual && b.returnDateTime) {
      const expectedReturn = new Date(b.returnDateTime);
      const actualReturn = new Date(this.endBookingFields.returnDateTimeActual);
      if (actualReturn > expectedReturn) {
        const diffMs = actualReturn.getTime() - expectedReturn.getTime();
        rawHoursExceeded = Math.ceil(diffMs / (1000 * 60 * 60));
      }
    }

    const rawKmsExceeded = baseKmLimit > 0 ? Math.max(0, distanceDriven - baseKmLimit) : 0;
    const isKmExceeded = rawKmsExceeded > 0;
    const isHrsExceeded = rawHoursExceeded > 0;

    // [1] Cleanliness Fee
    if (this.endBookingFields.cleanlinessChoice === '500') {
      this.endBookingFields.cleanlinessFee = 500;
    } else if (this.endBookingFields.cleanlinessChoice === '1000') {
      this.endBookingFields.cleanlinessFee = 1000;
    } else if (this.endBookingFields.cleanlinessChoice === 'custom') {
      this.endBookingFields.cleanlinessFee = Math.max(0, Number(this.endBookingFields.customCleanlinessAmount) || 0);
    } else {
      this.endBookingFields.cleanlinessFee = 0;
    }

    // [4] Damages total
    this.endBookingFields.damagesTotal = this.damages.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    // Challana / Toll total (fines merged with challan)
    const challana = Math.max(0, Number(this.endBookingFields.challanaAmount) || 0);
    const toll = Math.max(0, Number(this.endBookingFields.tollAmount) || 0);
    this.endBookingFields.challanaTollFinesTotal = challana + toll;

    // --- Scenario Logic & Validations ---
    const extraKmPrice = Number(this.endBookingFields.extraKmRate) || 0;
    const extraHourPrice = Number(this.endBookingFields.extraHourRate) || 0;

    let extraKms = 0;
    let extraKmFee = 0;
    let extraHours = 0;
    let extraHourFee = 0;
    let finalRent = Number(b.finalRentalAmount) || 0;
    let basePending = Number(b.pendingAmount) || (finalRent - (Number(b.amountPaid) || 0));

    this.endBookingFields.effectiveKmLimit = baseKmLimit;
    this.endBookingFields.slabExtraKmAllowance = 0;
    this.endBookingFields.slabExtraRent = 0;

    if (!isKmExceeded && !isHrsExceeded) {
      // Case 1: if Km's and Hrs are in limit (extra kms & hrs are zero)
      this.activeScenario.set('case1');
      extraKms = 0;
      extraKmFee = 0;
      extraHours = 0;
      extraHourFee = 0;
    } else if (isKmExceeded && !isHrsExceeded) {
      // Case 2: If Km's exceeded and returned within Hrs (extra hrs is zero)
      this.activeScenario.set('case2');
      extraKms = rawKmsExceeded;
      extraKmFee = extraKms * extraKmPrice;
      extraHours = 0;
      extraHourFee = 0;
    } else if (!isKmExceeded && isHrsExceeded) {
      // Case 3: If Hr's exceed and returned within Km's (extra kms is zero)
      this.activeScenario.set('case3');
      extraKms = 0;
      extraKmFee = 0;
      extraHours = rawHoursExceeded;
      extraHourFee = extraHours * extraHourPrice;
    } else {
      // Case 4: If both Km's and Hrs exceeded
      if (this.endBookingFields.recalculateSlabMode) {
        // Case 4.2: Recalculate extra kms and hrs field (by new time calculate extra time and add its respective kms limit)
        this.activeScenario.set('case4_2');
        const veh = this.vehicle();
        if (veh && veh.pricing) {
          const addedKmLimit = this.calculateSlabKm(rawHoursExceeded, veh.pricing);
          const addedRent = this.calculateSlabRent(rawHoursExceeded, veh.pricing);

          this.endBookingFields.slabExtraKmAllowance = addedKmLimit;
          this.endBookingFields.slabExtraRent = addedRent;

          const newEffectiveKmLimit = baseKmLimit + addedKmLimit;
          this.endBookingFields.effectiveKmLimit = newEffectiveKmLimit;

          extraKms = Math.max(0, distanceDriven - newEffectiveKmLimit);
          extraKmFee = extraKms * extraKmPrice;

          // Rent section changed as new duration and limit gives new renting price
          finalRent = (Number(b.finalRentalAmount) || 0) + addedRent;
          basePending = finalRent - (Number(b.amountPaid) || 0);

          // Extra hours absorbed into the new slab rental duration
          extraHours = rawHoursExceeded;
          extraHourFee = 0; // Absorbed into slab rent
        } else {
          // Fallback if vehicle pricing not present
          extraKms = rawKmsExceeded;
          extraKmFee = extraKms * extraKmPrice;
          extraHours = rawHoursExceeded;
          extraHourFee = extraHours * extraHourPrice;
        }
      } else {
        // Case 4.1: Standard mode (all will be added)
        this.activeScenario.set('case4_1');
        extraKms = rawKmsExceeded;
        extraKmFee = extraKms * extraKmPrice;
        extraHours = rawHoursExceeded;
        extraHourFee = extraHours * extraHourPrice;
      }
    }

    // Late / Non-Intimation Fine: Only applicable when both KMs and hours are exceeded (Case 4)
    const isBothExceeded = isKmExceeded && isHrsExceeded;
    let nonIntimationFine = 0;
    if (isBothExceeded && this.endBookingFields.applyNonIntimationFine) {
      nonIntimationFine = Math.max(0, Number(this.endBookingFields.nonIntimationFine) || 0);
    } else if (!isBothExceeded) {
      this.endBookingFields.applyNonIntimationFine = false;
    }

    this.endBookingFields.extraKms = extraKms;
    this.endBookingFields.extraKmFee = extraKmFee;
    this.endBookingFields.extraHours = extraHours;
    this.endBookingFields.extraHourFee = extraHourFee;
    this.endBookingFields.finalRentAmount = finalRent;
    this.endBookingFields.basePendingAmount = basePending;

    // Total Additional Charges
    const totalAdd =
      this.endBookingFields.cleanlinessFee +
      extraKmFee +
      extraHourFee +
      this.endBookingFields.damagesTotal +
      this.endBookingFields.challanaTollFinesTotal +
      nonIntimationFine;

    this.endBookingFields.totalAdditionalFees = totalAdd;

    // Final Total Payable
    const finalTotal = finalRent + totalAdd;
    this.endBookingFields.finalTotalPayable = finalTotal;

    // Pending/Balance Amount
    const netBalance = finalTotal - (Number(b.amountPaid) || 0);
    this.endBookingFields.balancePending = netBalance;
  }

  // --- Submission ---
  async submitEndBooking() {
    const b = this.booking();
    if (!b) return;

    if (!this.endBookingFields.odometerEnd) {
      toast.error('Please enter return odometer reading.');
      return;
    }

    const endOdo = Number(this.endBookingFields.odometerEnd);
    const startOdo = Number(b.vehicleOdometerStart) || 0;
    if (endOdo < startOdo) {
      toast.error(`Return odometer (${endOdo} KM) cannot be less than pickup odometer (${startOdo} KM).`);
      return;
    }

    if (!this.endBookingFields.returnDateTimeActual) {
      toast.error('Please select actual return date and time.');
      return;
    }

    try {
      this.isSubmitting.set(true);

      const isSettlingNow = this.endBookingFields.settleNow;
      const finalRentalAmountToSave = String(this.endBookingFields.finalTotalPayable);
      const pendingAmountToSave = isSettlingNow ? '0' : String(this.endBookingFields.balancePending);
      const amountPaidToSave = isSettlingNow
        ? String(this.endBookingFields.finalTotalPayable)
        : String(b.amountPaid || '0');

      const isBothExceeded = this.activeScenario() === 'case4_1' || this.activeScenario() === 'case4_2';
      const patch: Partial<IBooking> = {
        status: 'completed',
        vehicleOdometerEnd: String(endOdo),
        returnDateTimeActual: this.endBookingFields.returnDateTimeActual,
        cleanlinessFee: String(this.endBookingFields.cleanlinessFee),
        extraKmsTravelled: String(this.endBookingFields.extraKms),
        extraKmFee: String(this.endBookingFields.extraKmFee),
        extraHoursTaken: String(this.endBookingFields.extraHours),
        extraHourFee: String(this.endBookingFields.extraHourFee),
        damages: this.damages,
        damagesTotal: String(this.endBookingFields.damagesTotal),
        challanaAmount: String(this.endBookingFields.challanaAmount || 0),
        tollAmount: String(this.endBookingFields.tollAmount || 0),
        finesAmount: '0',
        challanaTollFinesTotal: String(this.endBookingFields.challanaTollFinesTotal),
        nonIntimationFine: isBothExceeded && this.endBookingFields.applyNonIntimationFine ? String(this.endBookingFields.nonIntimationFine || 0) : '0',
        recalculateSlabMode: this.endBookingFields.recalculateSlabMode,
        totalAdditionalFees: String(this.endBookingFields.totalAdditionalFees),
        finalRentalAmount: finalRentalAmountToSave,
        pendingAmount: pendingAmountToSave,
        amountPaid: amountPaidToSave,
        paymentMode: isSettlingNow ? this.endBookingFields.paymentMode : (b.paymentMode || 'Cash'),
      };

      await this.rrApi.updateBooking(b.id, patch);

      // Update vehicle odometer and availability
      try {
        await this.rrApi.updateVehicle(b.vehicleRegNo, {
          odometer: String(endOdo),
          status: 'available',
          bookingId: null,
        });
      } catch (ve) {
        console.warn('Vehicle odometer update note:', ve);
      }

      // Automatically generate & download customer invoice
      const completedBooking: IBooking = {
        ...b,
        ...patch,
      } as IBooking;

      try {
        await this.invoicePdf.printInvoicePdf(completedBooking);
      } catch (pdfErr) {
        console.error('Customer invoice generation note:', pdfErr);
      }

      toast.success(`Booking ${b.id} ended & customer invoice generated!`);
      this.dialogRef?.close(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Error finalizing booking.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeDialog() {
    this.dialogRef?.close(false);
  }
}
