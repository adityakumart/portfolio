import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideX,
  lucideCar,
  lucideUser,
  lucideShieldCheck,
  lucidePackage,
  lucideCreditCard,
  lucideCheck,
  lucideAlertTriangle,
  lucideCrown,
  lucideSearch,
  lucideRefreshCw,
  lucidePhone,
  lucideChevronDown,
  lucideClock,
  lucideAlertCircle,
  lucideCalendarCheck,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import {
  IVehicle,
  IVehiclePricing,
  IBooking,
  ICustomerMembershipDiscount,
  ICustomerAutocompleteItem,
  IRegularCustomerMasked,
} from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRCustomerApiService } from '../../../services/rr-customer-api.service';
import { RRAadharInputComponent } from '../../components/aadhar-input/aadhar-input.component';

export interface ReserveBookingDialogContext {
  vehicleRegNo?: string;
  vehicles?: IVehicle[];
  reservation?: IBooking;
  isEditMode?: boolean;
}

export interface ScheduleConflict {
  hasConflict: boolean;
  type?: 'active_booking' | 'advance_booking' | 'maintenance' | 'contract';
  message?: string;
  conflictingBooking?: IBooking;
}

@Component({
  selector: 'app-rr-reserve-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmBadgeImports,
    HlmDropdownMenuImports,
    NgIconComponent,
    RRAadharInputComponent,
  ],
  providers: [
    provideIcons({
      lucideCalendarDays,
      lucideX,
      lucideCar,
      lucideUser,
      lucideShieldCheck,
      lucidePackage,
      lucideCreditCard,
      lucideCheck,
      lucideAlertTriangle,
      lucideCrown,
      lucideSearch,
      lucideRefreshCw,
      lucidePhone,
      lucideChevronDown,
      lucideClock,
      lucideAlertCircle,
      lucideCalendarCheck,
    }),
  ],
  templateUrl: './reserve-booking-dialog.component.html',
})
export class RRReserveBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  context = injectBrnDialogContext<ReserveBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private customerApi = inject(RRCustomerApiService);
  private fb = inject(FormBuilder);

  vehicles = signal<IVehicle[]>([]);
  allBookings = signal<IBooking[]>([]);
  selectedVehicle = signal<IVehicle | null>(null);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  existingReservation = signal<IBooking | null>(null);

  // Real-time schedule conflict status
  scheduleConflict = signal<ScheduleConflict>({ hasConflict: false });
  isCheckingSchedule = signal(false);

  // Membership & Autocomplete State
  membershipDiscount = signal<ICustomerMembershipDiscount | null>(null);
  isRegularMemberMode = signal<boolean>(false);
  isMemberDropdownOpen = signal<boolean>(false);
  autocompleteQuery = signal<string>('');
  autocompleteResults = signal<ICustomerAutocompleteItem[]>([]);
  isSearchingCustomers = signal<boolean>(false);
  selectedRegularCustomer = signal<IRegularCustomerMasked | null>(null);

  reserveFormGroup!: FormGroup;

  get isTravelDetailsConfigured(): boolean {
    if (!this.reserveFormGroup) return false;
    const regNo = this.reserveFormGroup.get('vehicleRegNo')?.value;
    const pickup = this.reserveFormGroup.get('pickupDateTime')?.value;
    const returnDt = this.reserveFormGroup.get('returnDateTime')?.value;
    return !!(regNo && pickup && returnDt && !this.scheduleConflict().hasConflict);
  }

  ngOnInit() {
    this.isEditMode.set(!!this.context?.isEditMode || !!this.context?.reservation);
    if (this.context?.reservation) {
      this.existingReservation.set(this.context.reservation);
    }
    this.initForm();
    this.loadData();
  }

  private initForm() {
    this.reserveFormGroup = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleName: [''],
      vehicleManufacturer: [''],
      vehicleModel: [''],
      vehicleOdometerStart: ['0'],
      extraKmPrice: [''],
      extraHourPrice: [''],

      // Step 1: Travel Details
      pickupDateTime: ['', Validators.required],
      durationDays: ['1', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: ['', Validators.required],
      totalKmLimit: ['0'],
      travelPurpose: [''],
      travelFrom: [''],
      travelTo: [''],

      // Step 2: Renter Details
      renterFirstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterSecondName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterFatherName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterAadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      renterDL: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{15,16}$/)]],
      renterPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      renterAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      renterAddress: ['', Validators.required],

      // Guarantee Details (Step 2 Part 2)
      guarFirstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarSecondName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarFatherName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarAadhar: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      guarDL: ['', [Validators.pattern(/^[A-Za-z0-9]{15,16}$/)]],
      guarPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      guarAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      guarAddress: ['', Validators.required],

      // Deposit (Step 2 Part 3)
      depositType: ['none', Validators.required],
      bikeRegNo: [''],
      bikeManufacturer: [''],
      bikeModel: [''],
      bikeOwner: [''],
      cashAmount: [''],
      otherItemName: [''],
      otherItemValue: [''],

      // Step 3: Financial Billings
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['none'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]], // Advance Amount Paid
      pendingAmount: ['0'],
      paymentMode: ['Cash'],
      status: ['reserved'],
    });

    this.reserveFormGroup.get('depositType')?.valueChanges.subscribe((type) => {
      this.updateDepositValidators(type);
    });

    this.reserveFormGroup.get('renterPhone')?.valueChanges.subscribe(async (phone: string) => {
      const clean = phone ? phone.trim() : '';
      if (clean.length === 10) {
        await this.checkCustomerMembership(clean);
      } else if (!clean) {
        this.membershipDiscount.set(null);
      }
    });

    // Default pickup to next day at 09:00 if new reservation
    if (!this.context?.reservation) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const iso = tomorrow.toISOString().slice(0, 16);
      this.reserveFormGroup.patchValue({ pickupDateTime: iso });
    }
  }

  private async loadData() {
    try {
      const [vehList, bookList] = await Promise.all([
        this.context?.vehicles && this.context.vehicles.length > 0
          ? Promise.resolve(this.context.vehicles)
          : this.rrApi.getVehicles(),
        this.rrApi.getBookings(),
      ]);
      this.vehicles.set(vehList);
      this.allBookings.set(bookList);

      this.applyInitialData();
    } catch (e) {
      console.error('Failed to load vehicles/bookings for reservation modal:', e);
    }
  }

  private applyInitialData() {
    const resv = this.context?.reservation;
    if (resv) {
      this.reserveFormGroup.patchValue({
        vehicleRegNo: resv.vehicleRegNo,
        vehicleName: resv.vehicleName,
        vehicleManufacturer: resv.vehicleManufacturer,
        vehicleModel: resv.vehicleModel,
        vehicleOdometerStart: resv.vehicleOdometerStart || '0',
        extraKmPrice: resv.extraKmPrice,
        extraHourPrice: resv.extraHourPrice,
        pickupDateTime: resv.pickupDateTime,
        durationDays: resv.durationDays,
        durationHours: resv.durationHours,
        returnDateTime: resv.returnDateTime,
        totalKmLimit: resv.totalKmLimit,
        travelPurpose: resv.travelPurpose,
        travelFrom: resv.travelFrom,
        travelTo: resv.travelTo,
        renterFirstName: resv.renterFirstName,
        renterSecondName: resv.renterSecondName,
        renterFatherName: resv.renterFatherName,
        renterAadhar: resv.renterAadhar,
        renterDL: resv.renterDL,
        renterPhone: resv.renterPhone,
        renterAltPhone: resv.renterAltPhone || '',
        renterAddress: resv.renterAddress,
        guarFirstName: resv.guarFirstName,
        guarSecondName: resv.guarSecondName,
        guarFatherName: resv.guarFatherName,
        guarAadhar: resv.guarAadhar || '',
        guarDL: resv.guarDL || '',
        guarPhone: resv.guarPhone,
        guarAltPhone: resv.guarAltPhone || '',
        guarAddress: resv.guarAddress,
        depositType: resv.depositType,
        bikeRegNo: resv.bikeRegNo || '',
        bikeManufacturer: resv.bikeManufacturer || '',
        bikeModel: resv.bikeModel || '',
        bikeOwner: resv.bikeOwner || '',
        cashAmount: resv.cashAmount || '',
        otherItemName: resv.otherItemName || '',
        otherItemValue: resv.otherItemValue || '',
        totalRentalAmount: resv.totalRentalAmount,
        discount: resv.discount,
        discountType: resv.discountType,
        finalRentalAmount: resv.finalRentalAmount,
        amountPaid: resv.amountPaid,
        pendingAmount: resv.pendingAmount,
        paymentMode: resv.paymentMode || 'Cash',
      });
      const selected = this.vehicles().find((v) => v.regNo === resv.vehicleRegNo);
      this.selectedVehicle.set(selected || null);
      this.validateScheduleOverlap();
      return;
    }

    const preselected = this.context?.vehicleRegNo;
    if (preselected) {
      this.reserveFormGroup.patchValue({ vehicleRegNo: preselected });
      this.onVehicleSelectChange();
    }
  }

  onVehicleSelectChange() {
    const regNo = this.reserveFormGroup.get('vehicleRegNo')?.value;
    const selected = this.vehicles().find((v) => v.regNo === regNo);
    this.selectedVehicle.set(selected || null);

    if (selected) {
      this.reserveFormGroup.patchValue({
        vehicleName: selected.name,
        vehicleManufacturer: selected.manufacturer,
        vehicleModel: selected.model,
        vehicleOdometerStart: selected.odometer || '0',
        extraKmPrice: selected.extraKmPrice,
        extraHourPrice: selected.extraHourPrice,
      });
    } else {
      this.reserveFormGroup.patchValue({
        vehicleName: '',
        vehicleManufacturer: '',
        vehicleModel: '',
        vehicleOdometerStart: '0',
        extraKmPrice: '',
        extraHourPrice: '',
      });
    }

    this.calculateReturnDate();
  }

  onDurationDaysChange() {
    this.calculateReturnDate();
  }

  onDurationHoursChange() {
    this.calculateReturnDate();
  }

  calculateReturnDate() {
    const pickupVal = this.reserveFormGroup.get('pickupDateTime')?.value;
    const days = parseInt(this.reserveFormGroup.get('durationDays')?.value || '0', 10) || 0;
    const hours = parseInt(this.reserveFormGroup.get('durationHours')?.value || '0', 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.reserveFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateFinalAmount();
      this.validateScheduleOverlap();
      return;
    }

    const start = new Date(pickupVal);
    const end = new Date(start);

    if (days > 0) end.setDate(end.getDate() + days);
    if (hours > 0) end.setHours(end.getHours() + hours);

    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hour = String(end.getHours()).padStart(2, '0');
    const minute = String(end.getMinutes()).padStart(2, '0');

    this.reserveFormGroup.patchValue({
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`,
    });

    const selected = this.selectedVehicle();
    if (selected && selected.pricing) {
      const diffMs = end.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      const rent = this.calculateSlabRent(totalHours, selected.pricing);
      const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

      this.reserveFormGroup.patchValue({
        totalRentalAmount: String(rent),
        totalKmLimit: String(kmLimit),
      });
    }

    this.recalculateFinalAmount();
    this.validateScheduleOverlap();
  }

  /**
   * Advance Booking Validation Logic:
   * 1. Display all vehicles (available, in_booking, maintenance, contract).
   * 2. Multiple advance bookings for single vehicle allowed, but no overlap!
   * 3. If available: checks for existing advance bookings overlap.
   * 4. If active booking vehicle: check current active rental return date & time + check advance bookings.
   * 5. If contract/service vehicle: check contract/service next available date + check advance bookings.
   */
  validateScheduleOverlap() {
    const regNo = this.reserveFormGroup.get('vehicleRegNo')?.value;
    const pickupVal = this.reserveFormGroup.get('pickupDateTime')?.value;
    const returnVal = this.reserveFormGroup.get('returnDateTime')?.value;

    if (!regNo || !pickupVal || !returnVal) {
      this.scheduleConflict.set({ hasConflict: false });
      return;
    }

    const reqStart = new Date(pickupVal).getTime();
    const reqEnd = new Date(returnVal).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
      this.scheduleConflict.set({
        hasConflict: true,
        message: 'Expected Return schedule must be strictly after the Pickup schedule.',
      });
      return;
    }

    const vehicle = this.vehicles().find((v) => v.regNo === regNo);
    const existingReservations = this.allBookings().filter(
      (b) =>
        b.vehicleRegNo === regNo &&
        !b.isDeleted &&
        b.id !== this.context?.reservation?.id
    );

    // 1. Check Active Booking Overlap (if vehicle is in active rental)
    const activeBooking = existingReservations.find((b) => b.status === 'active');
    if (activeBooking && activeBooking.returnDateTime) {
      const activeEnd = new Date(activeBooking.returnDateTime).getTime();
      if (reqStart < activeEnd) {
        this.scheduleConflict.set({
          hasConflict: true,
          type: 'active_booking',
          conflictingBooking: activeBooking,
          message: `Vehicle has an ongoing Active Rental until ${new Date(activeBooking.returnDateTime).toLocaleString('en-IN')}. Pickup schedule must be set after the current return time.`,
        });
        return;
      }
    }

    // 2. Check Overlap with other Advance Bookings (status: 'reserved')
    const reservedBookings = existingReservations.filter((b) => b.status === 'reserved');
    for (const resv of reservedBookings) {
      const rStart = new Date(resv.pickupDateTime).getTime();
      const rEnd = new Date(resv.returnDateTime).getTime();

      // Interval overlap check: max(startA, startB) < min(endA, endB)
      if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
        this.scheduleConflict.set({
          hasConflict: true,
          type: 'advance_booking',
          conflictingBooking: resv,
          message: `Schedule overlaps with an existing Advance Reservation (${new Date(resv.pickupDateTime).toLocaleString('en-IN')} to ${new Date(resv.returnDateTime).toLocaleString('en-IN')}).`,
        });
        return;
      }
    }

    // 3. Check Contract / Maintenance Next Available Date
    if (vehicle && ['maintenance', 'contract', 'in_contract'].includes(vehicle.status)) {
      if (vehicle.nextAvailableDate) {
        const nextAvail = new Date(vehicle.nextAvailableDate).getTime();
        if (!isNaN(nextAvail) && reqStart < nextAvail) {
          this.scheduleConflict.set({
            hasConflict: true,
            type: vehicle.status === 'maintenance' ? 'maintenance' : 'contract',
            message: `Vehicle is currently in ${vehicle.status === 'maintenance' ? 'Maintenance / Service' : 'Corporate Contract'} and next available on ${new Date(vehicle.nextAvailableDate).toLocaleDateString('en-IN')}.`,
          });
          return;
        }
      }
    }

    // All clear!
    this.scheduleConflict.set({ hasConflict: false });
  }

  calculateSlabRent(hours: number, pricing: IVehiclePricing): number {
    let remaining = hours;
    let totalRent = 0;
    const p23 = Number(pricing.h23?.price || 0);
    const p11 = Number(pricing.h11?.price || 0);
    const p3 = Number(pricing.h3?.price || 0);

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
      const p1 = Number(pricing.h1?.price || (p3 > 0 ? Math.round(p3 / 4) : 0));
      totalRent += remaining * p1;
    }
    return totalRent;
  }

  calculateSlabKm(hours: number, pricing: IVehiclePricing): number {
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
      const km1 = Number(pricing.h1?.km || (km3 > 0 ? Math.round(km3 / 4) : 0));
      totalKm += remaining * km1;
    }
    return totalKm;
  }

  recalculateFinalAmount() {
    const total = Number(this.reserveFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountType = this.reserveFormGroup.get('discountType')?.value || 'none';

    if (discountType === 'none') {
      this.reserveFormGroup.get('discount')?.setValue('0', { emitEvent: false });
    }

    const discountVal = Number(this.reserveFormGroup.get('discount')?.value) || 0;
    const advancePaid = Number(this.reserveFormGroup.get('amountPaid')?.value) || 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        let discountAmt = (total * discountVal) / 100;
        const activeCustomer = this.selectedRegularCustomer();
        if (activeCustomer?.maxDiscountAmount && activeCustomer.maxDiscountAmount > 0) {
          discountAmt = Math.min(discountAmt, activeCustomer.maxDiscountAmount);
        }
        finalRent = total - discountAmt;
      } else if (discountType === 'rupee' || discountType === 'rupees') {
        finalRent = total - discountVal;
      }
    }
    finalRent = Math.max(0, finalRent);

    this.reserveFormGroup.patchValue(
      {
        finalRentalAmount: String(finalRent),
        pendingAmount: String(Math.max(0, finalRent - advancePaid)),
      },
      { emitEvent: false }
    );
  }

  updateDepositValidators(type: string) {
    const bikeControls = ['bikeRegNo', 'bikeManufacturer', 'bikeModel', 'bikeOwner'];
    const cashControls = ['cashAmount'];
    const otherControls = ['otherItemName', 'otherItemValue'];

    [...bikeControls, ...cashControls, ...otherControls].forEach((ctrl) => {
      this.reserveFormGroup.get(ctrl)?.clearValidators();
      this.reserveFormGroup.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
    });

    if (type === 'bike') {
      bikeControls.forEach((ctrl) => {
        this.reserveFormGroup.get(ctrl)?.setValidators(Validators.required);
        this.reserveFormGroup.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'cash') {
      cashControls.forEach((ctrl) => {
        this.reserveFormGroup.get(ctrl)?.setValidators([Validators.required, Validators.min(1)]);
        this.reserveFormGroup.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'other') {
      otherControls.forEach((ctrl) => {
        this.reserveFormGroup.get(ctrl)?.setValidators(Validators.required);
        this.reserveFormGroup.get(ctrl)?.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  async checkCustomerMembership(phone: string): Promise<void> {
    try {
      const totalAmount = Number(this.reserveFormGroup.get('totalRentalAmount')?.value) || 0;
      const result = await this.customerApi.checkMembershipDiscount(phone, totalAmount);
      if (result && result.isRegularCustomer) {
        this.membershipDiscount.set(result);
        toast.success(`🌟 Regular Member Recognized: ${result.discountRate}% discount auto-applied.`);
        this.reserveFormGroup.patchValue({
          discountType: 'percentage',
          discount: String(result.discountRate),
        });
        this.recalculateFinalAmount();
      } else {
        this.membershipDiscount.set(null);
      }
    } catch (err: unknown) {
      console.warn('Membership discount check error:', err);
    }
  }

  toggleRegularMemberMode(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isRegularMemberMode.set(checked);
    if (checked) {
      this.loadAutocompleteResults('');
    }
  }

  async loadAutocompleteResults(query: string): Promise<void> {
    this.isSearchingCustomers.set(true);
    try {
      const results = await this.customerApi.getAutocomplete(query);
      this.autocompleteResults.set(results);
    } catch (err: unknown) {
      console.warn('Autocomplete fetch failed:', err);
    } finally {
      this.isSearchingCustomers.set(false);
    }
  }

  async selectRegularCustomer(item: ICustomerAutocompleteItem): Promise<void> {
    this.isMemberDropdownOpen.set(false);
    try {
      const fullCustomer = await this.customerApi.getCustomerById(item._id || item.membershipId);
      this.selectedRegularCustomer.set(fullCustomer);

      this.reserveFormGroup.patchValue({
        renterFirstName: fullCustomer.firstName,
        renterSecondName: fullCustomer.lastName,
        renterFatherName: fullCustomer.fatherName,
        renterPhone: fullCustomer.phone,
        renterAltPhone: fullCustomer.altPhone || '',
        renterAddress: fullCustomer.address,
        renterAadhar: fullCustomer.aadhar,
        renterDL: fullCustomer.dl,
      });

      const totalAmount = Number(this.reserveFormGroup.get('totalRentalAmount')?.value) || 0;
      const rate = Math.min(30, Math.max(0, fullCustomer.discountRate || 0));
      let discountAmount = Math.round((totalAmount * rate) / 100);
      if (fullCustomer.maxDiscountAmount && fullCustomer.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, fullCustomer.maxDiscountAmount);
      }
      this.membershipDiscount.set({
        isRegularCustomer: true,
        customerId: fullCustomer._id,
        membershipId: fullCustomer.membershipId,
        customerName: `${fullCustomer.firstName} ${fullCustomer.lastName}`,
        membershipTier: fullCustomer.membershipTier,
        discountRate: rate,
        discountAmount,
        originalAmount: totalAmount,
        finalRentalAmount: Math.max(0, totalAmount - discountAmount),
      });
      this.reserveFormGroup.patchValue({
        discountType: 'percentage',
        discount: String(rate),
      });
      this.recalculateFinalAmount();
    } catch (e) {
      console.error('Error selecting customer:', e);
    }
  }

  async submitReservation(event: Event) {
    event.preventDefault();
    this.validateScheduleOverlap();

    if (this.reserveFormGroup.invalid || this.scheduleConflict().hasConflict) {
      toast.error('Please resolve schedule conflicts and complete required fields.');
      return;
    }

    try {
      this.isSubmitting.set(true);
      const currentUser = this.rrApi.currentUser();
      const payload: Partial<IBooking> = {
        ...this.reserveFormGroup.value,
        status: 'reserved',
        bookedBy: currentUser?.id,
        bookedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : undefined,
      };

      let result: IBooking;
      if (this.isEditMode() && this.context?.reservation?.id) {
        result = await this.rrApi.updateBooking(this.context.reservation.id, payload);
        toast.success(`Advance reservation ${this.context.reservation.id} updated successfully.`);
      } else {
        result = await this.rrApi.reserveBooking(payload);
        toast.success(`Advance reservation created successfully (${result.id}).`);
      }

      this.dialogRef?.close(result);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Failed to save advance reservation.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
