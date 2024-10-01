import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateTime } from 'luxon';

interface Duration { years: number; months: number; days: number; };
interface Dates { start: Date; end: Date };

type DurationAndDates = Duration & Dates;

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  providers: [provideNativeDateAdapter()],
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatDatepickerModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ExperienceComponent {
  private _snackBar = inject(MatSnackBar);

  experiences = signal<DurationAndDates[]>([]);

  totalExperience = signal<Duration>({
    days: 0,
    months: 0,
    years: 0
  });

  displayedColumns: string[] = ["index", "start", "end", "experience"];
  readonly maxDate = new Date();

  experienceForm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  calculateExperience = () => {
    if (this.experienceForm.value.start && this.experienceForm.value.end) {
      if (this.experienceForm.value.start < this.experienceForm.value.end) {
        const diff = DateTime.fromJSDate(this.experienceForm.value.end).diff(DateTime.fromJSDate(this.experienceForm.value.start), ["years", "months", "days"]);

        let tempArray: DurationAndDates[] = [...this.experiences(), {
          ...diff.toObject() as Duration,
          start: this.experienceForm.value.start as Date,
          end: this.experienceForm.value.end as Date
        }];
        tempArray = tempArray.sort((a, b) => a.start.valueOf() - b.start.valueOf());
        this.experiences.update(() => ([
          ...tempArray
        ]));


        let timeDiff = Math.abs(this.experienceForm.value.end.getTime() - this.experienceForm.value.start.getTime());
        let years = Math.floor(timeDiff / (1000 * 3600 * 24 * 365.25));
        timeDiff -= years * (1000 * 3600 * 24 * 365.25);
        let months = Math.floor(timeDiff / (1000 * 3600 * 24 * 30.44));
        timeDiff -= months * (1000 * 3600 * 24 * 30.44);
        let days = Math.floor(timeDiff / (1000 * 3600 * 24));


        let totalYears = (this.totalExperience().years + years) + Math.floor((this.totalExperience().months + months) / 12);
        let totalMonths = (this.totalExperience().months + months) % 12;
        totalMonths += Math.floor((this.totalExperience().days + days) / 30);
        let totalDays = (this.totalExperience().days + days) % 30;

        this.totalExperience.update(() => ({
          days: totalDays,
          months: totalMonths,
          years: totalYears
        }));


        this.experienceForm.reset();
      } else {
        this.openSnackBar("Last working date cannot be before the date of joining.");
      }
    }
  }

  reset = () => {
    this.experiences.update(() => ([]));
    
    this.totalExperience.update(() => ({
      days: 0,
      months: 0,
      years: 0
    }));
  }


  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

}
