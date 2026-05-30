import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    templateUrl: './experience.component.html',
    styleUrl: './experience.component.scss',
    providers: [provideNativeDateAdapter()],
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatDatepickerModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExperienceComponent {
  private snackBar = inject(MatSnackBar);

  experiences = signal<DurationAndDates[]>([]);
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  totalExperience = signal<Duration>({
    days: 0,
    months: 0,
    years: 0
  });

  displayedColumns: string[] = ["index", "start", "end", "experience"];
  readonly maxDate = new Date();


  calculateExperience = () => {
    const start = this.startDate();
    const end = this.endDate();
    if (start && end) {
      if (start < end) {
        const diff = DateTime.fromJSDate(end).diff(DateTime.fromJSDate(start), ["years", "months", "days"]);

        let tempArray: DurationAndDates[] = [...this.experiences(), {
          ...diff.toObject() as Duration,
          start: this.startDate() as Date,
          end: this.endDate() as Date
        }];
        tempArray = tempArray.sort((a, b) => a.start.valueOf() - b.start.valueOf());
        this.experiences.update(() => ([
          ...tempArray
        ]));


        let timeDiff = Math.abs(end.getTime() - start.getTime());
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


        this.startDate.update(() => null);
        this.endDate.update(() => null);

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
    this.snackBar.open(message, '', {
      horizontalPosition: "end",
      verticalPosition: "top",
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

}
