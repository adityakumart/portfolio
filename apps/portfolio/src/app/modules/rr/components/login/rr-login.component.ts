import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RRApiService } from '../../services/rr-api.service';

@Component({
  selector: 'app-rr-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
    dob: new FormControl('', [Validators.required])
  });

  adminFormGroup = new FormGroup({
    adminUsername: new FormControl('', [Validators.required]),
    adminPassword: new FormControl('', [Validators.required, Validators.minLength(4)])
  });

  // State Signals
  selectedRole = signal<'employee' | 'admin'>('employee');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
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
      setTimeout(() => {
        this.router.navigate(['/user/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Employee login error:', err);
      this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
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
      setTimeout(() => {
        this.router.navigate(['/user/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Admin login error:', err);
      this.error.set(err.error?.message || 'Admin login failed. Please check your credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}
