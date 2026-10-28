import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideSend,
  lucideExternalLink,
  lucideCopy,
  lucideRefreshCw,
  lucideCheck,
  lucideMessageSquare,
  lucidePhone,
  lucideCar,
  lucideAlertCircle,
  lucideClock,
  lucideReceipt,
  lucideCalendarClock,
  lucideAlertTriangle,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking, IRRWhatsAppTemplateId, IRRWhatsAppTemplate } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';

export interface WhatsAppPreviewDialogContext {
  booking: IBooking;
  templateType?: IRRWhatsAppTemplateId;
}

@Component({
  selector: 'app-rr-whatsapp-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideX,
      lucideSend,
      lucideExternalLink,
      lucideCopy,
      lucideRefreshCw,
      lucideCheck,
      lucideMessageSquare,
      lucidePhone,
      lucideCar,
      lucideAlertCircle,
      lucideClock,
      lucideReceipt,
      lucideCalendarClock,
      lucideAlertTriangle,
    }),
  ],
  templateUrl: './rr-whatsapp-preview-dialog.component.html',
})
export class RRWhatsAppPreviewDialogComponent implements OnInit {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<WhatsAppPreviewDialogContext>({ optional: true });
  private rrApi = inject(RRApiService);

  booking!: IBooking;
  selectedTemplate = signal<IRRWhatsAppTemplateId>('active_reminder');
  customText = signal<string>('');
  directWhatsAppUrl = signal<string>('');
  recipientPhone = signal<string>('');
  customerName = signal<string>('');
  provider = signal<string>('manual_only');
  invoiceLink = signal<string | undefined>(undefined);

  isLoading = signal<boolean>(true);
  isSending = signal<boolean>(false);
  copied = signal<boolean>(false);

  readonly availableTemplates: { id: IRRWhatsAppTemplateId; label: string; icon: string }[] = [
    { id: 'active_reminder', label: 'Return Reminder (4h)', icon: 'lucideClock' },
    { id: 'pending_payment', label: 'Pending Dues Reminder', icon: 'lucideAlertTriangle' },
    { id: 'reserve_intimation', label: 'Reserve Intimation (Pickup)', icon: 'lucideCalendarClock' },
    { id: 'new_booking', label: 'New Booking Confirmation', icon: 'lucideCar' },
    { id: 'reserve_booking', label: 'Advance Reservation', icon: 'lucideCalendarClock' },
    { id: 'end_booking_invoice', label: 'Tax Invoice (24h Link)', icon: 'lucideReceipt' },
  ];

  ngOnInit() {
    if (this.data?.booking) {
      this.booking = this.data.booking;
      if (this.data.templateType) {
        this.selectedTemplate.set(this.data.templateType);
      } else if (this.booking.status === 'reserved') {
        this.selectedTemplate.set('reserve_intimation');
      } else if (parseFloat(this.booking.pendingAmount || '0') > 0) {
        this.selectedTemplate.set('pending_payment');
      } else {
        this.selectedTemplate.set('active_reminder');
      }
      this.loadPreview();
    }
  }

  async onTemplateChange(newType: IRRWhatsAppTemplateId) {
    this.selectedTemplate.set(newType);
    await this.loadPreview();
  }

  async loadPreview() {
    this.isLoading.set(true);
    try {
      const res = await this.rrApi.getWhatsAppPreview(this.booking.id, this.selectedTemplate());
      if (res.success) {
        this.customText.set(res.compiledText);
        this.directWhatsAppUrl.set(res.directWhatsAppUrl);
        this.recipientPhone.set(res.phone);
        this.customerName.set(res.customerName);
        this.provider.set(res.provider);
        this.invoiceLink.set(res.invoiceLink);
      }
    } catch (err: any) {
      toast.error('Could not compile WhatsApp message preview: ' + (err.error?.message || err.message));
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendViaApi() {
    if (!this.booking?.id) return;
    this.isSending.set(true);
    try {
      const res = await this.rrApi.sendWhatsAppNotification(
        this.booking.id,
        this.selectedTemplate(),
        this.customText()
      );

      if (res.success) {
        toast.success(`WhatsApp message sent successfully via ${res.provider}!`);
        this.dialogRef?.close({ success: true, message: res.message });
      } else {
        toast.error(`Message dispatch failed: ${res.error || res.message}`);
      }
    } catch (err: any) {
      toast.error('Error sending WhatsApp notification: ' + (err.error?.message || err.message));
    } finally {
      this.isSending.set(false);
    }
  }

  openWhatsAppWeb() {
    const url = this.directWhatsAppUrl();
    if (url) {
      window.open(url, '_blank');
      toast.success('Opening WhatsApp in a new tab...');
      this.dialogRef?.close({ success: true, method: 'manual' });
    }
  }

  copyText() {
    if (!this.customText()) return;
    navigator.clipboard.writeText(this.customText()).then(() => {
      this.copied.set(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  close() {
    this.dialogRef?.close();
  }
}
