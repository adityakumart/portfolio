import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
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

  constructor() {
    effect(() => {
      const user = this.rrApi.currentUser();
      if (user) {
        this.router.navigate(['/rr/dashboard']);
      }
    });
  }

  // State Signals
  selectedRole = signal<'employee' | 'admin'>('employee');
  empId = signal('');
  dob = signal('');
  adminUsername = signal('');
  adminPassword = signal('');

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showPassword = signal(false);

  setRole(role: 'employee' | 'admin') {
    this.selectedRole.set(role);
    this.error.set(null);
    this.success.set(null);
    this.empId.set('');
    this.dob.set('');
    this.adminUsername.set('');
    this.adminPassword.set('');
  }

  async onEmployeeSubmit() {
    this.error.set(null);
    this.success.set(null);

    const enteredId = this.empId().trim();
    const enteredDob = this.dob().trim(); // Format: 'YYYY-MM-DD'

    if (!enteredId || !enteredDob) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    this.loading.set(true);
    try {
      await this.rrApi.login({ empId: enteredId, dob: enteredDob });
      this.success.set('Login successful! Redirecting...');
      setTimeout(() => {
        this.router.navigate(['/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Employee login error:', err);
      this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      this.loading.set(false);
    }
  }

  async onAdminSubmit() {
    this.error.set(null);
    this.success.set(null);

    const username = this.adminUsername().trim();
    const password = this.adminPassword().trim();

    if (!username || !password) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    this.loading.set(true);
    try {
      await this.rrApi.login({ username, password });
      this.success.set('Admin login successful! Redirecting...');
      setTimeout(() => {
        this.router.navigate(['/rr/dashboard']);
      }, 1000);
    } catch (err: any) {
      console.error('Admin login error:', err);
      this.error.set(err.error?.message || 'Admin login failed. Please check your credentials.');
    } finally {
      this.loading.set(false);
    }
  }
}
