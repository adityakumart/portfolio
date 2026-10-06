import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideCalendarDays,
  lucideCalendarClock,
  lucideKey,
  lucideCheckCircle,
  lucideClock,
  lucideCar,
  lucideSearch,
  lucideMoreVertical,
  lucidePhone,
  lucideTag,
} from '@ng-icons/lucide';
import { IBooking, IVehicle } from '@portfolio/shared-types';
import { RRApiService } from '../../../../services/rr-api.service';
import {
  RRNewBookingDialogComponent,
  RRReserveBookingDialogComponent,
  AadharVisiblePipe,
} from '../../../../shared';
import { IndianDatePipe } from '../../../../../../shared/pipes/indian-date.pipe';

@Component({
  selector: 'app-rr-advance-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmTableImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    HlmInputImports,
    NgIconComponent,
    AadharVisiblePipe,
    IndianDatePipe,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideCalendarDays,
      lucideCalendarClock,
      lucideKey,
      lucideCheckCircle,
      lucideClock,
      lucideCar,
      lucideSearch,
      lucideMoreVertical,
      lucidePhone,
      lucideTag,
    }),
  ],
  templateUrl: './advance-booking-list.component.html',
  styleUrl: './advance-booking-list.component.scss',
})
export class RRAdvanceBookingListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private dialog = inject(HlmDialogService);
  private route = inject(ActivatedRoute);

  bookings = signal<IBooking[]>([]);
  vehicles = signal<IVehicle[]>([]);
  searchQuery = signal<string>('');

  currentPage = signal(0);
  pageSize = signal(10);

  reservedBookings = computed(() => {
    const list = this.bookings().filter((b) => b.status === 'reserved' && !b.isDeleted);
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return list;

    return list.filter(
      (b) =>
        (b.vehicleRegNo || '').toLowerCase().includes(query) ||
        (b.vehicleName || '').toLowerCase().includes(query) ||
        (b.vehicleManufacturer || '').toLowerCase().includes(query) ||
        (b.renterFirstName || '').toLowerCase().includes(query) ||
        (b.renterSecondName || '').toLowerCase().includes(query) ||
        (b.renterPhone || '').includes(query) ||
        (b.id || '').toLowerCase().includes(query)
    );
  });

  pagedBookings = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.reservedBookings().slice(start, start + this.pageSize());
  });

  totalPages = computed(
    () => Math.ceil(this.reservedBookings().length / this.pageSize()) || 1
  );

  ngOnInit() {
    this.loadBookings();
    this.loadVehicles();

    this.route.queryParams.subscribe((params) => {
      const regNo = params['vehicleRegNo'];
      if (regNo) {
        this.openReserveBookingModal(regNo);
      }
    });
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings({ status: 'reserved' });
      this.bookings.set(data);
    } catch (e) {
      console.error('Error loading advance bookings:', e);
    }
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles:', e);
    }
  }

  getVehicleForBooking(b: IBooking): IVehicle | undefined {
    return this.vehicles().find((v) => v.regNo === b.vehicleRegNo);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  /**
   * Top-right "Reserve Booking" Button
   */
  openReserveBookingModal(vehicleRegNo?: string) {
    const ref = this.dialog.open(RRReserveBookingDialogComponent, {
      context: {
        vehicleRegNo,
        vehicles: this.vehicles(),
      },
      contentClass: 'max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  /**
   * Action 1: Edit/Modify Reservation Schedule or Details
   */
  openModifyReservationModal(reservation: IBooking) {
    const ref = this.dialog.open(RRReserveBookingDialogComponent, {
      context: {
        reservation,
        vehicles: this.vehicles(),
        isEditMode: true,
      },
      contentClass: 'max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  /**
   * Action 2: Book Now -> Navigates to New Booking popup with all details auto-filled.
   * Once booking is confirmed, reserved vehicle is moved to active booking!
   */
  openBookNowModal(reservation: IBooking) {
    const ref = this.dialog.open(RRNewBookingDialogComponent, {
      context: {
        vehicleRegNo: reservation.vehicleRegNo,
        vehicles: this.vehicles(),
        reservation,
      },
      contentClass: 'max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((createdOrUpdated) => {
      if (createdOrUpdated) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  /**
   * Action 3: Delete Advance Booking
   */
  async deleteReservation(reservation: IBooking) {
    const confirmed = window.confirm(
      `Are you sure you want to delete advance reservation #${reservation.id} for vehicle ${reservation.vehicleRegNo}?`
    );
    if (!confirmed) return;

    try {
      await this.rrApi.deleteBooking(reservation.id);
      toast.success(`Advance reservation #${reservation.id} deleted successfully.`);
      this.loadBookings();
      this.loadVehicles();
    } catch (e: any) {
      console.error(e);
      toast.error(e.error?.message || 'Failed to delete reservation.');
    }
  }
}
