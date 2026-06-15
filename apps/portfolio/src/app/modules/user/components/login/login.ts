import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.router.navigate(['/user']);
      }
    });
  }

  mode = signal<'login' | 'signup'>('login');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  setMode(newMode: 'login' | 'signup') {
    this.mode.set(newMode);
    this.error.set(null);
    this.success.set(null);
    this.password.set('');
    this.confirmPassword.set('');
  }

  async onSubmit() {
    this.error.set(null);
    this.success.set(null);

    const emailVal = this.email().trim();
    const passwordVal = this.password();

    if (!emailVal || !passwordVal) {
      this.error.set('Please fill out all required fields.');
      return;
    }

    if (passwordVal.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }

    if (this.mode() === 'signup' && passwordVal !== this.confirmPassword()) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);

    try {
      if (this.mode() === 'login') {
        await this.authService.login(emailVal, passwordVal);
        this.success.set('Successfully logged in! Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/user']);
        }, 1000);
      } else {
        await this.authService.register(emailVal, passwordVal);
        this.success.set('Account created successfully! Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/user']);
        }, 1500);
      }
      // Clear input fields
      this.email.set('');
      this.password.set('');
      this.confirmPassword.set('');
    } catch (err: any) {
      console.error('Authentication error:', err);
      this.error.set(this.getErrorMessage(err.code || err.message));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(msg: string): string {
    const lowercaseMsg = (msg || '').toLowerCase();

    if (
      lowercaseMsg.includes('invalid') &&
      (lowercaseMsg.includes('credential') ||
        lowercaseMsg.includes('login') ||
        lowercaseMsg.includes('email'))
    ) {
      return 'Invalid email address or password.';
    }
    if (
      lowercaseMsg.includes('already registered') ||
      lowercaseMsg.includes('already exists') ||
      lowercaseMsg.includes('already in use')
    ) {
      return 'This email address is already registered.';
    }
    if (lowercaseMsg.includes('disabled')) {
      return 'This user account has been disabled.';
    }
    if (
      lowercaseMsg.includes('not found') ||
      lowercaseMsg.includes('no user')
    ) {
      return 'No user found with this email.';
    }
    if (
      lowercaseMsg.includes('wrong password') ||
      lowercaseMsg.includes('incorrect password')
    ) {
      return 'Incorrect password. Please try again.';
    }
    if (lowercaseMsg.includes('weak') || lowercaseMsg.includes('characters')) {
      return 'The password is too weak. Choose at least 6 characters.';
    }
    if (
      lowercaseMsg.includes('not confirmed') ||
      lowercaseMsg.includes('confirm your email')
    ) {
      return 'Please confirm your email address.';
    }

    return msg || 'An unexpected error occurred. Please try again.';
  }
}
