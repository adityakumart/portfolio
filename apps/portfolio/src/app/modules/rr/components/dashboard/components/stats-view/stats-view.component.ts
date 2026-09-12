import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRApiService } from '../../../../services/rr-api.service';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideKey,
  lucideWrench,
  lucideAlertTriangle,
  lucideUsers,
  lucideFuel,
  lucideGauge,
  lucideSearchX,
  lucideCar,
  lucideCalendarCheck,
  lucideX,
  lucideChevronDown,
  lucideChevronUp,
  lucideEye,
  lucidePhone,
  lucideReceipt,
  lucideUser,
  lucideAlertCircle,
  lucideCheck,
  lucideFileText,
  lucidePencil,
  lucideCalendarX,
} from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { IVehicle, IBooking, IRRDashboardStats } from '@portfolio/shared-types';
import { RRInvoicePdfService } from '../../../../services/rr-invoice-pdf.service';
import {
  RRVehicleCardComponent,
  RRNewBookingDialogComponent,
  RRModifyBookingDialogComponent,
  RREndBookingDialogComponent,
} from '../../../../shared';

export type StatCategory = 'fleet' | 'available' | 'contract' | 'bookings' | 'maintenance' | 'payments';
export type SeatingFilter = 'all' | '5' | '7';

@Component({
  selector: 'app-rr-stats-view',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmTooltipImports,
    HlmButtonImports,
    HlmBadgeImports,
    NgIconComponent,
    RRVehicleCardComponent,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideKey,
      lucideWrench,
      lucideAlertTriangle,
      lucideUsers,
      lucideFuel,
      lucideGauge,
      lucideSearchX,
      lucideCar,
      lucideCalendarCheck,
      lucideX,
      lucideChevronDown,
      lucideChevronUp,
      lucideEye,
      lucidePhone,
      lucideReceipt,
      lucideUser,
      lucideAlertCircle,
      lucideCheck,
      lucideFileText,
      lucidePencil,
      lucideCalendarX,
    }),
  ],
  templateUrl: './stats-view.component.html',
  styleUrl: './stats-view.component.scss',
})
export class RRStatsViewComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private router = inject(Router);

  vehicles = signal<IVehicle[]>([]);
  bookings = signal<IBooking[]>([]);
  stats = signal<IRRDashboardStats>({
    totalFleet: 0,
    available: 0,
    contract: 0,
    activeBookings: 0,
    maintenance: 0,
    pendingPayments: 0,
  });

  // Active accordion section
  activeCategory = signal<StatCategory | null>(null);

  // Seating filter for the expanded accordion: 'all', '5', or '7'
  selectedSeating = signal<SeatingFilter>('all');

  ngOnInit() {
    this.loadVehicles();
    this.loadBookings();
    this.loadStats();
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles in stats view:', e);
    }
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error('Error loading bookings in stats view:', e);
    }
  }

  async loadStats() {
    try {
      const data = await this.rrApi.getDashboardStats();
      this.stats.set(data);
    } catch (e) {
      console.error('Error loading stats in stats view:', e);
    }
  }

  getVehicleCount(status: string): number {
    if (status === 'contract') {
      return this.vehicles().filter((v) => v.status === 'contract' || v.status === 'in_contract').length;
    }
    return this.vehicles().filter((v) => v.status === status).length;
  }

  getVehicleImage(v: any): string {
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  getBookingVehicle(b: IBooking): IVehicle | undefined {
    return this.vehicles().find((item) => item.regNo === b.vehicleRegNo);
  }

  getBookingVehicleImage(b: IBooking): string {
    const v = this.getBookingVehicle(b);
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  async toggleCategory(category: StatCategory) {
    if (this.activeCategory() === category) {
      this.activeCategory.set(null);
      return;
    }
    this.selectedSeating.set('all');
    await Promise.all([this.loadVehicles(), this.loadBookings(), this.loadStats()]);
    this.activeCategory.set(category);
  }

  closeAccordion() {
    this.activeCategory.set(null);
  }

  setSeatingFilter(filter: SeatingFilter) {
    this.selectedSeating.set(filter);
  }

  get activeCategoryTitle(): string {
    switch (this.activeCategory()) {
      case 'fleet':
        return 'Total Fleet Inventory';
      case 'available':
        return 'Available Fleet';
      case 'contract':
        return 'In-Contract Fleet';
      case 'bookings':
        return 'Active Customer Bookings';
      case 'maintenance':
        return 'Fleet In Service & Maintenance';
      case 'payments':
        return 'Bookings with Pending Balances';
      default:
        return '';
    }
  }

  get activeCategoryDescription(): string {
    switch (this.activeCategory()) {
      case 'fleet':
        return 'Complete directory of all registered vehicles in RoadReady Rentals';
      case 'available':
        return 'Vehicles ready and available for immediate customer rental and dispatch';
      case 'contract':
        return 'Vehicles committed to corporate accounts and long-term contract agreements';
      case 'bookings':
        return 'Active customer journeys currently on the road';
      case 'maintenance':
        return 'Vehicles currently undergoing routine servicing, inspection, or repair';
      case 'payments':
        return 'Active rentals with outstanding balance dues and pending settlements';
      default:
        return '';
    }
  }

  get activeCategoryCount(): number {
    switch (this.activeCategory()) {
      case 'fleet':
        return this.vehicles().length;
      case 'available':
        return this.getVehicleCount('available');
      case 'contract':
        return this.getVehicleCount('contract');
      case 'bookings':
        return this.bookings().filter((b) => b.status === 'active').length;
      case 'maintenance':
        return this.getVehicleCount('maintenance');
      case 'payments':
        return this.bookings().filter((b) => b.status === 'active' && Number(b.pendingAmount) > 0).length;
      default:
        return 0;
    }
  }

  get isVehicleCategory(): boolean {
    const cat = this.activeCategory();
    return cat === 'fleet' || cat === 'available' || cat === 'contract' || cat === 'maintenance';
  }

  get isBookingCategory(): boolean {
    const cat = this.activeCategory();
    return cat === 'bookings' || cat === 'payments';
  }

  get activeVehicles(): IVehicle[] {
    const cat = this.activeCategory();
    if (cat === 'fleet') {
      return this.vehicles();
    }
    if (cat === 'available') {
      return this.vehicles().filter((v) => v.status === 'available');
    }
    if (cat === 'contract') {
      return this.vehicles().filter((v) => v.status === 'contract' || v.status === 'in_contract');
    }
    if (cat === 'maintenance') {
      return this.vehicles().filter((v) => v.status === 'maintenance');
    }
    return [];
  }

  get activeVehicles5Seater(): IVehicle[] {
    return this.activeVehicles.filter((v) => (v.seating || '5') === '5');
  }

  get activeVehicles7Seater(): IVehicle[] {
    return this.activeVehicles.filter((v) => v.seating === '7');
  }

  get activeBookingsList(): IBooking[] {
    if (this.activeCategory() === 'bookings') {
      return this.bookings().filter((b) => b.status === 'active');
    }
    if (this.activeCategory() === 'payments') {
      return this.bookings().filter((b) => b.status === 'active' && Number(b.pendingAmount) > 0);
    }
    return [];
  }

  get activeBookings5Seater(): IBooking[] {
    return this.activeBookingsList.filter((b) => {
      const v = this.getBookingVehicle(b);
      return (v?.seating || '5') === '5';
    });
  }

  get activeBookings7Seater(): IBooking[] {
    return this.activeBookingsList.filter((b) => {
      const v = this.getBookingVehicle(b);
      return v?.seating === '7';
    });
  }

  get currentCategoryTotalCount(): number {
    return this.activeCategoryCount;
  }

  get currentCategory5SeaterCount(): number {
    if (this.isVehicleCategory) {
      return this.activeVehicles5Seater.length;
    }
    if (this.isBookingCategory) {
      return this.activeBookings5Seater.length;
    }
    return 0;
  }

  get currentCategory7SeaterCount(): number {
    if (this.isVehicleCategory) {
      return this.activeVehicles7Seater.length;
    }
    if (this.isBookingCategory) {
      return this.activeBookings7Seater.length;
    }
    return 0;
  }

  private dialog = inject(HlmDialogService);
  private invoicePdf = inject(RRInvoicePdfService);

  bookVehicle(vehicle: any, event?: Event) {
    event?.stopPropagation();
    const ref = this.dialog.open(RRNewBookingDialogComponent, {
      context: {
        vehicleRegNo: vehicle.regNo,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((created) => {
      if (created) {
        this.loadVehicles();
        this.loadBookings();
        this.loadStats();
      }
    });
  }

  modifyBooking(b: IBooking, event?: Event) {
    event?.stopPropagation();
    const ref = this.dialog.open(RRModifyBookingDialogComponent, {
      context: {
        booking: b,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((updated) => {
      if (updated) {
        this.loadVehicles();
        this.loadBookings();
        this.loadStats();
      }
    });
  }

  printAgreement(b: IBooking, event?: Event) {
    event?.stopPropagation();
    this.invoicePdf.printAgreementPdf(b);
  }

  endBooking(b: IBooking, event?: Event) {
    event?.stopPropagation();
    const ref = this.dialog.open(RREndBookingDialogComponent, {
      context: {
        booking: b,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadVehicles();
        this.loadBookings();
        this.loadStats();
      }
    });
  }

  viewBooking(b: IBooking, event?: Event) {
    this.modifyBooking(b, event);
  }
}


