import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLock,
  lucideLockOpen,
  lucideArrowUpDown,
  lucideEraser,
  lucideAlertTriangle,
  lucideCheckCircle,
  lucideCopy,
  lucideInfo,
  lucideHash,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EncoderHashService } from './services/encoder-hash.service';

@Component({
  selector: 'app-encoder-hash-tools',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatSnackBarModule,
    NgIconComponent,
    MatTooltipModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonToggleModule,
  ],
  providers: [
    provideIcons({
      lucideLock,
      lucideLockOpen,
      lucideArrowUpDown,
      lucideEraser,
      lucideAlertTriangle,
      lucideCheckCircle,
      lucideCopy,
      lucideInfo,
      lucideHash,
      lucideShieldCheck,
    }),
  ],
  templateUrl: './encoder-hash-tools.component.html',
  styleUrls: ['./encoder-hash-tools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncoderHashToolsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private encoderHashService = inject(EncoderHashService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  activeTabIndex = 0;
  copiedField: string | null = null;
  urlErrorMessage = '';

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.syncTabWithRoute();
    this.setupStateSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes Form Controls with default values.
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      // URL Encoding/Decoding parameters
      urlInput: [''],
      urlOutput: [''],
      urlOperation: ['encode'], // 'encode' | 'decode'

      // MD5 hasing parameters
      md5Input: [''],
      md5Output: [''],
      md5Case: ['lower'], // 'lower' | 'upper'

      // SHA-256 hashing parameters
      sha256Input: [''],
      sha256Output: [''],
      sha256Case: ['lower'], // 'lower' | 'upper'
    });
  }

  /**
   * Selects active tab corresponding to the route path.
   */
  private syncTabWithRoute(): void {
    const url = this.router.url;
    if (url.endsWith('/url')) {
      this.activeTabIndex = 0;
    } else if (url.endsWith('/md5')) {
      this.activeTabIndex = 1;
    } else if (url.endsWith('/sha256')) {
      this.activeTabIndex = 2;
    }
  }

  /**
   * Tab change event handler. Synchronizes active tab with routing.
   * @param index Tab index
   */
  onTabChange(index: number): void {
    this.activeTabIndex = index;
    let targetPath = '';
    if (index === 0) {
      targetPath = '/dev-tools/encode-decode/url';
    } else if (index === 1) {
      targetPath = '/dev-tools/encode-decode/md5';
    } else if (index === 2) {
      targetPath = '/dev-tools/encode-decode/sha256';
    }

    if (targetPath && this.router.url !== targetPath) {
      this.router.navigateByUrl(targetPath);
    }
  }

  /**
   * Subscribes to input control changes, incorporating debouncing for heavy calculation prevention.
   */
  private setupStateSubscriptions(): void {
    // URL fields subscription
    this.form.get('urlInput')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.processUrl();
      });

    this.form.get('urlOperation')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.processUrl();
      });

    // MD5 fields subscription
    this.form.get('md5Input')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.processMd5();
      });

    this.form.get('md5Case')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.processMd5();
      });

    // SHA-256 fields subscription
    this.form.get('sha256Input')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.processSha256();
      });

    this.form.get('sha256Case')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.processSha256();
      });
  }

  /**
   * Handles URL encoding/decoding and catches malformed URI decoding errors.
   */
  processUrl(): void {
    const input = this.form.get('urlInput')?.value || '';
    const operation = this.form.get('urlOperation')?.value;

    if (!input || input.trim() === '') {
      this.form.patchValue({ urlOutput: '' }, { emitEvent: false });
      this.urlErrorMessage = '';
      return;
    }

    if (operation === 'encode') {
      try {
        const result = this.encoderHashService.encodeUrl(input);
        this.form.patchValue({ urlOutput: result }, { emitEvent: false });
        this.urlErrorMessage = '';
      } catch (err) {
        this.urlErrorMessage = err instanceof Error ? err.message : 'Failed to encode URL component.';
        this.form.patchValue({ urlOutput: '' }, { emitEvent: false });
      }
    } else {
      try {
        const result = this.encoderHashService.decodeUrl(input);
        this.form.patchValue({ urlOutput: result }, { emitEvent: false });
        this.urlErrorMessage = '';
      } catch (err) {
        this.urlErrorMessage = err instanceof URIError
          ? 'URIError: The input contains malformed URL-encoded sequences (e.g., incomplete %-escapes).'
          : err instanceof Error ? err.message : 'Failed to decode URL component.';
        this.form.patchValue({ urlOutput: '' }, { emitEvent: false });
      }
    }
  }

  /**
   * Generates MD5 hash dynamically and processes hex letter casing.
   */
  processMd5(): void {
    const input = this.form.get('md5Input')?.value || '';
    const isUpper = this.form.get('md5Case')?.value === 'upper';

    if (!input || input.trim() === '') {
      this.form.patchValue({ md5Output: '' }, { emitEvent: false });
      return;
    }

    let hash = this.encoderHashService.generateMd5(input);
    if (isUpper) {
      hash = hash.toUpperCase();
    }
    this.form.patchValue({ md5Output: hash }, { emitEvent: false });
  }

  /**
   * Generates SHA-256 hash dynamically and processes hex letter casing.
   */
  processSha256(): void {
    const input = this.form.get('sha256Input')?.value || '';
    const isUpper = this.form.get('sha256Case')?.value === 'upper';

    if (!input || input.trim() === '') {
      this.form.patchValue({ sha256Output: '' }, { emitEvent: false });
      return;
    }

    let hash = this.encoderHashService.generateSha256(input);
    if (isUpper) {
      hash = hash.toUpperCase();
    }
    this.form.patchValue({ sha256Output: hash }, { emitEvent: false });
  }

  /**
   * Swaps input and output values for URL encoder/decoder.
   */
  onSwapUrl(): void {
    const input = this.form.get('urlInput')?.value || '';
    const output = this.form.get('urlOutput')?.value || '';
    const currentOp = this.form.get('urlOperation')?.value;

    this.form.patchValue({
      urlInput: output,
      urlOutput: input,
      urlOperation: currentOp === 'encode' ? 'decode' : 'encode',
    }, { emitEvent: false });

    this.processUrl();
    this.showSnackBar('Swapped input and output.', 'info');
  }

  onClearUrl(): void {
    this.form.patchValue({ urlInput: '', urlOutput: '' }, { emitEvent: false });
    this.urlErrorMessage = '';
    this.showSnackBar('Cleared URL fields.', 'info');
  }

  onClearMd5(): void {
    this.form.patchValue({ md5Input: '', md5Output: '' }, { emitEvent: false });
    this.showSnackBar('Cleared MD5 fields.', 'info');
  }

  onClearSha256(): void {
    this.form.patchValue({ sha256Input: '', sha256Output: '' }, { emitEvent: false });
    this.showSnackBar('Cleared SHA-256 fields.', 'info');
  }

  /**
   * Copies target field text to system clipboard.
   * @param text Text content to copy
   * @param field Field name for tracking transient copy status in UI
   */
  onCopy(text: string | undefined, field: string): void {
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

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass =
      type === 'success'
        ? 'success-snackbar'
        : type === 'error'
        ? 'error-snackbar'
        : 'info-snackbar';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }
}
