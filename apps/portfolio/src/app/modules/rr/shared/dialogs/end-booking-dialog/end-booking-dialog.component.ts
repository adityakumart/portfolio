import { Component, OnInit, inject, signal } from '@angular/core';
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
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking, IVehicle } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';

export interface EndBookingDialogContext {
  booking: IBooking;
  vehicles?: IVehicle[];
}

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
    }),
  ],
  templateUrl: './end-booking-dialog.component.html',
})
export class RREndBookingDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<EndBookingDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  isSubmitting = signal(false);

  booking = signal<IBooking | null>(null);

  endBookingFields = {
    odometerEnd: '',
    extraKms: 0,
    extraKmFee: 0,
    extraHours: 0,
    extraHourFee: 0,
    cleanlinessFine: false,
    totalAdditionalFees: 0,
    finalTotalPayable: 0,
    balancePending: 0,
  };

  ngOnInit() {
    if (this.data?.booking) {
      this.booking.set(this.data.booking);
      this.endBookingFields.finalTotalPayable = Number(this.data.booking.finalRentalAmount) || 0;
      this.endBookingFields.balancePending = Number(this.data.booking.pendingAmount) || 0;
    }
  }

  calculateEndBookingFees() {
    const b = this.booking();
    if (!b) return;

    const startOdo = Number(b.vehicleOdometerStart) || 0;
    const endOdo = Number(this.endBookingFields.odometerEnd) || 0;

    let extraKms = 0;
    let extraKmFee = 0;

    if (endOdo > startOdo) {
      const totalKms = endOdo - startOdo;
      const kmLimit = Number(b.totalKmLimit) || 0;
      if (totalKms > kmLimit) {
        extraKms = totalKms - kmLimit;
        extraKmFee = extraKms * (Number(b.extraKmPrice) || 0);
      }
    }

    const expectedReturn = new Date(b.returnDateTime);
    const now = new Date();
    let extraHours = 0;
    let extraHourFee = 0;

    if (now > expectedReturn) {
      const diffMs = now.getTime() - expectedReturn.getTime();
      extraHours = Math.ceil(diffMs / (1000 * 60 * 60));
      extraHourFee = extraHours * (Number(b.extraHourPrice) || 0);
    }

    const cleanlinessFine = this.endBookingFields.cleanlinessFine ? 500 : 0;
    const totalAdd = extraKmFee + extraHourFee + cleanlinessFine;
    const finalTotal = Number(b.finalRentalAmount) + totalAdd;
    const balance = finalTotal - (Number(b.amountPaid) || 0);

    this.endBookingFields.extraKms = extraKms;
    this.endBookingFields.extraKmFee = extraKmFee;
    this.endBookingFields.extraHours = extraHours;
    this.endBookingFields.extraHourFee = extraHourFee;
    this.endBookingFields.totalAdditionalFees = totalAdd;
    this.endBookingFields.finalTotalPayable = finalTotal;
    this.endBookingFields.balancePending = balance;
  }

  async submitEndBooking() {
    const b = this.booking();
    if (!b) return;

    if (!this.endBookingFields.odometerEnd) {
      toast.error('Please enter return odometer reading.');
      return;
    }

    const endOdo = Number(this.endBookingFields.odometerEnd);
    const startOdo = Number(b.vehicleOdometerStart);
    if (endOdo < startOdo) {
      toast.error('Return odometer cannot be less than starting odometer.');
      return;
    }

    try {
      this.isSubmitting.set(true);
      const patch = {
        status: 'completed' as const,
        vehicleOdometerEnd: String(endOdo),
        finalRentalAmount: String(this.endBookingFields.finalTotalPayable),
        pendingAmount: '0',
        amountPaid: String(this.endBookingFields.finalTotalPayable),
      };

      await this.rrApi.updateBooking(b.id, patch);

      // Update vehicle odometer
      try {
        await this.rrApi.updateVehicle(b.vehicleRegNo, {
          odometer: String(endOdo),
        });
      } catch (ve) {
        console.warn('Vehicle odometer update note:', ve);
      }

      toast.success('Booking finalized and closed.');
      this.dialogRef?.close(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Error closing booking.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  closeDialog() {
    this.dialogRef?.close(false);
  }
}
