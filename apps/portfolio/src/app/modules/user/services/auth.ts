// auth.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: User;
}

@Injectable()
export class AuthService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'portfolio_auth_session';

  // Expose a read-only signal for tracking user state reactively
  currentUser = signal<User | null | undefined>(undefined);

  constructor() {
    this.initSession();
  }

  private getStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  }

  private async initSession() {
    const sessionStr = this.getStorageItem(this.STORAGE_KEY);
    if (!sessionStr) {
      this.currentUser.set(null);
      return;
    }

    try {
      const session = JSON.parse(sessionStr) as AuthSession;
      const now = Math.floor(Date.now() / 1000);

      // If expired or expiring in less than 60 seconds, try to refresh
      if (session.expires_at && session.expires_at - now < 60) {
        if (session.refresh_token) {
          const newUser = await this.refreshSession(session.refresh_token);
          this.currentUser.set(newUser);
        } else {
          this.clearSession();
        }
      } else {
        this.currentUser.set(session.user);
      }
    } catch (e) {
      console.error('Error initializing auth session:', e);
      this.clearSession();
    }
  }

  private saveSession(res: any) {
    if (res && res.access_token) {
      const now = Math.floor(Date.now() / 1000);
      const session: AuthSession = {
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        expires_in: res.expires_in,
        expires_at: now + res.expires_in,
        user: res.user,
      };
      this.setStorageItem(this.STORAGE_KEY, JSON.stringify(session));
    }
  }

  private clearSession() {
    this.removeStorageItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  // Refresh user session using refresh token
  private async refreshSession(refreshToken: string): Promise<User> {
    const url = `${environment.apiUrl}/auth/refresh`;
    try {
      const res = await firstValueFrom(
        this.http.post<any>(
          url,
          { refresh_token: refreshToken },
          { headers: this.getHeaders() }
        )
      );
      this.saveSession(res);
      return res.user;
    } catch (err) {
      this.clearSession();
      throw err;
    }
  }

  // Register a new user
  async register(email: string, password: string, firstName: string, lastName: string) {
    const url = `${environment.apiUrl}/auth/signup`;
    try {
      const res = await firstValueFrom(
        this.http.post<any>(
          url,
          {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          },
          { headers: this.getHeaders() }
        )
      );

      // If direct signup returns a session (auto-confirm is enabled), save it
      if (res && res.access_token) {
        this.saveSession(res);
        this.currentUser.set(res.user);
      } else {
        // If confirmation is required, we may just have a user object
        this.currentUser.set(res?.user || null);
      }

      return {
        user: res?.user || null,
        session: res?.access_token ? res : null,
      };
    } catch (err: any) {
      const errorMsg = err.error?.error_description || err.error?.message || err.error?.msg || err.message;
      throw new Error(errorMsg);
    }
  }

  // Sign in existing user
  async login(email: string, password: string) {
    const url = `${environment.apiUrl}/auth/login`;
    try {
      const res = await firstValueFrom(
        this.http.post<any>(
          url,
          { email, password },
          { headers: this.getHeaders() }
        )
      );

      this.saveSession(res);
      this.currentUser.set(res.user);

      return {
        user: res.user,
        session: res,
      };
    } catch (err: any) {
      const errorMsg = err.error?.error_description || err.error?.message || err.error?.msg || err.message;
      throw new Error(errorMsg);
    }
  }

  // Logout
  async logout() {
    const url = `${environment.apiUrl}/auth/logout`;
    const sessionStr = this.getStorageItem(this.STORAGE_KEY);
    let token = '';
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr) as AuthSession;
        token = session.access_token;
      } catch (e) {
        // ignore
      }
    }

    try {
      if (token) {
        const headers = this.getHeaders().set('Authorization', `Bearer ${token}`);
        await firstValueFrom(
          this.http.post<any>(url, {}, { headers })
        );
      }
    } catch (err) {
      console.error('Error calling logout API:', err);
    } finally {
      this.clearSession();
    }
  }
}
