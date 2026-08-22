import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RRApiService, IRRUser } from '../../services/rr-api.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-rr-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class RRDashboardComponent implements OnInit {
  rrApi = inject(RRApiService);
  private router = inject(Router);

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
  selectedVehicleRegNo = '';
  selectedVehicle = signal<any | null>(null);
  selectedBookingToEnd = signal<any | null>(null);
  selectedBookingToModify = signal<any | null>(null);
  selectedVehicleDetails = signal<any | null>(null);

  // Forms state objects
  bookingForm = {
    vehicleRegNo: '',
    vehicleName: '',
    vehicleManufacturer: '',
    vehicleModel: '',
    vehicleOdometerStart: '',
    extraKmPrice: '',
    extraHourPrice: '',
    renterFirstName: '',
    renterSecondName: '',
    renterFatherName: '',
    renterAadhar: '',
    renterDL: '',
    renterPhone: '',
    renterAltPhone: '',
    renterAddress: '',
    guarFirstName: '',
    guarSecondName: '',
    guarFatherName: '',
    guarAadhar: '',
    guarDL: '',
    guarPhone: '',
    guarAltPhone: '',
    guarAddress: '',
    travelFrom: '',
    travelTo: '',
    travelPurpose: '',
    pickupDateTime: '',
    returnDateTime: '',
    durationDays: '0',
    durationHours: '0',
    totalKmLimit: '0',
    depositType: 'none',
    bikeRegNo: '',
    bikeManufacturer: '',
    bikeModel: '',
    bikeOwner: '',
    cashAmount: '',
    otherItemName: '',
    otherItemValue: '',
    totalRentalAmount: '0',
    discount: '0',
    discountType: 'rupee',
    finalRentalAmount: '0',
    amountPaid: '0',
    pendingAmount: '0',
    paymentMode: 'Cash',
    amountByUser: '0',
    status: 'active'
  };

  vehicleForm = {
    regNo: '',
    name: '',
    manufacturer: '',
    model: '',
    seating: '5',
    odometer: '',
    type: '',
    color: '',
    fuelType: 'Petrol',
    engineNo: '',
    chassisNo: '',
    insuranceExpiry: '',
    pollutionExpiry: '',
    pricing: {
      h23: { price: '', km: '' },
      h11: { price: '', km: '' },
      h3:  { price: '', km: '' },
      h1:  { price: '', km: '' }
    },
    extraKmPrice: '',
    extraHourPrice: '',
    allowBooking: true,
    status: 'available',
    images: [] as string[]
  };

  employeeForm = {
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    altPhone: '',
    email: '',
    aadhar: '',
    dl: '',
    role: 'employee',
    allowLogin: true,
    address: ''
  };

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
    // Check if user is logged in
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/rr/login']);
      return;
    }

    this.loadVehicles();
    this.loadBookings();

    if (this.isAdmin()) {
      this.loadEmployees();
      this.loadActivityLogs();
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
    const selected = this.vehicles().find((v) => v.regNo === this.selectedVehicleRegNo);
    this.selectedVehicle.set(selected || null);

    if (selected) {
      this.bookingForm.vehicleRegNo = selected.regNo;
      this.bookingForm.vehicleName = selected.name;
      this.bookingForm.vehicleManufacturer = selected.manufacturer;
      this.bookingForm.vehicleModel = selected.model;
      this.bookingForm.vehicleOdometerStart = selected.odometer;
      this.bookingForm.extraKmPrice = selected.extraKmPrice;
      this.bookingForm.extraHourPrice = selected.extraHourPrice;
    } else {
      this.bookingForm.vehicleRegNo = '';
      this.bookingForm.vehicleName = '';
      this.bookingForm.vehicleManufacturer = '';
      this.bookingForm.vehicleModel = '';
      this.bookingForm.vehicleOdometerStart = '';
      this.bookingForm.extraKmPrice = '';
      this.bookingForm.extraHourPrice = '';
    }

    this.calculateReturnDate();
  }

  calculateReturnDate() {
    const pickupVal = this.bookingForm.pickupDateTime;
    const days = parseInt(this.bookingForm.durationDays, 10) || 0;
    const hours = parseInt(this.bookingForm.durationHours, 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      this.bookingForm.returnDateTime = '';
      this.bookingForm.totalRentalAmount = '0';
      this.bookingForm.totalKmLimit = '0';
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

    // Format YYYY-MM-DDTHH:MM
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hour = String(end.getHours()).padStart(2, '0');
    const minute = String(end.getMinutes()).padStart(2, '0');

    this.bookingForm.returnDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

    this.calculateTotalRent();
  }

  calculateTotalRent() {
    const selected = this.selectedVehicle();
    if (!selected) return;

    const start = new Date(this.bookingForm.pickupDateTime);
    const end = new Date(this.bookingForm.returnDateTime);

    if (end <= start) {
      this.bookingForm.totalRentalAmount = '0';
      this.bookingForm.totalKmLimit = '0';
      this.recalculateFinalAmount();
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    // Business Pricing Slab Calculations
    const rent = this.calculateSlabRent(totalHours, selected.pricing);
    const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

    this.bookingForm.totalRentalAmount = String(rent);
    this.bookingForm.totalKmLimit = String(kmLimit);

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
      total += p3; // Adds 4 hour rent slab for any remaining fraction
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
    const total = Number(this.bookingForm.totalRentalAmount) || 0;
    const discountVal = Number(this.bookingForm.discount) || 0;
    const paid = Number(this.bookingForm.amountPaid) || 0;

    let finalRent = total;
    if (discountVal > 0) {
      if (this.bookingForm.discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else {
        finalRent = total - discountVal;
      }
    }

    this.bookingForm.finalRentalAmount = String(Math.max(0, finalRent));
    this.bookingForm.pendingAmount = String(Math.max(0, finalRent - paid));
  }

  resetBookingForm() {
    this.selectedVehicleRegNo = '';
    this.selectedVehicle.set(null);
    this.bookingForm = {
      vehicleRegNo: '',
      vehicleName: '',
      vehicleManufacturer: '',
      vehicleModel: '',
      vehicleOdometerStart: '',
      extraKmPrice: '',
      extraHourPrice: '',
      renterFirstName: '',
      renterSecondName: '',
      renterFatherName: '',
      renterAadhar: '',
      renterDL: '',
      renterPhone: '',
      renterAltPhone: '',
      renterAddress: '',
      guarFirstName: '',
      guarSecondName: '',
      guarFatherName: '',
      guarAadhar: '',
      guarDL: '',
      guarPhone: '',
      guarAltPhone: '',
      guarAddress: '',
      travelFrom: '',
      travelTo: '',
      travelPurpose: '',
      pickupDateTime: '',
      returnDateTime: '',
      durationDays: '0',
      durationHours: '0',
      totalKmLimit: '0',
      depositType: 'none',
      bikeRegNo: '',
      bikeManufacturer: '',
      bikeModel: '',
      bikeOwner: '',
      cashAmount: '',
      otherItemName: '',
      otherItemValue: '',
      totalRentalAmount: '0',
      discount: '0',
      discountType: 'rupee',
      finalRentalAmount: '0',
      amountPaid: '0',
      pendingAmount: '0',
      paymentMode: 'Cash',
      amountByUser: '0',
      status: 'active'
    };
  }

  async createBooking(event: Event) {
    event.preventDefault();
    if (!this.selectedVehicle()) {
      alert('Please select a vehicle.');
      return;
    }

    try {
      await this.rrApi.createBooking(this.bookingForm);
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

    // Hour calculations (Check returns)
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
        amountPaid: String(this.endBookingFields.finalTotalPayable), // Balance fully paid
      };

      await this.rrApi.updateBooking(booking.id, patch);

      // Update vehicle odometer on vehicle details
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
    this.selectedBookingToModify.set({ ...booking });
    this.modifyBookingPopupOpen.set(true);
  }

  closeModifyBookingPopup() {
    this.modifyBookingPopupOpen.set(false);
    this.selectedBookingToModify.set(null);
  }

  calculateModifyReturnDate() {
    const booking = this.selectedBookingToModify();
    if (!booking) return;

    const pickupVal = booking.pickupDateTime;
    const days = parseInt(booking.durationDays, 10) || 0;
    const hours = parseInt(booking.durationHours, 10) || 0;

    if (!pickupVal || (days === 0 && hours === 0)) {
      booking.returnDateTime = '';
      booking.totalRentalAmount = '0';
      booking.totalKmLimit = '0';
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

    booking.returnDateTime = `${year}-${month}-${day}T${hour}:${minute}`;

    // Recalculate rent
    const selected = this.vehicles().find((v) => v.regNo === booking.vehicleRegNo);
    if (selected) {
      const diffMs = end.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);

      const rent = this.calculateSlabRent(totalHours, selected.pricing);
      const kmLimit = this.calculateSlabKm(totalHours, selected.pricing);

      booking.totalRentalAmount = String(rent);
      booking.totalKmLimit = String(kmLimit);
    }

    this.recalculateModifyFinalAmount();
  }

  recalculateModifyFinalAmount() {
    const booking = this.selectedBookingToModify();
    if (!booking) return;

    const total = Number(booking.totalRentalAmount) || 0;
    const discountVal = Number(booking.discount) || 0;
    const paid = Number(booking.amountPaid) || 0;

    let finalRent = total;
    if (discountVal > 0) {
      if (booking.discountType === 'percentage') {
        finalRent = total - (total * discountVal) / 100;
      } else {
        finalRent = total - discountVal;
      }
    }

    booking.finalRentalAmount = String(Math.max(0, finalRent));
    booking.pendingAmount = String(Math.max(0, finalRent - paid));
  }

  async submitModifyBooking() {
    const booking = this.selectedBookingToModify();
    if (!booking) return;

    try {
      await this.rrApi.updateBooking(booking.id, booking);
      alert('Booking updated successfully.');
      this.closeModifyBookingPopup();
      this.loadBookings();
    } catch (e: any) {
      console.error(e);
      alert(e.error?.message || 'Error updating booking.');
    }
  }

  // --- VEHICLE POPOVER & CRUD ---
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
    this.vehicleForm = {
      regNo: '',
      name: '',
      manufacturer: '',
      model: '',
      seating: '5',
      odometer: '',
      type: '',
      color: '',
      fuelType: 'Petrol',
      engineNo: '',
      chassisNo: '',
      insuranceExpiry: '',
      pollutionExpiry: '',
      pricing: {
        h23: { price: '', km: '' },
        h11: { price: '', km: '' },
        h3:  { price: '', km: '' },
        h1:  { price: '', km: '' }
      },
      extraKmPrice: '',
      extraHourPrice: '',
      allowBooking: true,
      status: 'available',
      images: []
    };
    this.navigateToSection('vehicle-list');
  }

  editVehicle(v: any) {
    this.closeVehicleDetailsPopup();
    this.editingVehicleMode.set(true);

    this.vehicleForm = {
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
      pricing: {
        h23: { price: v.pricing?.h23?.price || '', km: v.pricing?.h23?.km || '' },
        h11: { price: v.pricing?.h11?.price || '', km: v.pricing?.h11?.km || '' },
        h3:  { price: v.pricing?.h3?.price || '',  km: v.pricing?.h3?.km || '' },
        h1:  { price: v.pricing?.h1?.price || '',  km: v.pricing?.h1?.km || '' }
      },
      extraKmPrice: v.extraKmPrice,
      extraHourPrice: v.extraHourPrice,
      allowBooking: v.allowBooking !== undefined ? v.allowBooking : true,
      status: v.status || 'available',
      images: v.images || []
    };
    this.vehicleImageInputUrl = v.images && v.images.length > 0 ? v.images[0] : '';
    this.navigateToSection('vehicle-manage');
  }

  async saveVehicle(e: Event) {
    e.preventDefault();

    if (this.vehicleImageInputUrl.trim()) {
      this.vehicleForm.images = [this.vehicleImageInputUrl.trim()];
    } else {
      // Fallback images
      this.vehicleForm.images = [`assets/rr/${this.vehicleForm.name.toLowerCase()}.png`];
    }

    try {
      if (this.editingVehicleMode()) {
        await this.rrApi.updateVehicle(this.vehicleForm.regNo, this.vehicleForm);
        alert('Vehicle updated successfully.');
      } else {
        await this.rrApi.createVehicle(this.vehicleForm);
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
    this.employeeForm = {
      firstName: '',
      lastName: '',
      dob: '',
      phone: '',
      altPhone: '',
      email: '',
      aadhar: '',
      dl: '',
      role: 'employee',
      allowLogin: true,
      address: ''
    };
    this.navigateToSection('employee-list');
  }

  editEmployee(emp: any) {
    this.editingEmployeeMode.set(true);
    this.employeeForm = {
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
    };
    // Stash the ID to update
    (this.employeeForm as any).id = emp.id;
    this.navigateToSection('employee-manage');
  }

  async saveEmployee(e: Event) {
    e.preventDefault();

    try {
      if (this.editingEmployeeMode()) {
        const id = (this.employeeForm as any).id;
        await this.rrApi.updateEmployee(id, this.employeeForm);
        alert('Employee updated successfully.');
      } else {
        await this.rrApi.createEmployee(this.employeeForm);
        alert('Employee added successfully.');
      }
      this.resetEmployeeForm();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error saving employee.');
    }
  }

  // --- PDF GENERATION MIGRATED FROM agreement-pdf.js ---
  printAgreementPDFFromForm() {
    // Collect from form object
    const bObj = {
      id: 'RRB-DRAFT',
      vehicleRegNo: this.bookingForm.vehicleRegNo || '____',
      vehicleName: this.bookingForm.vehicleName || '____',
      pickupDateTime: this.bookingForm.pickupDateTime || '____',
      returnDateTime: this.bookingForm.returnDateTime || '____',
      totalRentalAmount: this.bookingForm.totalRentalAmount || '____',
      extraKmPrice: this.bookingForm.extraKmPrice || '____',
      extraHourPrice: this.bookingForm.extraHourPrice || '____',
      renterFirstName: this.bookingForm.renterFirstName || '____',
      renterSecondName: this.bookingForm.renterSecondName || '____',
      renterFatherName: this.bookingForm.renterFatherName || '____',
      renterAadhar: this.bookingForm.renterAadhar || '____',
      renterDL: this.bookingForm.renterDL || '____',
      renterPhone: this.bookingForm.renterPhone || '____',
      renterAltPhone: this.bookingForm.renterAltPhone || '____',
      renterAddress: this.bookingForm.renterAddress || '____',
      guarFirstName: this.bookingForm.guarFirstName || '____',
      guarSecondName: this.bookingForm.guarSecondName || '____',
      guarFatherName: this.bookingForm.guarFatherName || '____',
      guarAddress: this.bookingForm.guarAddress || '____',
      depositType: this.bookingForm.depositType,
      bikeManufacturer: this.bookingForm.bikeManufacturer,
      bikeModel: this.bookingForm.bikeModel,
      bikeRegNo: this.bookingForm.bikeRegNo,
      cashAmount: this.bookingForm.cashAmount,
      otherItemName: this.bookingForm.otherItemName,
      otherItemValue: this.bookingForm.otherItemValue,
      paymentMode: this.bookingForm.paymentMode,
      travelFrom: this.bookingForm.travelFrom || '____',
      travelTo: this.bookingForm.travelTo || '____',
      vehicleOdometerStart: this.bookingForm.vehicleOdometerStart || '____'
    };

    this.printAgreementPDFFromObject(bObj);
  }

  printAgreementPDFFromObject(b: any) {
    if (!b) return;

    // LEGAL SIZE: 8.5 x 14 inches → 216 × 356 mm
    const doc = new jsPDF({
      unit: 'mm',
      format: [216, 356]
    });

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. TITLE
    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    const title1 = "RAM & RAM'S CAR RENTALS";
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;

    doc.setFontSize(15);
    const title2 = "RENTAL AGREEMENT";
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 10;

    // 2. HEADINGS
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
        if (leftWrapped[i]) {
          doc.text(leftWrapped[i], leftX, y);
        }
        if (rightWrapped[i]) {
          doc.text(rightWrapped[i], rightX, y);
        }
        y += 5.5;
      }
    });

    y += 5;

    // 3. GUARANTEE PERSON DETAILS
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

    // 4. MAIN DECLARATION
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

    // 5. TERMS & CONDITIONS
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

    // 6. EXTRA FEES NOTICE
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

    // 7. SIGNATURE
    const yy = doc.internal.pageSize.getHeight() - 25;
    doc.text("Renter Signature: _______________________", 15, yy);
    doc.text("Authorized Representative: _______________________", 115, yy);

    // Save/Print PDF
    doc.save(`Agreement_${b.id}.pdf`);
  }
}
