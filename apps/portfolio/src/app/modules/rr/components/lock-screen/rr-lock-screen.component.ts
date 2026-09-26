import { Component, inject, signal, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLock,
  lucideEye,
  lucideEyeOff,
  lucideLogOut,
  lucideShieldAlert,
  lucideShieldCheck,
  lucideAlertCircle,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmSpinnerImports } from '@spartan-ng/hel/spinner';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmAvatarImports } from '@spartan-ng/hel/avatar';
import { RRInactivityService } from '../../services/rr-inactivity.service';
import { RRApiService } from '../../services/rr-api.service';

@Component({
  selector: 'app-rr-lock-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSpinnerImports,
    HlmBadgeImports,
    HlmAvatarImports,
  ],
  providers: [
    provideIcons({
      lucideLock,
      lucideEye,
      lucideEyeOff,
      lucideLogOut,
      lucideShieldAlert,
      lucideShieldCheck,
      lucideAlertCircle,
      lucideSparkles,
    }),
  ],
  templateUrl: './rr-lock-screen.component.html',
  styleUrl: './rr-lock-screen.component.scss',
})
export class RRLockScreenComponent implements AfterViewInit {
  inactivityService = inject(RRInactivityService);
  rrApi = inject(RRApiService);

  credentialInput = signal<string>('');
  showPassword = signal<boolean>(false);

  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isVerifying = computed(() => this.inactivityService.isVerifying());
  errorMessage = computed(() => this.inactivityService.errorMessage());

  ngAfterViewInit(): void {
    // Focus the credential input automatically on desktop and web
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const input = document.getElementById('rr-lock-credential') as HTMLInputElement;
        input?.focus();
      }
    }, 100);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'RR';
    const f = user.firstName ? user.firstName.substring(0, 1) : '';
    const l = user.lastName ? user.lastName.substring(0, 1) : '';
    return (f + l).toUpperCase() || 'RR';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onUnlockSubmit(): Promise<void> {
    const val = this.credentialInput();
    if (!val) return;
    const success = await this.inactivityService.verifyAndUnlock(val);
    if (success) {
      this.credentialInput.set('');
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onUnlockSubmit();
    } else if (event.key === 'Escape') {
      // Prevent dismissing security lock screen on desktop
      event.preventDefault();
      event.stopPropagation();
    }
  }

  async onLogout(): Promise<void> {
    await this.inactivityService.logout();
  }
}
