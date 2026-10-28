import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideCalendarDays,
  lucideCalendarX,
  lucideFileText,
  lucideInfo,
  lucidePhoneCall,
  lucideBell,
  lucideClock,
  lucideX,
  lucideSave,
  lucideMoreVertical,
  lucideEye,
  lucideDownload,
  lucideMail,
  lucideAlertCircle,
  lucideMessageSquare,
} from '@ng-icons/lucide';
import { IBooking, IVehicle, ICustomerIntimation, IRRWhatsAppTemplateId } from '@portfolio/shared-types';
import { RRApiService } from '../../../../services/rr-api.service';
import { RRInvoicePdfService } from '../../../../services/rr-invoice-pdf.service';
import {
  RRNewBookingDialogComponent,
  RRReserveBookingDialogComponent,
  RREndBookingDialogComponent,
  RRModifyBookingDialogComponent,
  RRWhatsAppPreviewDialogComponent,
  AadharVisiblePipe,
} from '../../../../shared';
import { IndianDatePipe } from '../../../../../../shared/pipes/indian-date.pipe';

@Component({
  selector: 'app-rr-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HlmTableImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    HlmInputImports,
    HlmLabelImports,
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
      lucideCalendarX,
      lucideFileText,
      lucideInfo,
      lucidePhoneCall,
      lucideBell,
      lucideClock,
      lucideX,
      lucideSave,
      lucideMoreVertical,
      lucideEye,
      lucideDownload,
      lucideMail,
      lucideAlertCircle,
      lucideMessageSquare,
    }),
  ],
  templateUrl: './booking-list.component.html',
  styleUrl: './booking-list.component.scss',
})
export class RRBookingListComponent implements OnInit, OnDestroy {
  private rrApi = inject(RRApiService);
  private dialog = inject(HlmDialogService);
  private route = inject(ActivatedRoute);
  private invoicePdf = inject(RRInvoicePdfService);

  // Collections data
  bookings = signal<IBooking[]>([]);
  vehicles = signal<IVehicle[]>([]);

  currentTime = signal<Date>(new Date());
  private timeTickerInterval: any = null;

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
      const isReserve = params['reserve'] === 'true';
      if (regNo) {
        if (isReserve) {
          this.openReserveBookingModal(regNo);
        } else {
          this.openNewBookingModal(regNo);
        }
      }
    });

    this.timeTickerInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 10000);
  }

  ngOnDestroy() {
    if (this.timeTickerInterval) {
      clearInterval(this.timeTickerInterval);
      this.timeTickerInterval = null;
    }
  }

  getRentalTimeRemaining(returnDateTime: string): {
    text: string;
    isExceeded: boolean;
    label: string;
  } {
    if (!returnDateTime) {
      return { text: 'N/A', isExceeded: false, label: 'Time Left' };
    }

    const returnTime = new Date(returnDateTime).getTime();
    if (isNaN(returnTime)) {
      return { text: 'Invalid date', isExceeded: false, label: 'Time Left' };
    }

    const now = this.currentTime().getTime();
    const diffMs = returnTime - now;
    const isExceeded = diffMs < 0;
    const absDiffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));

    const days = Math.floor(absDiffMinutes / (24 * 60));
    const hours = Math.floor((absDiffMinutes % (24 * 60)) / 60);
    const minutes = absDiffMinutes % 60;

    const timeParts: string[] = [];
    if (days > 0) {
      timeParts.push(`${days}day${days > 1 ? 's' : ''}`);
    }
    if (hours > 0 || days > 0) {
      timeParts.push(`${hours} hrs`);
    }
    timeParts.push(`${minutes} mins`);

    const formattedTime = timeParts.join(' ');

    return {
      text: formattedTime,
      isExceeded,
      label: isExceeded ? 'Exceeded by' : 'Time Left',
    };
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
        bookings: this.bookings(),
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

  openReserveBookingModal(vehicleRegNo?: string) {
    const ref = this.dialog.open(RRReserveBookingDialogComponent, {
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

  private fb = inject(FormBuilder);

  // Intimation modal state
  @ViewChild('intimationDialog') intimationDialogTemplate!: TemplateRef<any>;
  selectedIntimationBooking = signal<IBooking | null>(null);
  isSubmittingIntimation = signal<boolean>(false);
  intimationFormGroup: FormGroup = this.fb.group({
    intimationType: ['delay', Validators.required],
    notes: ['', [Validators.required, Validators.minLength(3)]],
    expectedReturnDateTime: [''],
  });

  openWhatsAppModal(booking: IBooking, templateType: IRRWhatsAppTemplateId = 'active_reminder') {
    const ref = this.dialog.open(RRWhatsAppPreviewDialogComponent, {
      context: {
        booking,
        templateType,
      },
      contentClass: 'max-w-xl w-full p-0 border-0 bg-transparent shadow-none',
    });

    ref.closed$.subscribe((result) => {
      if (result) {
        this.loadBookings();
      }
    });
  }

  viewBookingPdf(b: IBooking) {
    this.invoicePdf.viewAgreementPdf(b);
  }

  downloadBookingPdf(b: IBooking) {
    this.viewBookingPdf(b);
  }

  exportBookingPdf(b: IBooking) {
    this.viewBookingPdf(b);
  }

  openIntimationModal(booking: IBooking) {
    this.selectedIntimationBooking.set(booking);
    this.intimationFormGroup.reset({
      intimationType: 'delay',
      notes: '',
      expectedReturnDateTime: booking.returnDateTime || '',
    });
    this.dialog.open(this.intimationDialogTemplate, {
      contentClass: 'max-w-lg w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  closeIntimationModal() {
    this.dialog.closeAll();
    this.selectedIntimationBooking.set(null);
  }

  async submitCustomerIntimation() {
    if (this.intimationFormGroup.invalid) return;

    const booking = this.selectedIntimationBooking();
    if (!booking) return;

    try {
      this.isSubmittingIntimation.set(true);
      const val = this.intimationFormGroup.value;
      await this.rrApi.recordCustomerIntimation(booking.id, {
        intimationType: val.intimationType,
        notes: val.notes,
        expectedReturnDateTime: val.expectedReturnDateTime || undefined,
      });

      toast.success(`Customer intimation logged for booking #${booking.id}`);
      this.closeIntimationModal();
      await this.loadBookings();
    } catch (err: any) {
      console.error('Error logging customer intimation:', err);
      toast.error(err.error?.message || 'Failed to record customer intimation.');
    } finally {
      this.isSubmittingIntimation.set(false);
    }
  }
}
