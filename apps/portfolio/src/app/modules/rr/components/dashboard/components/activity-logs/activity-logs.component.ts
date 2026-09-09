import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideEraser,
  lucideAlertCircle,
  lucideShieldAlert,
  lucideClock,
  lucideCalendar,
  lucideRefreshCw,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideUser,
  lucideFilter,
  lucideCalendarDays,
  lucideActivity,
} from '@ng-icons/lucide';
import { ILog } from '@portfolio/shared-types';

export type LogRangePreset = 'last_week' | 'last_month' | 'last_quarter' | 'last_year' | 'custom';

@Component({
  selector: 'app-rr-activity-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmInputImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmTableImports,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideEraser,
      lucideAlertCircle,
      lucideShieldAlert,
      lucideClock,
      lucideCalendar,
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucideUser,
      lucideFilter,
      lucideCalendarDays,
      lucideActivity,
    }),
  ],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss',
})
export class RRActivityLogsComponent implements OnInit {
  private rrApi = inject(RRApiService);

  logs = signal<ILog[]>([]);
  totalLogs = signal<number>(0);
  currentPage = signal<number>(1);
  pageSize = signal<number>(15);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(false);

  selectedRange = signal<LogRangePreset>('last_week');
  logFilterFrom = '';
  logFilterTo = '';
  searchQuery = '';

  showingStart = computed(() => {
    if (this.totalLogs() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalLogs());
  });

  ngOnInit() {
    this.applyPresetDates('last_week');
    this.loadActivityLogs();
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  applyPresetDates(preset: LogRangePreset) {
    const now = new Date();
    this.logFilterTo = this.formatDate(now);

    if (preset === 'last_week') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      this.logFilterFrom = this.formatDate(past);
    } else if (preset === 'last_month') {
      const past = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      this.logFilterFrom = this.formatDate(past);
    } else if (preset === 'last_quarter') {
      const past = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      this.logFilterFrom = this.formatDate(past);
    } else if (preset === 'last_year') {
      const past = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      this.logFilterFrom = this.formatDate(past);
    }
  }

  onRangeChange() {
    const preset = this.selectedRange();
    if (preset !== 'custom') {
      this.applyPresetDates(preset);
      this.currentPage.set(1);
      this.loadActivityLogs();
    }
  }

  applyCustomRange() {
    this.currentPage.set(1);
    this.loadActivityLogs();
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadActivityLogs();
  }

  clearFilters() {
    this.selectedRange.set('last_week');
    this.applyPresetDates('last_week');
    this.searchQuery = '';
    this.currentPage.set(1);
    this.loadActivityLogs();
  }

  async loadActivityLogs() {
    this.isLoading.set(true);
    try {
      const res = await this.rrApi.getLogs({
        from: this.logFilterFrom || undefined,
        to: this.logFilterTo || undefined,
        page: this.currentPage(),
        limit: this.pageSize(),
        search: this.searchQuery.trim() || undefined,
      });

      this.logs.set(res?.logs || []);
      this.totalLogs.set(res?.total || 0);
      this.totalPages.set(res?.totalPages || 1);
    } catch (e) {
      console.error('Error loading activity logs:', e);
      this.logs.set([]);
      this.totalLogs.set(0);
      this.totalPages.set(1);
    } finally {
      this.isLoading.set(false);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadActivityLogs();
    }
  }

  firstPage() {
    if (this.currentPage() > 1) {
      this.goToPage(1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  lastPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.totalPages());
    }
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10) || 15;
    this.pageSize.set(newSize);
    this.currentPage.set(1);
    this.loadActivityLogs();
  }
}
