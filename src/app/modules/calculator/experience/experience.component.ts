import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ExperienceService, UserExperienceRecord } from 'src/shared/services/experience.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorMessageComponent } from '../../../shared/components/error-message.component';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatDatepickerModule, ReactiveFormsModule, MatIconModule, MatTooltipModule, ErrorMessageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExperienceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expService = inject(ExperienceService);

  private snackBar = inject(MatSnackBar);


  savedRecords = signal<UserExperienceRecord[]>([]);

  experienceForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    experience: this.fb.array([this.createDateRangeGroup()])
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
      end: ['', Validators.required]
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
    this.expService.getAllRecords().subscribe({
      next: (data) => this.savedRecords.set(data),
      error: (err) => console.error('DB Error:', err)
    });
  }

  submitRecord() {
    if (this.experienceForm.invalid) return;

    const formValue = this.experienceForm.value;

    // Calculate total experience details before saving
    const calculatedExp = this.expService.calculateTotalExperience(formValue.experience);
    const totalDays = (calculatedExp.years * 365) + (calculatedExp.months * 30) + calculatedExp.days;

    const payload: UserExperienceRecord = {
      name: formValue.name,
      email: formValue.email,
      experience: formValue.experience,
      totalDays: totalDays,
      displayYears: calculatedExp.years,
      displayMonths: calculatedExp.months,
      displayDays: calculatedExp.days
    };

    this.expService.saveRecord(payload).subscribe({
      next: () => {
        this.experienceForm.reset();
        this.experienceFormArray.clear();
        this.experienceFormArray.push(this.createDateRangeGroup());
        this.loadRecords();
      }
    });
  }

  deleteRecord(id?: number) {
    if (!id) return;
    this.expService.deleteRecord(id).subscribe(() => this.loadRecords());
  }

  getComputedExperience(): string {
    const total = this.expService.calculateTotalExperience(this.experienceForm.value.experience);
    if (total.years || total.months || total.days) {
      return `${total.years} Years, ${total.months} Months, ${total.days} Days`;
    }
    return ``;
  }

  displayedColumns: string[] = ["index", "start", "end", "experience"];
  readonly maxDate = new Date();



  reset = () => {
    this.experienceForm.reset();

  }


  openSnackBar(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

}
