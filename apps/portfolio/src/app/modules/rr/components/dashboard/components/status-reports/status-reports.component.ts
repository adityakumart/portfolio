import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RRApiService } from '../../../../services/rr-api.service';
import { RRReportExportService } from '../../../../services/rr-report-export.service';
import {
  IBooking,
  IVehicleAutocompleteItem,
  BookingStatus,
  DepositType,
  IRRStatusReportFilter,
  IRRStatusReportSummary,
} from '@portfolio/shared-types';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmDatePickerImports } from '@spartan-ng/hel/date-picker';
import {
  IndianDatePipe,
  toISODateString,
  IndianDateInput,
  formatToIndianDate,
} from '../../../../../../shared/pipes/indian-date.pipe';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFileBarChart,
  lucideDownload,
  lucideFileSpreadsheet,
  lucideFilter,
  lucideRotateCcw,
  lucideCalendar,
  lucideCar,
  lucideSearch,
  lucideX,
  lucideCheck,
  lucideLoader2,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCalendarDays,
  lucideKey,
  lucideReceipt,
  lucideBadgeCheck,
  lucideClock,
  lucideGauge,
  lucideShieldAlert,
  lucideEye,
  lucideInfo,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';

export type ReportPeriodHorizon = 'monthly' | 'yearly' | 'custom';

@Component({
  selector: 'app-rr-status-reports',
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
    HlmDatePickerImports,
    IndianDatePipe,
  ],
  providers: [
    provideIcons({
      lucideFileBarChart,
      lucideDownload,
      lucideFileSpreadsheet,
      lucideFilter,
      lucideRotateCcw,
      lucideCalendar,
      lucideCar,
      lucideSearch,
      lucideX,
      lucideCheck,
      lucideLoader2,
      lucideChevronLeft,
      lucideChevronRight,
      lucideCalendarDays,
      lucideKey,
      lucideReceipt,
      lucideBadgeCheck,
      lucideClock,
      lucideGauge,
      lucideShieldAlert,
      lucideEye,
      lucideInfo,
    }),
  ],
  templateUrl: './status-reports.component.html',
  styleUrl: './status-reports.component.scss',
})
export class RRStatusReportsComponent implements OnInit {
  protected readonly Number = Number;
  protected readonly Math = Math;

  private rrApi = inject(RRApiService);
  private reportExport = inject(RRReportExportService);
  private router = inject(Router);

  // User RBAC Context
  currentUser = this.rrApi.currentUser;
  isManagerOrAdmin = this.rrApi.isManagerOrAdmin;
  isAdmin = this.rrApi.isAdmin;

  // Filter signals
  periodType = signal<ReportPeriodHorizon>('monthly');
  selectedMonth = signal<number>(new Date().getMonth() + 1); // 1 - 12
  selectedYear = signal<number>(new Date().getFullYear());
  fromDateFilter = signal<IndianDateInput>(null);
  toDateFilter = signal<IndianDateInput>(null);

  vehicleFilter = signal<string>('all');
  vehicleInputDisplay = signal<string>('');
  isVehicleDropdownOpen = signal<boolean>(false);

  statusFilter = signal<BookingStatus | 'all'>('all');
  paymentStatusFilter = signal<'all' | 'settled' | 'pending'>('all');
  depositFilter = signal<DepositType | 'all'>('all');
  searchQuery = signal<string>('');

  // Data signals
  bookings = signal<IBooking[]>([]);
  vehicles = signal<IVehicleAutocompleteItem[]>([]);
  summary = signal<IRRStatusReportSummary>({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    reservedBookings: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalKilometers: 0,
    totalDurationHours: 0,
    fleetUtilizationRate: 0,
  });

  // Pagination & Loading
  currentPage = signal<number>(1);
  pageSize = signal<number>(15);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);
  isExporting = signal<boolean>(false);

  // Months and Years lists
  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  readonly years = computed(() => {
    const cur = new Date().getFullYear();
    return [cur - 2, cur - 1, cur, cur + 1];
  });

  // Autocomplete vehicle options
  vehicleOptions = computed(() => {
    const list = this.vehicles();
    const query = this.vehicleInputDisplay().trim().toLowerCase();
    if (!query) return list;
    return list.filter(
      (v) =>
        v.name?.toLowerCase().includes(query) ||
        v.regNo?.toLowerCase().includes(query) ||
        v.manufacturer?.toLowerCase().includes(query)
    );
  });

  // Date Range Validation
  today = new Date();
  dateError = computed(() => {
    if (this.periodType() !== 'custom') return null;
    const from = this.fromDateFilter();
    const to = this.toDateFilter();
    const fromIso = toISODateString(from);
    const toIso = toISODateString(to);

    if (fromIso && toIso && fromIso > toIso) {
      return 'From date cannot be after To date.';
    }
    return null;
  });

  // Dynamic Filter Label for Headers and Export
  filterLabel = computed(() => {
    const horizon = this.periodType();
    let label = '';
    if (horizon === 'monthly') {
      const mObj = this.months.find((m) => m.value === this.selectedMonth());
      label = `Monthly: ${mObj?.label || this.selectedMonth()} ${this.selectedYear()}`;
    } else if (horizon === 'yearly') {
      label = `Yearly: ${this.selectedYear()}`;
    } else {
      const fStr = formatToIndianDate(this.fromDateFilter(), { fallback: 'Start' });
      const tStr = formatToIndianDate(this.toDateFilter(), { fallback: 'End' });
      label = `Date Range: ${fStr} to ${tStr}`;
    }

    if (this.vehicleFilter() !== 'all') {
      label += ` (${this.vehicleFilter()})`;
    }
    if (this.statusFilter() !== 'all') {
      label += ` [Status: ${this.statusFilter().toUpperCase()}]`;
    }
    return label;
  });

  hasActiveFilters = computed(() => {
    return (
      this.periodType() !== 'monthly' ||
      this.selectedMonth() !== new Date().getMonth() + 1 ||
      this.selectedYear() !== new Date().getFullYear() ||
      this.vehicleFilter() !== 'all' ||
      this.statusFilter() !== 'all' ||
      this.paymentStatusFilter() !== 'all' ||
      this.depositFilter() !== 'all' ||
      !!this.searchQuery().trim()
    );
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.vehicle-autocomplete-box')) {
      this.isVehicleDropdownOpen.set(false);
    }
  }

  ngOnInit() {
    // Role check guard: Manager & Admin only
    if (!this.isManagerOrAdmin()) {
      toast.error('Access Denied', {
        description: 'Status Reports require Manager or Administrator privileges.',
      });
      this.router.navigate(['/user/rr/dashboard']);
      return;
    }

    this.loadVehicles();
    this.fetchReportData();
  }

  async loadVehicles() {
    try {
      const list = await this.rrApi.getBookingVehiclesAutocomplete();
      this.vehicles.set(list || []);
    } catch {
      // Fallback: vehicles will be empty, won't break view
    }
  }

  async fetchReportData() {
    if (this.dateError()) {
      toast.error('Invalid Date Range', { description: this.dateError()! });
      return;
    }

    this.isLoading.set(true);
    try {
      const filter: IRRStatusReportFilter = {
        periodType: this.periodType(),
        month: this.selectedMonth(),
        year: this.selectedYear(),
        from: this.fromDateFilter() ? formatToIndianDate(this.fromDateFilter()) : undefined,
        to: this.toDateFilter() ? formatToIndianDate(this.toDateFilter()) : undefined,
        vehicleRegNo: this.vehicleFilter() !== 'all' ? this.vehicleFilter() : undefined,
        status: this.statusFilter(),
        paymentStatus: this.paymentStatusFilter(),
        depositType: this.depositFilter(),
        search: this.searchQuery().trim() || undefined,
        page: this.currentPage(),
        limit: this.pageSize(),
      };

      const res = await this.rrApi.getStatusReport(filter);
      if (res && res.success) {
        const bookingList = Array.isArray(res.bookings) ? res.bookings : [];
        this.bookings.set(bookingList);
        this.summary.set(res.summary);
        this.totalRecords.set(res.totalRecords !== undefined ? res.totalRecords : bookingList.length);
        this.totalPages.set(res.totalPages !== undefined ? res.totalPages : 1);
        this.currentPage.set(res.currentPage || 1);
      }
    } catch (err: unknown) {
      toast.error('Failed to load status report', {
        description: (err as Error)?.message || 'Internal server error occurred.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  // Horizon Switching
  setPeriodType(mode: ReportPeriodHorizon) {
    this.periodType.set(mode);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  onMonthChange(m: number) {
    this.selectedMonth.set(m);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  onYearChange(y: number) {
    this.selectedYear.set(y);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  onFromDateChange(date: IndianDateInput) {
    this.fromDateFilter.set(date);
    if (this.toDateFilter() && !this.dateError()) {
      this.currentPage.set(1);
      this.fetchReportData();
    }
  }

  onToDateChange(date: IndianDateInput) {
    this.toDateFilter.set(date);
    if (this.fromDateFilter() && !this.dateError()) {
      this.currentPage.set(1);
      this.fetchReportData();
    }
  }

  clearFromDate() {
    this.fromDateFilter.set(null);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  clearToDate() {
    this.toDateFilter.set(null);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  // Vehicle Autocomplete Handlers
  openVehicleDropdown() {
    this.isVehicleDropdownOpen.set(true);
  }

  selectVehicle(v: IVehicleAutocompleteItem) {
    this.vehicleFilter.set(v.regNo);
    this.vehicleInputDisplay.set(`${v.regNo} - ${v.manufacturer} ${v.name}`);
    this.isVehicleDropdownOpen.set(false);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  clearVehicleFilter() {
    this.vehicleFilter.set('all');
    this.vehicleInputDisplay.set('');
    this.isVehicleDropdownOpen.set(false);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  // Status & Payment Filter Toggles
  setStatusFilter(status: BookingStatus | 'all') {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  setPaymentStatusFilter(status: 'all' | 'settled' | 'pending') {
    this.paymentStatusFilter.set(status);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  onSearchChange(text: string) {
    this.searchQuery.set(text);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  resetFilters() {
    this.periodType.set('monthly');
    this.selectedMonth.set(new Date().getMonth() + 1);
    this.selectedYear.set(new Date().getFullYear());
    this.fromDateFilter.set(null);
    this.toDateFilter.set(null);
    this.vehicleFilter.set('all');
    this.vehicleInputDisplay.set('');
    this.statusFilter.set('all');
    this.paymentStatusFilter.set('all');
    this.depositFilter.set('all');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.fetchReportData();
    toast.info('Filters Reset', { description: 'Reverted to current month report.' });
  }

  // Pagination Handlers
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.fetchReportData();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.fetchReportData();
  }

  // Export Downloads
  async downloadPdf() {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    toast.loading('Preparing PDF report...', { id: 'report-export' });

    try {
      // Fetch full matching dataset for export
      const fullFilter: IRRStatusReportFilter = {
        periodType: this.periodType(),
        month: this.selectedMonth(),
        year: this.selectedYear(),
        from: this.fromDateFilter() ? formatToIndianDate(this.fromDateFilter()) : undefined,
        to: this.toDateFilter() ? formatToIndianDate(this.toDateFilter()) : undefined,
        vehicleRegNo: this.vehicleFilter() !== 'all' ? this.vehicleFilter() : undefined,
        status: this.statusFilter(),
        paymentStatus: this.paymentStatusFilter(),
        depositType: this.depositFilter(),
        search: this.searchQuery().trim() || undefined,
        page: 1,
        limit: 1000,
      };

      const res = await this.rrApi.getStatusReport(fullFilter);
      const dataset = res && res.bookings ? res.bookings : this.bookings();
      const summaryData = res && res.summary ? res.summary : this.summary();

      this.reportExport.exportToPdf(dataset, summaryData, fullFilter, this.filterLabel());
      toast.success('PDF Report Downloaded', {
        id: 'report-export',
        description: `Exported ${dataset.length} records in DD-MM-YYYY format.`,
      });
    } catch {
      toast.error('PDF Export Failed', { id: 'report-export' });
    } finally {
      this.isExporting.set(false);
    }
  }

  async downloadCsv() {
    if (this.isExporting()) return;
    this.isExporting.set(true);
    toast.loading('Preparing CSV export...', { id: 'report-export' });

    try {
      const fullFilter: IRRStatusReportFilter = {
        periodType: this.periodType(),
        month: this.selectedMonth(),
        year: this.selectedYear(),
        from: this.fromDateFilter() ? formatToIndianDate(this.fromDateFilter()) : undefined,
        to: this.toDateFilter() ? formatToIndianDate(this.toDateFilter()) : undefined,
        vehicleRegNo: this.vehicleFilter() !== 'all' ? this.vehicleFilter() : undefined,
        status: this.statusFilter(),
        paymentStatus: this.paymentStatusFilter(),
        depositType: this.depositFilter(),
        search: this.searchQuery().trim() || undefined,
        page: 1,
        limit: 1000,
      };

      const res = await this.rrApi.getStatusReport(fullFilter);
      const dataset = res && res.bookings ? res.bookings : this.bookings();
      const summaryData = res && res.summary ? res.summary : this.summary();

      this.reportExport.exportToCsv(dataset, summaryData, fullFilter, this.filterLabel());
      toast.success('CSV Report Downloaded', {
        id: 'report-export',
        description: `Exported ${dataset.length} records.`,
      });
    } catch {
      toast.error('CSV Export Failed', { id: 'report-export' });
    } finally {
      this.isExporting.set(false);
    }
  }

  getVehicleMileage(b: IBooking): string {
    const start = parseFloat(String(b.vehicleOdometerStart || '0')) || 0;
    const end = parseFloat(String(b.vehicleOdometerEnd || '0')) || 0;
    if (end > start) {
      return `${end - start} KM`;
    }
    return '—';
  }
}
