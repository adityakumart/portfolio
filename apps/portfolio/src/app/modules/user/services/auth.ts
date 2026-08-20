import {
  Injectable,
  inject,
  signal,
  effect,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, fromEvent, merge, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, AuthSession, AuthResponse } from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'portfolio_auth_session';

  // Expose a read-only signal for tracking user state reactively
  currentUser = signal<User | null | undefined>(undefined);

  private idleSubscription?: Subscription;
  private idleTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly IDLE_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in ms

  constructor() {
    this.initSession();

    // Set up auto-logout effect if in browser
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        const user = this.currentUser();
        if (user) {
          this.startIdleTimer();
        } else {
          this.stopIdleTimer();
        }
      });
    }
  }

  private startIdleTimer() {
    this.stopIdleTimer();

    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // Listen to common user activity events
      const activityEvents$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'mousedown'),
        fromEvent(window, 'keypress'),
        fromEvent(window, 'scroll'),
        fromEvent(window, 'touchstart'),
        fromEvent(window, 'click'),
      );

      // Reset timer on activity, throttle to once every 2 seconds to save CPU
      this.idleSubscription = activityEvents$
        .pipe(throttleTime(2000))
        .subscribe(() => {
          this.resetIdleTimer();
        });

      // Start the initial timer
      this.resetIdleTimer();
    });
  }

  private resetIdleTimer() {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
    }

    this.idleTimeoutId = setTimeout(() => {
      // Time is up! Run logout inside Angular zone so that routing and state updates work correctly
      this.ngZone.run(() => {
        console.warn('User idle for 2 hours. Logging out automatically.');
        this.logout();
      });
    }, this.IDLE_TIMEOUT);
  }

  private stopIdleTimer() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = undefined;
    }
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = undefined;
    }
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

  private saveSession(res: Partial<AuthResponse>) {
    if (res && res.access_token && res.user) {
      const now = Math.floor(Date.now() / 1000);
      const session: AuthSession = {
        access_token: res.access_token,
        refresh_token: res.refresh_token || '',
        expires_in: res.expires_in || 0,
        expires_at: now + (res.expires_in || 0),
        user: res.user,
      };
      this.setStorageItem(this.STORAGE_KEY, JSON.stringify(session));
    }
  }

  private clearSession() {
    this.removeStorageItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    const sessionStr = this.getStorageItem(this.STORAGE_KEY);
    if (!sessionStr) return null;
    try {
      const session = JSON.parse(sessionStr) as AuthSession;
      return session.access_token || null;
    } catch (e) {
      console.error('Error reading access token from storage:', e);
      return null;
    }
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
        this.http.post<AuthResponse>(
          url,
          { refresh_token: refreshToken },
          { headers: this.getHeaders() },
        ),
      );
      this.saveSession(res);
      return res.user;
    } catch (err) {
      this.clearSession();
      throw err;
    }
  }

  // Register a new user
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    const url = `${environment.apiUrl}/auth/signup`;
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(
          url,
          {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          },
          { headers: this.getHeaders() },
        ),
      );

      // If direct signup returns a session (auto-confirm is enabled), save it
      if (res && res.access_token && res.user) {
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
    } catch (err: unknown) {
      let errorMsg = 'An unknown error occurred';
      if (err instanceof HttpErrorResponse) {
        errorMsg =
          err.error?.error_description ||
          err.error?.message ||
          err.error?.msg ||
          err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      throw new Error(errorMsg);
    }
  }

  // Sign in existing user
  async login(email: string, password: string) {
    const url = `${environment.apiUrl}/auth/login`;
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(
          url,
          { email, password },
          { headers: this.getHeaders() },
        ),
      );

      this.saveSession(res);
      this.currentUser.set(res.user);

      return {
        user: res.user,
        session: res,
      };
    } catch (err: unknown) {
      let errorMsg = 'An unknown error occurred';
      if (err instanceof HttpErrorResponse) {
        errorMsg =
          err.error?.error_description ||
          err.error?.message ||
          err.error?.msg ||
          err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
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
      } catch {
        // ignore
      }
    }

    try {
      if (token) {
        const headers = this.getHeaders().set(
          'Authorization',
          `Bearer ${token}`,
        );
        await firstValueFrom(this.http.post<unknown>(url, {}, { headers }));
      }
    } catch (err) {
      console.error('Error calling logout API:', err);
    } finally {
      this.clearSession();
      // Redirect to login if on a protected user route
      const currentUrl = this.router.url;
      if (
        currentUrl.startsWith('/user') &&
        !currentUrl.startsWith('/user/login')
      ) {
        this.router.navigate(['/user/login']);
      }
    }
  }
}
