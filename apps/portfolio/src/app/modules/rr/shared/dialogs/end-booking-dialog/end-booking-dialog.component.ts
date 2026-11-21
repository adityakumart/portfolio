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
  lucidePhoneCall,
  lucideCamera,
  lucideUpload,
  lucideImage,
  lucideFileText,
  lucideExternalLink,
  lucidePaperclip,
  lucideCheckCircle2,
  lucideEye,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import {
  IBooking,
  IVehicle,
  IVehiclePricing,
  IDamageItem,
  IBookingAttachments,
} from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';

import { AadharVisiblePipe } from '../../utils/aadhar-mask.util';
import { IndianDatePipe } from '../../../../../shared/pipes/indian-date.pipe';

export interface EndBookingDialogContext {
  booking: IBooking;
  vehicles?: IVehicle[];
}

export type EndBookingScenario =
  | 'case1'
  | 'case2'
  | 'case3'
  | 'case4';

export type Case4ResolvedScenario = 'case1' | 'case2' | null;

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
    AadharVisiblePipe,
    IndianDatePipe,
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
      lucidePhoneCall,
      lucideCamera,
      lucideUpload,
      lucideImage,
      lucideFileText,
      lucideExternalLink,
      lucidePaperclip,
      lucideCheckCircle2,
      lucideEye,
      lucideRefreshCw,
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

  // Active validation scenario (Case 1, 2, 3, 4)
  activeScenario = signal<EndBookingScenario>('case1');
  case4ResolvedScenario = signal<Case4ResolvedScenario>(null);

  attachmentsVerified = signal<boolean>(false);
  previewImageUrl = signal<string | null>(null);

  // Damage selection status: null (unselected), 'none' (no damages), 'damage' (has damages)
  damageStatus = signal<'none' | 'damage' | null>(null);

  // Case 4 fine selection: null (unselected), 'apply', 'waive'
  case4FineSelection = signal<'apply' | 'waive' | null>(null);

  // Collect Remaining Due Balance checkbox mandatory state
  collectRemainingBalance = signal<boolean>(false);

  bookingAttachments = computed<IBookingAttachments>(() => {
    const b = this.booking();
    if (!b) return {};
    if (b.bookingAttachments) {
      return b.bookingAttachments;
    }
    return {
      signedAgreement: b.signedAgreementUrl || null,
      vehicleImages: b.attachments || [],
    };
  });

  // Fields state
  endBookingFields = {
    // Top fields
    odometerEnd: '',
    returnDateTimeActual: '',

    // Cleanliness Fee
    cleanlinessChoice: '' as '' | 'none' | '500' | '1000' | 'custom',
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
    settleNow: false,
    paymentMode: '' as string,
  };

  // Dynamic Damages list
  damages: (IDamageItem & { isUploadingImage?: boolean })[] = [];

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

  isReturnDateInvalid(): boolean {
    if (!this.endBookingFields.returnDateTimeActual) return false;
    const startStr =
      this.booking()?.pickupDateTime || this.booking()?.createdAt;
    if (!startStr) return false;
    const pickupTime = new Date(startStr).getTime();
    const returnTime = new Date(
      this.endBookingFields.returnDateTimeActual,
    ).getTime();
    return !isNaN(pickupTime) && !isNaN(returnTime) && returnTime < pickupTime;
  }

  hasReturnDetailsEntered(): boolean {
    return (
      !!this.endBookingFields.odometerEnd &&
      !this.isOdometerEndInvalid() &&
      !!this.endBookingFields.returnDateTimeActual &&
      !this.isReturnDateInvalid()
    );
  }

  hasInvalidDamages(): boolean {
    if (this.damages.length === 0) return false;
    return this.damages.some((d) => this.isDamageItemInvalid(d));
  }

  isDamageItemInvalid(dmg: IDamageItem): boolean {
    return (
      !dmg.description ||
      dmg.description.trim() === '' ||
      (dmg.amount as unknown as string) === '' ||
      dmg.amount === null ||
      dmg.amount === undefined ||
      isNaN(Number(dmg.amount)) ||
      Number(dmg.amount) < 0
    );
  }

  isDamageAmountInvalid(dmg: IDamageItem): boolean {
    return (
      (dmg.amount as unknown as string) === '' ||
      dmg.amount === null ||
      dmg.amount === undefined ||
      isNaN(Number(dmg.amount)) ||
      Number(dmg.amount) < 0
    );
  }

  hasDamageVerificationPassed(): boolean {
    if (this.damageStatus() === 'none') {
      return true;
    }
    if (this.damageStatus() === 'damage') {
      if (this.damages.length === 0) return false;
      return !this.hasInvalidDamages();
    }
    return false;
  }

  isChallanInvalid(): boolean {
    return (
      this.endBookingFields.challanaAmount === '' ||
      this.endBookingFields.challanaAmount === null ||
      this.endBookingFields.challanaAmount === undefined ||
      isNaN(Number(this.endBookingFields.challanaAmount)) ||
      Number(this.endBookingFields.challanaAmount) < 0
    );
  }

  isTollInvalid(): boolean {
    return (
      this.endBookingFields.tollAmount === '' ||
      this.endBookingFields.tollAmount === null ||
      this.endBookingFields.tollAmount === undefined ||
      isNaN(Number(this.endBookingFields.tollAmount)) ||
      Number(this.endBookingFields.tollAmount) < 0
    );
  }

  isCase4FineInvalid(): boolean {
    if (this.activeScenario() !== 'case4') {
      return false;
    }
    if (!this.case4FineSelection()) {
      return true;
    }
    if (this.case4FineSelection() === 'apply') {
      return (
        this.endBookingFields.nonIntimationFine === '' ||
        this.endBookingFields.nonIntimationFine === null ||
        this.endBookingFields.nonIntimationFine === undefined ||
        isNaN(Number(this.endBookingFields.nonIntimationFine)) ||
        Number(this.endBookingFields.nonIntimationFine) < 0
      );
    }
    return false;
  }

  isFormValid(): boolean {
    // 1. Odometer end reading must be filled and valid (>= start odometer)
    if (
      this.endBookingFields.odometerEnd === '' ||
      this.endBookingFields.odometerEnd === null ||
      this.endBookingFields.odometerEnd === undefined ||
      this.isOdometerEndInvalid()
    ) {
      return false;
    }

    // 2. Return date and time must be entered and valid (not earlier than pickup)
    if (
      !this.endBookingFields.returnDateTimeActual ||
      this.endBookingFields.returnDateTimeActual.trim() === '' ||
      isNaN(new Date(this.endBookingFields.returnDateTimeActual).getTime()) ||
      this.isReturnDateInvalid()
    ) {
      return false;
    }

    // 3. Return attachments must be verified after vehicle inspection
    if (!this.attachmentsVerified()) {
      return false;
    }

    // 4. Cleanliness fee must be explicitly addressed (cannot be blank)
    if (
      !this.endBookingFields.cleanlinessChoice ||
      this.endBookingFields.cleanlinessChoice.trim() === ''
    ) {
      return false;
    }

    // If custom cleanliness is selected, amount must be valid and non-negative
    if (this.endBookingFields.cleanlinessChoice === 'custom') {
      if (
        this.endBookingFields.customCleanlinessAmount === '' ||
        this.endBookingFields.customCleanlinessAmount === null ||
        isNaN(Number(this.endBookingFields.customCleanlinessAmount)) ||
        Number(this.endBookingFields.customCleanlinessAmount) < 0
      ) {
        return false;
      }
    }

    // 5. Damages mandatory (Must select None or Add Damage; if damage, all items complete)
    if (!this.hasDamageVerificationPassed()) {
      return false;
    }

    // 6. Challan mandatory (numeric >= 0, enter 0 if none)
    if (this.isChallanInvalid()) {
      return false;
    }

    // 7. Toll mandatory (numeric >= 0, enter 0 if none)
    if (this.isTollInvalid()) {
      return false;
    }

    // 8. Late / Non-Intimation Fine mandatory decision when Case 4 is active
    if (this.isCase4FineInvalid()) {
      return false;
    }

    // 9. Collect Remaining Due Balance checkbox is mandatory
    if (!this.collectRemainingBalance()) {
      return false;
    }

    // 10. Payment mode dropdown is mandatory (cannot be empty)
    if (
      !this.endBookingFields.paymentMode ||
      this.endBookingFields.paymentMode.trim() === ''
    ) {
      return false;
    }

    return true;
  }

  getMissingFieldsHint(): string {
    if (!this.endBookingFields.odometerEnd) {
      return 'Enter final return odometer reading';
    }
    if (this.isOdometerEndInvalid()) {
      return 'Return odometer cannot be less than pickup odometer';
    }
    if (!this.endBookingFields.returnDateTimeActual) {
      return 'Select return date & time';
    }
    if (this.isReturnDateInvalid()) {
      return 'Return date/time cannot be earlier than pickup';
    }
    if (!this.attachmentsVerified()) {
      return 'Verify return attachments after inspecting the vehicle';
    }
    if (!this.endBookingFields.cleanlinessChoice) {
      return 'Select cleanliness fee status (choose None if clean)';
    }
    if (
      this.endBookingFields.cleanlinessChoice === 'custom' &&
      (this.endBookingFields.customCleanlinessAmount === '' ||
        Number(this.endBookingFields.customCleanlinessAmount) < 0)
    ) {
      return 'Enter custom cleanliness amount';
    }
    if (!this.hasDamageVerificationPassed()) {
      if (this.damageStatus() === null) {
        return 'Select Damages option (Add Damage or None)';
      }
      return 'Complete description and amount for all damages';
    }
    if (this.isChallanInvalid()) {
      return 'Enter Challan amount (enter 0 if none)';
    }
    if (this.isTollInvalid()) {
      return 'Enter Toll amount (enter 0 if none)';
    }
    if (this.activeScenario() === 'case4') {
      if (!this.case4FineSelection()) {
        return 'Select Late / Non-Intimation Fine option for customer invoice';
      }
      if (
        this.case4FineSelection() === 'apply' &&
        (this.endBookingFields.nonIntimationFine === '' ||
          Number(this.endBookingFields.nonIntimationFine) < 0)
      ) {
        return 'Enter valid non-intimation fine amount';
      }
    }
    if (!this.collectRemainingBalance()) {
      return 'Check "Collect Remaining Due Balance" to confirm settlement';
    }
    if (
      !this.endBookingFields.paymentMode ||
      this.endBookingFields.paymentMode.trim() === ''
    ) {
      return 'Select payment mode';
    }
    return '';
  }

  getActualDurationText(): string {
    const startStr =
      this.booking()?.pickupDateTime || this.booking()?.createdAt;
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
        const matchedVeh = this.data.vehicles.find(
          (v) => v.regNo === b.vehicleRegNo,
        );
        if (matchedVeh) {
          this.vehicle.set(matchedVeh);
        }
      }

      // Initialize default rates
      this.endBookingFields.extraKmRate =
        Number(b.extraKmPrice) ||
        (this.vehicle() ? Number(this.vehicle()?.extraKmPrice) : 0) ||
        0;
      this.endBookingFields.extraHourRate =
        Number(b.extraHourPrice) ||
        (this.vehicle() ? Number(this.vehicle()?.extraHourPrice) : 0) ||
        0;

      // Initialize return details as blank (all details must be filled by user)
      this.endBookingFields.odometerEnd = '';
      this.endBookingFields.returnDateTimeActual = '';
      this.endBookingFields.cleanlinessChoice = '';
      this.endBookingFields.cleanlinessFee = 0;
      this.endBookingFields.customCleanlinessAmount = '';
      this.endBookingFields.challanaAmount = '';
      this.endBookingFields.tollAmount = '';
      this.endBookingFields.paymentMode = '';
      this.collectRemainingBalance.set(false);
      this.endBookingFields.settleNow = false;
      this.damageStatus.set(null);
      this.case4FineSelection.set(null);

      // Base rent values
      this.endBookingFields.totalRentAmount = Number(b.totalRentalAmount) || 0;
      this.endBookingFields.discountAmount = Number(b.discount) || 0;
      this.endBookingFields.finalRentAmount = Number(b.finalRentalAmount) || 0;
      this.endBookingFields.paidAmount = Number(b.amountPaid) || 0;
      this.endBookingFields.basePendingAmount =
        Number(b.pendingAmount) ||
        this.endBookingFields.finalRentAmount -
          this.endBookingFields.paidAmount;

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
      this.endBookingFields.cleanlinessFee =
        Number(this.endBookingFields.customCleanlinessAmount) || 0;
    }
    this.calculateEndBookingFees();
  }

  onCustomCleanlinessChange() {
    if (this.endBookingFields.cleanlinessChoice === 'custom') {
      this.endBookingFields.cleanlinessFee = Math.max(
        0,
        Number(this.endBookingFields.customCleanlinessAmount) || 0,
      );
      this.calculateEndBookingFees();
    }
  }

  // --- Damages Handlers ---
  selectDamageNone() {
    this.damageStatus.set('none');
    this.damages = [];
    this.endBookingFields.damagesTotal = 0;
    this.calculateEndBookingFees();
  }

  selectAddDamage() {
    this.damageStatus.set('damage');
    if (this.damages.length === 0) {
      this.addDamage();
    } else {
      this.calculateEndBookingFees();
    }
  }

  addDamage() {
    this.damageStatus.set('damage');
    const newDamage: IDamageItem = {
      id:
        'dmg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      description: '',
      amount: '' as unknown as number,
      confirmed: true,
      imageUrl: '',
      isUploadingImage: false,
    };
    this.damages.push(newDamage);
    this.calculateEndBookingFees();
  }

  removeDamage(id: string) {
    this.damages = this.damages.filter((d) => d.id !== id);
    if (this.damages.length === 0) {
      this.damageStatus.set(null);
    }
    this.calculateEndBookingFees();
  }

  toggleDamageConfirm(damage: IDamageItem) {
    damage.confirmed = !damage.confirmed;
  }

  // --- Case 4 Late / Non-Intimation Fine Handlers ---
  setCase4FineSelection(choice: 'apply' | 'waive') {
    this.case4FineSelection.set(choice);
    if (choice === 'apply') {
      this.endBookingFields.applyNonIntimationFine = true;
      if (!this.endBookingFields.nonIntimationFine) {
        this.endBookingFields.nonIntimationFine = 1000;
      }
    } else {
      this.endBookingFields.applyNonIntimationFine = false;
      this.endBookingFields.nonIntimationFine = '';
    }
    this.calculateEndBookingFees();
  }

  // --- Settlement / Collect Balance Handler ---
  onToggleCollectBalance(checked: boolean) {
    this.collectRemainingBalance.set(checked);
    this.endBookingFields.settleNow = checked;
  }

  async uploadDamagePhoto(event: Event, dmg: IDamageItem & { isUploadingImage?: boolean }) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      dmg.isUploadingImage = true;
      const res = await this.rrApi.uploadVehicleImage(file);
      if (res && res.url) {
        dmg.imageUrl = res.url;
        toast.success('Damage photo uploaded successfully.');
      } else {
        toast.error('Failed to obtain uploaded image URL.');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error('Error uploading damage photo: ' + ((err as { message?: string })?.message || 'unknown error'));
    } finally {
      dmg.isUploadingImage = false;
      target.value = '';
    }
  }

  removeDamagePhoto(dmg: IDamageItem) {
    dmg.imageUrl = undefined;
  }

  openImagePreview(url: string) {
    this.previewImageUrl.set(url);
  }

  closeImagePreview() {
    this.previewImageUrl.set(null);
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
  /**
   * Recalculates extra rent and extra KM limit for Case 4 based on custom recalculation slabs:
   * 1hr: 1hr P * 1, 1hr L * 1
   * 2hr: 1hr P * 2, 1hr L * 2
   * 3hr to 4hr: 4hr P, 4hr L
   * 5hr: 4hr P + 1hr P * 1, 4hr L + 1hr L * 1
   * 6hr: 4hr P + 1hr P * 2, 4hr L + 1hr L * 2
   * 7hr to 12hr: 12hr P, 12hr L
   * 13hr: 12hr P + 1hr P * 1, 12hr L + 1hr L * 1
   * 14hr: 12hr P + 1hr P * 2, 12hr L + 1hr L * 2
   * 15hr to 24hr: 24hr P, 24hr L
   * If > 24hrs: repeated for full days + remaining hours as above.
   */
  calculateCase4Slabs(
    hours: number,
    pricing?: IVehiclePricing,
  ): { slabExtraRent: number; slabExtraKm: number } {
    if (!pricing || hours <= 0) {
      return { slabExtraRent: 0, slabExtraKm: 0 };
    }

    const p24 = Number(pricing.h23?.price || 0);
    const km24 = Number(pricing.h23?.km || 0);

    const p12 = Number(pricing.h11?.price || 0);
    const km12 = Number(pricing.h11?.km || 0);

    const p4 = Number(pricing.h3?.price || 0);
    const km4 = Number(pricing.h3?.km || 0);

    const p1 = Number(pricing.h1?.price || (p4 > 0 ? Math.round(p4 / 4) : 0));
    const km1 = Number(pricing.h1?.km || (km4 > 0 ? Math.round(km4 / 4) : 0));

    const fullDays = Math.floor(hours / 24);
    const remHours = hours % 24;

    let remRent = 0;
    let remKm = 0;

    if (remHours === 1) {
      remRent = p1 * 1;
      remKm = km1 * 1;
    } else if (remHours === 2) {
      remRent = p1 * 2;
      remKm = km1 * 2;
    } else if (remHours === 3 || remHours === 4) {
      remRent = p4;
      remKm = km4;
    } else if (remHours === 5) {
      remRent = p4 + p1 * 1;
      remKm = km4 + km1 * 1;
    } else if (remHours === 6) {
      remRent = p4 + p1 * 2;
      remKm = km4 + km1 * 2;
    } else if (remHours >= 7 && remHours <= 12) {
      remRent = p12;
      remKm = km12;
    } else if (remHours === 13) {
      remRent = p12 + p1 * 1;
      remKm = km12 + km1 * 1;
    } else if (remHours === 14) {
      remRent = p12 + p1 * 2;
      remKm = km12 + km1 * 2;
    } else if (remHours >= 15 && remHours <= 23) {
      remRent = p24;
      remKm = km24;
    }

    const totalRent = fullDays * p24 + remRent;
    const totalKm = fullDays * km24 + remKm;

    return { slabExtraRent: totalRent, slabExtraKm: totalKm };
  }

  calculateSlabRent(hours: number, pricing?: IVehiclePricing): number {
    return this.calculateCase4Slabs(hours, pricing).slabExtraRent;
  }

  calculateSlabKm(hours: number, pricing?: IVehiclePricing): number {
    return this.calculateCase4Slabs(hours, pricing).slabExtraKm;
  }

  /**
   * Calculates extra hours exceeding scheduled return based on standard 30-min threshold rule:
   * - < 30 mins: round down to previous hour (e.g. 5:00 - 5:29 -> 5 hrs, 0:00 - 0:29 -> 0 hrs)
   * - >= 30 mins: round up to next hour (e.g. 5:30 - 5:59 -> 6 hrs, 0:30 - 0:59 -> 1 hr)
   */
  calculateExtraHours(
    actualReturnStr?: string | null,
    scheduledReturnStr?: string | null,
  ): number {
    if (!actualReturnStr || !scheduledReturnStr) return 0;
    const actualReturn = new Date(actualReturnStr).getTime();
    const expectedReturn = new Date(scheduledReturnStr).getTime();
    if (
      isNaN(actualReturn) ||
      isNaN(expectedReturn) ||
      actualReturn <= expectedReturn
    ) {
      return 0;
    }

    const diffMs = actualReturn - expectedReturn;
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes >= 30 ? hours + 1 : hours;
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

    // 2. Extra hours driven (< 30min -> previous hour, >= 30min -> next hour)
    const rawHoursExceeded = this.calculateExtraHours(
      this.endBookingFields.returnDateTimeActual,
      b.returnDateTime,
    );

    const rawKmsExceeded =
      baseKmLimit > 0 ? Math.max(0, distanceDriven - baseKmLimit) : 0;
    const isKmExceeded = rawKmsExceeded > 0;
    const isHrsExceeded = rawHoursExceeded > 0;

    // [1] Cleanliness Fee
    if (this.endBookingFields.cleanlinessChoice === '500') {
      this.endBookingFields.cleanlinessFee = 500;
    } else if (this.endBookingFields.cleanlinessChoice === '1000') {
      this.endBookingFields.cleanlinessFee = 1000;
    } else if (this.endBookingFields.cleanlinessChoice === 'custom') {
      this.endBookingFields.cleanlinessFee = Math.max(
        0,
        Number(this.endBookingFields.customCleanlinessAmount) || 0,
      );
    } else {
      this.endBookingFields.cleanlinessFee = 0;
    }

    // [4] Damages total
    this.endBookingFields.damagesTotal = this.damages.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0,
    );

    // Challana / Toll total (fines merged with challan)
    const challana = Math.max(
      0,
      Number(this.endBookingFields.challanaAmount) || 0,
    );
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
    let basePending =
      Number(b.pendingAmount) || finalRent - (Number(b.amountPaid) || 0);

    this.endBookingFields.effectiveKmLimit = baseKmLimit;
    this.endBookingFields.slabExtraKmAllowance = 0;
    this.endBookingFields.slabExtraRent = 0;

    if (!isKmExceeded && !isHrsExceeded) {
      // Case 1: if Km's and Hrs are in limit (extra kms & hrs are zero)
      this.activeScenario.set('case1');
      this.case4ResolvedScenario.set(null);
      this.endBookingFields.recalculateSlabMode = false;
      extraKms = 0;
      extraKmFee = 0;
      extraHours = 0;
      extraHourFee = 0;
    } else if (isKmExceeded && !isHrsExceeded) {
      // Case 2: If Km's exceeded and returned within Hrs (extra hrs is zero)
      this.activeScenario.set('case2');
      this.case4ResolvedScenario.set(null);
      this.endBookingFields.recalculateSlabMode = false;
      extraKms = rawKmsExceeded;
      extraKmFee = extraKms * extraKmPrice;
      extraHours = 0;
      extraHourFee = 0;
    } else if (!isKmExceeded && isHrsExceeded) {
      // Case 3: If Hr's exceed and returned within Km's (extra kms is zero)
      this.activeScenario.set('case3');
      this.case4ResolvedScenario.set(null);
      this.endBookingFields.recalculateSlabMode = false;
      extraKms = 0;
      extraKmFee = 0;
      extraHours = rawHoursExceeded;
      extraHourFee = extraHours * extraHourPrice;
    } else {
      // Case 4: If both Km's and Hrs exceeded -> Recalculation done based on recalculation slabs
      this.activeScenario.set('case4');
      this.endBookingFields.recalculateSlabMode = true;

      const veh = this.vehicle();
      const pricing = veh?.pricing || (b as { vehiclePricing?: IVehiclePricing }).vehiclePricing;
      const { slabExtraRent, slabExtraKm } = this.calculateCase4Slabs(
        rawHoursExceeded,
        pricing,
      );

      this.endBookingFields.slabExtraKmAllowance = slabExtraKm;
      this.endBookingFields.slabExtraRent = slabExtraRent;

      const newEffectiveKmLimit = baseKmLimit + slabExtraKm;
      this.endBookingFields.effectiveKmLimit = newEffectiveKmLimit;

      // Rent updated as new duration and limit gives new renting price
      finalRent = (Number(b.finalRentalAmount) || 0) + slabExtraRent;
      basePending = finalRent - (Number(b.amountPaid) || 0);

      // Extra hours absorbed into the new slab rental duration
      extraHours = rawHoursExceeded;
      extraHourFee = 0; // Absorbed into slab rent

      // Check distance driven against new recalculated KM limit:
      // Km. and Hr. within after recalculation ---- Case 1
      // Km. exceed and Hr. within after recalculation ---- Case 2
      if (distanceDriven <= newEffectiveKmLimit) {
        this.case4ResolvedScenario.set('case1');
        extraKms = 0;
        extraKmFee = 0;
      } else {
        this.case4ResolvedScenario.set('case2');
        extraKms = distanceDriven - newEffectiveKmLimit;
        extraKmFee = extraKms * extraKmPrice;
      }
    }

    // Late / Non-Intimation Fine: Only applicable when both KMs and hours are exceeded (Case 4)
    const isBothExceeded = isKmExceeded && isHrsExceeded;
    let nonIntimationFine = 0;
    if (isBothExceeded) {
      if (this.case4FineSelection() === 'apply') {
        nonIntimationFine = Math.max(
          0,
          Number(this.endBookingFields.nonIntimationFine) || 0,
        );
        this.endBookingFields.applyNonIntimationFine = true;
      } else {
        this.endBookingFields.applyNonIntimationFine = false;
        nonIntimationFine = 0;
      }
    } else {
      this.case4FineSelection.set(null);
      this.endBookingFields.applyNonIntimationFine = false;
      nonIntimationFine = 0;
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

    if (!this.isFormValid()) {
      const hint = this.getMissingFieldsHint();
      toast.error(hint || 'Please fill in all required fields before ending booking.');
      return;
    }

    const endOdo = Number(this.endBookingFields.odometerEnd);

    try {
      this.isSubmitting.set(true);

      const isSettlingNow = this.collectRemainingBalance();
      const finalRentalAmountToSave = String(
        this.endBookingFields.finalTotalPayable,
      );
      const pendingAmountToSave = isSettlingNow
        ? '0'
        : String(this.endBookingFields.balancePending);
      const amountPaidToSave = isSettlingNow
        ? String(this.endBookingFields.finalTotalPayable)
        : String(b.amountPaid || '0');

      const isBothExceeded = this.activeScenario() === 'case4';
      const currentUser = this.rrApi.currentUser();
      const patch: Partial<IBooking> = {
        status: 'completed',
        endedAt: new Date().toISOString(),
        endedBy: currentUser?.id,
        endedByName: currentUser
          ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
          : undefined,
        endedByRole: currentUser?.role,
        vehicleOdometerEnd: String(endOdo),
        returnDateTimeActual: this.endBookingFields.returnDateTimeActual,
        cleanlinessFee: String(this.endBookingFields.cleanlinessFee),
        extraKmsTravelled: String(this.endBookingFields.extraKms),
        extraKmFee: String(this.endBookingFields.extraKmFee),
        extraHoursTaken: String(this.endBookingFields.extraHours),
        extraHourFee: String(this.endBookingFields.extraHourFee),
        damages: this.damages.map((d) => ({
          id: d.id,
          description: d.description,
          amount: Number(d.amount),
          confirmed: d.confirmed,
          imageUrl: d.imageUrl || undefined,
        })),
        attachmentsVerified: true,
        bookingAttachments: {
          ...(b.bookingAttachments || {}),
          verifiedAfterReturn: true,
          verifiedAt: new Date().toISOString(),
          verifiedBy: currentUser?.id,
          verifiedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : undefined,
        },
        damagesTotal: String(this.endBookingFields.damagesTotal),
        challanaAmount: String(this.endBookingFields.challanaAmount || 0),
        tollAmount: String(this.endBookingFields.tollAmount || 0),
        finesAmount: '0',
        challanaTollFinesTotal: String(
          this.endBookingFields.challanaTollFinesTotal,
        ),
        nonIntimationFine:
          isBothExceeded && this.endBookingFields.applyNonIntimationFine
            ? String(this.endBookingFields.nonIntimationFine || 0)
            : '0',
        recalculateSlabMode: this.endBookingFields.recalculateSlabMode,
        totalKmLimit:
          this.endBookingFields.effectiveKmLimit > 0
            ? String(this.endBookingFields.effectiveKmLimit)
            : b.totalKmLimit,
        totalRentalAmount:
          this.endBookingFields.slabExtraRent > 0
            ? String(
                (Number(b.totalRentalAmount) || 0) +
                  this.endBookingFields.slabExtraRent,
              )
            : b.totalRentalAmount,
        totalAdditionalFees: String(this.endBookingFields.totalAdditionalFees),
        finalRentalAmount: finalRentalAmountToSave,
        pendingAmount: pendingAmountToSave,
        amountPaid: amountPaidToSave,
        paymentMode: this.endBookingFields.paymentMode || 'Cash',
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

      // Automatically generate & display customer invoice popup
      const completedBooking: IBooking = {
        ...b,
        ...patch,
      } as IBooking;

      // Close this End Booking dialog first
      this.dialogRef?.close(true);

      // Display the completed customer invoice popup
      try {
        await this.invoicePdf.viewInvoicePdf(completedBooking);
      } catch (pdfErr) {
        console.error('Customer invoice popup generation note:', pdfErr);
      }

      toast.success(`Booking ${b.id} ended successfully! Invoice generated.`);
    } catch (e: unknown) {
      console.error(e);
      const errMsg = (e as { error?: { message?: string }; message?: string })?.error?.message || (e as { message?: string })?.message || 'Error finalizing booking.';
      toast.error(errMsg);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeDialog() {
    this.dialogRef?.close(false);
  }
}
