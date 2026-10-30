import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmDatePickerImports } from '@spartan-ng/hel/date-picker';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideCalendar,
  lucideCar,
  lucideWrench,
  lucideFileText,
  lucideCheck,
  lucideAlertCircle,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IVehicle } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';
import { IndianDatePipe, toISODateString, IndianDateInput } from '../../../../../shared/pipes/indian-date.pipe';

export interface UpdateAvailabilityDialogContext {
  vehicle: IVehicle;
}

@Component({
  selector: 'app-rr-update-availability-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmBadgeImports,
    HlmDatePickerImports,
    NgIconComponent,
    IndianDatePipe,
  ],
  providers: [
    provideIcons({
      lucideX,
      lucideCalendar,
      lucideCar,
      lucideWrench,
      lucideFileText,
      lucideCheck,
      lucideAlertCircle,
    }),
  ],
  templateUrl: './update-availability-dialog.component.html',
})
export class RRUpdateVehicleAvailabilityDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<UpdateAvailabilityDialogContext>({ optional: true });

  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);

  vehicle = signal<IVehicle | null>(null);
  isSubmitting = signal(false);

  availForm!: FormGroup;

  get currentAvailableBy(): string | null {
    const v = this.vehicle();
    return v?.availableBy || v?.nextAvailableDate || null;
  }

  get isService(): boolean {
    return this.vehicle()?.status === 'maintenance';
  }

  get isContract(): boolean {
    const st = this.vehicle()?.status;
    return st === 'contract' || st === 'in_contract';
  }

  ngOnInit() {
    if (this.data?.vehicle) {
      this.vehicle.set(this.data.vehicle);
    }

    const current = this.currentAvailableBy;
    this.availForm = this.fb.group({
      availableBy: [current ? new Date(current) : null, [Validators.required]],
      note: [''],
    });
  }

  closeDialog() {
    this.dialogRef?.close(false);
  }

  async confirmUpdate() {
    if (this.availForm.invalid) {
      this.availForm.markAllAsTouched();
      toast.error('Please select a valid next available date');
      return;
    }

    if (!this.rrApi.isManagerOrAdmin()) {
      toast.error('Permission denied: Only Managers and Admins can update vehicle availability');
      return;
    }

    const v = this.vehicle();
    if (!v?.regNo) {
      toast.error('Invalid vehicle record');
      return;
    }

    const rawVal = this.availForm.value.availableBy;
    const isoDate = toISODateString(rawVal as IndianDateInput);

    if (!isoDate) {
      toast.error('Please enter a valid date in DD-MM-YYYY format');
      return;
    }

    this.isSubmitting.set(true);
    try {
      await this.rrApi.updateVehicle(v.regNo, {
        availableBy: isoDate,
        nextAvailableDate: isoDate,
      });

      toast.success(
        `Next available date for ${v.manufacturer} ${v.name} (${v.regNo}) updated successfully!`
      );
      this.dialogRef?.close(true);
    } catch (err: any) {
      console.error('Failed to update vehicle availability date:', err);
      toast.error(err?.message || 'Failed to update vehicle availability date');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

