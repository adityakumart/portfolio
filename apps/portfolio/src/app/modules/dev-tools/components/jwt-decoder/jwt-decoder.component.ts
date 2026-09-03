import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlay,
  lucideEraser,
  lucideAlertCircle,
  lucideSettings,
  lucideCheck,
  lucideCopy,
  lucideClipboardCheck,
  lucideCode,
  lucideUser,
  lucideShieldCheck,
  lucideKey,
  lucideShield,
  lucidePalette,
  lucideList,
} from '@ng-icons/lucide';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { JwtDecoderService, DecodedJwt, ClaimInfo } from './services/jwt-decoder.service';

@Component({
  selector: 'app-jwt-decoder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucidePlay,
      lucideEraser,
      lucideAlertCircle,
      lucideSettings,
      lucideCheck,
      lucideCopy,
      lucideClipboardCheck,
      lucideCode,
      lucideUser,
      lucideShieldCheck,
      lucideKey,
      lucideShield,
      lucidePalette,
      lucideList,
    }),
  ],
  templateUrl: './jwt-decoder.component.html',
  styleUrls: ['./jwt-decoder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JwtDecoderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private jwtDecoderService = inject(JwtDecoderService);
  private clipboard = inject(Clipboard);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  decodedToken: DecodedJwt | null = null;
  claimsDataSource: ClaimInfo[] = [];
  errorMessage = '';
  copiedSection: string | null = null;
  displayedColumns = ['key', 'value', 'description'];

  // Segments for raw JWT color-coded visual rendering
  tokenPartHeader = '';
  tokenPartPayload = '';
  tokenPartSignature = '';

  private destroy$ = new Subject<void>();



  ngOnInit(): void {
    this.form = this.fb.group({
      tokenInput: ['']
    });

    // Real-time input listening with debounce for performance safety
    this.form.get('tokenInput')?.valueChanges
      .pipe(
        debounceTime(150),
        takeUntil(this.destroy$)
      )
      .subscribe((val: string) => {
        this.processToken(val);
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Safe JWT parsing and claims extraction.
   * Handles error recovery and UI refresh states.
   */
  processToken(token: string): void {
    this.errorMessage = '';
    
    if (!token || token.trim() === '') {
      this.clearDecodedState();
      this.cdr.markForCheck();
      return;
    }

    const cleanedToken = token.trim();
    const parts = cleanedToken.split('.');

    // Highlight segments in real-time even if signature/other parts are missing
    this.tokenPartHeader = parts[0] || '';
    this.tokenPartPayload = parts[1] || '';
    this.tokenPartSignature = parts[2] || '';

    try {
      this.decodedToken = this.jwtDecoderService.decodeToken(cleanedToken);
      this.claimsDataSource = this.jwtDecoderService.getClaims(this.decodedToken.payload);
    } catch (err) {
      this.decodedToken = null;
      this.claimsDataSource = [];
      this.errorMessage = err instanceof Error ? err.message : 'Invalid JWT token.';
    }
    
    this.cdr.markForCheck();
  }

  /**
   * Resets decoded state variables.
   */
  clearDecodedState(): void {
    this.decodedToken = null;
    this.claimsDataSource = [];
    this.errorMessage = '';
    this.tokenPartHeader = '';
    this.tokenPartPayload = '';
    this.tokenPartSignature = '';
  }

  /**
   * Triggers cleanup and clears form input control.
   */
  onClear(): void {
    this.form.get('tokenInput')?.setValue('');
    this.showSnackBar('Cleared JWT input.', 'info');
  }

  /**
   * Loads a complete, pre-configured JWT token for demonstration purposes.
   */
  onLoadDemo(): void {
    const demoToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS1pZC0xMjM0NSJ9.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzEyMzQ1Njc4OTAiLCJhdWQiOiJodHRwczovL2FwaS5leGFtcGxlLmNvbSIsImV4cCI6MTgxNzU0NjY4OCwibmJmIjoxNzg1OTg3NjAwLCJpYXQiOjE3ODU5ODc2MDAsIm5hbWUiOiJKYW5lIFNtaXRoIiwiZW1haWwiOiJqYW5lLnNtaXRoQGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvbGVzIjpbImFkbWluIiwiZGV2ZWxvcGVyIl19.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    this.form.get('tokenInput')?.setValue(demoToken);
    this.showSnackBar('Demo JWT loaded successfully.', 'success');
  }

  /**
   * Utilizes the @angular/cdk/clipboard API to write contents to user clipboard.
   * Highlights success visual state.
   */
  onCopy(text: string | undefined, section: string): void {
    if (!text) {
      this.showSnackBar('No content to copy.', 'error');
      return;
    }

    const success = this.clipboard.copy(text);
    if (success) {
      this.copiedSection = section;
      this.showSnackBar('Copied to clipboard!', 'success');
      setTimeout(() => {
        this.copiedSection = null;
        this.cdr.markForCheck();
      }, 2000);
    } else {
      this.showSnackBar('Failed to copy to clipboard.', 'error');
    }
    this.cdr.markForCheck();
  }

  /**
   * Returns pretty-printed JSON representation of a decoded object.
   */
  formatJson(obj: object | undefined): string {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  }

  /**
   * Displays toast message indicators.
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  }
}
