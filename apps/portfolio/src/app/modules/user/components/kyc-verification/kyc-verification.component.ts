import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideShieldAlert,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideRefreshCw,
  lucideCopy,
  lucideCheck,
  lucideArrowRight,
  lucideCalendar,
  lucideMapPin,
  lucideUser,
  lucideAward,
  lucideFileText,
  lucideCar,
  lucideSparkles,
  lucideKeyRound,
  lucideInfo,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { KycApiService } from '../../../../shared/services/kyc-api.service';
import { ToastrService } from '../../../../shared/services/toaster.service';
import {
  IAadhaarVerifiedData,
  IDrivingLicenseVerifiedData,
  IKycServiceStatus,
} from '@portfolio/shared-types';

@Component({
  selector: 'app-kyc-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideShieldAlert,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideRefreshCw,
      lucideCopy,
      lucideCheck,
      lucideArrowRight,
      lucideCalendar,
      lucideMapPin,
      lucideUser,
      lucideAward,
      lucideFileText,
      lucideCar,
      lucideSparkles,
      lucideKeyRound,
      lucideInfo,
    }),
  ],
  templateUrl: './kyc-verification.component.html',
  styleUrls: ['./kyc-verification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KycVerificationComponent implements OnInit, OnDestroy {
  private kycApi = inject(KycApiService);
  private toaster = inject(ToastrService);

  // Active Tab: 'aadhaar' | 'dl'
  activeTab = signal<'aadhaar' | 'dl'>('aadhaar');

  // Service configuration status
  serviceStatus = signal<IKycServiceStatus | null>(null);

  // Aadhaar State
  aadhaarNumber = signal('');
  aadhaarStep = signal<'input' | 'otp' | 'verified'>('input');
  aadhaarOtp = signal('');
  aadhaarClientId = signal('');
  aadhaarLoading = signal(false);
  aadhaarError = signal<string | null>(null);
  aadhaarResult = signal<IAadhaarVerifiedData | null>(null);
  otpCountdown = signal(0);
  private timerInterval: any = null;

  // Driving License State
  dlNumber = signal('');
  dlDob = signal('');
  dlLoading = signal(false);
  dlError = signal<string | null>(null);
  dlResult = signal<IDrivingLicenseVerifiedData | null>(null);

  // Copy Feedback
  copiedField = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchServiceConfig();
  }

  ngOnDestroy(): void {
    this.clearOtpTimer();
  }

  fetchServiceConfig(): void {
    this.kycApi.getServiceStatus().subscribe({
      next: (status) => this.serviceStatus.set(status),
      error: () =>
        this.serviceStatus.set({
          isConfigured: false,
          mode: 'sandbox',
          baseUrl: 'https://kyc-api.surepass.io',
        }),
    });
  }

  setTab(tab: 'aadhaar' | 'dl'): void {
    this.activeTab.set(tab);
  }

  // --- Aadhaar Verification Flow ---

  formatAadhaarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '').slice(0, 12);
    // Format into XXXX XXXX XXXX
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    this.aadhaarNumber.set(formatted);
    input.value = formatted;
    this.aadhaarError.set(null);
  }

  get cleanAadhaar(): string {
    return this.aadhaarNumber().replace(/\s/g, '');
  }

  async sendAadhaarOtp(): Promise<void> {
    const raw = this.cleanAadhaar;
    if (raw.length !== 12) {
      this.aadhaarError.set('Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    this.aadhaarLoading.set(true);
    this.aadhaarError.set(null);

    try {
      const res = await this.kycApi.generateAadhaarOtp({
        aadhaarNumber: raw,
      });
      this.aadhaarClientId.set(res.clientId);
      this.aadhaarStep.set('otp');
      this.startOtpTimer();
      this.toaster.open(
        res.message || 'OTP sent successfully to registered mobile.',
        'success',
      );
    } catch (err: unknown) {
      const msg =
        (err as any)?.error?.message ||
        (err as Error).message ||
        'Failed to generate Aadhaar OTP.';
      this.aadhaarError.set(msg);
      this.toaster.open(msg, 'error');
    } finally {
      this.aadhaarLoading.set(false);
    }
  }

  startOtpTimer(): void {
    this.clearOtpTimer();
    this.otpCountdown.set(60);
    this.timerInterval = setInterval(() => {
      const current = this.otpCountdown();
      if (current <= 1) {
        this.clearOtpTimer();
      } else {
        this.otpCountdown.set(current - 1);
      }
    }, 1000);
  }

  clearOtpTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.otpCountdown.set(0);
  }

  async submitAadhaarOtp(): Promise<void> {
    const otp = this.aadhaarOtp().trim();
    if (!otp || otp.length < 4) {
      this.aadhaarError.set('Please enter a valid verification OTP.');
      return;
    }

    this.aadhaarLoading.set(true);
    this.aadhaarError.set(null);

    try {
      const res = await this.kycApi.submitAadhaarOtp({
        clientId: this.aadhaarClientId(),
        otp,
      });
      this.aadhaarResult.set(res);
      this.aadhaarStep.set('verified');
      this.clearOtpTimer();
      this.toaster.open(
        `Successfully verified identity for ${res.fullName}`,
        'success',
      );
    } catch (err: unknown) {
      const msg =
        (err as any)?.error?.message ||
        (err as Error).message ||
        'Failed to verify Aadhaar OTP.';
      this.aadhaarError.set(msg);
      this.toaster.open(msg, 'error');
    } finally {
      this.aadhaarLoading.set(false);
    }
  }

  resetAadhaar(): void {
    this.aadhaarNumber.set('');
    this.aadhaarOtp.set('');
    this.aadhaarClientId.set('');
    this.aadhaarResult.set(null);
    this.aadhaarError.set(null);
    this.aadhaarStep.set('input');
    this.clearOtpTimer();
  }

  // --- Driving License Verification Flow ---

  formatDlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    this.dlNumber.set(clean);
    input.value = clean;
    this.dlError.set(null);
  }

  async verifyDrivingLicense(): Promise<void> {
    const dl = this.dlNumber().trim();
    if (dl.length < 10) {
      this.dlError.set('Please enter a valid Driving License number.');
      return;
    }

    this.dlLoading.set(true);
    this.dlError.set(null);

    try {
      const res = await this.kycApi.verifyDrivingLicense({
        dlNumber: dl,
        dob: this.dlDob() ? this.dlDob() : undefined,
      });
      this.dlResult.set(res);
      this.toaster.open(
        `Verified license for ${res.holderName} (${res.status})`,
        res.status === 'ACTIVE' ? 'success' : 'warning',
      );
    } catch (err: unknown) {
      const msg =
        (err as any)?.error?.message ||
        (err as Error).message ||
        'Failed to verify Driving License.';
      this.dlError.set(msg);
      this.toaster.open(msg, 'error');
    } finally {
      this.dlLoading.set(false);
    }
  }

  resetDl(): void {
    this.dlNumber.set('');
    this.dlDob.set('');
    this.dlResult.set(null);
    this.dlError.set(null);
  }

  // --- Helpers ---

  copyToClipboard(text: string, label: string): void {
    if (!text || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField.set(label);
      this.toaster.open(`${label} copied successfully.`, 'info');
      setTimeout(() => {
        if (this.copiedField() === label) {
          this.copiedField.set(null);
        }
      }, 2500);
    });
  }

  formatAddress(addr?: IAadhaarVerifiedData['address']): string {
    if (!addr) return 'N/A';
    const parts = [
      addr.careOf,
      addr.line,
      addr.street,
      addr.locality,
      addr.district,
      addr.state ? `${addr.state} - ${addr.pin}` : addr.pin,
      addr.country,
    ].filter((p) => !!p && p.trim().length > 0);
    return parts.join(', ');
  }
}
