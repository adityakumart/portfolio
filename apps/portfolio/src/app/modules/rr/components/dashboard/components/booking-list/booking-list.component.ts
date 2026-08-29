import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  TemplateRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { jsPDF } from 'jspdf';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rr-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class RRBookingListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  @ViewChild('newBookingDialog') newBookingDialog!: TemplateRef<any>;
  @ViewChild('modifyBookingDialog') modifyBookingDialog!: TemplateRef<any>;
  @ViewChild('endBookingDialog') endBookingDialog!: TemplateRef<any>;

  // MatTable Configuration
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'vehicleDetails',
    'renterName',
    'pickupDateTime',
    'returnDateTime',
    'finalRentalAmount',
    'amountPaid',
    'pendingAmount',
    'actions',
  ];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  constructor() {
    effect(() => {
      this.dataSource.data = this.activeBookings();
    });
  }

  // Collections data
  bookings = signal<any[]>([]);
  vehicles = signal<any[]>([]);

  // Selections
  selectedVehicle = signal<any | null>(null);
  selectedBookingToEnd = signal<any | null>(null);
  selectedBookingToModify = signal<any | null>(null);

  overrideOdometer = false;

  // Forms
  bookingFormGroup!: FormGroup;
  modifyBookingFormGroup!: FormGroup;

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

  activeBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'active'),
  );

  get isTravelDetailsConfigured(): boolean {
    if (!this.bookingFormGroup) return false;
    return !!(
      this.bookingFormGroup.get('vehicleRegNo')?.value &&
      this.bookingFormGroup.get('pickupDateTime')?.value &&
      this.bookingFormGroup.get('returnDateTime')?.value
    );
  }

  async ngOnInit() {
    this.initForms();
    this.loadBookings();
    await this.loadVehicles();

    // Listen for query params for contextual booking pre-select
    this.route.queryParams.subscribe((params) => {
      const regNo = params['vehicleRegNo'];
      if (regNo) {
        // Find if this vehicle is actually available
        const vehicleExists = this.vehicles().some((v) => v.regNo === regNo && v.status === 'available');
        if (vehicleExists) {
          this.openNewBookingModal(regNo);
        }
      }
    });
  }

  private initForms() {
    this.bookingFormGroup = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleName: [''],
      vehicleManufacturer: [''],
      vehicleModel: [''],
      vehicleOdometerStart: ['', [Validators.required, Validators.min(0)]],
      extraKmPrice: [''],
      extraHourPrice: [''],

      // Renter
      renterFirstName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterSecondName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterFatherName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      renterAadhar: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{12}$/)],
      ],
      renterDL: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)],
      ],
      renterPhone: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      renterAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      renterAddress: ['', Validators.required],

      // Guarantee
      guarFirstName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarSecondName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarFatherName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)],
      ],
      guarAadhar: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      guarDL: ['', [Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      guarPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      guarAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      guarAddress: ['', Validators.required],

      // Travel
      pickupDateTime: ['', Validators.required],
      durationDays: ['0', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: [''],
      totalKmLimit: ['0'],
      travelPurpose: [''],
      travelFrom: [''],
      travelTo: [''],

      // Deposit
      depositType: ['none', Validators.required],
      bikeRegNo: [''],
      bikeManufacturer: [''],
      bikeModel: [''],
      bikeOwner: [''],
      cashAmount: [''],
      otherItemName: [''],
      otherItemValue: [''],

      // Financials
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['none'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      paymentMode: ['Cash'],
      amountByUser: ['0'],
      status: ['active'],
    });

    this.bookingFormGroup.get('depositType')?.valueChanges.subscribe((type) => {
      this.updateDepositValidators(type);
    });

    this.modifyBookingFormGroup = this.fb.group({
      id: [''],
      pickupDateTime: ['', Validators.required],
      durationDays: ['0', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: [''],
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['none'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      totalKmLimit: ['0'],
    });
  }

  private updateDepositValidators(type: string) {
    const bikeControls = [
      'bikeRegNo',
      'bikeManufacturer',
      'bikeModel',
      'bikeOwner',
    ];
    const cashControls = ['cashAmount'];
    const otherControls = ['otherItemName', 'otherItemValue'];

    [...bikeControls, ...cashControls, ...otherControls].forEach((name) => {
      this.bookingFormGroup.get(name)?.clearValidators();
      this.bookingFormGroup
        .get(name)
        ?.updateValueAndValidity({ emitEvent: false });
    });

    if (type === 'bike') {
      bikeControls.forEach((name) => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required]);
        this.bookingFormGroup
          .get(name)
          ?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'cash') {
      cashControls.forEach((name) => {
        this.bookingFormGroup
          .get(name)
          ?.setValidators([Validators.required, Validators.min(0)]);
        this.bookingFormGroup
          .get(name)
          ?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'other') {
      otherControls.forEach((name) => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required]);
        this.bookingFormGroup
          .get(name)
          ?.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  // --- RETRIEVALS ---
  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  // --- DIALOG MODALS OPEN/CLOSE ---
  openNewBookingModal(vehicleRegNo?: string) {
    this.resetBookingForm();
    if (vehicleRegNo) {
      this.bookingFormGroup.patchValue({ vehicleRegNo: vehicleRegNo });
      this.onVehicleSelectChange();
    }
    this.dialog.open(this.newBookingDialog, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }

  closeNewBookingModal() {
    this.dialog.closeAll();
  }

  // --- NEW BOOKING FORM LOGIC ---
  onVehicleSelectChange() {
    const regNo = this.bookingFormGroup.get('vehicleRegNo')?.value;
    const selected = this.vehicles().find((v) => v.regNo === regNo);
    this.selectedVehicle.set(selected || null);
    this.overrideOdometer = false;

    if (selected) {
      this.bookingFormGroup.patchValue({
        vehicleName: selected.name,
        vehicleManufacturer: selected.manufacturer,
        vehicleModel: selected.model,
        vehicleOdometerStart: selected.odometer,
        extraKmPrice: selected.extraKmPrice,
        extraHourPrice: selected.extraHourPrice,
      });
    } else {
      this.bookingFormGroup.patchValue({
        vehicleName: '',
        vehicleManufacturer: '',
        vehicleModel: '',
        vehicleOdometerStart: '',
        extraKmPrice: '',
        extraHourPrice: '',
      });
    }

    this.calculateReturnDate();
  }

  calculateReturnDate() {
    const pickupVal = this.bookingFormGroup.get('pickupDateTime')?.value;
    const days =
      parseInt(this.bookingFormGroup.get('durationDays')?.value || '0', 10) ||
      0;
    const hours =
      parseInt(this.bookingFormGroup.get('durationHours')?.value || '0', 10) ||
      0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.bookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateFinalAmount();
      return;
    }

    const start = new Date(pickupVal);
    const end = new Date(start);

    if (days > 0) {
      end.setDate(end.getDate() + days);
    }
    if (hours > 0) {
      end.setHours(end.getHours() + hours);
    }

    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hour = String(end.getHours()).padStart(2, '0');
    const minute = String(end.getMinutes()).padStart(2, '0');

    this.bookingFormGroup.patchValue({
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`,
    });

    this.calculateTotalRent();
  }

  calculateTotalRent() {
    const selected = this.selectedVehicle();
    if (!selected) return;

    const start = new Date(this.bookingFormGroup.get('pickupDateTime')?.value);
    const end = new Date(this.bookingFormGroup.get('returnDateTime')?.value);

    if (end <= start) {
      this.bookingFormGroup.patchValue({
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateFinalAmount();
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    const rent = this.calculateSlabRent(totalHours, selected.pricing);
    const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

    this.bookingFormGroup.patchValue({
      totalRentalAmount: String(rent),
      totalKmLimit: String(kmLimit),
    });

    this.recalculateFinalAmount();
  }

  private calculateSlabRent(hours: number, pricing: any): number {
    let remaining = hours;
    let total = 0;

    const p23 = Number(pricing.h23?.price || 0);
    const p11 = Number(pricing.h11?.price || 0);
    const p3 = Number(pricing.h3?.price || 0);
    const p1 = Number(pricing.h1?.price || 0);

    if (remaining >= 24) {
      const count = Math.floor(remaining / 24);
      total += count * p23;
      remaining -= count * 24;
    }
    if (remaining >= 12) {
      const count = Math.floor(remaining / 12);
      total += count * p11;
      remaining -= count * 12;
    }
    if (remaining >= 4) {
      const count = Math.floor(remaining / 4);
      total += count * p3;
      remaining -= count * 4;
    }
    if (remaining > 0) {
      total += p3;
    }

    return total;
  }

  private calculateSlabKm(hours: number, pricing: any): number {
    let remaining = hours;
    let totalKm = 0;

    const km23 = Number(pricing.h23?.km || 0);
    const km11 = Number(pricing.h11?.km || 0);
    const km3 = Number(pricing.h3?.km || 0);
    const km1 = Number(pricing.h1?.km || 0);

    if (remaining >= 24) {
      const count = Math.floor(remaining / 24);
      totalKm += count * km23;
      remaining -= count * 24;
    }
    if (remaining >= 12) {
      const count = Math.floor(remaining / 12);
      totalKm += count * km11;
      remaining -= count * 12;
    }
    if (remaining >= 4) {
      const count = Math.floor(remaining / 4);
      totalKm += count * km3;
      remaining -= count * 4;
    }
    if (remaining > 0) {
      totalKm += km3;
    }

    return totalKm;
  }

  onOverrideOdometerChange(checked: boolean) {
    this.overrideOdometer = checked;
    if (!checked) {
      const selected = this.selectedVehicle();
      this.bookingFormGroup.patchValue({
        vehicleOdometerStart: selected ? selected.odometer : ''
      });
    }
  }

  recalculateFinalAmount() {
    const total =
      Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountType = this.bookingFormGroup.get('discountType')?.value || 'none';

    if (discountType === 'none') {
      this.bookingFormGroup.get('discount')?.setValue('0', { emitEvent: false });
    }

    const discountVal =
      Number(this.bookingFormGroup.get('discount')?.value) || 0;
    const paid = Number(this.bookingFormGroup.get('amountPaid')?.value) || 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else if (discountType === 'rupee' || discountType === 'rupees') {
        finalRent = total - discountVal;
      }
    }
    finalRent = Math.max(0, finalRent);

    this.bookingFormGroup.patchValue({
      finalRentalAmount: String(finalRent),
      pendingAmount: String(finalRent - paid),
    }, { emitEvent: false });

    // Dynamic validations for Discount field
    const discountCtrl = this.bookingFormGroup.get('discount');
    discountCtrl?.clearValidators();
    if (discountType === 'percentage') {
      discountCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (discountType === 'rupee' || discountType === 'rupees') {
      discountCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(total)]);
    } else {
      discountCtrl?.setValidators([Validators.min(0), Validators.max(0)]);
    }
    discountCtrl?.updateValueAndValidity({ emitEvent: false });

    // Dynamic validations for Advance amount
    const paidCtrl = this.bookingFormGroup.get('amountPaid');
    paidCtrl?.clearValidators();
    paidCtrl?.setValidators([Validators.required, Validators.min(0)]);
    paidCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  resetBookingForm() {
    this.selectedVehicle.set(null);
    this.overrideOdometer = false;
    if (this.bookingFormGroup) {
      this.bookingFormGroup.reset({
        durationDays: '0',
        durationHours: '0',
        depositType: 'none',
        totalRentalAmount: '0',
        discount: '0',
        discountType: 'none',
        finalRentalAmount: '0',
        amountPaid: '0',
        pendingAmount: '0',
        paymentMode: 'Cash',
        amountByUser: '0',
        status: 'active',
      });
    }
  }

  async createBooking(event: Event) {
    event.preventDefault();
    if (this.bookingFormGroup.invalid) return;

    try {
      await this.rrApi.createBooking(this.bookingFormGroup.value);
      alert('Booking created successfully.');
      this.closeNewBookingModal();
      this.loadBookings();
      this.loadVehicles();
    } catch (e: any) {
      console.error(e);
      alert(e.error?.message || 'Error creating booking.');
    }
  }

  // --- END BOOKING POPUP ---
  openEndBookingPopup(booking: any) {
    this.selectedBookingToEnd.set(booking);
    this.endBookingFields = {
      odometerEnd: '',
      extraKms: 0,
      extraKmFee: 0,
      extraHours: 0,
      extraHourFee: 0,
      cleanlinessFine: false,
      totalAdditionalFees: 0,
      finalTotalPayable: Number(booking.finalRentalAmount),
      balancePending: Number(booking.pendingAmount),
    };
    this.dialog.open(this.endBookingDialog, {
      width: '600px',
      maxWidth: '90vw',
    });
  }

  closeEndBookingPopup() {
    this.dialog.closeAll();
    this.selectedBookingToEnd.set(null);
  }

  calculateEndBookingFees() {
    const booking = this.selectedBookingToEnd();
    if (!booking) return;

    const startOdo = Number(booking.vehicleOdometerStart) || 0;
    const endOdo = Number(this.endBookingFields.odometerEnd) || 0;

    let extraKms = 0;
    let extraKmFee = 0;

    if (endOdo > startOdo) {
      const totalKms = endOdo - startOdo;
      const kmLimit = Number(booking.totalKmLimit) || 0;
      if (totalKms > kmLimit) {
        extraKms = totalKms - kmLimit;
        extraKmFee = extraKms * (Number(booking.extraKmPrice) || 0);
      }
    }

    const expectedReturn = new Date(booking.returnDateTime);
    const now = new Date();
    let extraHours = 0;
    let extraHourFee = 0;

    if (now > expectedReturn) {
      const diffMs = now.getTime() - expectedReturn.getTime();
      extraHours = Math.ceil(diffMs / (1000 * 60 * 60));
      extraHourFee = extraHours * (Number(booking.extraHourPrice) || 0);
    }

    const cleanlinessFine = this.endBookingFields.cleanlinessFine ? 500 : 0;
    const totalAdd = extraKmFee + extraHourFee + cleanlinessFine;
    const finalTotal = Number(booking.finalRentalAmount) + totalAdd;
    const balance = finalTotal - (Number(booking.amountPaid) || 0);

    this.endBookingFields.extraKms = extraKms;
    this.endBookingFields.extraKmFee = extraKmFee;
    this.endBookingFields.extraHours = extraHours;
    this.endBookingFields.extraHourFee = extraHourFee;
    this.endBookingFields.totalAdditionalFees = totalAdd;
    this.endBookingFields.finalTotalPayable = finalTotal;
    this.endBookingFields.balancePending = balance;
  }

  async submitEndBooking() {
    const booking = this.selectedBookingToEnd();
    if (!booking) return;

    if (!this.endBookingFields.odometerEnd) {
      alert('Please enter return odometer reading.');
      return;
    }

    const endOdo = Number(this.endBookingFields.odometerEnd);
    const startOdo = Number(booking.vehicleOdometerStart);
    if (endOdo < startOdo) {
      alert('Return odometer cannot be less than starting odometer.');
      return;
    }

    try {
      const patch = {
        status: 'completed',
        vehicleOdometerEnd: String(endOdo),
        finalRentalAmount: String(this.endBookingFields.finalTotalPayable),
        pendingAmount: '0',
        amountPaid: String(this.endBookingFields.finalTotalPayable),
      };

      await this.rrApi.updateBooking(booking.id, patch);

      const vehicle = this.vehicles().find(
        (v) => v.regNo === booking.vehicleRegNo,
      );
      if (vehicle) {
        await this.rrApi.updateVehicle(vehicle.regNo, {
          odometer: String(endOdo),
        });
      }

      alert('Booking finalized and closed.');
      this.closeEndBookingPopup();
      this.loadBookings();
      this.loadVehicles();
    } catch (e: any) {
      console.error(e);
      alert(e.error?.message || 'Error closing booking.');
    }
  }

  // --- MODIFY BOOKING POPUP ---
  openModifyBookingPopup(booking: any) {
    this.selectedBookingToModify.set(booking);
    this.modifyBookingFormGroup.reset({
      id: booking.id,
      pickupDateTime: booking.pickupDateTime,
      durationDays: booking.durationDays || '0',
      durationHours: booking.durationHours || '0',
      returnDateTime: booking.returnDateTime,
      totalRentalAmount: booking.totalRentalAmount,
      discount: booking.discount || '0',
      discountType: booking.discountType || 'none',
      finalRentalAmount: booking.finalRentalAmount,
      amountPaid: booking.amountPaid || '0',
      pendingAmount: booking.pendingAmount || '0',
      totalKmLimit: booking.totalKmLimit,
    });
    this.recalculateModifyFinalAmount();
    this.dialog.open(this.modifyBookingDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
  }

  closeModifyBookingPopup() {
    this.dialog.closeAll();
    this.selectedBookingToModify.set(null);
  }

  calculateModifyReturnDate() {
    const pickupVal = this.modifyBookingFormGroup.get('pickupDateTime')?.value;
    const days =
      parseInt(
        this.modifyBookingFormGroup.get('durationDays')?.value || '0',
        10,
      ) || 0;
    const hours =
      parseInt(
        this.modifyBookingFormGroup.get('durationHours')?.value || '0',
        10,
      ) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.modifyBookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0',
      });
      this.recalculateModifyFinalAmount();
      return;
    }

    const start = new Date(pickupVal);
    const end = new Date(start);

    if (days > 0) {
      end.setDate(end.getDate() + days);
    }
    if (hours > 0) {
      end.setHours(end.getHours() + hours);
    }

    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hour = String(end.getHours()).padStart(2, '0');
    const minute = String(end.getMinutes()).padStart(2, '0');

    this.modifyBookingFormGroup.patchValue({
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`,
    });

    const booking = this.selectedBookingToModify();
    const selected = this.vehicles().find(
      (v) => v.regNo === booking.vehicleRegNo,
    );
    if (selected) {
      const diffMs = end.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      const rent = this.calculateSlabRent(totalHours, selected.pricing);
      const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

      this.modifyBookingFormGroup.patchValue({
        totalRentalAmount: String(rent),
        totalKmLimit: String(kmLimit),
      });
    }

    this.recalculateModifyFinalAmount();
  }

  recalculateModifyFinalAmount() {
    const total =
      Number(this.modifyBookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountType = this.modifyBookingFormGroup.get('discountType')?.value || 'none';

    if (discountType === 'none') {
      this.modifyBookingFormGroup.get('discount')?.setValue('0', { emitEvent: false });
    }

    const discountVal =
      Number(this.modifyBookingFormGroup.get('discount')?.value) || 0;
    const paid =
      Number(this.modifyBookingFormGroup.get('amountPaid')?.value) || 0;

    let finalRent = total;
    if (discountVal > 0 && discountType !== 'none') {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else if (discountType === 'rupee' || discountType === 'rupees') {
        finalRent = total - discountVal;
      }
    }
    finalRent = Math.max(0, finalRent);

    this.modifyBookingFormGroup.patchValue({
      finalRentalAmount: String(finalRent),
      pendingAmount: String(finalRent - paid),
    }, { emitEvent: false });

    // Dynamic validations for Discount field in modification
    const discountCtrl = this.modifyBookingFormGroup.get('discount');
    discountCtrl?.clearValidators();
    if (discountType === 'percentage') {
      discountCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
    } else if (discountType === 'rupee' || discountType === 'rupees') {
      discountCtrl?.setValidators([Validators.required, Validators.min(0), Validators.max(total)]);
    } else {
      discountCtrl?.setValidators([Validators.min(0), Validators.max(0)]);
    }
    discountCtrl?.updateValueAndValidity({ emitEvent: false });

    // Dynamic validations for Advance amount in modification
    const paidCtrl = this.modifyBookingFormGroup.get('amountPaid');
    paidCtrl?.clearValidators();
    paidCtrl?.setValidators([Validators.required, Validators.min(0)]);
    paidCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  async submitModifyBooking() {
    if (this.modifyBookingFormGroup.invalid) return;

    try {
      const id = this.modifyBookingFormGroup.value.id;
      const originalBooking = this.selectedBookingToModify();
      const updated = {
        ...originalBooking,
        ...this.modifyBookingFormGroup.value,
      };

      await this.rrApi.updateBooking(id, updated);
      alert('Booking updated successfully.');
      this.closeModifyBookingPopup();
      this.loadBookings();
    } catch (e: any) {
      console.error(e);
      alert(e.error?.message || 'Error updating booking.');
    }
  }

  // --- PDF AGREEMENT PRINTERS ---
  printAgreementPDFFromForm() {
    const val = this.bookingFormGroup.value;
    const bObj = {
      id: 'RRB-DRAFT',
      vehicleRegNo: val.vehicleRegNo || '____',
      vehicleName: val.vehicleName || '____',
      pickupDateTime: val.pickupDateTime || '____',
      returnDateTime: val.returnDateTime || '____',
      totalRentalAmount: val.totalRentalAmount || '____',
      extraKmPrice: val.extraKmPrice || '____',
      extraHourPrice: val.extraHourPrice || '____',
      renterFirstName: val.renterFirstName || '____',
      renterSecondName: val.renterSecondName || '____',
      renterFatherName: val.renterFatherName || '____',
      renterAadhar: val.renterAadhar || '____',
      renterDL: val.renterDL || '____',
      renterPhone: val.renterPhone || '____',
      renterAltPhone: val.renterAltPhone || '____',
      renterAddress: val.renterAddress || '____',
      guarFirstName: val.guarFirstName || '____',
      guarSecondName: val.guarSecondName || '____',
      guarFatherName: val.guarFatherName || '____',
      guarAddress: val.guarAddress || '____',
      depositType: val.depositType,
      bikeManufacturer: val.bikeManufacturer,
      bikeModel: val.bikeModel,
      bikeRegNo: val.bikeRegNo,
      cashAmount: val.cashAmount,
      otherItemName: val.otherItemName,
      otherItemValue: val.otherItemValue,
      paymentMode: val.paymentMode,
      travelFrom: val.travelFrom || '____',
      travelTo: val.travelTo || '____',
      vehicleOdometerStart: val.vehicleOdometerStart || '____',
    };

    this.printAgreementPDFFromObject(bObj);
  }

  printAgreementPDFFromModifyForm() {
    const original = this.selectedBookingToModify();
    if (!original) return;
    const formVal = this.modifyBookingFormGroup.value;
    const merged = {
      ...original,
      ...formVal,
    };
    this.printAgreementPDFFromObject(merged);
  }

  printAgreementPDFFromObject(b: any) {
    if (!b) return;

    // Normalize all fields to avoid "undefined" strings in printed PDF
    const id = b.id || 'DRAFT';
    const renterFirstName = b.renterFirstName || '';
    const renterSecondName = b.renterSecondName || '';
    const renterFatherName = b.renterFatherName || '____';
    const renterAddress = b.renterAddress || '____';
    const renterPhone = b.renterPhone || '____';
    const renterAltPhone = b.renterAltPhone || '-';
    const renterAadhar = b.renterAadhar || '____';
    const renterDL = b.renterDL || '____';

    const vehicleRegNo = b.vehicleRegNo || '____';
    const vehicleName = b.vehicleName || '____';
    const vehicleOdometerStart = b.vehicleOdometerStart || '____';

    const rawPickupDateTime = b.pickupDateTime || '____';
    const rawReturnDateTime = b.returnDateTime || '____';
    const pickupDateTime = formatToIndianDate(rawPickupDateTime);
    const returnDateTime = formatToIndianDate(rawReturnDateTime);
    const travelFrom = b.travelFrom || '____';
    const travelTo = b.travelTo || '____';

    const extraHourPrice = b.extraHourPrice || '____';
    const extraKmPrice = b.extraKmPrice || '____';

    // Use finalRentalAmount if present, else totalRentalAmount
    const rentalAmountVal = b.finalRentalAmount !== undefined && b.finalRentalAmount !== null
      ? b.finalRentalAmount
      : (b.totalRentalAmount || '____');

    const paymentMode = b.paymentMode || '____';

    const guarFirstName = b.guarFirstName || '';
    const guarSecondName = b.guarSecondName || '';
    const guarFatherName = b.guarFatherName || '____';
    const guarAddress = b.guarAddress || '____';

    const depositType = b.depositType || 'none';

    const doc = new jsPDF({
      unit: 'mm',
      format: [216, 356],
    });

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    const title1 = "RAM & RAM'S CAR RENTALS";
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;

    doc.setFontSize(15);
    const title2 = 'RENTAL AGREEMENT';
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Renter Person Details:', 15, y);
    doc.text('Rented Vehicle Details:', 115, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');

    const leftX = 15;
    const rightX = 115;

    let depositValue = 'None';
    if (depositType === 'bike') {
      depositValue = `${b.bikeManufacturer || ''} - ${b.bikeModel || ''} (${b.bikeRegNo || ''})`;
    } else if (depositType === 'cash') {
      depositValue = `Rs. ${b.cashAmount || ''}`;
    } else if (depositType === 'other') {
      depositValue = `${b.otherItemName || ''} - Rs. ${b.otherItemValue || ''}`;
    }

    const renterPairs = [
      [
        'Name',
        (renterFirstName + ' ' + renterSecondName).trim() || '____',
        'Vehicle Reg No',
        vehicleRegNo,
      ],
      ['Father Name', renterFatherName, 'Vehicle Model', vehicleName],
      [
        'Alternate Phone',
        renterAltPhone,
        'Pickup Date & Time',
        pickupDateTime,
      ],
      [
        'Aadhar Number',
        renterAadhar,
        'Odometer Reading',
        vehicleOdometerStart,
      ],
      ['Driving License', renterDL, 'Return Date & Time', returnDateTime],
      [
        'Contact Number',
        renterPhone,
        'Rental Amount',
        `Rs. ${rentalAmountVal}`,
      ],
      ['Address', renterAddress, 'Security Deposit', depositValue],
      ['Payment Mode', paymentMode, '', ''],
    ];

    renterPairs.forEach(([label1, val1, label2, val2]) => {
      const leftText = label1 ? `${label1}: ${val1}` : '';
      const rightText = label2 ? `${label2}: ${val2}` : '';

      const leftWrapped = doc.splitTextToSize(leftText, 95);
      const rightWrapped = doc.splitTextToSize(rightText, 95);
      const lineCount = Math.max(leftWrapped.length, rightWrapped.length);

      for (let i = 0; i < lineCount; i++) {
        if (leftWrapped[i]) doc.text(leftWrapped[i], leftX, y);
        if (rightWrapped[i]) doc.text(rightWrapped[i], rightX, y);
        y += 5.5;
      }
    });

    y += 5;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Guarantee Person Details:', 15, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(
      `Name: ${(guarFirstName + ' ' + guarSecondName).trim() || '____'}`,
      leftX,
      y,
    );
    doc.text(`Father Name: ${guarFatherName}`, rightX, y);
    y += 5.5;
    doc.text(`Address: ${guarAddress}`, 15, y);
    y += 10;

    const pickupDate = rawPickupDateTime !== '____'
      ? formatToIndianDate(rawPickupDateTime.split('T')[0])
      : '____';
    const returnDate = rawReturnDateTime !== '____'
      ? formatToIndianDate(rawReturnDateTime.split('T')[0])
      : '____';
    const fullParagraph = `For my (Renter) need I hired your above-mentioned Vehicle for Self-Drive/Driver Assisted Car/Vehicle bearing registration number ${vehicleRegNo} from Dt. ${pickupDate} To Dt. ${returnDate} to travel from ${travelFrom} to ${travelTo}.`;

    doc.text(fullParagraph, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitParagraph = doc.splitTextToSize(fullParagraph, 185);
    y += splitParagraph.length * 5.5 + 4;

    const paraRest =
      'On my own assurance I will use the above-mentioned vehicle, I shall not use the vehicle for any illegal activities and also solely responsible for causing accidents or causing any damage to the vehicle. ' +
      'I will not give the vehicle to anyone other than myself without your permission. In case if any I am responsible for any actions taken by you, if I violate the Terms & Conditions mentioned in this Agreement. ' +
      "I can resolve them at my own expense. If any damage occurred to the vehicle, I'm responsible for that and I can resolve with my own expenses. Neither you (Owner of vehicle) nor your vehicle has any responsibility for the Illegal activities as stated above. " +
      'If any of my actions cause damage to you or your vehicle for that I am agreeing to compensate for the damage.';

    doc.text(paraRest, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitRest = doc.splitTextToSize(paraRest, 185);
    y += splitRest.length * 5.5 + 8;

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    const terms = [
      'No Insurance is claimed or paid, in case of any damage to vehicle I (Renter) bear the complete amount.',
      'I (Renter) is/am responsible for Half Clutch Failure.',
      'I (Renter) agree to any action on my Safety Deposit in case of any damages.',
      'I (Renter) agree that I am responsible for any Criminal / Legal Police Charges / Cases during rental period.',
      'I (Renter) agree to pay rent everyday if any damage to the vehicle untill the completion of the repair/damage.',
      'I (Renter) agree that Half-day booking must be done before 9AM and should be returned by 9PM same-day.',
      'Wrong Fuel: I take full responsibility for any engine failures due to wrong fuel type filled in the vehicle.',
    ];

    terms.forEach((t) => {
      doc.text('• ' + t, 18, y, { maxWidth: 185, lineHeightFactor: 1.35 });
      const splitT = doc.splitTextToSize('• ' + t, 185);
      y += splitT.length * 5.5;
    });

    y += 5;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Extra Fee Charged Slabs:', 15, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.text(`• Late Return Fee: Rs. ${extraHourPrice}/- per hour`, 18, y);
    y += 5.5;
    doc.text(`• Extra Kilometer Fee: Rs. ${extraKmPrice}/- per km`, 18, y);
    y += 5.5;
    doc.text(
      `• Cleanliness Fee: Rs. 500 to Rs. 1000 in case of dirty vehicle returns`,
      18,
      y,
    );
    y += 10;

    const yy = doc.internal.pageSize.getHeight() - 25;
    doc.text('Renter Signature: _______________________', 15, yy);
    doc.text('Authorized Representative: _______________________', 115, yy);

    doc.save(`Agreement_${id}.pdf`);
  }
}

function formatToIndianDate(dateStr: string): string {
  if (!dateStr || dateStr === '____' || dateStr === 'N/A') return dateStr;
  
  const separator = dateStr.includes('T') ? 'T' : dateStr.includes(' ') ? ' ' : null;
  if (separator) {
    const parts = dateStr.split(separator);
    const datePart = parts[0];
    const timePart = parts[1] || '';
    const dateParts = datePart.split('-');
    if (dateParts.length === 3 && dateParts[0].length === 4) {
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      return timePart ? `${formattedDate} ${timePart}` : formattedDate;
    }
    return dateStr;
  }

  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

