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
} from '@ng-icons/lucide';
import { Router } from '@angular/router';
import { IVehicle, IBooking, IRRDashboardStats } from '@portfolio/shared-types';

export type StatCategory = 'fleet' | 'bookings' | 'maintenance' | 'payments';

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
    activeBookings: 0,
    maintenance: 0,
    pendingPayments: 0,
  });

  // Active accordion section
  activeCategory = signal<StatCategory | null>(null);

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
    return this.vehicles().filter((v) => v.status === status).length;
  }

  getVehicleImage(v: any): string {
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  getBookingVehicleImage(b: IBooking): string {
    const v = this.vehicles().find((item) => item.regNo === b.vehicleRegNo);
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
    await Promise.all([this.loadVehicles(), this.loadBookings(), this.loadStats()]);
    this.activeCategory.set(category);
  }

  closeAccordion() {
    this.activeCategory.set(null);
  }

  get activeCategoryTitle(): string {
    switch (this.activeCategory()) {
      case 'fleet':
        return 'Total Fleet Inventory';
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
      case 'bookings':
        return this.bookings().filter((b) => b.status === 'active').length;
      case 'maintenance':
        return this.vehicles().filter((v) => v.status === 'maintenance').length;
      case 'payments':
        return this.bookings().filter((b) => b.status === 'active' && Number(b.pendingAmount) > 0).length;
      default:
        return 0;
    }
  }

  get activeVehicles(): IVehicle[] {
    if (this.activeCategory() === 'fleet') {
      return this.vehicles();
    }
    if (this.activeCategory() === 'maintenance') {
      return this.vehicles().filter((v) => v.status === 'maintenance');
    }
    return [];
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

  bookVehicle(vehicle: any, event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/user/rr/booking/list'], {
      queryParams: { vehicleRegNo: vehicle.regNo },
    });
  }

  viewBooking(b: IBooking, event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/user/rr/booking/list'], {
      queryParams: { vehicleRegNo: b.vehicleRegNo },
    });
  }
}


