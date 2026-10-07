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
import { AES, enc } from 'crypto-js';
import { environment } from '../../../../environments/environment';
import {
  User,
  AuthSession,
  AuthResponse,
  RefreshPermissionsResponse,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'portfolio_auth_session';
  private readonly ENCRYPTION_KEY = 'portfolio_secure_session_v1';

  // Expose a read-only signal for tracking user state reactively
  currentUser = signal<User | null | undefined>(undefined);

  private idleSubscription?: Subscription;
  private visibilitySubscription?: Subscription;
  private idleTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly IDLE_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in ms

  private permissionsIntervalId?: ReturnType<typeof setInterval>;
  private readonly PERMISSIONS_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in ms
  private lastPermissionsCheckTime = Date.now();
  private isRefreshingPermissions = false;
  private isInternalStorageWrite = false;

  constructor() {
    this.initSession();

    // Set up auto-logout effect, periodic permissions timer, and tamper detection if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.setupStorageTamperListener();

      effect(() => {
        const user = this.currentUser();
        if (user) {
          this.startIdleTimer();
          this.startPermissionsTimer();
        } else {
          this.stopIdleTimer();
          this.stopPermissionsTimer();
        }
      });
    }
  }

  private encryptData(plainText: string): string {
    try {
      return AES.encrypt(plainText, this.ENCRYPTION_KEY).toString();
    } catch (e) {
      console.error('[Security] Error encrypting session data:', e);
      return plainText;
    }
  }

  private decryptData(cipherText: string): string | null {
    if (!cipherText) return null;

    // Graceful backward compatibility for plaintext JSON (e.g. initial login migration or test fixtures)
    const trimmed = cipherText.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return cipherText;
    }

    try {
      const bytes = AES.decrypt(cipherText, this.ENCRYPTION_KEY);
      const decrypted = bytes.toString(enc.Utf8);
      if (!decrypted) {
        return null;
      }
      return decrypted;
    } catch (e) {
      console.warn('[Security] Error decrypting session data:', e);
      return null;
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
          this.checkActivityPermissionsRefresh();
        });

      // Also listen to tab visibility and focus resumption
      const visibilityEvents$ = merge(
        fromEvent(document, 'visibilitychange'),
        fromEvent(window, 'focus'),
      );

      this.visibilitySubscription = visibilityEvents$
        .pipe(throttleTime(5000))
        .subscribe(() => {
          if (
            typeof document !== 'undefined' &&
            document.visibilityState === 'visible'
          ) {
            const now = Date.now();
            // If at least 1 minute passed since last check when user returns to tab
            if (now - this.lastPermissionsCheckTime >= 60 * 1000) {
              this.ngZone.run(() => {
                this.refreshPermissions();
              });
            }
          }
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
        console.warn('User idle for 3 hours. Logging out automatically.');
        this.logout();
      });
    }, this.IDLE_TIMEOUT);
  }

  private stopIdleTimer() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = undefined;
    }
    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
      this.visibilitySubscription = undefined;
    }
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = undefined;
    }
  }

  private startPermissionsTimer() {
    this.stopPermissionsTimer();

    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      this.permissionsIntervalId = setInterval(() => {
        this.ngZone.run(() => {
          this.refreshPermissions();
        });
      }, this.PERMISSIONS_REFRESH_INTERVAL);
    });
  }

  private stopPermissionsTimer() {
    if (this.permissionsIntervalId) {
      clearInterval(this.permissionsIntervalId);
      this.permissionsIntervalId = undefined;
    }
  }

  private checkActivityPermissionsRefresh() {
    const now = Date.now();
    // If user was idle or inactive for at least 10 minutes since last permissions check, refresh permissions
    if (now - this.lastPermissionsCheckTime >= this.PERMISSIONS_REFRESH_INTERVAL) {
      this.ngZone.run(() => {
        this.refreshPermissions();
      });
    }
  }

  private setupStorageTamperListener() {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;

    // 1. Cross-tab storage change listener
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === this.STORAGE_KEY) {
        console.warn('[Security] Cross-tab localStorage change detected for auth session.');
        this.ngZone.run(() => {
          this.refreshPermissions();
        });
      }
    });

    // 2. In-tab storage modification monkey-patch
    try {
      const storageProto = Storage.prototype;
      if (!(storageProto as any).__tamperListenerAttached) {
        (storageProto as any).__tamperListenerAttached = true;
        const originalSetItem = storageProto.setItem;
        const originalRemoveItem = storageProto.removeItem;
        const self = this;

        storageProto.setItem = function (key: string, value: string) {
          originalSetItem.apply(this, [key, value]);
          if (key === self.STORAGE_KEY && !self.isInternalStorageWrite) {
            console.warn('[Security] Direct in-tab localStorage modification detected for auth session.');
            self.ngZone.run(() => {
              self.refreshPermissions();
            });
          }
        };

        storageProto.removeItem = function (key: string) {
          originalRemoveItem.apply(this, [key]);
          if (key === self.STORAGE_KEY && !self.isInternalStorageWrite) {
            console.warn('[Security] Direct in-tab localStorage removal detected for auth session.');
            self.ngZone.run(() => {
              self.currentUser.set(null);
              self.logout();
            });
          }
        };
      }
    } catch (e) {
      console.error('[Security] Could not attach storage tamper listeners:', e);
    }
  }

  private getStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      if (key === this.STORAGE_KEY) {
        const decrypted = this.decryptData(raw);
        if (!decrypted) {
          console.warn('[Security] Failed to decrypt session data from storage.');
          return null;
        }

        // Auto-upgrade plain JSON to encrypted in storage
        if (raw.trim().startsWith('{')) {
          this.setStorageItem(key, decrypted);
        }

        return decrypted;
      }

      return raw;
    }
    return null;
  }

  private setStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isInternalStorageWrite = true;
      try {
        const dataToStore =
          key === this.STORAGE_KEY ? this.encryptData(value) : value;
        localStorage.setItem(key, dataToStore);
      } finally {
        this.isInternalStorageWrite = false;
      }
    }
  }

  private removeStorageItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.isInternalStorageWrite = true;
      try {
        localStorage.removeItem(key);
      } finally {
        this.isInternalStorageWrite = false;
      }
    }
  }

  private updateStoredUser(updatedUser: User): void {
    const sessionStr = this.getStorageItem(this.STORAGE_KEY);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr) as AuthSession;
        session.user = updatedUser;
        this.setStorageItem(this.STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error('Error updating session user in storage:', e);
      }
    }
    this.currentUser.set(updatedUser);
    this.validateCurrentRouteAccess(updatedUser);
  }

  private validateCurrentRouteAccess(user: User): void {
    const currentUrl = this.router.url;
    if (!currentUrl.startsWith('/user') || currentUrl.startsWith('/user/login')) {
      return;
    }

    const modules = user.modules || {
      aiSpace: false,
      aiAssistant: false,
      fileManager: false,
      dietHydration: false,
    };
    let hasAccess = true;

    if (currentUrl.startsWith('/user/admin') && !user.masterAdmin) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/ai') && !modules.aiAssistant) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/chat') && !modules.aiSpace) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/files') && !modules.fileManager) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/diet-hydration') && !modules.dietHydration) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/planner') && !modules.planner) {
      hasAccess = false;
    } else if (currentUrl.startsWith('/user/movies') && !modules.movies) {
      hasAccess = false;
    }

    if (!hasAccess) {
      console.warn(`[Security] Access revoked for current route: ${currentUrl}. Redirecting...`);
      this.router.navigate(['/user']);
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
        // Verify with backend permissions in background on initialization
        if (session.access_token) {
          this.refreshPermissions().catch((e) =>
            console.error('Initial permissions verification error:', e),
          );
        }
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

  // Refresh user permissions and validate session integrity from the server
  async refreshPermissions(): Promise<User | null> {
    if (this.isRefreshingPermissions) {
      return this.currentUser() ?? null;
    }

    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    this.isRefreshingPermissions = true;
    const url = `${environment.APIURL}/auth/permissions`;
    const headers = this.getHeaders().set('Authorization', `Bearer ${token}`);

    try {
      const res = await firstValueFrom(
        this.http.get<RefreshPermissionsResponse>(url, { headers }),
      );

      this.lastPermissionsCheckTime = Date.now();
      if (res?.user) {
        this.updateStoredUser(res.user);
        return res.user;
      }
      return null;
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        // If token revoked, expired, or account deactivated, force logout
        if (err.status === 401 || err.status === 403) {
          console.warn('[Security] Token invalid or user deactivated. Forcing logout.');
          await this.logout();
          return null;
        }
      }
      console.error('Error refreshing permissions:', err);
      return null;
    } finally {
      this.isRefreshingPermissions = false;
    }
  }

  // Refresh user session using refresh token
  private async refreshSession(refreshToken: string): Promise<User> {
    const url = `${environment.APIURL}/auth/refresh`;
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(
          url,
          { refresh_token: refreshToken },
          { headers: this.getHeaders() },
        ),
      );
      if (!res.user) {
        throw new Error('User not found in refreshed session');
      }
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
    const url = `${environment.APIURL}/auth/signup`;
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

      // Signup does not authenticate the user; account requires admin approval
      return {
        user: res?.user || null,
        message:
          res?.message ||
          'Admin will enable your account, please wait.',
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
    const url = `${environment.APIURL}/auth/login`;
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
    this.stopPermissionsTimer();
    this.stopIdleTimer();

    const url = `${environment.APIURL}/auth/logout`;
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
