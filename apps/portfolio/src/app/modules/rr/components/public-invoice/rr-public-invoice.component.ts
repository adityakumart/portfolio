import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCar,
  lucideClock,
  lucideCheckCircle2,
  lucideAlertTriangle,
  lucideDownload,
  lucidePrinter,
  lucidePhone,
  lucideFileText,
  lucideArrowLeft,
  lucideShieldAlert,
} from '@ng-icons/lucide';
import { IBooking } from '@portfolio/shared-types';
import { RRApiService } from '../../services/rr-api.service';
import { RRInvoicePdfService } from '../../services/rr-invoice-pdf.service';
import { IndianDatePipe } from '../../../../shared/pipes/indian-date.pipe';
import { AadharVisiblePipe } from '../../shared/utils/aadhar-mask.util';

@Component({
  selector: 'app-rr-public-invoice',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIconComponent,
    IndianDatePipe,
    AadharVisiblePipe,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucideClock,
      lucideCheckCircle2,
      lucideAlertTriangle,
      lucideDownload,
      lucidePrinter,
      lucidePhone,
      lucideFileText,
      lucideArrowLeft,
      lucideShieldAlert,
    }),
  ],
  templateUrl: './rr-public-invoice.component.html',
})
export class RRPublicInvoiceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private rrApi = inject(RRApiService);
  private invoicePdfService = inject(RRInvoicePdfService);

  isLoading = signal(true);
  isExpired = signal(false);
  errorMessage = signal<string>('');
  booking = signal<IBooking | null>(null);
  company = signal<{ name: string; supportPhone: string; depotAddress: string }>({
    name: 'RoadReady Car Rentals',
    supportPhone: '+91 98765 43210',
    depotAddress: 'Main Depot',
  });

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.isLoading.set(false);
      this.errorMessage.set('No invoice token provided in the link.');
      return;
    }
    this.fetchInvoice(token);
  }

  async fetchInvoice(token: string) {
    this.isLoading.set(true);
    try {
      const res = await this.rrApi.getPublicInvoice(token);
      if (res?.booking) {
        this.booking.set(res.booking);
        if (res.company) {
          this.company.set(res.company);
        }
      }
    } catch (err: any) {
      if (err.status === 410 || err.error?.expired) {
        this.isExpired.set(true);
        this.errorMessage.set(
          err.error?.message ||
            'This invoice link has expired. Digital invoice links are active for 24 hours only for security reasons. Please contact RoadReady support to request a fresh copy.'
        );
      } else {
        this.errorMessage.set(err.error?.message || 'Unable to retrieve invoice. The link may be invalid.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async downloadPdf() {
    const b = this.booking();
    if (b) {
      await this.invoicePdfService.downloadInvoicePdf(b);
    }
  }

  async printPdf() {
    const b = this.booking();
    if (b) {
      await this.invoicePdfService.printInvoicePdf(b);
    }
  }

  num(val: unknown): number {
    return Number(val) || 0;
  }
}
