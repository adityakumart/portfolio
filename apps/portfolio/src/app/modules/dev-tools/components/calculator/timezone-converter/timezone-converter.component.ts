import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { DateTime } from 'luxon';
import {
  TimeZoneInterface,
  TimeZonesList,
} from '../../../../../../shared/data/timeszones';
import { ToastrService } from '../../../../../shared/services/toaster.service';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmSeparatorImports } from '@spartan-ng/hel/separator';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideClock } from '@ng-icons/lucide';

@Component({
  selector: 'app-timezone-converter',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmSeparatorImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucideClock }),
  ],
  templateUrl: './timezone-converter.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './timezone-converter.component.scss',
})
export class TimezoneConverterComponent implements OnInit {
  formattedDate = signal('');

  timeForm = new FormGroup({
    fromDate: new FormControl<string>(new Date().toISOString().split('T')[0]),
    fromTime: new FormControl<string>(new Date().toTimeString().substring(0, 5)),
    fromTimeZone: new FormControl<string>(''),
    toTimeZone: new FormControl<string>(''),
  });

  timeZones = TimeZonesList;

  private toastr = inject(ToastrService);

  ngOnInit() {
    for (let i = 0; i < TimeZonesList.length; i++) {
      if (
        TimeZonesList[i].utc.includes(
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        )
      ) {
        this.timeForm.controls.fromTimeZone.setValue(
          TimeZonesList[i].abbr + ' - ' + TimeZonesList[i].text,
        );
        break;
      }
    }
  }

  calculate = () => {
    this.formattedDate.set('');
    const fromZone = this.timeZones.find(
      (zone) =>
        zone.abbr + ' - ' + zone.text === this.timeForm.value.fromTimeZone,
    )?.utc[0];
    const toZone = this.timeZones.find(
      (zone) =>
        zone.abbr + ' - ' + zone.text === this.timeForm.value.toTimeZone,
    )?.utc[0];

    if (!this.timeForm.value.fromDate) {
      this.toastr.open('Please enter From Date.');
      return;
    }
    if (!this.timeForm.value.fromTime) {
      this.toastr.open('Please enter From Time.');
      return;
    }
    if (!fromZone) {
      this.toastr.open('Please select From Time Zone.');
      return;
    }
    if (!toZone) {
      this.toastr.open('Please select To Time Zone.');
      return;
    }

    const [hour, minute] = (this.timeForm.value.fromTime || '00:00')
      .split(':')
      .map(Number);
    const fromDate = DateTime.fromISO(this.timeForm.value.fromDate as string, {
      zone: fromZone,
    }).set({
      hour,
      minute,
    });

    if (!fromDate.isValid) {
      this.toastr.open('Please enter valid From Date.');
      return;
    }

    this.formattedDate.set(
      fromDate.setZone(toZone).toFormat('dd-MM-yyyy hh:mm a '),
    );
  };
}
