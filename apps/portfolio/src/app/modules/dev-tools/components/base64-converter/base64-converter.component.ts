import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLock,
  lucideLockOpen,
  lucideEraser,
  lucideAlertTriangle,
  lucideInfo,
  lucideFile,
  lucideCheckCircle,
  lucideCopy,
  lucideUploadCloud,
} from '@ng-icons/lucide';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Base64Service, FileMetadata } from './services/base64.service';
import { ToastrService } from '../../../../shared/services/toaster.service';

@Component({
  selector: 'app-base64-converter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideLock,
      lucideLockOpen,
      lucideEraser,
      lucideAlertTriangle,
      lucideInfo,
      lucideFile,
      lucideCheckCircle,
      lucideCopy,
      lucideUploadCloud,
    }),
  ],
  templateUrl: './base64-converter.component.html',
  styleUrls: ['./base64-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Base64ConverterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private base64Service = inject(Base64Service);
  private sanitizer = inject(DomSanitizer);
  private toastr = inject(ToastrService);

  form!: FormGroup;
  selectedFile: FileMetadata | null = null;
  previewUrl: SafeResourceUrl | null = null;
  isImagePreview = false;
  metadataLabel = '';
  errorMessage = '';
  isDragOver = false;
  copiedField: string | null = null;

  private fileSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();



  ngOnInit(): void {
    this.initializeForm();
    this.setupStateSubscriptions();
  }

  ngOnDestroy(): void {
    // Unsubscribe and complete subject to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }
  }

  /**
   * Initializes the form with default values.
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      mode: ['text'], // 'text' | 'file'
      operation: ['encode'], // 'encode' | 'decode'
      inputText: [''],
      outputText: [''],
      rawBase64: [''],
      outputDataUri: [''],
    });
  }

  /**
   * Subscribes to changes in Mode, Operation, and Inputs to manage UI state reactively.
   */
  private setupStateSubscriptions(): void {
    // Watch for mode changes to reset specific states
    this.form.get('mode')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode: 'text' | 'file') => {
        this.clearAllStates();
        if (mode === 'file') {
          // Default file mode operation to encode internally
          this.form.patchValue({ operation: 'encode' }, { emitEvent: false });
        }
      });

    // Watch for operation changes to clear inputs and outputs
    this.form.get('operation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue({ inputText: '', outputText: '' }, { emitEvent: false });
        this.clearPreviewAndErrorStates();
      });

    // Set up real-time text conversion with debouncing for performance safety
    this.form.get('inputText')?.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((text: string) => {
        this.processTextRealTime(text);
      });
  }

  /**
   * Encodes or decodes text inputs in real-time.
   * Supresses errors during typing to ensure a smooth user experience.
   * @param text Raw or base64 input text
   */
  private processTextRealTime(text: string): void {
    if (!text || text.trim() === '') {
      this.form.patchValue({ outputText: '' }, { emitEvent: false });
      this.clearPreviewAndErrorStates();
      return;
    }

    const op = this.form.get('operation')?.value;
    if (op === 'encode') {
      try {
        const encoded = this.base64Service.encodeText(text);
        this.form.patchValue({ outputText: encoded }, { emitEvent: false });
        this.clearPreviewAndErrorStates();
      } catch {
        this.form.patchValue({ outputText: '' }, { emitEvent: false });
      }
    } else {
      try {
        // Attempt to decode base64
        const decoded = this.base64Service.decodeText(text);
        this.form.patchValue({ outputText: decoded }, { emitEvent: false });
        this.clearPreviewAndErrorStates();

        // Examine if the input was actually a base64 file representation to show visual preview
        this.detectAndSetupPreview(text);
      } catch {
        // Suppress real-time error displaying while typing, but try to resolve preview if possible
        this.form.patchValue({ outputText: '' }, { emitEvent: false });
        this.detectAndSetupPreview(text);
      }
    }
  }

  /**
   * Triggered by explicit click actions on "Encode" or "Decode" buttons.
   * Displays errors to the user in case of failures.
   */
  onProcessText(): void {
    const text = this.form.get('inputText')?.value;
    if (!text || text.trim() === '') {
      this.showSnackBar('Please enter text to process.', 'error');
      return;
    }

    const op = this.form.get('operation')?.value;
    this.errorMessage = '';

    if (op === 'encode') {
      try {
        const encoded = this.base64Service.encodeText(text);
        this.form.patchValue({ outputText: encoded }, { emitEvent: false });
        this.showSnackBar('Text encoded successfully.', 'success');
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to encode text.';
        this.showSnackBar('Encoding failed.', 'error');
      }
    } else {
      try {
        const decoded = this.base64Service.decodeText(text);
        this.form.patchValue({ outputText: decoded }, { emitEvent: false });
        this.detectAndSetupPreview(text);
        this.showSnackBar('Text decoded successfully.', 'success');
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to decode Base64.';
        this.showSnackBar('Decoding failed. See details below.', 'error');
        this.form.patchValue({ outputText: '' }, { emitEvent: false });
        // Still attempt preview extraction if it was valid binary base64
        this.detectAndSetupPreview(text);
      }
    }
  }

  /**
   * Examines a Base64 string for file signatures, building a preview URL and metadata label if valid.
   * @param base64 Base64 or Data URI string
   */
  private detectAndSetupPreview(base64: string): void {
    const info = this.base64Service.detectFileInfo(base64);
    if (info.sizeBytes > 0 && info.mimeType) {
      // Build safe Data URI for visualization
      const rawBase64 = this.base64Service.extractBase64FromDataUri(base64);
      const dataUri = `data:${info.mimeType};base64,${rawBase64}`;
      
      // Use DomSanitizer to mark content safe before binding to DOM
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUri);
      this.isImagePreview = info.isImage;
      
      this.metadataLabel = `Decoded a ${info.extension?.toUpperCase() || 'unknown'} file (${this.formatBytes(info.sizeBytes)}) - ${
        info.isImage ? 'preview shown below' : 'binary format detected'
      }`;
    } else {
      this.previewUrl = null;
      this.isImagePreview = false;
      this.metadataLabel = '';
    }
  }

  /**
   * Handles File Upload / Drop.
   * @param file File object from input or drop action
   */
  processUploadedFile(file: File): void {
    this.errorMessage = '';
    this.clearFileStates();

    // Size limit check
    if (file.size > this.base64Service.MAX_FILE_SIZE_BYTES) {
      this.errorMessage = `File is too large (${this.formatBytes(file.size)}). Maximum size is 15MB to prevent browser freezing.`;
      this.showSnackBar('File upload failed: too large.', 'error');
      return;
    }

    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }

    // Process file asynchronously using the service observable
    this.fileSubscription = this.base64Service.readFileAsDataURL(file).subscribe({
      next: (res) => {
        this.selectedFile = res.metadata;
        this.form.patchValue({
          rawBase64: res.base64,
          outputDataUri: res.dataUri,
        }, { emitEvent: false });

        // Set up image previews for rendering
        if (res.metadata.type.startsWith('image/')) {
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.dataUri);
          this.isImagePreview = true;
        } else {
          this.previewUrl = null;
          this.isImagePreview = false;
        }

        this.metadataLabel = `File: ${res.metadata.name} (${this.formatBytes(res.metadata.size)}) - Base64 generated successfully.`;
        this.showSnackBar('File processed successfully.', 'success');
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.showSnackBar('Failed to read file.', 'error');
      },
    });
  }

  /**
   * File Drag & Drop events
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processUploadedFile(files[0]);
    }
  }

  /**
   * File Input trigger
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processUploadedFile(input.files[0]);
    }
  }

  /**
   * Cleans up text form inputs, outputs, and states.
   */
  onClearText(): void {
    this.form.patchValue({
      inputText: '',
      outputText: '',
    }, { emitEvent: false });
    this.clearPreviewAndErrorStates();
    this.showSnackBar('Cleared text fields.', 'info');
  }

  /**
   * Cleans up file states, forms, and unsubscribe.
   */
  onClearFile(): void {
    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }
    this.form.patchValue({
      rawBase64: '',
      outputDataUri: '',
    }, { emitEvent: false });
    this.clearFileStates();
    this.clearPreviewAndErrorStates();
    this.showSnackBar('Cleared file.', 'info');
  }

  /**
   * Resets both text and file states completely.
   */
  private clearAllStates(): void {
    if (this.fileSubscription) {
      this.fileSubscription.unsubscribe();
    }
    this.form.reset({
      mode: this.form.get('mode')?.value,
      operation: 'encode',
      inputText: '',
      outputText: '',
      rawBase64: '',
      outputDataUri: '',
    }, { emitEvent: false });
    this.clearFileStates();
    this.clearPreviewAndErrorStates();
  }

  private clearFileStates(): void {
    this.selectedFile = null;
  }

  private clearPreviewAndErrorStates(): void {
    this.previewUrl = null;
    this.isImagePreview = false;
    this.metadataLabel = '';
    this.errorMessage = '';
  }

  /**
   * Copies string values to the clipboard.
   * @param text Text value to copy
   * @param field Field name for setting the success visual indicator state
   */
  onCopy(text: string | undefined, field: string = 'outputText'): void {
    if (!text || text.trim() === '') {
      this.showSnackBar('No content to copy.', 'error');
      return;
    }

    navigator.clipboard.writeText(text).then(
      () => {
        this.copiedField = field;
        this.showSnackBar('Copied to clipboard!', 'success');
        setTimeout(() => {
          this.copiedField = null;
        }, 2000);
      },
      () => {
        this.showSnackBar('Failed to copy to clipboard.', 'error');
      }
    );
  }

  /**
   * Formats file bytes to a readable format (Bytes/KB/MB)
   * @param bytes Number of bytes
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Helper to display snackbar alerts.
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastr.open(message, type);
  }
}
