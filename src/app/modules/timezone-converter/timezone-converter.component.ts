import { Component, signal } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { DateTime } from 'luxon';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TimeZoneInterface, TimeZonesList } from 'src/shared/data/timeszones';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { ToastrService } from 'src/app/shared/services/toaster.service';


@Component({
    selector: 'app-timezone-converter',
    imports: [
        FormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        NgxMatTimepickerModule,
        MatIcon,
        MatButtonModule,
        MatAutocompleteModule,
        AsyncPipe
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './timezone-converter.component.html',
    styleUrl: './timezone-converter.component.scss'
})
export class TimezoneConverterComponent {


  filteredFromTimeZones: Observable<TimeZoneInterface[]>;
  filteredToTimeZones: Observable<TimeZoneInterface[]>;


  formattedDate = signal("");



  timeForm = new FormGroup({
    fromDate: new FormControl<Date>(new Date()),
    fromTime: new FormControl<string>(DateTime.now().toFormat('hh:mm a')),
    fromTimeZone: new FormControl<string>(""),
    // toDate: new FormControl<Date | null>(new Date()),
    // toTime: new FormControl<string>(DateTime.now().toFormat('hh:mm a')),
    toTimeZone: new FormControl<string>("")
  });

  timeZones = TimeZonesList;


  constructor(private toastr: ToastrService) {
    this.filteredFromTimeZones = this.timeForm.controls.fromTimeZone.valueChanges.pipe(
      startWith(''),
      map(zone => (zone ? this._filterFromTimes(zone) : this.timeZones.slice()))
    );
    this.filteredToTimeZones = this.timeForm.controls.toTimeZone.valueChanges.pipe(
      startWith(''),
      map(zone => (zone ? this._filterToTimes(zone) : this.timeZones.slice()))
    );
  }



  ngOnInit() {
    for (let i = 0; i < TimeZonesList.length; i++) {
      if (TimeZonesList[i].utc.includes(Intl.DateTimeFormat().resolvedOptions().timeZone)) {
        this.timeForm.controls.fromTimeZone.setValue(TimeZonesList[i].abbr + ' - ' + TimeZonesList[i].text);
        break;
      }
    }
  }

  calculate = () => {

    this.formattedDate.set('');
    let fromZone = this.timeZones.find((zone) => (zone.abbr + ' - ' + zone.text) === this.timeForm.value.fromTimeZone)?.utc[0];
    let toZone = this.timeZones.find((zone) => (zone.abbr + ' - ' + zone.text) === this.timeForm.value.toTimeZone)?.utc[0];

    if (!this.timeForm.value.fromDate) {
      this.toastr.open('Please enter From Date from dropdown.')
      return;
    }
    if (!this.timeForm.value.fromTime) {
      this.toastr.open('Please enter From Time from dropdown.')
      return;
    }
    if (!fromZone) {
      this.toastr.open('Please select From Time Zone from dropdown.')
      return;
    }
    if (!toZone) {
      this.toastr.open('Please select To Time Zone from dropdown.')
      return;
    }

    let time = DateTime.fromFormat(this.timeForm.value.fromTime as string, 'h:mm a');
    let fromDate = DateTime.fromJSDate(this.timeForm.value.fromDate as Date, {
      zone: fromZone
    }).set({
      hour: time.hour,
      minute: time.minute,
    });
    if (!fromDate.isValid) {
      this.toastr.open('Please enter valid From Date.')
      return;
    }

    if (!time.isValid) {
      this.toastr.open('Please enter valid From Time.')
      return;
    }

    this.formattedDate.set(fromDate.setZone(toZone).toFormat("dd-MM-yyyy hh:mm a "));
    // serverDateTime.setZone(dateTime.toFormat("z").toString()).toFormat(dateFormatToReturn)

  }

  private _filterFromTimes(value: string): TimeZoneInterface[] {
    const filterValue = value.toLowerCase();

    return this.timeZones.filter(zone => (zone.abbr + ' - ' + zone.text).toLowerCase().includes(filterValue));
  }

  private _filterToTimes(value: string): TimeZoneInterface[] {
    const filterValue = value.toLowerCase();

    return this.timeZones.filter(zone => (zone.abbr + ' - ' + zone.text).toLowerCase().includes(filterValue));
  }

}
