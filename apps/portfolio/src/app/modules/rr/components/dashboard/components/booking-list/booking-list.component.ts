import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideCalendarDays,
  lucideCalendarX,
  lucideFileText,
  lucideInfo,
} from '@ng-icons/lucide';
import { IBooking, IVehicle } from '@portfolio/shared-types';
import { RRApiService } from '../../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../../services/rr-invoice-pdf.service';
import {
  RRNewBookingDialogComponent,
  RREndBookingDialogComponent,
  RRModifyBookingDialogComponent,
} from '../../../../shared';

@Component({
  selector: 'app-rr-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    HlmTableImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideCalendarDays,
      lucideCalendarX,
      lucideFileText,
      lucideInfo,
    }),
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class RRBookingListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private dialog = inject(HlmDialogService);
  private route = inject(ActivatedRoute);
  private invoicePdf = inject(RRInvoicePdfService);

  // Collections data
  bookings = signal<IBooking[]>([]);
  vehicles = signal<IVehicle[]>([]);

  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);

  activeBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'active')
  );

  pagedBookings = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.activeBookings().slice(start, start + this.pageSize());
  });

  totalPages = computed(
    () => Math.ceil(this.activeBookings().length / this.pageSize()) || 1
  );

  ngOnInit() {
    this.loadBookings();
    this.loadVehicles();

    this.route.queryParams.subscribe((params) => {
      const regNo = params['vehicleRegNo'];
      if (regNo) {
        this.openNewBookingModal(regNo);
      }
    });
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error('Error loading bookings:', e);
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

  // --- DIALOG MODALS OPEN/CLOSE ---
  openNewBookingModal(vehicleRegNo?: string) {
    const ref = this.dialog.open(RRNewBookingDialogComponent, {
      context: {
        vehicleRegNo,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-4xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  openEndBookingPopup(booking: IBooking) {
    const ref = this.dialog.open(RREndBookingDialogComponent, {
      context: {
        booking,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  openModifyBookingPopup(booking: IBooking) {
    const ref = this.dialog.open(RRModifyBookingDialogComponent, {
      context: {
        booking,
        vehicles: this.vehicles(),
      },
      contentClass:
        'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
        this.loadVehicles();
      }
    });
  }

  exportBookingPdf(b: IBooking) {
    this.invoicePdf.printAgreementPdf(b);
  }
}
