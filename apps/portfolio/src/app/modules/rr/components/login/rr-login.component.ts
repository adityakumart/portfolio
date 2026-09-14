import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmTabsImports } from '@spartan-ng/hel/tabs';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmSpinnerImports } from '@spartan-ng/hel/spinner';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmSeparatorImports } from '@spartan-ng/hel/separator';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldCheck,
  lucideCar,
  lucideAlertCircle,
  lucideCheckCircle,
  lucideBadgeCheck,
  lucideCalendar,
  lucideUser,
  lucideLock,
  lucideEyeOff,
  lucideEye,
  lucideArrowLeft,
  lucideZap,
  lucideSparkles,
} from '@ng-icons/lucide';
import { RRApiService } from '../../services/rr-api.service';

@Component({
  selector: 'app-rr-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HlmCardImports,
    HlmTabsImports,
    HlmInputImports,
    HlmLabelImports,
    HlmButtonImports,
    HlmSpinnerImports,
    HlmBadgeImports,
    HlmSeparatorImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideShieldCheck,
      lucideCar,
      lucideAlertCircle,
      lucideCheckCircle,
      lucideBadgeCheck,
      lucideCalendar,
      lucideUser,
      lucideLock,
      lucideEyeOff,
      lucideEye,
      lucideArrowLeft,
      lucideZap,
      lucideSparkles,
    }),
  ],
  templateUrl: './rr-login.component.html',
  styleUrl: './rr-login.component.scss',
})
export class RRLoginComponent {
  rrApi = inject(RRApiService);
  private router = inject(Router);

  // Form Groups
  employeeFormGroup = new FormGroup({
    empId: new FormControl('', [Validators.required, Validators.pattern(/^RRA[0-9]{3}$/)]),
    dob: new FormControl('', [Validators.required]),
  });

  adminFormGroup = new FormGroup({
    adminUsername: new FormControl('', [Validators.required]),
    adminPassword: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  // State Signals
  selectedRole = signal<'employee' | 'admin'>('employee');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  authError = this.error;
  authSuccess = this.success;
  showPassword = signal(false);

  constructor() {
    effect(() => {
      const user = this.rrApi.currentUser();
      if (user) {
        this.router.navigate(['/user/rr/dashboard']);
      }
    });
  }

  setRole(role: 'employee' | 'admin') {
    this.selectedRole.set(role);
    this.error.set(null);
    this.success.set(null);
    this.employeeFormGroup.reset();
    this.adminFormGroup.reset();
  }

  switchRole(role: 'employee' | 'admin') {
    this.setRole(role);
  }

  async onEmployeeSubmit() {
    if (this.employeeFormGroup.invalid) return;

    this.error.set(null);
    this.success.set(null);
    this.loading.set(true);

    const enteredId = this.employeeFormGroup.value.empId || '';
    const enteredDob = this.employeeFormGroup.value.dob || '';

    try {
      await this.rrApi.login({ empId: enteredId, dob: enteredDob });
      this.success.set('Login successful! Redirecting...');
      toast.success('Login successful! Redirecting to fleet console...');
      setTimeout(() => {
        this.router.navigate(['/user/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Employee login error:', err);
      const msg = err.error?.message || 'Login failed. Please check your credentials.';
      this.error.set(msg);
      toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async onAdminSubmit() {
    if (this.adminFormGroup.invalid) return;

    this.error.set(null);
    this.success.set(null);
    this.loading.set(true);

    const username = this.adminFormGroup.value.adminUsername || '';
    const password = this.adminFormGroup.value.adminPassword || '';

    try {
      await this.rrApi.login({ username, password });
      this.success.set('Admin login successful! Redirecting...');
      toast.success('Admin login successful! Redirecting to fleet console...');
      setTimeout(() => {
        this.router.navigate(['/user/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Admin login error:', err);
      const msg = err.error?.message || 'Admin login failed. Please check your credentials.';
      this.error.set(msg);
      toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }

  fillDemoAdmin() {
    this.setRole('admin');
    this.adminFormGroup.patchValue({
      adminUsername: 'admin@rams-cars.com',
      adminPassword: 'AdminPD',
    });
  }

  fillDemoEmployee() {
    this.setRole('employee');
    this.employeeFormGroup.patchValue({
      empId: 'RRA002',
      dob: '1990-05-15',
    });
  }
}
