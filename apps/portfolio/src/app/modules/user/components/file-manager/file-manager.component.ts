import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideFolder,
  lucideFolderPlus,
  lucideUpload,
  lucideFile,
  lucideFileText,
  lucideDownload,
  lucideEye,
  lucideChevronRight,
  lucideHome,
  lucideTrash2,
  lucideShieldCheck,
  lucideUser,
  lucideSparkles,
  lucideX,
  lucideArrowLeft,
  lucideCloud,
  lucideCornerLeftUp,
  lucideLock,
  lucideBot,
  lucideCopy,
  lucideRefreshCw,
  lucideCheck,
} from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmProgressImports } from '@spartan-ng/hel/progress';
import { HlmSpinner } from '@spartan-ng/hel/spinner';
import { FileManagerService } from '../../services/file-manager.service';
import { AuthService } from '../../services/auth';
import { FileNode } from '@portfolio/shared-types';
import { FilePreviewDialogComponent } from './file-preview-dialog.component';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButton,
    HlmTooltipImports,
    HlmProgressImports,
    HlmSpinner,
  ],
  providers: [
    provideIcons({
      lucideFolder,
      lucideFolderPlus,
      lucideUpload,
      lucideFile,
      lucideFileText,
      lucideDownload,
      lucideEye,
      lucideChevronRight,
      lucideHome,
      lucideTrash2,
      lucideShieldCheck,
      lucideUser,
      lucideSparkles,
      lucideX,
      lucideArrowLeft,
      lucideCloud,
      lucideCornerLeftUp,
      lucideLock,
      lucideBot,
      lucideCopy,
      lucideRefreshCw,
      lucideCheck,
    }),
  ],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileManagerComponent implements OnInit {
  fileService = inject(FileManagerService);
  authService = inject(AuthService);
  private dialog = inject(HlmDialogService);

  // UI State Signals
  showFolderInput = signal<boolean>(false);
  newFolderName = signal<string>('');
  isDragging = signal<boolean>(false);

  // AI Assistant Modal State
  selectedAiFile = signal<FileNode | null>(null);
  aiPrompt = signal<string>('');
  copiedAiReply = signal<boolean>(false);

  // Active user & RBAC scope state
  currentUser = computed(() => this.authService.currentUser());
  scope = computed(() => this.fileService.scope());
  userRole = computed(() => this.scope()?.userRole || (this.currentUser()?.admin ? 'admin' : 'user'));
  isAdmin = computed(() => this.userRole() === 'admin');
  userFullName = computed(() => this.scope()?.userFullName || this.currentUser()?.fullName || 'User');
  uploadDir = computed(() => this.scope()?.uploadDir || 'root/');

  // Breadcrumbs computation based on scope
  breadcrumbs = computed(() => {
    const current = this.fileService.currentPath();
    const parts = current.split('/').filter(Boolean);
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
    // Initialize directory from authorized scope
    this.fileService.loadDirectory('');
  }

  /**
   * Refreshes the active folder contents
   */
  refreshCurrentDirectory(): void {
    this.fileService.loadDirectory(this.fileService.currentPath());
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
        context: {
          node,
          downloadUrl: url,
        },
        showCloseButton: false,
        contentClass: 'w-[90vw] max-w-[800px] p-0 border-0 bg-transparent shadow-none',
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
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Download url retrieval failed:', err);
    }
  }

  /**
   * Opens AI assistant analysis modal for the selected file
   */
  openAiAssistant(node: FileNode): void {
    this.selectedAiFile.set(node);
    this.aiPrompt.set('Summarize the contents of this file and extract key takeaways.');
    this.fileService.aiResponse.set(null);
  }

  closeAiAssistant(): void {
    this.selectedAiFile.set(null);
    this.aiPrompt.set('');
    this.fileService.aiResponse.set(null);
    this.copiedAiReply.set(false);
  }

  async runAiAnalysis(): Promise<void> {
    const node = this.selectedAiFile();
    if (!node) return;
    try {
      await this.fileService.askAiAboutFile(node.path, this.aiPrompt());
    } catch (err) {
      console.error('AI Analysis failed:', err);
    }
  }

  copyAiResponse(text: string): void {
    navigator.clipboard.writeText(text);
    this.copiedAiReply.set(true);
    setTimeout(() => this.copiedAiReply.set(false), 2000);
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
