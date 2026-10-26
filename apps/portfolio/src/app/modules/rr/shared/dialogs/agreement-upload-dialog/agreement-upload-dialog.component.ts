import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideUpload,
  lucideTrash2,
  lucideImage,
  lucideCheck,
  lucidePrinter,
  lucidePaperclip,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { RRApiService } from '../../../services/rr-api.service';
import { toast } from '@spartan-ng/hel/sonner';

export interface AgreementUploadItem {
  name: string;
  url: string;
  type?: string;
  size?: number;
}

export interface AgreementUploadDialogContext {
  title: string;
  fileName: string;
  blobUrl: string;
  signedAgreementUrl?: string | null;
  attachments?: AgreementUploadItem[];
}

export interface AgreementUploadDialogResult {
  signedAgreementUrl: string | null;
  attachments: AgreementUploadItem[];
}

@Component({
  selector: 'app-rr-agreement-upload-dialog',
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
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideUpload,
      lucideTrash2,
      lucideImage,
      lucideCheck,
      lucidePrinter,
      lucidePaperclip,
      lucideRefreshCw,
    }),
  ],
  template: `
    <div class="p-4 sm:p-6 bg-card text-card-foreground rounded-2xl border border-border shadow-2xl flex flex-col w-full h-[92vh] max-w-5xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border/70 shrink-0">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ng-icon class="text-xl" name="lucideFileText"></ng-icon>
          </div>
          <div class="truncate">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-base sm:text-lg font-bold text-foreground truncate">Rental Agreement & Attachments</h2>
              <span hlmBadge variant="outline" class="text-[10px] font-semibold uppercase tracking-wider py-0.5 px-2 bg-primary/10 text-primary border-primary/30">
                Documentation Step
              </span>
            </div>
            <p class="text-xs text-muted-foreground truncate">{{ data.fileName }}</p>
          </div>
        </div>

        <!-- Action / Close -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            hlmBtn
            size="icon"
            variant="ghost"
            class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            (click)="onCancel()"
            aria-label="Close dialog"
          >
            <ng-icon name="lucideX" class="text-sm"></ng-icon>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Draft Agreement vs Signed Agreement & Attachments) -->
      <div class="flex items-center gap-2 pt-3 pb-2 border-b border-border/40 shrink-0">
        <button
          type="button"
          (click)="activeTab.set('draft')"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          [ngClass]="activeTab() === 'draft' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'"
        >
          <ng-icon name="lucideFileText" class="text-sm"></ng-icon>
          <span>1. Draft Agreement (PDF)</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('signed')"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative"
          [ngClass]="activeTab() === 'signed' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/60 text-muted-foreground hover:bg-muted'"
        >
          <ng-icon name="lucideUpload" class="text-sm"></ng-icon>
          <span>2. Signed Agreement & Attachments</span>
          @if (signedAgreementUrl() && attachments().length > 0) {
            <span class="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white text-[9px] font-black">
              ✓
            </span>
          }
        </button>
      </div>

      <!-- Main Body: Content changes by active tab -->
      <div class="flex-1 min-h-0 pt-3 flex flex-col overflow-hidden">
        <!-- TAB 1: DRAFT AGREEMENT PREVIEW -->
        @if (activeTab() === 'draft') {
          <div class="flex flex-col h-full overflow-hidden">
            <!-- Draft Controls Bar -->
            <div class="flex items-center justify-between gap-2 pb-2 shrink-0 flex-wrap">
              <div class="text-xs text-muted-foreground flex items-center gap-1.5">
                <span class="font-semibold text-foreground">Draft Document:</span>
                <span>Review terms, print or download for customer signature.</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  hlmBtn
                  size="sm"
                  variant="outline"
                  class="h-8 px-2.5 text-xs font-semibold gap-1.5"
                  (click)="openInNewTab()"
                  title="Open in new window"
                >
                  <ng-icon name="lucideExternalLink" class="text-xs"></ng-icon>
                  <span>Pop Out</span>
                </button>
                <button
                  hlmBtn
                  size="sm"
                  variant="outline"
                  class="h-8 px-2.5 text-xs font-semibold gap-1.5"
                  (click)="printPdf()"
                  title="Print Draft Agreement"
                >
                  <ng-icon name="lucidePrinter" class="text-xs"></ng-icon>
                  <span>Print</span>
                </button>
                <button
                  hlmBtn
                  size="sm"
                  class="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                  (click)="downloadPdf()"
                  title="Download Draft Agreement"
                >
                  <ng-icon name="lucideDownload" class="text-xs"></ng-icon>
                  <span>Download Draft</span>
                </button>
              </div>
            </div>

            <!-- PDF Viewer Frame -->
            <div class="flex-1 w-full overflow-hidden rounded-xl border border-border/60 bg-muted/20 relative">
              @if (safeUrl) {
                <iframe
                  [src]="safeUrl"
                  class="w-full h-full border-0 rounded-xl"
                  title="Draft Agreement Viewer"
                ></iframe>
              } @else {
                <div class="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Generating draft agreement preview...
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 2: SIGNED AGREEMENT & ATTACHMENTS UPLOAD -->
        @if (activeTab() === 'signed') {
          <div class="flex-1 overflow-y-auto space-y-5 pr-1">
            <!-- Documentation Banner -->
            <div class="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-start gap-2.5">
              <ng-icon name="lucidePaperclip" class="text-base text-primary shrink-0 mt-0.5"></ng-icon>
              <div>
                <span class="font-bold">Required Documents for Booking Finalization:</span>
                <p class="text-muted-foreground mt-0.5">
                  1. Upload the physically signed agreement document (PDF or Photo).<br />
                  2. Upload attachments (Aadhaar/DL copy, customer photo, vehicle pre-trip images).
                </p>
              </div>
            </div>

            <!-- 1. SIGNED AGREEMENT DOCUMENT -->
            <div class="p-4 rounded-xl border border-border bg-card/60 space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideFileText" class="text-primary"></ng-icon>
                    <span>1. Signed Rental Agreement Document</span>
                  </h3>
                  @if (signedAgreementUrl()) {
                    <span hlmBadge variant="outline" class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold">
                      Uploaded
                    </span>
                  } @else {
                    <span hlmBadge variant="outline" class="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold">
                      Mandatory
                    </span>
                  }
                </div>
              </div>

              @if (signedAgreementUrl()) {
                <div class="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-3">
                    <div class="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ng-icon name="lucideCheckCircle2" class="text-lg"></ng-icon>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-foreground">Signed Agreement Document Attached</div>
                      <a [href]="signedAgreementUrl()" target="_blank" class="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
                        <span>View uploaded agreement</span>
                        <ng-icon name="lucideExternalLink" class="text-[10px]"></ng-icon>
                      </a>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      hlmBtn
                      variant="outline"
                      size="sm"
                      class="h-8 text-xs text-destructive hover:bg-destructive/10"
                      (click)="removeSignedAgreement()"
                    >
                      <ng-icon name="lucideTrash2" class="mr-1 text-xs"></ng-icon>
                      Remove / Replace
                    </button>
                  </div>
                </div>
              } @else {
                <div class="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/20 transition-colors">
                  <input
                    type="file"
                    id="signedAgreementFileInput"
                    (change)="onSignedAgreementFileSelected($event)"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    class="hidden"
                  />
                  <label for="signedAgreementFileInput" class="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div class="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      @if (isUploadingSigned()) {
                        <ng-icon name="lucideRefreshCw" class="text-lg animate-spin"></ng-icon>
                      } @else {
                        <ng-icon name="lucideUpload" class="text-lg"></ng-icon>
                      }
                    </div>
                    <span class="text-xs font-bold text-foreground">
                      {{ isUploadingSigned() ? 'Uploading signed document...' : 'Click to Upload Signed Agreement' }}
                    </span>
                    <span class="text-[11px] text-muted-foreground">PDF or high-res photo (PNG, JPG, WEBP)</span>
                  </label>
                </div>
              }
            </div>

            <!-- 2. ATTACHMENT IMAGES -->
            <div class="p-4 rounded-xl border border-border bg-card/60 space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ng-icon name="lucideImage" class="text-primary"></ng-icon>
                    <span>2. Supporting Attachment Images</span>
                  </h3>
                  <span hlmBadge variant="outline" class="text-[10px] font-bold" [ngClass]="attachments().length > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'">
                    {{ attachments().length }} Uploaded
                  </span>
                </div>
              </div>

              <!-- Upload Drag-Drop Box -->
              <div class="border-2 border-dashed border-border rounded-xl p-5 text-center hover:bg-muted/20 transition-colors">
                <input
                  type="file"
                  id="attachmentFilesInput"
                  multiple
                  (change)="onAttachmentsSelected($event)"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  class="hidden"
                />
                <label for="attachmentFilesInput" class="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                  <div class="h-9 w-9 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    @if (isUploadingAttachments()) {
                      <ng-icon name="lucideRefreshCw" class="text-base animate-spin"></ng-icon>
                    } @else {
                      <ng-icon name="lucideUpload" class="text-base"></ng-icon>
                    }
                  </div>
                  <span class="text-xs font-bold text-foreground">
                    {{ isUploadingAttachments() ? 'Uploading attachments...' : 'Add Attachment Images / KYC Proofs' }}
                  </span>
                  <span class="text-[11px] text-muted-foreground">Upload photos of Customer ID, DL, Customer, or Vehicle</span>
                </label>
              </div>

              <!-- Attachment Preview Grid -->
              @if (attachments().length > 0) {
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                  @for (att of attachments(); track att.url; let idx = $index) {
                    <div class="relative group rounded-xl border border-border overflow-hidden bg-card/80 flex flex-col">
                      <div class="aspect-video bg-muted/40 relative overflow-hidden flex items-center justify-center">
                        @if (att.url.endsWith('.pdf')) {
                          <ng-icon name="lucideFileText" class="text-2xl text-primary"></ng-icon>
                        } @else {
                          <img [src]="att.url" [alt]="att.name" class="w-full h-full object-cover" />
                        }
                        <button
                          type="button"
                          (click)="removeAttachment(idx)"
                          class="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-90 hover:opacity-100 flex items-center justify-center text-xs shadow-md transition-opacity"
                          title="Delete attachment"
                        >
                          <ng-icon name="lucideTrash2" class="text-[11px]"></ng-icon>
                        </button>
                      </div>
                      <div class="p-2 text-[10px] truncate font-medium text-foreground" [title]="att.name">
                        {{ att.name }}
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Fixed Footer -->
      <div class="shrink-0 pt-3 border-t border-border flex items-center justify-between gap-3 flex-wrap">
        <div class="text-xs text-muted-foreground flex items-center gap-2">
          @if (signedAgreementUrl() && attachments().length > 0) {
            <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <ng-icon name="lucideCheckCircle2" class="text-sm"></ng-icon>
              <span>Agreement and Attachments verified. Ready to create booking.</span>
            </span>
          } @else {
            <span class="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <ng-icon name="lucideAlertCircle" class="text-sm"></ng-icon>
              <span>Please upload signed agreement document and at least 1 attachment image.</span>
            </span>
          }
        </div>

        <div class="flex items-center gap-2">
          <button hlmBtn variant="outline" type="button" (click)="onCancel()">
            Close
          </button>
          <button
            hlmBtn
            type="button"
            class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
            (click)="onConfirm()"
          >
            <ng-icon name="lucideCheck" class="mr-1.5 text-xs"></ng-icon>
            <span>Save & Apply Documentation</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RRAgreementUploadDialogComponent implements OnInit, OnDestroy {
  dialogRef = inject(BrnDialogRef, { optional: true });
  data = injectBrnDialogContext<AgreementUploadDialogContext>({ optional: true }) || {
    title: 'Rental Agreement',
    fileName: 'Agreement_Draft.pdf',
    blobUrl: '',
    signedAgreementUrl: null,
    attachments: [],
  };

  private sanitizer = inject(DomSanitizer);
  private rrApi = inject(RRApiService);

  activeTab = signal<'draft' | 'signed'>('draft');
  safeUrl!: SafeResourceUrl;

  signedAgreementUrl = signal<string | null>(null);
  attachments = signal<AgreementUploadItem[]>([]);

  isUploadingSigned = signal(false);
  isUploadingAttachments = signal(false);

  ngOnInit(): void {
    if (this.data.blobUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.blobUrl);
    }
    if (this.data.signedAgreementUrl) {
      this.signedAgreementUrl.set(this.data.signedAgreementUrl);
    }
    if (this.data.attachments && this.data.attachments.length > 0) {
      this.attachments.set([...this.data.attachments]);
    }
  }

  downloadPdf(): void {
    if (!this.data.blobUrl) return;
    const link = document.createElement('a');
    link.href = this.data.blobUrl;
    link.download = this.data.fileName || 'Agreement_Draft.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printPdf(): void {
    if (!this.data.blobUrl) return;
    const win = window.open(this.data.blobUrl, '_blank');
    if (win) {
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  }

  openInNewTab(): void {
    if (!this.data.blobUrl) return;
    window.open(this.data.blobUrl, '_blank');
  }

  async onSignedAgreementFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
      this.isUploadingSigned.set(true);
      const res = await this.rrApi.uploadVehicleImages([file]);
      const url = res.images?.[0]?.url || res.url;
      if (url) {
        this.signedAgreementUrl.set(url);
        toast.success('Signed agreement uploaded successfully.');
      } else {
        toast.error('Failed to obtain uploaded agreement URL.');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading signed agreement.');
    } finally {
      this.isUploadingSigned.set(false);
      target.value = '';
    }
  }

  removeSignedAgreement() {
    this.signedAgreementUrl.set(null);
  }

  async onAttachmentsSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    try {
      this.isUploadingAttachments.set(true);
      const fileList = Array.from(files);
      const res = await this.rrApi.uploadVehicleImages(fileList);
      const newItems: AgreementUploadItem[] = (res.images || []).map((img) => ({
        name: img.originalName || 'Attachment',
        url: img.url,
      }));

      if (newItems.length > 0) {
        this.attachments.update((curr) => [...curr, ...newItems]);
        toast.success(`${newItems.length} attachment(s) uploaded successfully.`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading attachments.');
    } finally {
      this.isUploadingAttachments.set(false);
      target.value = '';
    }
  }

  removeAttachment(index: number) {
    this.attachments.update((curr) => curr.filter((_, i) => i !== index));
  }

  onConfirm() {
    this.dialogRef?.close({
      signedAgreementUrl: this.signedAgreementUrl(),
      attachments: this.attachments(),
    });
  }

  onCancel() {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    // blobUrl is managed by caller
  }
}
