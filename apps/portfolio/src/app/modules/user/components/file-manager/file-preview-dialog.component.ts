import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideImage,
  lucideFileText,
  lucideVolume2,
  lucideVideo,
  lucideFileCode,
  lucideFile,
  lucideX,
  lucideAlertCircle,
  lucideDownload,
} from '@ng-icons/lucide';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { FileNode } from '@portfolio/shared-types';

@Component({
  selector: 'app-file-preview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    NgIconComponent,
    MatProgressSpinnerModule,
  ],
  providers: [
    provideIcons({
      lucideImage,
      lucideFileText,
      lucideVolume2,
      lucideVideo,
      lucideFileCode,
      lucideFile,
      lucideX,
      lucideAlertCircle,
      lucideDownload,
    }),
  ],
  templateUrl: './file-preview-dialog.component.html',
  styleUrl: './file-preview-dialog.component.scss',
})
export class FilePreviewDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<FilePreviewDialogComponent>);
  data = inject<{ node: FileNode; downloadUrl: string }>(MAT_DIALOG_DATA);
  sanitizer = inject(DomSanitizer);
  http = inject(HttpClient);

  previewType: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'unsupported' =
    'unsupported';
  safeUrl!: SafeResourceUrl;
  textContent: string | null = null;
  loadingText = false;
  textError = false;

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.data.downloadUrl,
    );
    this.determinePreviewType();
    if (this.previewType === 'text') {
      this.loadTextContent();
    }
  }

  determinePreviewType() {
    const name = this.data.node.name.toLowerCase();
    const ext = name.split('.').pop() || '';

    const imageExts = [
      'png',
      'jpg',
      'jpeg',
      'gif',
      'svg',
      'webp',
      'bmp',
      'ico',
    ];
    const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'm4a'];
    const videoExts = ['mp4', 'webm', 'ogv', 'avi'];
    const textExts = [
      'txt',
      'json',
      'md',
      'html',
      'css',
      'js',
      'ts',
      'xml',
      'yaml',
      'yml',
      'csv',
    ];

    if (imageExts.includes(ext)) {
      this.previewType = 'image';
    } else if (ext === 'pdf') {
      this.previewType = 'pdf';
    } else if (audioExts.includes(ext)) {
      this.previewType = 'audio';
    } else if (videoExts.includes(ext)) {
      this.previewType = 'video';
    } else if (textExts.includes(ext)) {
      this.previewType = 'text';
    } else {
      this.previewType = 'unsupported';
    }
  }

  loadTextContent() {
    this.loadingText = true;
    this.textError = false;
    this.http.get(this.data.downloadUrl, { responseType: 'text' }).subscribe({
      next: (content) => {
        // limit content length to 50KB to avoid UI freezing
        const maxLen = 50 * 1024;
        if (content.length > maxLen) {
          this.textContent =
            content.substring(0, maxLen) +
            '\n\n... [Content Truncated due to size]';
        } else {
          this.textContent = content;
        }
        this.loadingText = false;
      },
      error: (err) => {
        console.error('Failed to load text content for preview:', err);
        this.textError = true;
        this.loadingText = false;
      },
    });
  }

  download() {
    window.open(this.data.downloadUrl, '_blank');
  }

  getIconForType(): string {
    switch (this.previewType) {
      case 'image':
        return 'lucideImage';
      case 'pdf':
        return 'lucideFileText';
      case 'audio':
        return 'lucideVolume2';
      case 'video':
        return 'lucideVideo';
      case 'text':
        return 'lucideFileCode';
      default:
        return 'lucideFile';
    }
  }

  getExtension(): string {
    return this.data.node.name.split('.').pop() || '';
  }

  formatSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}
