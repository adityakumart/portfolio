import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
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
  lucideFileText,
  lucideAlertTriangle,
  lucideCrown,
  lucideSearch,
  lucideRefreshCw,
  lucideEye,
  lucideEyeOff,
  lucidePhone,
  lucideMail,
  lucideMapPin,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import {
  IVehicle,
  IVehiclePricing,
  ICustomerMembershipDiscount,
  ICustomerAutocompleteItem,
  IRegularCustomerMasked,
} from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';
import { RRCustomerApiService } from '../../../services/rr-customer-api.service';
import { RRAadharInputComponent } from '../../components/aadhar-input/aadhar-input.component';

export interface NewBookingDialogContext {
  vehicleRegNo?: string;
  vehicles?: IVehicle[];
}

@Component({
  selector: 'app-rr-new-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
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
      lucideFileText,
      lucideAlertTriangle,
      lucideCrown,
      lucideSearch,
      lucideRefreshCw,
      lucideEye,
      lucideEyeOff,
      lucidePhone,
      lucideMail,
      lucideMapPin,
      lucideChevronDown,
    }),
  ],
  templateUrl: './new-booking-dialog.component.html',
})
export class RRNewBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  context = injectBrnDialogContext<NewBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private customerApi = inject(RRCustomerApiService);
  private fb = inject(FormBuilder);
  private invoicePdf = inject(RRInvoicePdfService);

  vehicles = signal<IVehicle[]>([]);
  selectedVehicle = signal<IVehicle | null>(null);
  overrideOdometer = false;
  isSubmitting = signal(false);
  membershipDiscount = signal<ICustomerMembershipDiscount | null>(null);

  // Autocomplete & Regular Member Mode State
  isRegularMemberMode = signal<boolean>(false);
  isMemberDropdownOpen = signal<boolean>(false);
  autocompleteQuery = signal<string>('');
  autocompleteResults = signal<ICustomerAutocompleteItem[]>([]);
  isSearchingCustomers = signal<boolean>(false);
  selectedRegularCustomer = signal<IRegularCustomerMasked | null>(null);
  showManualFieldsInMemberMode = signal<boolean>(false);
  isLoadingCustomerDetails = signal<boolean>(false);

  bookingFormGroup!: FormGroup;

  get isTravelDetailsConfigured(): boolean {
    if (!this.bookingFormGroup) return false;
    const regNo = this.bookingFormGroup.get('vehicleRegNo')?.value;
    const pickup = this.bookingFormGroup.get('pickupDateTime')?.value;
    const returnDt = this.bookingFormGroup.get('returnDateTime')?.value;
    const odo = this.bookingFormGroup.get('vehicleOdometerStart')?.value;
    return !!(regNo && pickup && returnDt && odo !== null && odo !== '');
  }

  ngOnInit() {
    this.initForm();
    this.loadVehicles();
  }

  private initForm() {
    this.bookingFormGroup = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleName: [''],
      vehicleManufacturer: [''],
      vehicleModel: [''],
      vehicleOdometerStart: ['', [Validators.required, Validators.min(0)]],
      extraKmPrice: [''],
      extraHourPrice: [''],

      // Renter
      renterFirstName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterSecondName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterFatherName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterAadhar: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{12}$/)],
      ],
      renterDL: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)],
      ],
      renterPhone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      renterAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      renterAddress: ['', Validators.required],

      // Guarantee
      guarFirstName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarSecondName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarFatherName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarAadhar: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      guarDL: ['', [Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      guarPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      guarAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      guarAddress: ['', Validators.required],

      // Travel
      pickupDateTime: ['', Validators.required],
      durationDays: ['0', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: ['', Validators.required],
      totalKmLimit: ['0'],
      travelPurpose: [''],
      travelFrom: [''],
      travelTo: [''],

      // Deposit
      depositType: ['none', Validators.required],
      bikeRegNo: [''],
      bikeManufacturer: [''],
      bikeModel: [''],
      bikeOwner: [''],
      cashAmount: [''],
      otherItemName: [''],
      otherItemValue: [''],

      // Financials
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['none'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      paymentMode: ['Cash'],
      amountByUser: ['0'],
      status: ['active'],
    });

    this.bookingFormGroup.get('depositType')?.valueChanges.subscribe((type) => {
      this.updateDepositValidators(type);
    });

    this.bookingFormGroup.get('renterPhone')?.valueChanges.subscribe(async (phone: string) => {
      const cleanPhone = phone ? phone.trim() : '';
      if (cleanPhone.length === 10) {
        await this.checkCustomerMembership(cleanPhone);
      } else if (!cleanPhone) {
        this.membershipDiscount.set(null);
      }
    });
  }

  async checkCustomerMembership(phone: string): Promise<void> {
    try {
      const totalAmount = Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
      const result = await this.customerApi.checkMembershipDiscount(phone, totalAmount);
      if (result && result.isRegularCustomer) {
        this.membershipDiscount.set(result);
        toast.success(
          `🌟 Regular Member Identified (${result.membershipTier?.toUpperCase()})! ${result.discountRate}% discount auto-applied.`
        );

        // Fetch customer profile to autofill if fields are empty
        try {
          const list = await this.customerApi.getCustomers({ search: phone });
          const matched = list.customers.find((c) => c.phone === phone);
          if (matched) {
            this.bookingFormGroup.patchValue({
              renterFirstName: this.bookingFormGroup.get('renterFirstName')?.value || matched.firstName,
              renterSecondName: this.bookingFormGroup.get('renterSecondName')?.value || matched.lastName,
              renterFatherName: this.bookingFormGroup.get('renterFatherName')?.value || matched.fatherName,
              renterAddress: this.bookingFormGroup.get('renterAddress')?.value || matched.address,
              renterAltPhone: this.bookingFormGroup.get('renterAltPhone')?.value || matched.altPhone || '',
            });
          }
        } catch {
          // ignore autofill failure
        }

        // Apply discount to booking form
        this.bookingFormGroup.patchValue({
          discountType: 'percentage',
          discount: String(result.discountRate),
        });
        this.recalculateFinalAmount();
      } else {
        this.membershipDiscount.set(null);
      }
    } catch (err: unknown) {
      console.warn('Membership discount check failed:', (err as Error).message);
    }
  }

  /**
   * Toggle between manual renter details entry and regular member autocomplete mode.
   */
  toggleRegularMemberMode(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isRegularMemberMode.set(checked);

    if (checked) {
      // Adjust Aadhaar & DL validators to accept masked format tokens from verified members
      this.bookingFormGroup.get('renterAadhar')?.setValidators([
        Validators.required,
        Validators.pattern(/^([0-9]{12}|[X\d-]{12,16}|\[Aadhaar Redacted\])$/),
      ]);
      this.bookingFormGroup.get('renterDL')?.setValidators([
        Validators.required,
        Validators.pattern(/^([A-Za-z0-9]{15,16}|[X\w-]{12,18}|\[DL Redacted\])$/),
      ]);
      this.isMemberDropdownOpen.set(false);
      this.loadAutocompleteResults('');
    } else {
      // Restore standard manual entry validators
      this.bookingFormGroup.get('renterAadhar')?.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{12}$/),
      ]);
      this.bookingFormGroup.get('renterDL')?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]{16}$/),
      ]);
      this.selectedRegularCustomer.set(null);
      this.membershipDiscount.set(null);
      this.showManualFieldsInMemberMode.set(false);
      this.isMemberDropdownOpen.set(false);
    }

    this.bookingFormGroup.get('renterAadhar')?.updateValueAndValidity();
    this.bookingFormGroup.get('renterDL')?.updateValueAndValidity();
  }

  /**
   * Dropdown open/close & search controllers for select-tag style autocomplete
   */
  openMemberDropdown(): void {
    this.isMemberDropdownOpen.set(true);
    if (this.autocompleteResults().length === 0) {
      this.loadAutocompleteResults(this.autocompleteQuery());
    }
  }

  closeMemberDropdown(): void {
    this.isMemberDropdownOpen.set(false);
  }

  toggleMemberDropdown(): void {
    if (this.isMemberDropdownOpen()) {
      this.closeMemberDropdown();
    } else {
      this.openMemberDropdown();
    }
  }

  onBlurMemberDropdown(): void {
    // Delay closing so that clicking an option in the dropdown (which causes blur) has time to execute
    setTimeout(() => {
      this.isMemberDropdownOpen.set(false);
    }, 200);
  }

  onMemberSearchInput(query: string): void {
    this.autocompleteQuery.set(query);
    this.isMemberDropdownOpen.set(true);
    this.loadAutocompleteResults(query);
  }

  /**
   * Queries lightweight customer autocomplete endpoint (returns ONLY id and name).
   */
  async loadAutocompleteResults(query: string): Promise<void> {
    this.autocompleteQuery.set(query);
    this.isSearchingCustomers.set(true);
    try {
      const results = await this.customerApi.getAutocomplete(query);
      this.autocompleteResults.set(results);
    } catch {
      this.autocompleteResults.set([]);
    } finally {
      this.isSearchingCustomers.set(false);
    }
  }

  /**
   * When an item is selected from autocomplete:
   * 1. Fetches full member details via GET /api/rr/customers/:id
   * 2. Prefills all booking form controls (Name, Father, Phone, Address, KYC)
   * 3. Auto-applies membership tier discount to financials step
   */
  async selectRegularCustomer(item: ICustomerAutocompleteItem): Promise<void> {
    this.isMemberDropdownOpen.set(false);
    this.autocompleteQuery.set('');
    this.isLoadingCustomerDetails.set(true);
    try {
      const fullCustomer = await this.customerApi.getCustomerById(
        item._id || item.membershipId
      );
      this.selectedRegularCustomer.set(fullCustomer);

      // Prefill all booking form controls
      this.bookingFormGroup.patchValue({
        renterFirstName: fullCustomer.firstName,
        renterSecondName: fullCustomer.lastName,
        renterFatherName: fullCustomer.fatherName,
        renterPhone: fullCustomer.phone,
        renterAltPhone: fullCustomer.altPhone || '',
        renterAddress: fullCustomer.address,
        renterAadhar: fullCustomer.aadhar,
        renterDL: fullCustomer.dl,
      });

      // Calculate and auto-apply tier discount
      const totalAmount =
        Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
      const rate = fullCustomer.discountRate || 0;
      const discountAmount = Math.round((totalAmount * rate) / 100);
      const finalRentalAmount = Math.max(0, totalAmount - discountAmount);

      this.membershipDiscount.set({
        isRegularCustomer: true,
        customerId: fullCustomer._id,
        membershipId: fullCustomer.membershipId,
        customerName: `${fullCustomer.firstName} ${fullCustomer.lastName}`,
        phone: fullCustomer.phone,
        email: fullCustomer.email,
        membershipTier: fullCustomer.membershipTier,
        discountRate: rate,
        discountAmount,
        originalAmount: totalAmount,
        finalRentalAmount,
        message: `${fullCustomer.membershipTier.toUpperCase()} Member (${rate}% discount active)`,
      });

      this.bookingFormGroup.patchValue({
        discountType: 'percentage',
        discount: String(rate),
      });
      this.recalculateFinalAmount();

      toast.success(
        `Pre-filled profile for ${fullCustomer.firstName} ${fullCustomer.lastName} (${fullCustomer.membershipId})! ${rate}% discount applied.`
      );
    } catch (err: unknown) {
      toast.error('Failed to retrieve full member details.');
    } finally {
      this.isLoadingCustomerDetails.set(false);
    }
  }

  /**
   * Resets regular customer selection to pick another member.
   */
  clearSelectedRegularCustomer(): void {
    this.selectedRegularCustomer.set(null);
    this.membershipDiscount.set(null);
    this.autocompleteQuery.set('');
    this.isMemberDropdownOpen.set(false);
    this.loadAutocompleteResults('');
  }

  /**
   * Toggles visibility of manual input fields while in member mode.
   */
  toggleManualFieldsView(): void {
    this.showManualFieldsInMemberMode.update((v) => !v);
  }

  private updateDepositValidators(type: string) {
    const bikeControls = [
      'bikeRegNo',
      'bikeManufacturer',
      'bikeModel',
      'bikeOwner',
    ];
    const cashControls = ['cashAmount'];
    const otherControls = ['otherItemName', 'otherItemValue'];

    [...bikeControls, ...cashControls, ...otherControls].forEach((name) => {
      this.bookingFormGroup.get(name)?.clearValidators();
      this.bookingFormGroup.get(name)?.updateValueAndValidity();
    });

    if (type === 'bike') {
      [...bikeControls].forEach((name) => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required]);
        this.bookingFormGroup.get(name)?.updateValueAndValidity();
      });
    } else if (type === 'cash') {
      this.bookingFormGroup
        .get('cashAmount')
        ?.setValidators([Validators.required, Validators.min(1)]);
      this.bookingFormGroup.get('cashAmount')?.updateValueAndValidity();
    } else if (type === 'other') {
      this.bookingFormGroup
        .get('otherItemName')
        ?.setValidators([Validators.required]);
      this.bookingFormGroup
        .get('otherItemValue')
        ?.setValidators([Validators.required, Validators.min(1)]);
      this.bookingFormGroup.get('otherItemName')?.updateValueAndValidity();
      this.bookingFormGroup.get('otherItemValue')?.updateValueAndValidity();
    }
  }

  async loadVehicles() {
    if (this.context?.vehicles && this.context.vehicles.length > 0) {
      this.vehicles.set(this.context.vehicles);
      this.applyPreselectedVehicle();
      return;
    }

    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
      this.applyPreselectedVehicle();
    } catch (e) {
      console.error('Error loading vehicles for new booking dialog:', e);
    }
  }

  private applyPreselectedVehicle() {
    const regNo = this.context?.vehicleRegNo;
    if (regNo) {
      this.bookingFormGroup.patchValue({ vehicleRegNo: regNo });
      this.onVehicleSelectChange();
    }
  }

  onVehicleSelectChange() {
    const regNo = this.bookingFormGroup.get('vehicleRegNo')?.value;
    const selected = this.vehicles().find((v) => v.regNo === regNo);
    this.selectedVehicle.set(selected || null);
    this.overrideOdometer = false;

    if (selected) {
      this.bookingFormGroup.patchValue({
        vehicleName: selected.name,
        vehicleManufacturer: selected.manufacturer,
        vehicleModel: selected.model,
        vehicleOdometerStart: selected.odometer,
        extraKmPrice: selected.extraKmPrice,
        extraHourPrice: selected.extraHourPrice,
      });
    } else {
      this.bookingFormGroup.patchValue({
        vehicleName: '',
        vehicleManufacturer: '',
        vehicleModel: '',
        vehicleOdometerStart: '',
        extraKmPrice: '',
        extraHourPrice: '',
      });
    }

    this.calculateReturnDate();
  }

  onDurationDaysChange() {
    const days =
      parseInt(this.bookingFormGroup.get('durationDays')?.value || '0', 10) || 0;
    if (days > 0) {
      this.bookingFormGroup.patchValue(
        { durationHours: '0' },
        { emitEvent: false }
      );
    }
    this.calculateReturnDate();
  }

  onDurationHoursChange() {
    const hours =
      parseInt(this.bookingFormGroup.get('durationHours')?.value || '0', 10) || 0;
    if (hours > 0) {
      this.bookingFormGroup.patchValue(
        { durationDays: '0' },
        { emitEvent: false }
      );
    }
    this.calculateReturnDate();
  }

  calculateReturnDate() {
    const pickupVal = this.bookingFormGroup.get('pickupDateTime')?.value;
    const days =
      parseInt(this.bookingFormGroup.get('durationDays')?.value || '0', 10) || 0;
    const hours =
      parseInt(this.bookingFormGroup.get('durationHours')?.value || '0', 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.bookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateFinalAmount();
      return;
    }

    const start = new Date(pickupVal);
    const end = new Date(start);

    if (days > 0) {
      end.setDate(end.getDate() + days);
    }
    if (hours > 0) {
      end.setHours(end.getHours() + hours);
    }

    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hour = String(end.getHours()).padStart(2, '0');
    const minute = String(end.getMinutes()).padStart(2, '0');

    this.bookingFormGroup.patchValue({
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`,
    });

    const selected = this.selectedVehicle();
    if (selected) {
      const diffMs = end.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      const rent = this.calculateSlabRent(totalHours, selected.pricing);
      const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

      this.bookingFormGroup.patchValue({
        totalRentalAmount: String(rent),
        totalKmLimit: String(kmLimit),
      });
    }

    this.recalculateFinalAmount();
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

    return totalKm;
  }

  onOverrideOdometerChange(checked: boolean) {
    this.overrideOdometer = checked;
    if (!checked) {
      const selected = this.selectedVehicle();
      this.bookingFormGroup.patchValue({
        vehicleOdometerStart: selected ? selected.odometer : '',
      });
    }
  }

  recalculateFinalAmount() {
    const total =
      Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountType =
      this.bookingFormGroup.get('discountType')?.value || 'none';

    if (discountType === 'none') {
      this.bookingFormGroup.get('discount')?.setValue('0', { emitEvent: false });
    }

    const discountVal =
      Number(this.bookingFormGroup.get('discount')?.value) || 0;
    const paid = Number(this.bookingFormGroup.get('amountPaid')?.value) || 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else if (discountType === 'rupee' || discountType === 'rupees') {
        finalRent = total - discountVal;
      }
    }
    finalRent = Math.max(0, finalRent);

    this.bookingFormGroup.patchValue(
      {
        finalRentalAmount: String(finalRent),
        pendingAmount: String(finalRent - paid),
      },
      { emitEvent: false }
    );

    const discountCtrl = this.bookingFormGroup.get('discount');
    discountCtrl?.clearValidators();
    if (discountType === 'percentage') {
      discountCtrl?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]);
    } else if (discountType === 'rupee' || discountType === 'rupees') {
      discountCtrl?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(total),
      ]);
    } else {
      discountCtrl?.setValidators([Validators.min(0), Validators.max(0)]);
    }
    discountCtrl?.updateValueAndValidity({ emitEvent: false });

    const paidCtrl = this.bookingFormGroup.get('amountPaid');
    paidCtrl?.clearValidators();
    paidCtrl?.setValidators([Validators.required, Validators.min(0)]);
    paidCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  async createBooking(event: Event) {
    event.preventDefault();
    if (this.bookingFormGroup.invalid) return;

    try {
      this.isSubmitting.set(true);
      const currentUser = this.rrApi.currentUser();
      const payload = {
        ...this.bookingFormGroup.value,
        bookedBy: currentUser?.id,
        bookedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : undefined,
      };
      const created = await this.rrApi.createBooking(payload);
      toast.success('Booking created successfully.');
      this.dialogRef?.close(created);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Error creating booking.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  printAgreementPDFFromForm() {
    const val = this.bookingFormGroup.value;
    const bObj = {
      id: 'RRB-DRAFT',
      vehicleRegNo: val.vehicleRegNo || '____',
      vehicleName: val.vehicleName || '____',
      vehicleManufacturer: val.vehicleManufacturer || '',
      vehicleModel: val.vehicleModel || '',
      pickupDateTime: val.pickupDateTime || '____',
      returnDateTime: val.returnDateTime || '____',
      totalRentalAmount: val.totalRentalAmount || '____',
      extraKmPrice: val.extraKmPrice || '____',
      extraHourPrice: val.extraHourPrice || '____',
      renterFirstName: val.renterFirstName || '____',
      renterSecondName: val.renterSecondName || '____',
      renterFatherName: val.renterFatherName || '____',
      renterAadhar: val.renterAadhar || '____',
      renterDL: val.renterDL || '____',
      renterPhone: val.renterPhone || '____',
      renterAltPhone: val.renterAltPhone || '____',
      renterAddress: val.renterAddress || '____',
      guarFirstName: val.guarFirstName || '____',
      guarSecondName: val.guarSecondName || '____',
      guarFatherName: val.guarFatherName || '____',
      guarAadhar: val.guarAadhar || '____',
      guarPhone: val.guarPhone || '____',
      guarAddress: val.guarAddress || '____',
      depositType: val.depositType,
      bikeManufacturer: val.bikeManufacturer,
      bikeModel: val.bikeModel,
      bikeRegNo: val.bikeRegNo,
      cashAmount: val.cashAmount,
      otherItemName: val.otherItemName,
      otherItemValue: val.otherItemValue,
      paymentMode: val.paymentMode,
      travelFrom: val.travelFrom || '____',
      travelTo: val.travelTo || '____',
      vehicleOdometerStart: val.vehicleOdometerStart || '____',
    };

    this.invoicePdf.printAgreementPdf(bObj);
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
