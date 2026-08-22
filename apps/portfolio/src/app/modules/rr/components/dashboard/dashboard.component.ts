import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RRApiService, IRRUser } from '../../services/rr-api.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-rr-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class RRDashboardComponent implements OnInit {
  rrApi = inject(RRApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Navigation / Panel State
  activeSection = signal<string>('dashboard');
  profileDropdownOpen = signal<boolean>(false);
  profilePopupOpen = signal<boolean>(false);
  endBookingPopupOpen = signal<boolean>(false);
  modifyBookingPopupOpen = signal<boolean>(false);
  vehicleDetailsPopupOpen = signal<boolean>(false);
  editingVehicleMode = signal<boolean>(false);
  editingEmployeeMode = signal<boolean>(false);

  // Collections data
  vehicles = signal<any[]>([]);
  bookings = signal<any[]>([]);
  employees = signal<any[]>([]);
  logs = signal<any[]>([]);

  // Selection references
  selectedVehicle = signal<any | null>(null);
  selectedBookingToEnd = signal<any | null>(null);
  selectedBookingToModify = signal<any | null>(null);
  selectedVehicleDetails = signal<any | null>(null);

  // Reactive Form Groups
  bookingFormGroup!: FormGroup;
  vehicleFormGroup!: FormGroup;
  employeeFormGroup!: FormGroup;
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
    balancePending: 0
  };

  // Filters
  logFilterFrom = '';
  logFilterTo = '';
  vehicleImageInputUrl = '';

  // Helpers
  activeBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'active')
  );

  historyBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'completed' || b.status === 'cancelled')
  );

  ngOnInit() {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/rr/login']);
      return;
    }

    this.initForms();
    this.loadVehicles();
    this.loadBookings();

    if (this.isAdmin()) {
      this.loadEmployees();
      this.loadActivityLogs();
    }
  }

  // --- INITIALIZE REACTIVE FORMS ---
  private initForms() {
    // 1. Booking Form Group
    this.bookingFormGroup = this.fb.group({
      vehicleRegNo: ['', Validators.required],
      vehicleName: [''],
      vehicleManufacturer: [''],
      vehicleModel: [''],
      vehicleOdometerStart: [''],
      extraKmPrice: [''],
      extraHourPrice: [''],

      // Renter
      renterFirstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterSecondName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterFatherName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      renterAadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      renterDL: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      renterPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      renterAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      renterAddress: ['', Validators.required],

      // Guarantee
      guarFirstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarSecondName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarFatherName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      guarAadhar: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      guarDL: ['', [Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      guarPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      guarAltPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      guarAddress: ['', Validators.required],

      // Travel details
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
      discountType: ['rupee'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      paymentMode: ['Cash'],
      amountByUser: ['0'],
      status: ['active']
    });

    // Subscriptions for booking form logic
    this.bookingFormGroup.get('depositType')?.valueChanges.subscribe(type => {
      this.updateDepositValidators(type);
    });

    // 2. Vehicle Form Group
    this.vehicleFormGroup = this.fb.group({
      regNo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9 -]+$/)]],
      name: ['', Validators.required],
      manufacturer: ['', Validators.required],
      model: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{2}$/)]],
      seating: ['5', Validators.required],
      odometer: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      color: ['', Validators.required],
      fuelType: ['Petrol', Validators.required],
      engineNo: ['', Validators.required],
      chassisNo: ['', Validators.required],
      insuranceExpiry: ['', Validators.required],
      pollutionExpiry: ['', Validators.required],
      status: ['available', Validators.required],
      pricing: this.fb.group({
        h23: this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h11: this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h3:  this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h1:  this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] })
      }),
      extraKmPrice: ['', [Validators.required, Validators.min(0)]],
      extraHourPrice: ['', [Validators.required, Validators.min(0)]]
    });

    // 3. Employee Form Group
    this.employeeFormGroup = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      dob: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      altPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      dl: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      role: ['employee', Validators.required],
      allowLogin: [true],
      address: ['', Validators.required]
    });

    // 4. Modify Booking Form Group
    this.modifyBookingFormGroup = this.fb.group({
      id: [''],
      pickupDateTime: ['', Validators.required],
      durationDays: ['0', Validators.required],
      durationHours: ['0', Validators.required],
      returnDateTime: [''],
      totalRentalAmount: ['0'],
      discount: ['0'],
      discountType: ['rupee'],
      finalRentalAmount: ['0'],
      amountPaid: ['0', [Validators.required, Validators.min(0)]],
      pendingAmount: ['0'],
      totalKmLimit: ['0']
    });
  }

  private updateDepositValidators(type: string) {
    const bikeControls = ['bikeRegNo', 'bikeManufacturer', 'bikeModel', 'bikeOwner'];
    const cashControls = ['cashAmount'];
    const otherControls = ['otherItemName', 'otherItemValue'];

    // Clear all validators
    [...bikeControls, ...cashControls, ...otherControls].forEach(name => {
      this.bookingFormGroup.get(name)?.clearValidators();
      this.bookingFormGroup.get(name)?.updateValueAndValidity({ emitEvent: false });
    });

    if (type === 'bike') {
      bikeControls.forEach(name => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required]);
        this.bookingFormGroup.get(name)?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'cash') {
      cashControls.forEach(name => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required, Validators.min(0)]);
        this.bookingFormGroup.get(name)?.updateValueAndValidity({ emitEvent: false });
      });
    } else if (type === 'other') {
      otherControls.forEach(name => {
        this.bookingFormGroup.get(name)?.setValidators([Validators.required]);
        this.bookingFormGroup.get(name)?.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  // --- NAVIGATION ---
  navigateToSection(section: string) {
    this.activeSection.set(section);
    this.profileDropdownOpen.set(false);

    if (section === 'dashboard' || section === 'vehicle-list') {
      this.loadVehicles();
    }
    if (section === 'end-booking' || section === 'history') {
      this.loadBookings();
    }
    if (section === 'employee-list') {
      this.loadEmployees();
    }
    if (section === 'activity-logs') {
      this.loadActivityLogs();
    }
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen.set(!this.profileDropdownOpen());
  }

  showProfilePopup() {
    this.profileDropdownOpen.set(false);
    this.profilePopupOpen.set(true);
  }

  closeProfilePopup() {
    this.profilePopupOpen.set(false);
  }

  logout() {
    this.rrApi.logout();
  }

  // --- RETRIEVALS ---
  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles:', e);
    }
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error('Error loading bookings:', e);
    }
  }

  async loadEmployees() {
    try {
      const data = await this.rrApi.getEmployees();
      this.employees.set(data);
    } catch (e) {
      console.error('Error loading employees:', e);
    }
  }

  async loadActivityLogs() {
    try {
      const data = await this.rrApi.getLogs(this.logFilterFrom, this.logFilterTo);
      this.logs.set(data);
    } catch (e) {
      console.error('Error loading activity logs:', e);
    }
  }

  clearLogFilters() {
    this.logFilterFrom = '';
    this.logFilterTo = '';
    this.loadActivityLogs();
  }

  getVehicleCount(status: string): number {
    return this.vehicles().filter((v) => v.status === status).length;
  }

  getVehicleImage(v: any): string {
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  // --- NEW BOOKING FORM ---
  onVehicleSelectChange() {
    const regNo = this.bookingFormGroup.get('vehicleRegNo')?.value;
    const selected = this.vehicles().find((v) => v.regNo === regNo);
    this.selectedVehicle.set(selected || null);

    if (selected) {
      this.bookingFormGroup.patchValue({
        vehicleName: selected.name,
        vehicleManufacturer: selected.manufacturer,
        vehicleModel: selected.model,
        vehicleOdometerStart: selected.odometer,
        extraKmPrice: selected.extraKmPrice,
        extraHourPrice: selected.extraHourPrice
      });
    } else {
      this.bookingFormGroup.patchValue({
        vehicleName: '',
        vehicleManufacturer: '',
        vehicleModel: '',
        vehicleOdometerStart: '',
        extraKmPrice: '',
        extraHourPrice: ''
      });
    }

    this.calculateReturnDate();
  }

  calculateReturnDate() {
    const pickupVal = this.bookingFormGroup.get('pickupDateTime')?.value;
    const days = parseInt(this.bookingFormGroup.get('durationDays')?.value || '0', 10) || 0;
    const hours = parseInt(this.bookingFormGroup.get('durationHours')?.value || '0', 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.bookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0'
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
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`
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
        totalKmLimit: '0'
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
      totalKmLimit: String(kmLimit)
    });

    this.recalculateFinalAmount();
  }

  private calculateSlabRent(hours: number, pricing: any): number {
    let remaining = hours;
    let total = 0;

    const p23 = Number(pricing.h23?.price || 0);
    const p11 = Number(pricing.h11?.price || 0);
    const p3  = Number(pricing.h3?.price || 0);
    const p1  = Number(pricing.h1?.price || 0);

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
    const km3  = Number(pricing.h3?.km || 0);
    const km1  = Number(pricing.h1?.km || 0);

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

  recalculateFinalAmount() {
    const total = Number(this.bookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountVal = Number(this.bookingFormGroup.get('discount')?.value) || 0;
    const paid = Number(this.bookingFormGroup.get('amountPaid')?.value) || 0;
    const discountType = this.bookingFormGroup.get('discountType')?.value;

    let finalRent = total;
    if (discountVal > 0) {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else {
        finalRent = total - discountVal;
      }
    }

    this.bookingFormGroup.patchValue({
      finalRentalAmount: String(Math.max(0, finalRent)),
      pendingAmount: String(Math.max(0, finalRent - paid))
    });
  }

  resetBookingForm() {
    this.selectedVehicle.set(null);
    this.bookingFormGroup.reset({
      durationDays: '0',
      durationHours: '0',
      depositType: 'none',
      totalRentalAmount: '0',
      discount: '0',
      discountType: 'rupee',
      finalRentalAmount: '0',
      amountPaid: '0',
      pendingAmount: '0',
      paymentMode: 'Cash',
      amountByUser: '0',
      status: 'active'
    });
  }

  async createBooking(event: Event) {
    event.preventDefault();
    if (this.bookingFormGroup.invalid) {
      alert('Form is invalid. Please fill all fields correctly.');
      return;
    }

    try {
      await this.rrApi.createBooking(this.bookingFormGroup.value);
      alert('Booking created successfully.');
      this.resetBookingForm();
      this.navigateToSection('end-booking');
    } catch (e: any) {
      console.error('Error creating booking:', e);
      alert(e.error?.message || 'Error creating booking.');
    }
  }

  // --- MODIFY / END BOOKING ACTIONS ---
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
      balancePending: Number(booking.pendingAmount)
    };
    this.endBookingPopupOpen.set(true);
  }

  closeEndBookingPopup() {
    this.endBookingPopupOpen.set(false);
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

      const vehicle = this.vehicles().find(v => v.regNo === booking.vehicleRegNo);
      if (vehicle) {
        await this.rrApi.updateVehicle(vehicle.regNo, { odometer: String(endOdo) });
      }

      alert('Booking finalized and closed.');
      this.closeEndBookingPopup();
      this.navigateToSection('dashboard');
    } catch (e: any) {
      console.error(e);
      alert(e.error?.message || 'Error closing booking.');
    }
  }

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
      discountType: booking.discountType || 'rupee',
      finalRentalAmount: booking.finalRentalAmount,
      amountPaid: booking.amountPaid || '0',
      pendingAmount: booking.pendingAmount || '0',
      totalKmLimit: booking.totalKmLimit
    });
    this.modifyBookingPopupOpen.set(true);
  }

  closeModifyBookingPopup() {
    this.modifyBookingPopupOpen.set(false);
    this.selectedBookingToModify.set(null);
  }

  calculateModifyReturnDate() {
    const pickupVal = this.modifyBookingFormGroup.get('pickupDateTime')?.value;
    const days = parseInt(this.modifyBookingFormGroup.get('durationDays')?.value || '0', 10) || 0;
    const hours = parseInt(this.modifyBookingFormGroup.get('durationHours')?.value || '0', 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.modifyBookingFormGroup.patchValue({
        returnDateTime: '',
        totalRentalAmount: '0',
        totalKmLimit: '0'
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
      returnDateTime: `${year}-${month}-${day}T${hour}:${minute}`
    });

    const booking = this.selectedBookingToModify();
    const selected = this.vehicles().find((v) => v.regNo === booking.vehicleRegNo);
    if (selected) {
      const diffMs = end.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      const rent = this.calculateSlabRent(totalHours, selected.pricing);
      const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

      this.modifyBookingFormGroup.patchValue({
        totalRentalAmount: String(rent),
        totalKmLimit: String(kmLimit)
      });
    }

    this.recalculateModifyFinalAmount();
  }

  recalculateModifyFinalAmount() {
    const total = Number(this.modifyBookingFormGroup.get('totalRentalAmount')?.value) || 0;
    const discountVal = Number(this.modifyBookingFormGroup.get('discount')?.value) || 0;
    const paid = Number(this.modifyBookingFormGroup.get('amountPaid')?.value) || 0;
    const discountType = this.modifyBookingFormGroup.get('discountType')?.value;

    let finalRent = total;
    if (discountVal > 0) {
      if (discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else {
        finalRent = total - discountVal;
      }
    }

    this.modifyBookingFormGroup.patchValue({
      finalRentalAmount: String(Math.max(0, finalRent)),
      pendingAmount: String(Math.max(0, finalRent - paid))
    });
  }

  async submitModifyBooking() {
    if (this.modifyBookingFormGroup.invalid) return;

    try {
      const id = this.modifyBookingFormGroup.value.id;
      const originalBooking = this.selectedBookingToModify();
      const updated = {
        ...originalBooking,
        ...this.modifyBookingFormGroup.value
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

  // --- VEHICLE CRUD ---
  viewVehicleDetails(v: any) {
    this.selectedVehicleDetails.set(v);
    this.vehicleDetailsPopupOpen.set(true);
  }

  closeVehicleDetailsPopup() {
    this.vehicleDetailsPopupOpen.set(false);
    this.selectedVehicleDetails.set(null);
  }

  resetVehicleForm() {
    this.editingVehicleMode.set(false);
    this.vehicleImageInputUrl = '';
    this.vehicleFormGroup.reset({
      seating: '5',
      fuelType: 'Petrol',
      status: 'available'
    });
    this.navigateToSection('vehicle-list');
  }

  editVehicle(v: any) {
    this.closeVehicleDetailsPopup();
    this.editingVehicleMode.set(true);

    this.vehicleFormGroup.reset({
      regNo: v.regNo,
      name: v.name,
      manufacturer: v.manufacturer,
      model: v.model,
      seating: v.seating || '5',
      odometer: v.odometer,
      type: v.type,
      color: v.color,
      fuelType: v.fuelType || 'Petrol',
      engineNo: v.engineNo,
      chassisNo: v.chassisNo,
      insuranceExpiry: v.insuranceExpiry,
      pollutionExpiry: v.pollutionExpiry,
      status: v.status || 'available',
      extraKmPrice: v.extraKmPrice,
      extraHourPrice: v.extraHourPrice
    });

    const pricingGroup = this.vehicleFormGroup.get('pricing') as FormGroup;
    pricingGroup.patchValue({
      h23: { price: v.pricing?.h23?.price || '', km: v.pricing?.h23?.km || '' },
      h11: { price: v.pricing?.h11?.price || '', km: v.pricing?.h11?.km || '' },
      h3:  { price: v.pricing?.h3?.price || '',  km: v.pricing?.h3?.km || '' },
      h1:  { price: v.pricing?.h1?.price || '',  km: v.pricing?.h1?.km || '' }
    });

    this.vehicleImageInputUrl = v.images && v.images.length > 0 ? v.images[0] : '';
    this.navigateToSection('vehicle-manage');
  }

  async saveVehicle(e: Event) {
    e.preventDefault();
    if (this.vehicleFormGroup.invalid) {
      alert('Please fill out all vehicle parameters correctly.');
      return;
    }

    const payload = {
      ...this.vehicleFormGroup.value,
      images: this.vehicleImageInputUrl.trim() 
        ? [this.vehicleImageInputUrl.trim()] 
        : [`assets/rr/${this.vehicleFormGroup.value.name.toLowerCase()}.png`]
    };

    try {
      if (this.editingVehicleMode()) {
        await this.rrApi.updateVehicle(payload.regNo, payload);
        alert('Vehicle updated successfully.');
      } else {
        await this.rrApi.createVehicle(payload);
        alert('Vehicle added successfully.');
      }
      this.resetVehicleForm();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error saving vehicle.');
    }
  }

  async deleteVehicle(regNo: string) {
    if (!confirm(`Are you sure you want to delete vehicle ${regNo}?`)) return;

    try {
      await this.rrApi.deleteVehicle(regNo);
      alert('Vehicle deleted successfully.');
      this.closeVehicleDetailsPopup();
      this.loadVehicles();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error deleting vehicle.');
    }
  }

  // --- EMPLOYEE CRUD ---
  resetEmployeeForm() {
    this.editingEmployeeMode.set(false);
    this.employeeFormGroup.reset({
      role: 'employee',
      allowLogin: true
    });
    this.navigateToSection('employee-list');
  }

  editEmployee(emp: any) {
    this.editingEmployeeMode.set(true);
    this.employeeFormGroup.reset({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      dob: emp.dob,
      phone: emp.phone,
      altPhone: emp.altPhone || '',
      email: emp.email,
      aadhar: emp.aadhar,
      dl: emp.dl,
      role: emp.role || 'employee',
      allowLogin: emp.allowLogin !== undefined ? emp.allowLogin : true,
      address: emp.address
    });
    this.navigateToSection('employee-manage');
  }

  async saveEmployee(e: Event) {
    e.preventDefault();
    if (this.employeeFormGroup.invalid) {
      alert('Form contains validation errors. Please review.');
      return;
    }

    try {
      if (this.editingEmployeeMode()) {
        const id = this.employeeFormGroup.value.id;
        await this.rrApi.updateEmployee(id, this.employeeFormGroup.value);
        alert('Employee updated successfully.');
      } else {
        await this.rrApi.createEmployee(this.employeeFormGroup.value);
        alert('Employee registered successfully.');
      }
      this.resetEmployeeForm();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error saving employee.');
    }
  }

  // --- PDF GENERATOR ---
  printAgreementPDFFromForm() {
    const val = this.bookingFormGroup.value;
    const selected = this.selectedVehicle();

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
      vehicleOdometerStart: val.vehicleOdometerStart || '____'
    };

    this.printAgreementPDFFromObject(bObj);
  }

  printAgreementPDFFromObject(b: any) {
    if (!b) return;

    const doc = new jsPDF({
      unit: 'mm',
      format: [216, 356]
    });

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    const title1 = "RAM & RAM'S CAR RENTALS";
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;

    doc.setFontSize(15);
    const title2 = "RENTAL AGREEMENT";
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 10;

    // Headers
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text("Renter Person Details:", 15, y);
    doc.text("Rented Vehicle Details:", 115, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');

    const leftX = 15;
    const rightX = 115;

    let depositValue = "None";
    if (b.depositType === 'bike') {
      depositValue = `${b.bikeManufacturer || ''} - ${b.bikeModel || ''} (${b.bikeRegNo || ''})`;
    } else if (b.depositType === 'cash') {
      depositValue = `Rs. ${b.cashAmount || ''}`;
    } else if (b.depositType === 'other') {
      depositValue = `${b.otherItemName || ''} - Rs. ${b.otherItemValue || ''}`;
    }

    const renterPairs = [
      ["Name", (b.renterFirstName || '') + " " + (b.renterSecondName || ''), "Vehicle Reg No", b.vehicleRegNo],
      ["Father Name", b.renterFatherName, "Vehicle Model", b.vehicleName],
      ["Alternate Phone", b.renterAltPhone || '-', "Pickup Date & Time", b.pickupDateTime],
      ["Aadhar Number", b.renterAadhar, "Odometer Reading", b.vehicleOdometerStart],
      ["Driving License", b.renterDL, "Return Date & Time", b.returnDateTime],
      ["Contact Number", b.renterPhone, "Rental Amount", `Rs. ${b.totalRentalAmount}`],
      ["Address", b.renterAddress, "Security Deposit", depositValue],
      ["Payment Mode", b.paymentMode, "", ""]
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

    // Guarantee Details
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text("Guarantee Person Details:", 15, y);
    y += 7;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Name: ${(b.guarFirstName || '')} ${(b.guarSecondName || '')}`, leftX, y);
    doc.text(`Father Name: ${b.guarFatherName || ''}`, rightX, y);
    y += 5.5;
    doc.text(`Address: ${b.guarAddress || ''}`, 15, y);
    y += 10;

    // Declaration paragraphs
    const pickupDate = b.pickupDateTime ? b.pickupDateTime.split('T')[0] : '____';
    const returnDate = b.returnDateTime ? b.returnDateTime.split('T')[0] : '____';
    const fullParagraph = `For my (Renter) need I hired your above-mentioned Vehicle for Self-Drive/Driver Assisted Car/Vehicle bearing registration number ${b.vehicleRegNo} from Dt. ${pickupDate} To Dt. ${returnDate} to travel from ${b.travelFrom} to ${b.travelTo}.`;

    doc.text(fullParagraph, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitParagraph = doc.splitTextToSize(fullParagraph, 185);
    y += splitParagraph.length * 5.5 + 4;

    const paraRest = "On my own assurance I will use the above-mentioned vehicle, I shall not use the vehicle for any illegal activities and also solely responsible for causing accidents or causing any damage to the vehicle. " +
      "I will not give the vehicle to anyone other than myself without your permission. In case if any I am responsible for any actions taken by you, if I violate the Terms & Conditions mentioned in this Agreement. " +
      "I can resolve them at my own expense. If any damage occurred to the vehicle, I'm responsible for that and I can resolve with my own expenses. Neither you (Owner of vehicle) nor your vehicle has any responsibility for the Illegal activities as stated above. " +
      "If any of my actions cause damage to you or your vehicle for that I am agreeing to compensate for the damage.";
    
    doc.text(paraRest, 15, y, { maxWidth: 185, lineHeightFactor: 1.35 });
    const splitRest = doc.splitTextToSize(paraRest, 185);
    y += splitRest.length * 5.5 + 8;

    // Terms
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text("Terms & Conditions:", 15, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    const terms = [
      "No Insurance is claimed or paid, in case of any damage to vehicle I (Renter) bear the complete amount.",
      "I (Renter) is/am responsible for Half Clutch Failure.",
      "I (Renter) agree to any action on my Safety Deposit in case of any damages.",
      "I (Renter) agree that I am responsible for any Criminal / Legal Police Charges / Cases during rental period.",
      "I (Renter) agree to pay rent everyday if any damage to the vehicle untill the completion of the repair/damage.",
      "I (Renter) agree that Half-day booking must be done before 9AM and should be returned by 9PM same-day.",
      "Wrong Fuel: I take full responsibility for any engine failures due to wrong fuel type filled in the vehicle."
    ];

    terms.forEach(t => {
      doc.text("• " + t, 18, y, { maxWidth: 185, lineHeightFactor: 1.35 });
      const splitT = doc.splitTextToSize("• " + t, 185);
      y += splitT.length * 5.5;
    });

    y += 5;

    // Surcharges
    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text("Extra Fee Charged Slabs:", 15, y);
    y += 6;

    doc.setFont('Helvetica', 'normal');
    doc.text(`• Late Return Fee: Rs. ${b.extraHourPrice}/- per hour`, 18, y);
    y += 5.5;
    doc.text(`• Extra Kilometer Fee: Rs. ${b.extraKmPrice}/- per km`, 18, y);
    y += 5.5;
    doc.text(`• Cleanliness Fee: Rs. 500 to Rs. 1000 in case of dirty vehicle returns`, 18, y);
    y += 10;

    // Signatures
    const yy = doc.internal.pageSize.getHeight() - 25;
    doc.text("Renter Signature: _______________________", 15, yy);
    doc.text("Authorized Representative: _______________________", 115, yy);

    doc.save(`Agreement_${b.id}.pdf`);
  }
}
