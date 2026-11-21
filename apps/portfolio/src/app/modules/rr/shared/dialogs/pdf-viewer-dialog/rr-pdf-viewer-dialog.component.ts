import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFileText,
  lucideDownload,
  lucideExternalLink,
  lucideX,
  lucideShieldCheck,
  lucidePrinter,
  lucideSend,
  lucideChevronDown,
  lucideSmartphone,
  lucideXCircle,
  lucideCopy,
  lucideCheck,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import { IBooking } from '@portfolio/shared-types';
import { RRApiService } from '../../../services/rr-api.service';

export interface RRPdfViewerDialogContext {
  title: string;
  fileName: string;
  blobUrl: string;
  booking?: Partial<IBooking>;
}

@Component({
  selector: 'app-rr-pdf-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideFileText,
      lucideDownload,
      lucideExternalLink,
      lucideX,
      lucideShieldCheck,
      lucidePrinter,
      lucideSend,
      lucideChevronDown,
      lucideSmartphone,
      lucideXCircle,
      lucideCopy,
      lucideCheck,
    }),
  ],
  template: `
    <div class="p-4 sm:p-5 bg-card text-card-foreground rounded-2xl border border-border shadow-2xl flex flex-col w-full h-[90vh] max-w-5xl overflow-hidden relative">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border/70 shrink-0">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ng-icon class="text-lg" name="lucideFileText"></ng-icon>
          </div>
          <div class="truncate">
            <div class="flex items-center gap-2">
              <h2 class="text-sm sm:text-base font-bold text-foreground truncate">{{ data.title }}</h2>
              <span hlmBadge variant="secondary" class="text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2 bg-muted text-muted-foreground border border-border/50">
                Tax Invoice
              </span>
            </div>
            <p class="text-xs text-muted-foreground truncate">{{ data.fileName }}</p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Send Invoice Options Dropdown -->
          @if (data.booking) {
            <div class="relative">
              <button
                hlmBtn
                size="sm"
                class="h-8 px-2.5 sm:px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                (click)="toggleSendInvoiceDropdown()"
              >
                <ng-icon name="lucideSend" class="text-xs"></ng-icon>
                <span>Send Invoice Options</span>
                <ng-icon name="lucideChevronDown" class="text-xs"></ng-icon>
              </button>

              @if (isSendInvoiceOpen()) {
                <div
                  class="fixed inset-0 z-40"
                  (click)="isSendInvoiceOpen.set(false)"
                ></div>
                <div
                  class="absolute right-0 mt-1 w-64 rounded-xl bg-card border border-border shadow-2xl z-50 py-1.5 text-xs text-foreground overflow-hidden"
                >
                  <!-- Option 1: Print -->
                  <button
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors font-medium cursor-pointer"
                    (click)="printInvoice()"
                  >
                    <div class="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ng-icon name="lucidePrinter" class="text-sm"></ng-icon>
                    </div>
                    <div>
                      <span class="block text-foreground font-bold">Print</span>
                      <span class="text-[10px] text-muted-foreground">Print invoice document directly</span>
                    </div>
                  </button>

                  <!-- Option 2: Send Digital Invoice -->
                  <button
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors font-medium border-t border-border/50 cursor-pointer"
                    (click)="openSendDigitalInvoice()"
                  >
                    <div class="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ng-icon name="lucideSmartphone" class="text-sm"></ng-icon>
                    </div>
                    <div>
                      <span class="block text-foreground font-bold">Send Digital Invoice</span>
                      <span class="text-[10px] text-muted-foreground">Download link to customer via SMS or WhatsApp</span>
                    </div>
                  </button>

                  <!-- Option 3: Not Required -->
                  <button
                    type="button"
                    class="w-full text-left px-3.5 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors font-medium border-t border-border/50 text-muted-foreground hover:text-foreground cursor-pointer"
                    (click)="selectNotRequired()"
                  >
                    <div class="h-7 w-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <ng-icon name="lucideXCircle" class="text-sm"></ng-icon>
                    </div>
                    <div>
                      <span class="block font-bold">Not Required</span>
                      <span class="text-[10px] text-muted-foreground">Sending or printing not required</span>
                    </div>
                  </button>
                </div>
              }
            </div>
          }

          <button
            hlmBtn
            size="sm"
            variant="outline"
            class="h-8 px-2.5 text-xs font-semibold gap-1.5 hidden sm:inline-flex cursor-pointer"
            (click)="openInNewTab()"
            title="Open in new window"
          >
            <ng-icon name="lucideExternalLink" class="text-xs"></ng-icon>
            <span>Pop Out</span>
          </button>

          <button
            hlmBtn
            size="sm"
            class="h-8 px-3 text-xs font-semibold gap-1.5 bg-muted hover:bg-muted/80 text-foreground shadow-sm cursor-pointer"
            (click)="download()"
            title="Download PDF"
          >
            <ng-icon name="lucideDownload" class="text-xs"></ng-icon>
            <span>Download</span>
          </button>

          <button
            hlmBtn
            size="icon"
            variant="ghost"
            class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            (click)="dialogRef?.close()"
            aria-label="Close dialog"
          >
            <ng-icon name="lucideX" class="text-sm"></ng-icon>
          </button>
        </div>
      </div>

      <!-- PDF Viewer Frame -->
      <div class="flex-1 w-full mt-3 overflow-hidden rounded-xl border border-border/60 bg-muted/20 relative">
        <iframe
          [src]="safeUrl"
          class="w-full h-full border-0 rounded-xl"
          title="PDF Document Viewer"
        ></iframe>
      </div>

      <!-- Modal: Send Digital Invoice -->
      @if (isDigitalModalOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          (click)="closeDigitalModal()"
        >
          <div
            class="relative w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-2xl p-5 space-y-4"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ng-icon name="lucideSmartphone" class="text-base"></ng-icon>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-foreground">Send Digital Invoice</h3>
                  <p class="text-[11px] text-muted-foreground">Share invoice download link to customer</p>
                </div>
              </div>
              <button
                type="button"
                (click)="closeDigitalModal()"
                class="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              >
                <ng-icon name="lucideX" class="text-sm"></ng-icon>
              </button>
            </div>

            <!-- Customer Details Card -->
            <div class="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Customer:</span>
                <span class="font-bold text-foreground">{{ customerName() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Mobile Number:</span>
                <span class="font-mono font-bold text-foreground">{{ customerPhone() || 'Not available' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Invoice ID:</span>
                <span class="font-mono font-semibold text-primary">INV-{{ data.booking?.id }}</span>
              </div>
            </div>

            <!-- Download Link Box -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground block">Digital Invoice Download Link:</label>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  [value]="invoiceDownloadLink()"
                  readonly
                  class="flex-1 h-8 px-2.5 text-xs font-mono bg-muted/40 border border-border rounded-lg text-foreground truncate"
                />
                <button
                  type="button"
                  hlmBtn
                  size="sm"
                  variant="outline"
                  (click)="copyInvoiceLink()"
                  class="h-8 text-xs font-semibold shrink-0 gap-1 cursor-pointer"
                >
                  <ng-icon [name]="isCopied() ? 'lucideCheck' : 'lucideCopy'" class="text-xs"></ng-icon>
                  <span>{{ isCopied() ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>

            <!-- Note Banner -->
            <div class="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground flex items-start gap-2">
              <ng-icon name="lucideShieldCheck" class="text-sm text-primary shrink-0 mt-0.5"></ng-icon>
              <div>
                <span class="font-semibold text-foreground">Signature Note Added:</span>
                <span> "(this is an Digitally generated receipt, if required customer signed visit Branch)". Customer signature marked as "Not required".</span>
              </div>
            </div>

            <!-- Dispatch Action Buttons -->
            <div class="space-y-2 pt-1">
              <button
                type="button"
                hlmBtn
                class="w-full h-9 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center cursor-pointer"
                [disabled]="isSendingWhatsApp() || !customerPhone()"
                (click)="sendViaWhatsApp()"
              >
                <ng-icon name="lucideSend" class="text-sm"></ng-icon>
                <span>{{ isSendingWhatsApp() ? 'Sending via WhatsApp...' : 'Send to Customer WhatsApp' }}</span>
              </button>

              <button
                type="button"
                hlmBtn
                variant="outline"
                class="w-full h-9 text-xs font-semibold gap-2 border-border flex items-center justify-center hover:bg-muted cursor-pointer"
                [disabled]="!customerPhone()"
                (click)="sendViaSms()"
              >
                <ng-icon name="lucideSmartphone" class="text-sm"></ng-icon>
                <span>Send to Customer Mobile via SMS</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RRPdfViewerDialogComponent implements OnInit, OnDestroy {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<RRPdfViewerDialogContext>({ optional: true }) || {
    title: 'Document Preview',
    fileName: 'document.pdf',
    blobUrl: '',
  };

  private sanitizer = inject(DomSanitizer);
  private rrApi = inject(RRApiService);
  safeUrl!: SafeResourceUrl;

  isSendInvoiceOpen = signal<boolean>(false);
  isDigitalModalOpen = signal<boolean>(false);
  isSendingWhatsApp = signal<boolean>(false);
  isCopied = signal<boolean>(false);
  directWhatsAppUrl = signal<string>('');
  compiledSmsText = signal<string>('');

  customerPhone = computed(() => this.data.booking?.renterPhone || '');
  customerName = computed(
    () =>
      `${this.data.booking?.renterFirstName || ''} ${this.data.booking?.renterSecondName || ''}`.trim() ||
      'Valued Customer',
  );

  invoiceDownloadLink = computed(() => {
    const id = this.data.booking?.id || '';
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/user/rr/invoice/${id}`;
    }
    return `/user/rr/invoice/${id}`;
  });

  ngOnInit(): void {
    if (this.data.blobUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.blobUrl);
    }
  }

  toggleSendInvoiceDropdown(): void {
    this.isSendInvoiceOpen.update((v) => !v);
  }

  printInvoice(): void {
    this.isSendInvoiceOpen.set(false);
    const iframe = document.querySelector('iframe[title="PDF Document Viewer"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      } catch (err) {
        console.warn('Iframe print error, falling back to window:', err);
      }
    }
    if (this.data.blobUrl) {
      window.open(this.data.blobUrl, '_blank')?.print();
    }
  }

  async openSendDigitalInvoice(): Promise<void> {
    this.isSendInvoiceOpen.set(false);
    this.isDigitalModalOpen.set(true);

    const b = this.data.booking;
    if (!b?.id) return;

    try {
      const res = await this.rrApi.getWhatsAppPreview(b.id, 'end_booking_invoice');
      if (res && res.success) {
        this.directWhatsAppUrl.set(res.directWhatsAppUrl || '');
        this.compiledSmsText.set(res.compiledText || '');
      }
    } catch {
      // Fallback message text if preview API fails
      const link = this.invoiceDownloadLink();
      const msg = `Dear ${this.customerName()}, your tax invoice INV-${b.id} is generated. Download link: ${link}\n(Note: This is a digitally generated receipt, if customer signed copy required visit branch).`;
      this.compiledSmsText.set(msg);
      const cleanPhone = (b.renterPhone || '').replace(/\D/g, '');
      this.directWhatsAppUrl.set(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`);
    }
  }

  selectNotRequired(): void {
    this.isSendInvoiceOpen.set(false);
    toast.info('Invoice sending/printing marked as Not Required.');
  }

  closeDigitalModal(): void {
    this.isDigitalModalOpen.set(false);
  }

  async sendViaWhatsApp(): Promise<void> {
    const b = this.data.booking;
    if (!b?.id) return;

    this.isSendingWhatsApp.set(true);
    try {
      await this.rrApi.sendWhatsAppNotification(b.id, 'end_booking_invoice');
      toast.success('Digital invoice download link dispatched via WhatsApp!');
    } catch {
      if (this.directWhatsAppUrl()) {
        window.open(this.directWhatsAppUrl(), '_blank');
        toast.info('Opened WhatsApp chat with digital invoice link.');
      } else {
        toast.error('Could not dispatch via WhatsApp.');
      }
    } finally {
      this.isSendingWhatsApp.set(false);
    }
  }

  sendViaSms(): void {
    const b = this.data.booking;
    const phone = (b?.renterPhone || '').replace(/\D/g, '');
    const text = this.compiledSmsText() || `Your rental tax invoice is ready at: ${this.invoiceDownloadLink()}`;
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(text)}`;
    window.open(smsUrl, '_blank');
    navigator.clipboard.writeText(text);
    toast.success('SMS app opened & message copied to clipboard!');
  }

  copyInvoiceLink(): void {
    const link = this.invoiceDownloadLink();
    navigator.clipboard.writeText(link);
    this.isCopied.set(true);
    toast.success('Digital invoice download link copied to clipboard!');
    setTimeout(() => this.isCopied.set(false), 2500);
  }

  download(): void {
    if (!this.data.blobUrl) return;
    const link = document.createElement('a');
    link.href = this.data.blobUrl;
    link.download = this.data.fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openInNewTab(): void {
    if (!this.data.blobUrl) return;
    window.open(this.data.blobUrl, '_blank');
  }

  ngOnDestroy(): void {
    if (this.data.blobUrl) {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(this.data.blobUrl);
        } catch {}
      }, 5000);
    }
  }
}
