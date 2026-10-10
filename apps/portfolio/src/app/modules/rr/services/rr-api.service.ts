import { Injectable, inject, signal, computed, effect, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, fromEvent, merge, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AES, enc } from 'crypto-js';
import { environment } from '../../../../environments/environment';
import {
  maskToken,
  createStorageEnvelope,
  verifyStorageEnvelope,
  unwrapStoragePayload,
  SecureStorageEnvelope,
} from '../../../shared/utils/security.utils';
import {
  IRRUser,
  IVehicle,
  IVehicleAutocompleteItem,
  IBooking,
  IEmployee,
  ILog,
  ILogsResponse,
  IBookingsResponse,
  IRRDashboardStats,
  IRRVehicleAvailability,
  IRRLoginRequest,
  IRRLoginResponse,
  IRRPermissionsResponse,
  ICustomerIntimation,
  IVehicleImageUploadResponse,
  IVehicleUploadedAsset,
} from '@portfolio/shared-types';

export {
  maskToken,
  createStorageEnvelope,
  verifyStorageEnvelope,
  unwrapStoragePayload,
};
export type { SecureStorageEnvelope };

export type {
  IRRUser,
  IVehicle,
  IVehicleAutocompleteItem,
  IBooking,
  IEmployee,
  ILog,
  ILogsResponse,
  IBookingsResponse,
  IRRDashboardStats,
  IRRVehicleAvailability,
  IRRLoginRequest,
  IRRLoginResponse,
  IRRPermissionsResponse,
  ICustomerIntimation,
  IVehicleImageUploadResponse,
  IVehicleUploadedAsset,
};

@Injectable({
  providedIn: 'root',
})
export class RRApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.APIURL}/rr`;
  private readonly ENCRYPTION_KEY = 'portfolio_rr_secure_session_v1';
  private readonly STORAGE_KEY_USER = '_rr_state_u';
  private readonly STORAGE_KEY_TOKEN = '_rr_sec_tk';
  private readonly STORAGE_KEY_ROLE = '_rr_pref_meta';

  private readonly LEGACY_KEY_USER = 'rr_user';
  private readonly LEGACY_KEY_TOKEN = 'rr_token';
  private readonly LEGACY_KEY_ROLE = 'loggedInUser';
  private readonly PERMISSIONS_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in ms

  private permissionsIntervalId?: ReturnType<typeof setInterval>;
  private idleSubscription?: Subscription;
  private visibilitySubscription?: Subscription;
  private lastPermissionsCheckTime = Date.now();
  private isRefreshingPermissions = false;
  private internalStorageWriteDepth = 0;

  get isInternalStorageWrite(): boolean {
    return this.internalStorageWriteDepth > 0;
  }

  private withInternalStorageWrite<T>(action: () => T): T {
    this.internalStorageWriteDepth++;
    try {
      return action();
    } finally {
      this.internalStorageWriteDepth--;
    }
  }

  // Signals
  currentUser = signal<IRRUser | null>(null);
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.loadSession();

    if (isPlatformBrowser(this.platformId)) {
      this.setupStorageTamperListener();

      effect(() => {
        const user = this.currentUser();
        if (user) {
          this.startActivityTracking();
          this.startPermissionsTimer();
        } else {
          this.stopActivityTracking();
          this.stopPermissionsTimer();
        }
      });
    }
  }

  private isPersistentEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    const isExtension = !!(window as any).chrome?.runtime?.id;
    const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();
    const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
    return isExtension || isCapacitor || isTauri;
  }

  /**
   * Derives a device/browser-bound cryptographic key using hardware and environment entropy.
   * Prevents stolen ciphertext from being decrypted on another device, browser profile, or origin.
   */
  private getDeviceBoundKey(): string {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return this.ENCRYPTION_KEY;
    }

    try {
      const screenWidth = typeof screen !== 'undefined' ? screen.width : 0;
      const screenHeight = typeof screen !== 'undefined' ? screen.height : 0;
      // Normalize screen dimensions so mobile device rotation between portrait and landscape does not invalidate the key
      const screenDim = `${Math.max(screenWidth, screenHeight)}x${Math.min(screenWidth, screenHeight)}`;
      const colorDepth = typeof screen !== 'undefined' ? screen.colorDepth : 24;
      const concurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
      const origin = window.location ? window.location.origin : '';

      const deviceEntropy = [
        origin,
        userAgent,
        screenDim,
        colorDepth,
        concurrency,
      ].join('::');

      return `${this.ENCRYPTION_KEY}::${deviceEntropy}`;
    } catch {
      return this.ENCRYPTION_KEY;
    }
  }

  private encryptData(plainText: string): string {
    try {
      return AES.encrypt(plainText, this.getDeviceBoundKey()).toString();
    } catch (e) {
      console.error('[Security] Error encrypting RR session data:', e);
      return plainText;
    }
  }

  private decryptData(cipherText: string): string | null {
    if (!cipherText) return null;

    // Graceful backward compatibility for plaintext JSON/tokens
    const trimmed = cipherText.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[') || !trimmed.startsWith('U2FsdGVkX1')) {
      return cipherText;
    }

    try {
      const key = this.getDeviceBoundKey();
      let decrypted = '';

      try {
        const bytes = AES.decrypt(cipherText, key);
        decrypted = bytes.toString(enc.Utf8);
      } catch {
        // Mismatched key throws Malformed UTF-8 data; fall through to static key check
      }

      // Backward compatibility fallback: decrypt older sessions created with static ENCRYPTION_KEY
      if (!decrypted && key !== this.ENCRYPTION_KEY) {
        try {
          const bytes = AES.decrypt(cipherText, this.ENCRYPTION_KEY);
          decrypted = bytes.toString(enc.Utf8);
        } catch {
          // Malformed or invalid key
        }
      }

      if (!decrypted) {
        return null;
      }
      return decrypted;
    } catch (e) {
      console.warn('[Security] Error decrypting RR session data:', e);
      return null;
    }
  }

  /**
   * Measure 2 & Phase 4: Cryptographic Integrity Envelope & Client-Side TTL
   */
  createEnvelope<T>(payload: T, ttlMs?: number): SecureStorageEnvelope<T> {
    return createStorageEnvelope(payload, ttlMs);
  }

  verifyEnvelope<T>(envelope: SecureStorageEnvelope<T>): T | null {
    return verifyStorageEnvelope(envelope);
  }

  private getStorageItem(storage: Storage, key: string): string | null {
    try {
      let raw = storage.getItem(key);
      // Transparent migration from legacy un-obfuscated keys
      if (!raw) {
        if (key === this.STORAGE_KEY_USER) {
          raw = storage.getItem(this.LEGACY_KEY_USER);
          if (raw) {
            try { storage.removeItem(this.LEGACY_KEY_USER); } catch { /* ignore */ }
            this.setEncryptedItem(storage, key, raw);
          }
        } else if (key === this.STORAGE_KEY_TOKEN) {
          raw = storage.getItem(this.LEGACY_KEY_TOKEN);
          if (raw) {
            try { storage.removeItem(this.LEGACY_KEY_TOKEN); } catch { /* ignore */ }
            this.setEncryptedItem(storage, key, raw);
          }
        } else if (key === this.STORAGE_KEY_ROLE) {
          raw = storage.getItem(this.LEGACY_KEY_ROLE);
          if (raw) {
            try { storage.removeItem(this.LEGACY_KEY_ROLE); } catch { /* ignore */ }
            this.setEncryptedItem(storage, key, raw);
          }
        }
      }
      if (!raw) return null;

      const decrypted = this.decryptData(raw);
      if (!decrypted) {
        return null;
      }

      try {
        const parsed = JSON.parse(decrypted);
        const unwrapped = unwrapStoragePayload(parsed);
        if (!unwrapped) {
          console.warn(`[Security] RR storage envelope for ${key} invalid or expired.`);
          this.isInternalStorageWrite = true;
          try {
            storage.removeItem(key);
          } catch {
            /* ignore */
          } finally {
            this.isInternalStorageWrite = false;
          }
          return null;
        }

        const unwrappedStr =
          typeof unwrapped.payload === 'string'
            ? unwrapped.payload
            : JSON.stringify(unwrapped.payload);

        // Auto-upgrade plain or legacy unenveloped storage to encrypted envelope
        if (!unwrapped.wasEnveloped || raw.trim().startsWith('{') || !raw.startsWith('U2FsdGVkX1')) {
          this.setEncryptedItem(storage, key, unwrappedStr);
        }

        return unwrappedStr;
      } catch {
        return decrypted;
      }
    } catch (err) {
      console.warn(`[Security] Could not access RR storage for ${key}:`, err);
      return null;
    }
  }

  private setEncryptedItem(storage: Storage, key: string, value: string): void {
    this.withInternalStorageWrite(() => {
      let dataToStore = value;
      if (
        key === this.STORAGE_KEY_USER ||
        key === this.STORAGE_KEY_TOKEN ||
        key === this.STORAGE_KEY_ROLE ||
        key === this.LEGACY_KEY_USER ||
        key === this.LEGACY_KEY_TOKEN ||
        key === this.LEGACY_KEY_ROLE
      ) {
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(value);
        } catch {
          parsed = value;
        }

        let envelope: SecureStorageEnvelope<unknown>;
        if (
          parsed &&
          typeof parsed === 'object' &&
          'payload' in parsed &&
          'storedAt' in parsed &&
          'checksum' in parsed &&
          'ttlMs' in parsed
        ) {
          envelope = parsed as SecureStorageEnvelope<unknown>;
        } else {
          // RR session TTL: 24h for persistent environments, 2h default
          const ttlMs = this.isPersistentEnvironment()
            ? 24 * 60 * 60 * 1000
            : 2 * 60 * 60 * 1000;
          envelope = createStorageEnvelope(parsed, ttlMs);
        }

        dataToStore = JSON.stringify(envelope);
      }
      try {
        storage.setItem(key, this.encryptData(dataToStore));
      } catch (err) {
        console.warn(`[Security] Could not write ${key} to RR storage:`, err);
      }
    });
  }

  private removeStorageItem(storage: Storage, key: string): void {
    this.withInternalStorageWrite(() => {
      try {
        storage.removeItem(key);
      } catch (err) {
        console.warn(`[Security] Could not remove ${key} from RR storage:`, err);
      }
    });
  }

  private loadSession() {
    if (typeof window !== 'undefined') {
      let userStr: string | null = null;
      let token: string | null = null;
      try {
        userStr = window.sessionStorage ? this.getStorageItem(sessionStorage, this.STORAGE_KEY_USER) : null;
        token = window.sessionStorage ? this.getStorageItem(sessionStorage, this.STORAGE_KEY_TOKEN) : null;

        // In extension and mobile environments, fallback to localStorage if sessionStorage was wiped on backgrounding
        if ((!userStr || !token) && this.isPersistentEnvironment() && window.localStorage) {
          userStr = this.getStorageItem(localStorage, this.STORAGE_KEY_USER);
          token = this.getStorageItem(localStorage, this.STORAGE_KEY_TOKEN);
        }
      } catch (err) {
        console.warn('[Security] Could not read session from storage:', err);
      }

      if (userStr && token) {
        try {
          const storedUser = JSON.parse(userStr);
          // Data minimization: if stored session contains legacy PII, sanitize storage
          if (storedUser && ('email' in storedUser || 'firstName' in storedUser)) {
            const sanitized = this.minimizeRRUser(storedUser as IRRUser);
            if (window.sessionStorage) {
              this.setEncryptedItem(sessionStorage, this.STORAGE_KEY_USER, JSON.stringify(sanitized));
            }
            if (this.isPersistentEnvironment() && window.localStorage) {
              this.setEncryptedItem(localStorage, this.STORAGE_KEY_USER, JSON.stringify(sanitized));
            }
          }

          this.currentUser.set(storedUser);
          // Verify with backend permissions in background on initialization to fetch full user profile into reactive memory
          this.refreshPermissions().catch((e) =>
            console.error('Initial RR permissions check error:', e),
          );
        } catch {
          this.clearSession();
        }
      }
    }
  }

  /**
   * Data Minimization: Strips sensitive PII (firstName, lastName, email) before writing to browser storage.
   * Only non-sensitive authorization context (id, role) is persisted.
   * Full user profiles remain strictly in Angular reactive memory (currentUser signal).
   */
  private minimizeRRUser(user: IRRUser): Partial<IRRUser> {
    return {
      id: user.id,
      role: user.role,
    };
  }

  private saveSession(user: IRRUser, token: string) {
    if (typeof window !== 'undefined') {
      const minimizedUser = this.minimizeRRUser(user);
      const userJson = JSON.stringify(minimizedUser);
      const roleJson = JSON.stringify({ role: user.role, id: user.id });

      if (window.sessionStorage) {
        this.setEncryptedItem(sessionStorage, this.STORAGE_KEY_USER, userJson);
        this.setEncryptedItem(sessionStorage, this.STORAGE_KEY_TOKEN, token);
        this.setEncryptedItem(sessionStorage, this.STORAGE_KEY_ROLE, roleJson);
      }

      if (this.isPersistentEnvironment()) {
        if (window.localStorage) {
          this.setEncryptedItem(localStorage, this.STORAGE_KEY_USER, userJson);
          this.setEncryptedItem(localStorage, this.STORAGE_KEY_TOKEN, token);
          this.setEncryptedItem(localStorage, this.STORAGE_KEY_ROLE, roleJson);
        }
        (window as any).chrome?.storage?.local?.set({
          [this.STORAGE_KEY_USER]: this.encryptData(userJson),
          [this.STORAGE_KEY_TOKEN]: this.encryptData(token),
        });
      }
    }
    this.currentUser.set(user);
  }

  private clearSession() {
    this.stopPermissionsTimer();
    this.stopActivityTracking();

    if (typeof window !== 'undefined') {
      if (window.sessionStorage) {
        this.removeStorageItem(sessionStorage, this.STORAGE_KEY_USER);
        this.removeStorageItem(sessionStorage, this.STORAGE_KEY_TOKEN);
        this.removeStorageItem(sessionStorage, this.STORAGE_KEY_ROLE);
        this.removeStorageItem(sessionStorage, this.LEGACY_KEY_USER);
        this.removeStorageItem(sessionStorage, this.LEGACY_KEY_TOKEN);
        this.removeStorageItem(sessionStorage, this.LEGACY_KEY_ROLE);
      }

      if (this.isPersistentEnvironment()) {
        if (window.localStorage) {
          this.removeStorageItem(localStorage, this.STORAGE_KEY_USER);
          this.removeStorageItem(localStorage, this.STORAGE_KEY_TOKEN);
          this.removeStorageItem(localStorage, this.STORAGE_KEY_ROLE);
          this.removeStorageItem(localStorage, this.LEGACY_KEY_USER);
          this.removeStorageItem(localStorage, this.LEGACY_KEY_TOKEN);
          this.removeStorageItem(localStorage, this.LEGACY_KEY_ROLE);
        }
        (window as any).chrome?.storage?.local?.remove([
          this.STORAGE_KEY_USER,
          this.STORAGE_KEY_TOKEN,
          this.LEGACY_KEY_USER,
          this.LEGACY_KEY_TOKEN,
        ]);
      }
    }
    this.currentUser.set(null);
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

  private startActivityTracking() {
    this.stopActivityTracking();
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      const activityEvents$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'mousedown'),
        fromEvent(window, 'keypress'),
        fromEvent(window, 'scroll'),
        fromEvent(window, 'touchstart'),
        fromEvent(window, 'click'),
      );

      this.idleSubscription = activityEvents$
        .pipe(throttleTime(2000))
        .subscribe(() => {
          const now = Date.now();
          if (now - this.lastPermissionsCheckTime >= this.PERMISSIONS_REFRESH_INTERVAL) {
            this.ngZone.run(() => {
              this.refreshPermissions();
            });
          }
        });

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
            if (now - this.lastPermissionsCheckTime >= 60 * 1000) {
              this.ngZone.run(() => {
                this.refreshPermissions();
              });
            }
          }
        });
    });
  }

  private stopActivityTracking() {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = undefined;
    }
    if (this.visibilitySubscription) {
      this.visibilitySubscription.unsubscribe();
      this.visibilitySubscription = undefined;
    }
  }

  private setupStorageTamperListener() {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;

    const isMonitoredKey = (k: string) =>
      k === this.STORAGE_KEY_USER ||
      k === this.STORAGE_KEY_TOKEN ||
      k === this.LEGACY_KEY_USER ||
      k === this.LEGACY_KEY_TOKEN;

    // 1. Cross-tab storage change
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key && isMonitoredKey(event.key)) {
        console.warn('[Security] Cross-tab storage change detected for RR session.');
        this.ngZone.run(() => {
          if (!event.newValue) {
            this.clearSession();
            const currentUrl = this.router.url;
            if (currentUrl.includes('/user/rr') && !currentUrl.includes('/user/rr/login')) {
              this.router.navigate(['/user/rr/login']);
            }
          } else {
            this.refreshPermissions();
          }
        });
      }
    });

    // 2. In-tab storage modification monkey-patch
    try {
      const self = this;
      const checkAndReconcile = (key: string) => {
        if (isMonitoredKey(key) && !self.isInternalStorageWrite) {
          console.warn('[Security] Direct in-tab storage modification detected for RR session.');
          self.ngZone.run(() => {
            self.refreshPermissions();
          });
        }
      };

      const patchStorage = (storage: Storage) => {
        if (!storage || (storage as any).__rrTamperListenerAttached) return;
        (storage as any).__rrTamperListenerAttached = true;
        const originalSetItem = storage.setItem;
        const originalRemoveItem = storage.removeItem;

        storage.setItem = function (key: string, value: string) {
          originalSetItem.apply(this, [key, value]);
          checkAndReconcile(key);
        };

        storage.removeItem = function (key: string) {
          const itemExisted = Boolean(this.getItem(key));
          originalRemoveItem.apply(this, [key]);
          if (itemExisted && isMonitoredKey(key) && !self.isInternalStorageWrite) {
            self.ngZone.run(() => {
              const wasLoggedIn = Boolean(self.currentUser());
              self.currentUser.set(null);
              if (wasLoggedIn) {
                self.logout();
              }
            });
          }
        };
      };

      if (window.localStorage) patchStorage(window.localStorage);
      if (window.sessionStorage) patchStorage(window.sessionStorage);
    } catch (e) {
      console.error('[Security] Could not attach RR storage tamper listeners:', e);
    }
  }

  private validateCurrentRouteAccess(user: IRRUser): void {
    const currentUrl = this.router.url;
    // If employee is on admin-only route but their role was revoked from admin
    if (currentUrl.includes('/user/rr/dashboard/employees') && user.role !== 'admin') {
      console.warn('[Security] Admin access revoked for current route. Redirecting to desk dashboard.');
      this.router.navigate(['/user/rr/dashboard']);
    }
  }

  // Refresh permissions from backend
  async refreshPermissions(): Promise<IRRUser | null> {
    if (this.isRefreshingPermissions) {
      return this.currentUser() ?? null;
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    this.isRefreshingPermissions = true;
    const url = `${this.baseUrl}/auth/permissions`;
    const headers = this.getHeaders();

    try {
      const res = await firstValueFrom(
        this.http.get<IRRPermissionsResponse>(url, { headers })
      );

      this.lastPermissionsCheckTime = Date.now();
      if (res?.user) {
        this.saveSession(res.user, token);
        this.validateCurrentRouteAccess(res.user);
        return res.user;
      }
      return null;
    } catch (err: unknown) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 || err.status === 403) {
          console.warn('[Security] RR employee account revoked or token expired. Forcing logout.');
          await this.logout();
          return null;
        }
      }
      console.error('Error refreshing RR permissions:', err);
      return null;
    } finally {
      this.isRefreshingPermissions = false;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      if (window.sessionStorage) {
        const token = this.getStorageItem(sessionStorage, this.STORAGE_KEY_TOKEN);
        if (token) return token;
      }
      if (this.isPersistentEnvironment() && window.localStorage) {
        return this.getStorageItem(localStorage, this.STORAGE_KEY_TOKEN);
      }
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- API Methods ---

  // Auth Login
  async login(body: IRRLoginRequest): Promise<IRRUser> {
    const res = await firstValueFrom(
      this.http.post<IRRLoginResponse>(
        `${this.baseUrl}/auth/login`,
        body,
        { headers: this.getHeaders() }
      )
    );
    this.saveSession(res.user, res.access_token);
    console.debug(`[RR Auth] Authenticated session for user with token ${maskToken(res.access_token)}`);
    return res.user;
  }

  // Auth Logout
  async logout(): Promise<void> {
    try {
      if (this.getToken()) {
        await firstValueFrom(
          this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() })
        );
      }
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      this.clearSession();
      this.router.navigate(['/user/rr/login']);
    }
  }


  // Vehicles
  async getVehicles(params?: { search?: string; limit?: number }): Promise<IVehicle[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return firstValueFrom(
      this.http.get<IVehicle[]>(`${this.baseUrl}/vehicles`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getBookingVehiclesAutocomplete(params?: { search?: string; limit?: number; status?: string }): Promise<IVehicleAutocompleteItem[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return firstValueFrom(
      this.http.get<IVehicleAutocompleteItem[]>(`${this.baseUrl}/bookings/vehicles/autocomplete`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getVehiclesAutocomplete(params?: { search?: string; limit?: number; status?: string }): Promise<IVehicleAutocompleteItem[]> {
    return this.getBookingVehiclesAutocomplete(params);
  }

  async createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    return firstValueFrom(
      this.http.post<IVehicle>(`${this.baseUrl}/vehicles`, data, { headers: this.getHeaders() })
    );
  }

  async updateVehicle(id: string, data: Partial<IVehicle>): Promise<IVehicle> {
    return firstValueFrom(
      this.http.put<IVehicle>(`${this.baseUrl}/vehicles/${id}`, data, { headers: this.getHeaders() })
    );
  }

  async deleteVehicle(id: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/vehicles/${id}`, { headers: this.getHeaders() })
    );
  }

  // Bookings
  async getBookings(params?: {
    status?: string;
    vehicle?: string;
    customer?: string;
    from?: string;
    to?: string;
    search?: string;
  }): Promise<IBooking[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.vehicle) httpParams = httpParams.set('vehicle', params.vehicle);
    if (params?.customer) httpParams = httpParams.set('customer', params.customer);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return firstValueFrom(
      this.http.get<IBooking[]>(`${this.baseUrl}/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getBookingsPaginated(params?: {
    status?: string;
    vehicle?: string;
    customer?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<IBookingsResponse> {
    let httpParams = new HttpParams().set('paginate', 'true');
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.vehicle) httpParams = httpParams.set('vehicle', params.vehicle);
    if (params?.customer) httpParams = httpParams.set('customer', params.customer);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.includeDeleted) httpParams = httpParams.set('includeDeleted', 'true');

    return firstValueFrom(
      this.http.get<IBookingsResponse>(`${this.baseUrl}/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    return firstValueFrom(
      this.http.post<IBooking>(`${this.baseUrl}/bookings`, data, { headers: this.getHeaders() })
    );
  }

  async updateBooking(id: string, data: Partial<IBooking>): Promise<IBooking> {
    return firstValueFrom(
      this.http.put<IBooking>(`${this.baseUrl}/bookings/${id}`, data, { headers: this.getHeaders() })
    );
  }

  async deleteBooking(
    id: string,
    data?: { deletionReason?: string; returnAmount?: string | number; returnAmountMode?: string }
  ): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/bookings/${id}`, {
        headers: this.getHeaders(),
        body: data,
      })
    );
  }

  async getAdvanceBookings(): Promise<IBooking[]> {
    return this.getBookings({ status: 'reserved' });
  }

  async reserveBooking(data: Partial<IBooking>): Promise<IBooking> {
    return this.createBooking({ ...data, status: 'reserved' });
  }

  async recordCustomerIntimation(
    id: string,
    data: { intimationType: string; notes: string; expectedReturnDateTime?: string }
  ): Promise<{ success: boolean; message: string; intimation: ICustomerIntimation; booking: IBooking }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; message: string; intimation: ICustomerIntimation; booking: IBooking }>(
        `${this.baseUrl}/bookings/${id}/customer-intimation`,
        data,
        { headers: this.getHeaders() }
      )
    );
  }

  // Employees
  async getEmployees(): Promise<IEmployee[]> {
    return firstValueFrom(
      this.http.get<IEmployee[]>(`${this.baseUrl}/employees`, { headers: this.getHeaders() })
    );
  }

  async createEmployee(data: Partial<IEmployee>): Promise<IEmployee> {
    return firstValueFrom(
      this.http.post<IEmployee>(`${this.baseUrl}/employees`, data, { headers: this.getHeaders() })
    );
  }

  async updateEmployee(id: string, data: Partial<IEmployee>): Promise<IEmployee> {
    return firstValueFrom(
      this.http.put<IEmployee>(`${this.baseUrl}/employees/${id}`, data, { headers: this.getHeaders() })
    );
  }

  async deleteEmployee(id: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/employees/${id}`, { headers: this.getHeaders() })
    );
  }

  // Logs
  async getLogs(params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ILogsResponse> {
    let httpParams = new HttpParams();
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return firstValueFrom(
      this.http.get<ILogsResponse>(`${this.baseUrl}/logs`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getDashboardStats(): Promise<IRRDashboardStats> {
    return firstValueFrom(
      this.http.get<IRRDashboardStats>(`${this.baseUrl}/dashboard/stats`, { headers: this.getHeaders() })
    );
  }

  async checkVehicleAvailability(regNo: string): Promise<IRRVehicleAvailability> {
    return firstValueFrom(
      this.http.get<IRRVehicleAvailability>(`${this.baseUrl}/vehicles/${regNo}/availability`, { headers: this.getHeaders() })
    );
  }

  async uploadVehicleImage(file: File): Promise<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('images', file);

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await firstValueFrom(
      this.http.post<IVehicleImageUploadResponse>(
        `${this.baseUrl}/vehicles/upload`,
        formData,
        { headers }
      )
    );

    const first = res.images && res.images.length > 0 ? res.images[0] : null;
    return {
      key: first?.key || res.key || '',
      url: first?.url || res.url || '',
    };
  }

  async uploadVehicleImages(files: File[]): Promise<IVehicleImageUploadResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return firstValueFrom(
      this.http.post<IVehicleImageUploadResponse>(
        `${this.baseUrl}/vehicles/upload`,
        formData,
        { headers }
      )
    );
  }
}
