import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

import { ExperienceService, UserExperienceRecord } from './experience.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorMessageComponent } from '../../../shared/components/error-message.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExperienceListDialogComponent } from './experience-list-dialog.component';
import { CommonMaterialModule } from '../../../shared/Material/common-material.module';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatIconModule,
    MatTooltipModule,
    ErrorMessageComponent,
    MatDialogModule,
    CommonMaterialModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expService = inject(ExperienceService);

  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  experienceForm: FormGroup = this.fb.group({
    id: [null],
    name: ['', Validators.required],
    email: ['', Validators.email],
    experience: this.fb.array([this.createDateRangeGroup()]),
  });

  ngOnInit(): void {
    this.loadRecords();
  }

  get experienceFormArray(): FormArray {
    return this.experienceForm.get('experience') as FormArray;
  }

  createDateRangeGroup(): FormGroup {
    return this.fb.group({
      start: ['', Validators.required],
      end: ['', Validators.required],
    });
  }

  addDateRangeRow() {
    this.experienceFormArray.push(this.createDateRangeGroup());
  }

  removeDateRangeRow(index: number) {
    if (this.experienceFormArray.length > 1) {
      this.experienceFormArray.removeAt(index);
    }
  }

  loadRecords() {
    this.expService.refreshExperiences();
  }

  submitRecord() {
    if (this.experienceForm.invalid) return;

    const formValue = this.experienceForm.value;

    // Calculate total experience details before saving
    const calculatedExp = this.expService.calculateTotalExperience(
      formValue.experience,
    );
    const totalDays =
      calculatedExp.years * 365 +
      calculatedExp.months * 30 +
      calculatedExp.days;

    const payload: UserExperienceRecord = {
      ...(formValue.id ? { id: formValue.id } : {}),
      name: formValue.name,
      email: formValue.email,
      experience: formValue.experience,
      totalDays: totalDays,
      displayYears: calculatedExp.years,
      displayMonths: calculatedExp.months,
      displayDays: calculatedExp.days,
    };

    const saveObs = formValue.id
      ? this.expService.updateExperience(payload)
      : this.expService.addExperience(payload);

    saveObs.then(() => {
      this.reset();
      this.loadRecords();
      this.cdr.markForCheck();
    });
  }

  deleteRecord(id?: number) {
    if (!id) return;
    this.expService.deleteExperience(id).then(() => this.loadRecords());
  }

  openListDialog() {
    const dialogRef = this.dialog.open(ExperienceListDialogComponent, {
      width: '800px',
      data: { records: this.expService.experiences() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.action === 'edit') {
          this.editRecord(result.record);
        } else if (result.action === 'delete') {
          this.deleteRecord(result.record.id);
        }
      }
    });
  }

  editRecord(record: UserExperienceRecord) {
    this.experienceFormArray.clear();
    record.experience.forEach((exp) => {
      const group = this.createDateRangeGroup();
      group.patchValue({
        start: exp.start ? new Date(exp.start) : null,
        end: exp.end ? new Date(exp.end) : null,
      });
      this.experienceFormArray.push(group);
    });
    this.experienceForm.patchValue({
      id: record.id,
      name: record.name,
      email: record.email,
    });
    this.cdr.markForCheck();
  }

  getComputedExperience(): string {
    const total = this.expService.calculateTotalExperience(
      this.experienceForm.value.experience,
    );
    if (total.years || total.months || total.days) {
      return `${total.years} Years, ${total.months} Months, ${total.days} Days`;
    }
    return ``;
  }

  displayedColumns: string[] = ['index', 'start', 'end', 'experience'];
  readonly maxDate = new Date();

  reset = () => {
    this.experienceForm.reset();
    this.experienceFormArray.clear();
    this.experienceFormArray.push(this.createDateRangeGroup());
  };
}
