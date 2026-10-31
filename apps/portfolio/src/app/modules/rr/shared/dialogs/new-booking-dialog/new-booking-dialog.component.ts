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
  lucideDownload,
  lucideCalendar,
  lucideTag,
  lucideAlertCircle,
  lucideCalendarCheck,
  lucidePaperclip,
  lucidePrinter,
  lucideUpload,
  lucideTrash2,
  lucideCamera,
  lucideCheckCircle2,
  lucideExternalLink,
  lucideImage,
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
  IBookingAttachments,
} from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';
import { RRCustomerApiService } from '../../../services/rr-customer-api.service';
import { RRAadharInputComponent } from '../../components/aadhar-input/aadhar-input.component';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import {
  RRAgreementUploadDialogComponent,
  AgreementUploadItem,
  AgreementUploadDialogResult,
} from '../agreement-upload-dialog/agreement-upload-dialog.component';

import { ScheduleConflict } from '../reserve-booking-dialog/reserve-booking-dialog.component';

export interface NewBookingDialogContext {
  vehicleRegNo?: string;
  vehicles?: IVehicle[];
  reservation?: IBooking;
  bookings?: IBooking[];
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
      lucideDownload,
      lucideCalendar,
      lucideTag,
      lucideAlertCircle,
      lucideCalendarCheck,
  lucidePaperclip,
  lucidePrinter,
  lucideUpload,
  lucideTrash2,
  lucideCamera,
  lucideCheckCircle2,
  lucideExternalLink,
  lucideImage,
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
  private dialog = inject(HlmDialogService);

  vehicles = signal<IVehicle[]>([]);
  allBookings = signal<IBooking[]>([]);
  selectedVehicle = signal<IVehicle | null>(null);
  overrideOdometer = false;
  isSubmitting = signal(false);
  membershipDiscount = signal<ICustomerMembershipDiscount | null>(null);

  // Documentation & Agreement workflow state
  isAgreementPrinted = signal<boolean>(false);
  signedAgreementUrl = signal<string | null>(null);

  instrumentClusterImages = signal<string[]>([]);
  vehicleImages = signal<string[]>([]);
  customerIds = signal<string[]>([]);
  guaranteePersonIds = signal<string[]>([]);
  securityDepositImages = signal<string[]>([]);

  previewImageUrl = signal<string | null>(null);

  isUploadingSignedAgreement = signal<boolean>(false);
  isUploadingInstrumentCluster = signal<boolean>(false);
  isUploadingVehicleImages = signal<boolean>(false);
  isUploadingCustomerIds = signal<boolean>(false);
  isUploadingGuaranteeIds = signal<boolean>(false);
  isUploadingDepositImages = signal<boolean>(false);
  uploadedAttachments = signal<AgreementUploadItem[]>([]);


  isAgreementReviewed = computed(() => this.isAgreementPrinted());
  hasUploadedAttachments = computed(() => this.isAttachmentsValid());

  isSecurityDepositImageRequired = computed(() => {
    const depType = this.bookingFormGroup?.get('depositType')?.value;
    return depType !== 'none' && depType !== 'cash';
  });

  isAttachmentsValid = computed(() => {
    if (!this.isAgreementPrinted()) return false;
    if (!this.signedAgreementUrl()) return false;
    if (this.instrumentClusterImages().length < 1) return false;
    if (this.vehicleImages().length < 1 || this.vehicleImages().length > 10) return false;
    if (this.customerIds().length < 1 || this.customerIds().length > 3) return false;
    if (this.guaranteePersonIds().length > 3) return false;
    if (this.isSecurityDepositImageRequired()) {
      if (this.securityDepositImages().length < 1 || this.securityDepositImages().length > 10) return false;
    }
    return true;
  });

  missingAttachmentsList = computed(() => {
    const list: string[] = [];
    if (!this.isAgreementPrinted()) {
      list.push('Print Agreement');
    }
    if (!this.signedAgreementUrl()) {
      list.push('Signed Agreement (*)');
    }
    if (this.instrumentClusterImages().length < 1) {
      list.push('Vehicle Instrument Cluster (*)');
    }
    if (this.vehicleImages().length < 1) {
      list.push('Vehicle Images (*)');
    }
    if (this.customerIds().length < 1) {
      list.push("Customer ID's (*)");
    }
    if (this.isSecurityDepositImageRequired() && this.securityDepositImages().length < 1) {
      list.push('Security Deposit Images (*)');
    }
    return list;
  });




  // Real-time schedule conflict status against advance reservations
  scheduleConflict = signal<ScheduleConflict>({ hasConflict: false });

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
    return !!(
      regNo &&
      pickup &&
      returnDt &&
      odo !== null &&
      odo !== '' &&
      !this.scheduleConflict().hasConflict
    );
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
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
      renterEmail: ['', [Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
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
      depositType: ['', Validators.required],
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
      amountPaid: ['', [Validators.required, Validators.min(0)]],
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
   * Queries lightweight customer autocomplete endpoint (returns ONLY active, non-expired members).
   */
  async loadAutocompleteResults(query: string): Promise<void> {
    this.autocompleteQuery.set(query);
    this.isSearchingCustomers.set(true);
    try {
      const results = await this.customerApi.getAutocomplete(query);
      const now = new Date();
      // Exclude members whose end date has passed
      const activeNonExpired = results.filter(
        (item) => !item.endDate || new Date(item.endDate) >= now
      );
      this.autocompleteResults.set(activeNonExpired);
    } catch {
      this.autocompleteResults.set([]);
    } finally {
      this.isSearchingCustomers.set(false);
    }
  }

  getMemberDaysRemaining(endDateStr?: string): number {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  getMemberEndDateBadgeClass(endDateStr?: string): string {
    const days = this.getMemberDaysRemaining(endDateStr);
    if (days <= 30) {
      // <= 30 days: red color
      return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
    } else if (days <= 60) {
      // <= 60 days: yellow color
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    } else if (days >= 90) {
      // >= 90 days: green color
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    } else {
      // 61-89 days: yellow color
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
  }

  /**
   * When an item is selected from autocomplete:
   * 1. Fetches full member details via GET /api/rr/customers/:id
   * 2. Prefills all booking form controls (Name, Father, Phone, Address, KYC)
   * 3. Auto-applies membership tier discount to financials step (respecting maxDiscountAmount cap)
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
        renterEmail: fullCustomer.email || '',
        renterAddress: fullCustomer.address,
        renterAadhar: fullCustomer.aadhar,
        renterDL: fullCustomer.dl,
      });

      // Calculate and auto-apply tier discount (0 - 30%, capped at maxDiscountAmount)
      const totalAmount =
        Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
      const rate = Math.min(30, Math.max(0, fullCustomer.discountRate || 0));
      let discountAmount = Math.round((totalAmount * rate) / 100);
      if (fullCustomer.maxDiscountAmount && fullCustomer.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, fullCustomer.maxDiscountAmount);
      }
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
        maxDiscountAmount: fullCustomer.maxDiscountAmount,
        discountAmount,
        originalAmount: totalAmount,
        finalRentalAmount,
        endDate: fullCustomer.endDate,
        message:
          fullCustomer.maxDiscountAmount && fullCustomer.maxDiscountAmount > 0
            ? `${fullCustomer.membershipTier.toUpperCase()} Member (${rate}% discount active, capped up to ₹${fullCustomer.maxDiscountAmount})`
            : `${fullCustomer.membershipTier.toUpperCase()} Member (${rate}% discount active)`,
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

  async loadData() {
    try {
      const [vehList, bookList] = await Promise.all([
        this.context?.vehicles && this.context.vehicles.length > 0
          ? Promise.resolve(this.context.vehicles)
          : this.rrApi.getVehicles(),
        this.context?.bookings && this.context.bookings.length > 0
          ? Promise.resolve(this.context.bookings)
          : this.rrApi.getBookings(),
      ]);
      this.vehicles.set(vehList);
      this.allBookings.set(bookList);
      this.applyPreselectedVehicle();
    } catch (e) {
      console.error('Error loading data for new booking dialog:', e);
    }
  }

  async loadVehicles() {
    await this.loadData();
  }

  private applyPreselectedVehicle() {
    const resv = this.context?.reservation;
    if (resv) {
      this.bookingFormGroup.patchValue({
        vehicleRegNo: resv.vehicleRegNo,
        vehicleName: resv.vehicleName,
        vehicleManufacturer: resv.vehicleManufacturer,
        vehicleModel: resv.vehicleModel,
        vehicleOdometerStart: resv.vehicleOdometerStart,
        extraKmPrice: resv.extraKmPrice,
        extraHourPrice: resv.extraHourPrice,
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
        pickupDateTime: resv.pickupDateTime,
        durationDays: resv.durationDays,
        durationHours: resv.durationHours,
        returnDateTime: resv.returnDateTime,
        totalKmLimit: resv.totalKmLimit,
        travelPurpose: resv.travelPurpose,
        travelFrom: resv.travelFrom,
        travelTo: resv.travelTo,
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
      if (selected && (!resv.vehicleOdometerStart || resv.vehicleOdometerStart === '0')) {
        this.bookingFormGroup.patchValue({ vehicleOdometerStart: selected.odometer });
      }
      if (resv.signedAgreementUrl) {
        this.signedAgreementUrl.set(resv.signedAgreementUrl);
        this.isAgreementPrinted.set(true);
      }
      if (resv.attachments && resv.attachments.length > 0) {
        const atts: AgreementUploadItem[] = resv.attachments.map((url, i) => ({
          name: `Attachment ${i + 1}`,
          url,
        }));
        this.vehicleImages.set(resv.attachments);
      }
      if (resv.bookingAttachments) {
        const ba = resv.bookingAttachments;
        if (ba.signedAgreement) {
          this.signedAgreementUrl.set(ba.signedAgreement);
          this.isAgreementPrinted.set(true);
        }
        if (ba.instrumentCluster) {
          this.instrumentClusterImages.set(ba.instrumentCluster);
        }
        if (ba.vehicleImages) {
          this.vehicleImages.set(ba.vehicleImages);
        }
        if (ba.customerIds) {
          this.customerIds.set(ba.customerIds);
        }
        if (ba.guaranteePersonIds) {
          this.guaranteePersonIds.set(ba.guaranteePersonIds);
        }
        if (ba.securityDepositImages) {
          this.securityDepositImages.set(ba.securityDepositImages);
        }

      }
      this.validateScheduleOverlap();
      return;
    }

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
    this.validateScheduleOverlap();
  }

  onDurationDaysChange() {
    this.calculateReturnDate();
  }

  onDurationHoursChange() {
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
      this.validateScheduleOverlap();
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
    this.validateScheduleOverlap();
  }

  /**
   * Schedule Validation for Active Rentals:
   * Prevents creating an active rental if the vehicle has an advance reservation
   * (status: 'reserved') during the requested pickup-return window.
   */
  validateScheduleOverlap() {
    if (!this.bookingFormGroup) return;

    const regNo = this.bookingFormGroup.get('vehicleRegNo')?.value;
    const pickupVal = this.bookingFormGroup.get('pickupDateTime')?.value;
    const returnVal = this.bookingFormGroup.get('returnDateTime')?.value;

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
    const existingBookings = this.allBookings().filter(
      (b) =>
        b.vehicleRegNo === regNo &&
        !b.isDeleted &&
        b.id !== this.context?.reservation?.id
    );

    // 1. Check Overlap with Advance Bookings (status: 'reserved')
    const reservedBookings = existingBookings.filter((b) => b.status === 'reserved');
    for (const resv of reservedBookings) {
      const rStart = new Date(resv.pickupDateTime).getTime();
      const rEnd = new Date(resv.returnDateTime).getTime();

      // Interval overlap check: max(startA, startB) < min(endA, endB)
      if (Math.max(reqStart, rStart) < Math.min(reqEnd, rEnd)) {
        const startStr = new Date(resv.pickupDateTime).toLocaleString('en-IN');
        const endStr = new Date(resv.returnDateTime).toLocaleString('en-IN');
        this.scheduleConflict.set({
          hasConflict: true,
          type: 'advance_booking',
          conflictingBooking: resv,
          message: `Schedule overlaps with an existing Advance Reservation (${resv.id ? '#' + resv.id + ': ' : ''}${startStr} to ${endStr}). Cannot book this vehicle for overlapping dates and times.`,
        });
        return;
      }
    }

    // 2. Check Overlap with ongoing Active Rentals (status: 'active')
    const activeBooking = existingBookings.find((b) => b.status === 'active');
    if (activeBooking && activeBooking.returnDateTime) {
      const activeStart = new Date(activeBooking.pickupDateTime).getTime();
      const activeEnd = new Date(activeBooking.returnDateTime).getTime();
      if (Math.max(reqStart, activeStart) < Math.min(reqEnd, activeEnd)) {
        this.scheduleConflict.set({
          hasConflict: true,
          type: 'active_booking',
          conflictingBooking: activeBooking,
          message: `Vehicle currently has an ongoing Active Rental until ${new Date(activeBooking.returnDateTime).toLocaleString('en-IN')}. Pickup schedule must be set after the current return time.`,
        });
        return;
      }
    }

    // 3. Check Contract / Maintenance Next Available Date
    const targetAvailDate = vehicle?.availableBy || vehicle?.nextAvailableDate;
    if (vehicle && ['maintenance', 'contract', 'in_contract'].includes(vehicle.status)) {
      if (targetAvailDate) {
        const nextAvail = new Date(targetAvailDate).getTime();
        if (!isNaN(nextAvail) && reqStart < nextAvail) {
          this.scheduleConflict.set({
            hasConflict: true,
            type: vehicle.status === 'maintenance' ? 'maintenance' : 'contract',
            message: `Vehicle is currently in ${vehicle.status === 'maintenance' ? 'Maintenance / Service' : 'Corporate Contract'} and next available on ${new Date(targetAvailDate).toLocaleDateString('en-IN')}.`,
          });
          return;
        }
      }
    }

    // All clear!
    this.scheduleConflict.set({ hasConflict: false });
  }

  getVehicleUpcomingReservations(regNo: string): IBooking[] {
    if (!regNo) return [];
    return this.allBookings().filter(
      (b) =>
        b.vehicleRegNo === regNo &&
        b.status === 'reserved' &&
        !b.isDeleted &&
        b.id !== this.context?.reservation?.id
    );
  }

  getVehicleReservationsSummary(regNo: string): string {
    const resvs = this.getVehicleUpcomingReservations(regNo);
    if (resvs.length === 0) return '';
    return `[${resvs.length} Advance Reservation${resvs.length > 1 ? 's' : ''}]`;
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
    const paidVal = this.bookingFormGroup.get('amountPaid')?.value;
    const paid =
      paidVal !== null && paidVal !== '' && !isNaN(Number(paidVal))
        ? Number(paidVal)
        : 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        let discountAmt = (total * discountVal) / 100;
        // Apply max discount ceiling if customer has configured cap
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

    this.bookingFormGroup.patchValue(
      {
        finalRentalAmount: String(finalRent),
        pendingAmount: String(Math.max(0, finalRent - paid)),
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
    paidCtrl?.setValidators([
      Validators.required,
      Validators.min(0),
      Validators.max(finalRent),
    ]);
    paidCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  async createBooking(event: Event) {
    event.preventDefault();
    if (this.bookingFormGroup.invalid || this.scheduleConflict().hasConflict) {
      if (this.scheduleConflict().hasConflict) {
        toast.error(
          this.scheduleConflict().message ||
            'Cannot create booking: Selected schedule conflicts with an advance booking.'
        );
      }
      return;
    }

    if (!this.isAttachmentsValid()) {
      const missing = this.missingAttachmentsList().join(', ');
      toast.error(`Please complete mandatory attachment requirements: ${missing}`);



      return;
    }

    try {
      this.isSubmitting.set(true);
      const currentUser = this.rrApi.currentUser();
      const payload: Partial<IBooking> = {
        ...this.bookingFormGroup.value,
        status: 'active',
        signedAgreementUrl: this.signedAgreementUrl(),
        attachments: [
          ...this.instrumentClusterImages(),
          ...this.vehicleImages(),
          ...this.customerIds(),
          ...this.guaranteePersonIds(),
          ...this.securityDepositImages(),
        ],
        bookingAttachments: {
          signedAgreement: this.signedAgreementUrl(),
          instrumentCluster: this.instrumentClusterImages(),
          vehicleImages: this.vehicleImages(),
          customerIds: this.customerIds(),
          guaranteePersonIds: this.guaranteePersonIds(),
          securityDepositImages: this.securityDepositImages(),
          verifiedAfterReturn: false,
        },
        bookedBy: currentUser?.id,
        bookedByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : undefined,
      };

      let result: IBooking;
      if (this.context?.reservation?.id) {
        result = await this.rrApi.updateBooking(this.context.reservation.id, payload);
        toast.success(`Reserved booking ${this.context.reservation.id} successfully moved to active rentals.`);
      } else {
        result = await this.rrApi.createBooking(payload);
        toast.success('Booking created successfully.');
      }
      this.dialogRef?.close(result);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Error creating booking.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getAgreementDraftObject() {
    const val = this.bookingFormGroup.value;
    return {
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
  }

  async viewAgreementPDFFromForm() {
    try {
      const bObj = this.getAgreementDraftObject();
      const doc = await this.invoicePdf.generateAgreementPdfDoc(bObj);
      if (!doc) {
        toast.error('Failed to generate agreement preview.');
        return;
      }
      const id = bObj.id || 'DRAFT';
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      const ref = this.dialog.open(RRAgreementUploadDialogComponent, {
        context: {
          title: `Rental Agreement & Documentation - #${id}`,
          fileName: `Agreement_${id}.pdf`,
          blobUrl,
          signedAgreementUrl: this.signedAgreementUrl(),
          attachments: this.uploadedAttachments(),
        },
        contentClass: 'w-[95vw] max-w-5xl p-0 border-0 bg-transparent shadow-none',
      });

      ref.closed$.subscribe((res: unknown) => {
        const result = res as AgreementUploadDialogResult | undefined;
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
        if (result) {
          this.signedAgreementUrl.set(result.signedAgreementUrl || null);
          this.uploadedAttachments.set(result.attachments || []);
          this.isAgreementPrinted.set(true);
          const hasDocs = Boolean(result.signedAgreementUrl && result.attachments && result.attachments.length > 0);

          if (hasDocs) {
            toast.success('Agreement and attachments saved and verified.');
          } else {
            toast.info('Draft agreement reviewed. Note: Both signed agreement and attachments are required to create booking.');
          }
        }
      });
    } catch (err: any) {
      console.error('Error opening agreement upload dialog:', err);
      toast.error('Failed to open agreement dialog: ' + (err?.message || 'unknown error'));
    }
  }

  downloadAgreementPDFFromForm() {
    this.viewAgreementPDFFromForm();
  }

  async printAgreementPDF() {
    if (this.bookingFormGroup.invalid) {
      this.bookingFormGroup.markAllAsTouched();
      toast.error('Please complete all required booking details before printing the agreement.');
      return;
    }

    try {
      const bObj = this.getAgreementDraftObject();
      const doc = await this.invoicePdf.generateAgreementPdfDoc(bObj);
      if (!doc) {
        toast.error('Failed to generate agreement PDF.');
        return;
      }

      const id = bObj.id || 'DRAFT';
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);

      const win = window.open(blobUrl, '_blank');
      if (win) {
        win.focus();
        setTimeout(() => win.print(), 500);
      }

      this.isAgreementPrinted.set(true);
      toast.success('Rental Agreement sent to print. Attachments section is now unlocked!');
    } catch (err: any) {
      console.error(err);
      toast.error('Error generating agreement for printing: ' + (err?.message || 'unknown error'));
    }
  }

  async onSignedAgreementFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      this.isUploadingSignedAgreement.set(true);
      const res = await this.rrApi.uploadVehicleImage(file);
      if (res && res.url) {
        this.signedAgreementUrl.set(res.url);
        toast.success('Signed agreement uploaded successfully.');
      } else {
        toast.error('Failed to obtain uploaded agreement URL.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading signed agreement.');
    } finally {
      this.isUploadingSignedAgreement.set(false);
      target.value = '';
    }
  }

  removeSignedAgreement() {
    this.signedAgreementUrl.set(null);
  }

  async onInstrumentClusterSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    try {
      this.isUploadingInstrumentCluster.set(true);
      const urls = await this.uploadFiles(files);
      if (urls.length > 0) {
        this.instrumentClusterImages.update((curr) => [...curr, ...urls]);
        toast.success(`${urls.length} instrument cluster photo(s) uploaded.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading instrument cluster photos.');
    } finally {
      this.isUploadingInstrumentCluster.set(false);
      target.value = '';
    }
  }

  removeInstrumentCluster(idx: number) {
    this.instrumentClusterImages.update((curr) => curr.filter((_, i) => i !== idx));
  }

  async onVehicleImagesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - this.vehicleImages().length;
    if (remaining <= 0) {
      toast.error('Maximum 10 vehicle images allowed.');
      target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} images were accepted (max 10 allowed).`);
    }

    try {
      this.isUploadingVehicleImages.set(true);
      const urls = await this.uploadFiles(filesToUpload);
      if (urls.length > 0) {
        this.vehicleImages.update((curr) => [...curr, ...urls]);
        toast.success(`${urls.length} vehicle photo(s) uploaded.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading vehicle images.');
    } finally {
      this.isUploadingVehicleImages.set(false);
      target.value = '';
    }
  }

  removeVehicleImage(idx: number) {
    this.vehicleImages.update((curr) => curr.filter((_, i) => i !== idx));
  }

  async onCustomerIdsSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - this.customerIds().length;
    if (remaining <= 0) {
      toast.error("Maximum 3 customer ID's allowed.");
      target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} file(s) accepted (max 3 customer ID's).`);
    }

    try {
      this.isUploadingCustomerIds.set(true);
      const urls = await this.uploadFiles(filesToUpload);
      if (urls.length > 0) {
        this.customerIds.update((curr) => [...curr, ...urls]);
        toast.success(`${urls.length} customer ID(s) uploaded.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading customer IDs.');
    } finally {
      this.isUploadingCustomerIds.set(false);
      target.value = '';
    }
  }

  removeCustomerId(idx: number) {
    this.customerIds.update((curr) => curr.filter((_, i) => i !== idx));
  }

  async onGuaranteeIdsSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const remaining = 3 - this.guaranteePersonIds().length;
    if (remaining <= 0) {
      toast.error("Maximum 3 guarantee person ID's allowed.");
      target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} file(s) accepted (max 3 guarantee person ID's).`);
    }

    try {
      this.isUploadingGuaranteeIds.set(true);
      const urls = await this.uploadFiles(filesToUpload);
      if (urls.length > 0) {
        this.guaranteePersonIds.update((curr) => [...curr, ...urls]);
        toast.success(`${urls.length} guarantee ID(s) uploaded.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading guarantee person IDs.');
    } finally {
      this.isUploadingGuaranteeIds.set(false);
      target.value = '';
    }
  }

  removeGuaranteeId(idx: number) {
    this.guaranteePersonIds.update((curr) => curr.filter((_, i) => i !== idx));
  }

  async onDepositImagesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - this.securityDepositImages().length;
    if (remaining <= 0) {
      toast.error('Maximum 10 security deposit images allowed.');
      target.value = '';
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      toast.warning(`Only ${remaining} file(s) accepted (max 10 deposit images).`);
    }

    try {
      this.isUploadingDepositImages.set(true);
      const urls = await this.uploadFiles(filesToUpload);
      if (urls.length > 0) {
        this.securityDepositImages.update((curr) => [...curr, ...urls]);
        toast.success(`${urls.length} security deposit image(s) uploaded.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading security deposit images.');
    } finally {
      this.isUploadingDepositImages.set(false);
      target.value = '';
    }
  }

  removeDepositImage(idx: number) {
    this.securityDepositImages.update((curr) => curr.filter((_, i) => i !== idx));
  }

  private async uploadFiles(files: FileList | File[]): Promise<string[]> {
    const list = Array.from(files);
    if (list.length === 0) return [];
    const res = await this.rrApi.uploadVehicleImages(list);
    if (res.images && res.images.length > 0) {
      return res.images.map((img) => img.url);
    }
    if (res.url) {
      return [res.url];
    }
    return [];
  }

  openImagePreview(url: string) {
    this.previewImageUrl.set(url);
  }

  closeImagePreview() {
    this.previewImageUrl.set(null);
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
