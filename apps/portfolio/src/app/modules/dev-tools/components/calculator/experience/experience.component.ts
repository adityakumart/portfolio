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
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { ExperienceService } from './experience.service';
import { UserExperienceRecord } from '@portfolio/shared-types';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideList, lucidePlus, lucideTrash2 } from '@ng-icons/lucide';
import { ErrorMessageComponent } from '../../../../../shared/components/error-message.component';
import { ExperienceListDialogComponent } from './experience-list-dialog.component';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  providers: [
    provideIcons({ lucideList, lucidePlus, lucideTrash2 }),
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    NgIconComponent,
    ErrorMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expService = inject(ExperienceService);
  private dialogService = inject(HlmDialogService);
  private cdr = inject(ChangeDetectorRef);

  maxDate = new Date().toISOString().split('T')[0];

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
      totalDays,
      displayYears: calculatedExp.years,
      displayMonths: calculatedExp.months,
      displayDays: calculatedExp.days,
      experience: formValue.experience,
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
    const dialogRef = this.dialogService.open(ExperienceListDialogComponent, {
      contentClass: 'max-w-3xl w-full p-0 overflow-hidden',
      context: { records: this.expService.experiences() },
    });

    dialogRef.closed$.subscribe((result: any) => {
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
        start: exp.start ? new Date(exp.start).toISOString().split('T')[0] : '',
        end: exp.end ? new Date(exp.end).toISOString().split('T')[0] : '',
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
    const expArray = this.experienceForm.get('experience')?.value;
    if (!expArray || expArray.length === 0) return '';

    const validExp = expArray.filter(
      (e: { start: string; end: string }) => e.start && e.end,
    );
    if (validExp.length === 0) return '';

    const result = this.expService.calculateTotalExperience(validExp);
    return `${result.years} Years, ${result.months} Months, ${result.days} Days`;
  }

  reset() {
    this.experienceForm.reset();
    this.experienceFormArray.clear();
    this.addDateRangeRow();
    this.cdr.markForCheck();
  }
}
