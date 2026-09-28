import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
} from '@ng-icons/lucide';

export interface RRPdfViewerDialogContext {
  title: string;
  fileName: string;
  blobUrl: string;
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
    }),
  ],
  template: `
    <div class="p-4 sm:p-5 bg-card text-card-foreground rounded-2xl border border-border shadow-2xl flex flex-col w-full h-[90vh] max-w-5xl overflow-hidden">
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
                Read-Only
              </span>
            </div>
            <p class="text-xs text-muted-foreground truncate">{{ data.fileName }}</p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            hlmBtn
            size="sm"
            variant="outline"
            class="h-8 px-2.5 text-xs font-semibold gap-1.5 hidden sm:inline-flex"
            (click)="openInNewTab()"
            title="Open in new window"
          >
            <ng-icon name="lucideExternalLink" class="text-xs"></ng-icon>
            <span>Pop Out</span>
          </button>

          <button
            hlmBtn
            size="sm"
            class="h-8 px-3 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
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
            class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
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
  safeUrl!: SafeResourceUrl;

  ngOnInit(): void {
    if (this.data.blobUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.blobUrl);
    }
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
      // Clean up blob URL after a short timeout so active tabs or iframes aren't interrupted prematurely
      setTimeout(() => {
        try {
          URL.revokeObjectURL(this.data.blobUrl);
        } catch {}
      }, 5000);
    }
  }
}
