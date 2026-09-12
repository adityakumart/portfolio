import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IVehicle, IVehiclePricing } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';

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
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    NgIconComponent,
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
    }),
  ],
  templateUrl: './new-booking-dialog.component.html',
})
export class RRNewBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  context = injectBrnDialogContext<NewBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private invoicePdf = inject(RRInvoicePdfService);

  vehicles = signal<IVehicle[]>([]);
  selectedVehicle = signal<IVehicle | null>(null);
  overrideOdometer = false;
  isSubmitting = signal(false);

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
      returnDateTime: [''],
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
      totalKm += km3;
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
      const created = await this.rrApi.createBooking(this.bookingFormGroup.value);
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
