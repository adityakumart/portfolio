import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideAlertTriangle,
  lucideCheckCircle2,
  lucideCalendarClock,
  lucideCar,
  lucideUser,
  lucideCreditCard,
  lucideBanknote,
  lucideCheck,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking, IVehicle, ICloseAdvanceBookingPayload } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { IndianDatePipe } from '../../../../../shared/pipes/indian-date.pipe';

export interface CloseAdvanceBookingDialogContext {
  booking: IBooking;
  vehicle?: IVehicle;
}

@Component({
  selector: 'app-rr-close-advance-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmBadgeImports,
    NgIconComponent,
    IndianDatePipe,
  ],
  providers: [
    provideIcons({
      lucideX,
      lucideAlertTriangle,
      lucideCheckCircle2,
      lucideCalendarClock,
      lucideCar,
      lucideUser,
      lucideCreditCard,
      lucideBanknote,
      lucideCheck,
    }),
  ],
  templateUrl: './close-advance-booking-dialog.component.html',
})
export class RRCloseAdvanceBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<CloseAdvanceBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);

  booking!: IBooking;
  vehicle = signal<IVehicle | null>(null);
  isSubmitting = signal(false);

  closeForm!: FormGroup;

  readonly closureReasons = [
    'Customer No-Show',
    'Customer Cancelled',
    'Change of Plans / Schedule Conflict',
    'Vehicle Unavailable / Maintenance',
    'Swapped to Different Vehicle',
    'Mutual Cancellation',
    'Other',
  ];

  readonly returnModes = [
    'Cash',
    'UPI Transfer',
    'Bank Transfer',
    'Cheque / Checkbook',
    'Original method',
  ];

  ngOnInit() {
    if (this.data?.booking) {
      this.booking = this.data.booking;
    }
    if (this.data?.vehicle) {
      this.vehicle.set(this.data.vehicle);
    }

    const paidAmount = this.booking?.amountPaid ? String(this.booking.amountPaid) : '0';

    this.closeForm = this.fb.group({
      closeReason: ['Customer No-Show', Validators.required],
      closeNotes: [''],
      isAdvanceReturned: [false],
      advanceReturnAmount: [paidAmount, [Validators.min(0)]],
      advanceReturnMode: ['Cash'],
    });

    // Toggle return amount & return mode validation based on isAdvanceReturned checkbox
    this.closeForm.get('isAdvanceReturned')?.valueChanges.subscribe((checked: boolean) => {
      const amountCtrl = this.closeForm.get('advanceReturnAmount');
      const modeCtrl = this.closeForm.get('advanceReturnMode');

      if (checked) {
        amountCtrl?.setValidators([Validators.required, Validators.min(0)]);
        modeCtrl?.setValidators([Validators.required]);
        if (!amountCtrl?.value || amountCtrl.value === '0') {
          amountCtrl?.setValue(paidAmount);
        }
      } else {
        amountCtrl?.clearValidators();
        modeCtrl?.clearValidators();
      }
      amountCtrl?.updateValueAndValidity();
      modeCtrl?.updateValueAndValidity();
    });
  }

  get isAdvanceReturnedChecked(): boolean {
    return !!this.closeForm?.get('isAdvanceReturned')?.value;
  }

  async confirmClose() {
    if (this.closeForm.invalid || this.isSubmitting()) {
      this.closeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formVal = this.closeForm.value;
      const notes = (formVal.closeNotes || '').trim();
      const combinedReason = notes
        ? `${formVal.closeReason} - ${notes}`
        : formVal.closeReason;

      const payload: ICloseAdvanceBookingPayload = {
        closeReason: combinedReason,
        isAdvanceReturned: !!formVal.isAdvanceReturned,
        advanceReturnAmount: formVal.isAdvanceReturned
          ? String(formVal.advanceReturnAmount || '0')
          : '0',
        advanceReturnMode: formVal.isAdvanceReturned
          ? formVal.advanceReturnMode
          : undefined,
      };

      const result = await this.rrApi.closeAdvanceBooking(this.booking.id, payload);
      toast.success(`Advance reservation #${this.booking.id} closed successfully.`);
      this.dialogRef?.close(result);
    } catch (err: any) {
      console.error('Failed to close advance reservation:', err);
      toast.error(err.error?.message || 'Failed to close advance reservation.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeDialog() {
    this.dialogRef?.close();
  }
}
