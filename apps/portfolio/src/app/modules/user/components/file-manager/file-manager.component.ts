import { Component, inject, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FileManagerService } from '../../services/file-manager.service';
import { FileNode } from '@portfolio/shared-types';
import { FilePreviewDialogComponent } from './file-preview-dialog.component';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.scss',
})
export class FileManagerComponent implements OnInit {
  fileService = inject(FileManagerService);
  private dialog = inject(MatDialog);

  // UI State Signals
  showFolderInput = signal<boolean>(false);
  newFolderName = signal<string>('');
  isDragging = signal<boolean>(false);

  // Breadcrumbs selector
  breadcrumbs = computed(() => {
    const path = this.fileService.currentPath();
    const parts = path.split('/').filter(Boolean);
    const crumbs: { name: string; path: string }[] = [];
    let accum = '';
    for (const part of parts) {
      accum += part + '/';
      crumbs.push({ name: part, path: accum });
    }
    return crumbs;
  });

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    // Initial folder load (root of bucket)
    this.fileService.loadDirectory('');
  }

  /**
   * Navigates into a directory path
   */
  navigateTo(path: string): void {
    this.fileService.loadDirectory(path);
  }

  /**
   * Navigates one directory level up
   */
  navigateUp(): void {
    const current = this.fileService.currentPath();
    if (!current) return;
    const parts = current.split('/').filter(Boolean);
    parts.pop();
    const parentPath = parts.length > 0 ? parts.join('/') + '/' : '';
    this.navigateTo(parentPath);
  }

  /**
   * Opens the file preview dialog
   */
  async previewFile(node: FileNode): Promise<void> {
    try {
      const url = await this.fileService.getDownloadUrl(node.path);
      this.dialog.open(FilePreviewDialogComponent, {
        data: {
          node,
          downloadUrl: url,
        },
        width: '800px',
        maxWidth: '90vw',
        panelClass: 'glass-dialog-panel',
      });
    } catch (err: any) {
      console.error('Failed to open preview dialog:', err);
    }
  }

  /**
   * Opens browser download link for the clicked file
   */
  async downloadFile(node: FileNode): Promise<void> {
    try {
      const url = await this.fileService.getDownloadUrl(node.path);
      // Open in a new tab to trigger download
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Download url retrieval failed:', err);
    }
  }

  /**
   * Triggers file input click
   */
  triggerUpload(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handles files selected via standard file dialog picker
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      try {
        await this.fileService.uploadFile(file);
      } catch {
        // Handled in service
      } finally {
        // Reset file input value to allow uploading same file again
        input.value = '';
      }
    }
  }

  /**
   * Creates a folder with the designated name
   */
  async onCreateFolderSubmit(): Promise<void> {
    const name = this.newFolderName().trim();
    if (!name) return;

    // Reject folder names containing slashes
    if (name.includes('/') || name.includes('\\')) {
      this.fileService.error.set('Folder name cannot contain slashes.');
      return;
    }

    try {
      await this.fileService.createFolder(name);
      this.newFolderName.set('');
      this.showFolderInput.set(false);
    } catch {
      // Handled in service
    }
  }

  /**
   * Drag & Drop event handlers
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      try {
        await this.fileService.uploadFile(file);
      } catch {
        // Handled in service
      }
    }
  }

  /**
   * Utility helper to format file size strings
   */
  formatSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Utility helper to format date strings
   */
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
