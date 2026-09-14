import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  TemplateRef,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  IBooking,
  IVehicle,
  IVehicleAutocompleteItem,
} from '@portfolio/shared-types';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import {
  lucideHistory,
  lucideInbox,
  lucideFileText,
  lucideReceipt,
  lucideCar,
  lucideUser,
  lucideCalendar,
  lucideFilter,
  lucideRotateCcw,
  lucideX,
  lucideInfo,
  lucideLoader2,
  lucideSearch,
  lucideCheck,
  lucideChevronDown,
  lucidePhoneCall,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { RRInvoicePdfService } from '../../../../services/rr-invoice-pdf.service';

@Component({
  selector: 'app-rr-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  providers: [
    provideIcons({
      lucideHistory,
      lucideInbox,
      lucideFileText,
      lucideReceipt,
      lucideCar,
      lucideUser,
      lucideCalendar,
      lucideFilter,
      lucideRotateCcw,
      lucideX,
      lucideInfo,
      lucideLoader2,
      lucideSearch,
      lucideCheck,
      lucideChevronDown,
      lucidePhoneCall,
      lucideShieldCheck,
    }),
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class RRHistoryComponent implements OnInit {
  protected readonly Number = Number;
  protected readonly Math = Math;

  private rrApi = inject(RRApiService);
  private invoicePdf = inject(RRInvoicePdfService);
  private dialog = inject(HlmDialogService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('breakdownDialog') breakdownDialog!: TemplateRef<any>;

  // User role context
  isAdmin = this.rrApi.isAdmin;
  currentUser = this.rrApi.currentUser;

  // Data signals from API
  bookings = signal<IBooking[]>([]);
  vehicles = signal<IVehicleAutocompleteItem[]>([]);

  // Loading signals
  isLoading = signal<boolean>(false);
  isVehiclesLoading = signal<boolean>(false);

  // Filter signals
  vehicleFilter = signal<string>('');
  fromDateFilter = signal<string>('');
  toDateFilter = signal<string>('');
  customerFilter = signal<string>('');

  // Autocomplete dropdown visibility
  isVehicleDropdownOpen = signal<boolean>(false);

  // Pagination signals (from API)
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // Selected booking for breakdown popup
  selectedBooking = signal<IBooking | null>(null);

  // Computed signals ensuring full template compatibility
  filteredHistoryBookings = computed(() => this.bookings());
  historyBookings = computed(() => this.bookings());
  pagedHistoryBookings = computed(() => this.bookings());

  // Filter autocomplete vehicles by vehicleName, vehicleRegNo, or vehicleManufacturer
  vehicleOptions = computed(() => {
    const list = this.vehicles();
    const query = this.vehicleFilter().trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (v) =>
        v.name?.toLowerCase().includes(query) ||
        v.regNo?.toLowerCase().includes(query) ||
        v.manufacturer?.toLowerCase().includes(query),
    );
  });

  hasActiveFilters = computed(
    () =>
      !!this.vehicleFilter().trim() ||
      !!this.fromDateFilter() ||
      !!this.toDateFilter() ||
      !!this.customerFilter().trim(),
  );

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.vehicle-autocomplete-container')) {
      this.isVehicleDropdownOpen.set(false);
    }
  }

  ngOnInit() {
    // Initial loads from API
    this.loadVehiclesFromApi();
    this.fetchHistoryFromApi();
  }

  // --- API Methods ---

  async loadVehiclesFromApi(search = '') {
    this.isVehiclesLoading.set(true);
    try {
      const data = await this.rrApi.getVehiclesAutocomplete({
        search: search.trim(),
        limit: 10,
      });
      this.vehicles.set(data || []);
    } catch (e) {
      console.error('Error loading vehicles for autocomplete from API:', e);
    } finally {
      this.isVehiclesLoading.set(false);
    }
  }

  async fetchHistoryFromApi() {
    this.isLoading.set(true);
    try {
      const res = await this.rrApi.getBookingsPaginated({
        status: 'completed,cancelled',
        vehicle: this.vehicleFilter().trim(),
        customer: this.customerFilter().trim(),
        from: this.fromDateFilter(),
        to: this.toDateFilter(),
        page: this.currentPage() + 1,
        limit: this.pageSize(),
      });
      this.bookings.set(res.bookings || []);
      this.totalRecords.set(res.total || 0);
      this.totalPages.set(res.totalPages || 1);
    } catch (e) {
      console.error('Error fetching history bookings from API:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- Autocomplete & Filter Event Handlers ---

  openVehicleDropdown() {
    this.isVehicleDropdownOpen.set(true);
    if (this.vehicles().length === 0) {
      this.loadVehiclesFromApi();
    }
  }

  selectVehicle(v: IVehicleAutocompleteItem) {
    // Filter value can be vehicleName, vehicleRegNo, or vehicleManufacturer
    // Setting the plate number or model name matches the vehicle in API
    this.vehicleFilter.set(v.regNo);
    this.isVehicleDropdownOpen.set(false);
  }

  onVehicleInput(value: string) {
    this.vehicleFilter.set(value);
    this.isVehicleDropdownOpen.set(true);
  }

  clearVehicleFilter() {
    this.vehicleFilter.set('');
    this.isVehicleDropdownOpen.set(false);
  }

  onCustomerInput(value: string) {
    this.customerFilter.set(value);
  }

  clearCustomerFilter() {
    this.customerFilter.set('');
  }

  // Explicit Search Trigger
  applyFilters() {
    this.isVehicleDropdownOpen.set(false);
    this.currentPage.set(0);
    this.fetchHistoryFromApi();
  }

  resetFilters() {
    this.vehicleFilter.set('');
    this.fromDateFilter.set('');
    this.toDateFilter.set('');
    this.customerFilter.set('');
    this.currentPage.set(0);
    this.isVehicleDropdownOpen.set(false);
    this.fetchHistoryFromApi();
  }

  // --- Pagination Controls ---

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.fetchHistoryFromApi();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.fetchHistoryFromApi();
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSize.set(Number(newSize));
    this.currentPage.set(0);
    this.fetchHistoryFromApi();
  }

  // --- Breakdown Popup & Invoice Actions ---

  openBreakdownModal(b: IBooking) {
    this.selectedBooking.set(b);
    this.dialog.open(this.breakdownDialog, {
      contentClass:
        'max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  closeBreakdownModal() {
    this.dialog.closeAll();
    this.selectedBooking.set(null);
  }

  getDistanceDriven(b: IBooking): number {
    const end = Number(b.vehicleOdometerEnd) || 0;
    const start = Number(b.vehicleOdometerStart) || 0;
    return end >= start ? end - start : 0;
  }

  exportBookingPdf(b: IBooking) {
    this.invoicePdf.printAgreementPdf(b);
  }

  exportInvoicePdf(b: IBooking) {
    this.invoicePdf.printInvoicePdf(b);
  }
}
