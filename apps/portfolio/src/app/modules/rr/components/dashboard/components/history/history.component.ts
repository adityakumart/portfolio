import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRApiService } from '../../../../services/rr-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { IBooking } from '@portfolio/shared-types';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { lucideHistory, lucideInbox, lucideFileText } from '@ng-icons/lucide';
import { RRInvoicePdfService } from '../../../../services/rr-invoice-pdf.service';

@Component({
  selector: 'app-rr-history',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmTableImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTooltipImports,
  ],
  providers: [provideIcons({ lucideHistory, lucideInbox, lucideFileText })],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class RRHistoryComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private invoicePdf = inject(RRInvoicePdfService);

  bookings = signal<IBooking[]>([]);

  historyBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'completed' || b.status === 'cancelled')
  );

  ngOnInit() {
    this.loadBookings();
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  exportBookingPdf(b: IBooking) {
    this.invoicePdf.printAgreementPdf(b);
  }
}
