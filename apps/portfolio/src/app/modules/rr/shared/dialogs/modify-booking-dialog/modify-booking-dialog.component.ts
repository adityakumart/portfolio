import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarRange,
  lucideX,
  lucideSave,
  lucideFileText,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking, IVehicle, IVehiclePricing } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../services/rr-invoice-pdf.service';

export interface ModifyBookingDialogContext {
  booking: IBooking;
  vehicles?: IVehicle[];
}

@Component({
  selector: 'app-rr-modify-booking-dialog',
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
      lucideCalendarRange,
      lucideX,
      lucideSave,
      lucideFileText,
      lucideAlertTriangle,
    }),
  ],
  templateUrl: './modify-booking-dialog.component.html',
})
export class RRModifyBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<ModifyBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private invoicePdf = inject(RRInvoicePdfService);

  modifyBookingFormGroup!: FormGroup;
  selectedBooking = signal<IBooking | null>(null);
  vehicles = signal<IVehicle[]>([]);
  isSubmitting = signal(false);

  ngOnInit() {
    this.initForm();
    if (this.data?.booking) {
      this.selectedBooking.set(this.data.booking);
      this.populateForm(this.data.booking);
    }
    if (this.data?.vehicles) {
      this.vehicles.set(this.data.vehicles);
    } else {
      this.loadVehicles();
    }
  }

  private initForm() {
    this.modifyBookingFormGroup = this.fb.group({
      id: [''],
      pickupDateTime: ['', Validators.required],
      durationDays: ['0', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: ['', Validators.required],
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['none'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      totalKmLimit: ['0'],
    });
  }

  private populateForm(booking: IBooking) {
    this.modifyBookingFormGroup.reset({
      id: booking.id,
      pickupDateTime: booking.pickupDateTime,
      durationDays: booking.durationDays || '0',
      durationHours: booking.durationHours || '0',
      returnDateTime: booking.returnDateTime,
      totalRentalAmount: booking.totalRentalAmount,
      discount: booking.discount || '0',
      discountType: booking.discountType || 'none',
      finalRentalAmount: booking.finalRentalAmount,
      amountPaid: booking.amountPaid || '0',
      pendingAmount: booking.pendingAmount || '0',
      totalKmLimit: booking.totalKmLimit,
    });
    this.recalculateModifyFinalAmount();
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles for modify booking dialog:', e);
    }
  }

  calculateModifyReturnDate() {
    const pickupVal = this.modifyBookingFormGroup.get('pickupDateTime')?.value;
    const days =
      parseInt(
        this.modifyBookingFormGroup.get('durationDays')?.value || '0',
        10
      ) || 0;
    const hours =
      parseInt(
        this.modifyBookingFormGroup.get('durationHours')?.value || '0',
        10
      ) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.modifyBookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateModifyFinalAmount();
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

    this.modifyBookingFormGroup.patchValue({
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`,
    });

    const booking = this.selectedBooking();
    if (booking) {
      const selected = this.vehicles().find(
        (v) => v.regNo === booking.vehicleRegNo
      );
      if (selected) {
        const diffMs = end.getTime() - start.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);

        const rent = this.calculateSlabRent(totalHours, selected.pricing);
        const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

        this.modifyBookingFormGroup.patchValue({
          totalRentalAmount: String(rent),
          totalKmLimit: String(kmLimit),
        });
      }
    }

    this.recalculateModifyFinalAmount();
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

  recalculateModifyFinalAmount() {
    const total =
      Number(this.modifyBookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountType =
      this.modifyBookingFormGroup.get('discountType')?.value || 'none';

    if (discountType === 'none') {
      this.modifyBookingFormGroup
        .get('discount')
        ?.setValue('0', { emitEvent: false });
    }

    const discountVal =
      Number(this.modifyBookingFormGroup.get('discount')?.value) || 0;
    const paid =
      Number(this.modifyBookingFormGroup.get('amountPaid')?.value) || 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else if (discountType === 'rupee' || discountType === 'rupees') {
        finalRent = total - discountVal;
      }
    }
    finalRent = Math.max(0, finalRent);

    this.modifyBookingFormGroup.patchValue(
      {
        finalRentalAmount: String(finalRent),
        pendingAmount: String(finalRent - paid),
      },
      { emitEvent: false }
    );

    const discountCtrl = this.modifyBookingFormGroup.get('discount');
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

    const paidCtrl = this.modifyBookingFormGroup.get('amountPaid');
    paidCtrl?.clearValidators();
    paidCtrl?.setValidators([Validators.required, Validators.min(0)]);
    paidCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  async submitModifyBooking() {
    if (this.modifyBookingFormGroup.invalid) return;

    try {
      this.isSubmitting.set(true);
      const id = this.modifyBookingFormGroup.value.id;
      const originalBooking = this.selectedBooking();
      const updated = {
        ...originalBooking,
        ...this.modifyBookingFormGroup.value,
      };

      await this.rrApi.updateBooking(id, updated);
      toast.success('Booking updated successfully.');
      this.dialogRef?.close(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Error updating booking.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  printAgreementPDFFromModifyForm() {
    const original = this.selectedBooking();
    if (!original) return;
    const formVal = this.modifyBookingFormGroup.value;
    const merged = {
      ...original,
      ...formVal,
    };
    this.invoicePdf.printAgreementPdf(merged);
  }

  closeDialog() {
    this.dialogRef?.close(false);
  }
}
