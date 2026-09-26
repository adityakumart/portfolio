import { Injectable, inject, signal, effect, OnDestroy, computed } from '@angular/core';
import { RRApiService } from './rr-api.service';
import { toast } from '@spartan-ng/hel/sonner';

export const RR_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY_LAST_ACTIVE = 'rr_session_last_active';
const STORAGE_KEY_IS_LOCKED = 'rr_session_is_locked';

@Injectable({
  providedIn: 'root',
})
export class RRInactivityService implements OnDestroy {
  private rrApi = inject(RRApiService);

  // Inactivity timeout configuration
  readonly timeoutMs = signal<number>(RR_INACTIVITY_TIMEOUT_MS);

  // Reactive state signals
  readonly isLocked = signal<boolean>(false);
  readonly remainingSeconds = signal<number>(Math.floor(RR_INACTIVITY_TIMEOUT_MS / 1000));
  readonly isVerifying = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  private lastActiveTimestamp = Date.now();
  private checkIntervalId: any = null;
  private isTracking = false;
  private lastActivityThrottleMs = 1500;
  private lastRecordedTime = 0;

  private boundActivityHandler = this.onUserActivity.bind(this);
  private boundStorageHandler = this.onStorageEvent.bind(this);
  private boundVisibilityHandler = this.onVisibilityChange.bind(this);

  private boundChromeStorageHandler = (changes: any, areaName: string) => {
    if (areaName !== 'local') return;
    if (changes[STORAGE_KEY_IS_LOCKED]) {
      const val = changes[STORAGE_KEY_IS_LOCKED].newValue;
      this.isLocked.set(val === 'true' || val === true);
    }
    if (changes[STORAGE_KEY_LAST_ACTIVE] && changes[STORAGE_KEY_LAST_ACTIVE].newValue) {
      const parsed = parseInt(changes[STORAGE_KEY_LAST_ACTIVE].newValue, 10);
      if (!isNaN(parsed)) {
        this.lastActiveTimestamp = parsed;
      }
    }
  };

  private isChromeExtension(): boolean {
    return typeof window !== 'undefined' && !!(window as any).chrome?.storage?.local;
  }

  constructor() {
    // Automatically manage tracking based on currentUser authentication status
    effect(() => {
      const user = this.rrApi.currentUser();
      if (user) {
        this.initializeFromStorage();
        this.startTracking();
      } else {
        this.stopTracking();
        this.clearStorageState();
        this.isLocked.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  /**
   * Initializes initial state from localStorage & chrome.storage (useful on page reloads, new tabs, or extension popup open)
   */
  private initializeFromStorage(): void {
    if (typeof window === 'undefined') return;

    if (window.localStorage) {
      const storedLock = localStorage.getItem(STORAGE_KEY_IS_LOCKED);
      if (storedLock === 'true') {
        this.isLocked.set(true);
        return;
      }

      const storedLastActive = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE);
      if (storedLastActive) {
        const parsedTime = parseInt(storedLastActive, 10);
        if (!isNaN(parsedTime)) {
          this.lastActiveTimestamp = parsedTime;
          const elapsed = Date.now() - parsedTime;
          if (elapsed >= this.timeoutMs()) {
            this.lockSession();
            return;
          }
        }
      } else {
        this.recordActivityNow();
      }
    }

    // Chrome Extension storage bridge
    if (this.isChromeExtension()) {
      (window as any).chrome.storage.local.get(
        [STORAGE_KEY_IS_LOCKED, STORAGE_KEY_LAST_ACTIVE],
        (res: any) => {
          if (res && (res[STORAGE_KEY_IS_LOCKED] === 'true' || res[STORAGE_KEY_IS_LOCKED] === true)) {
            this.isLocked.set(true);
          } else if (res && res[STORAGE_KEY_LAST_ACTIVE]) {
            const parsed = parseInt(res[STORAGE_KEY_LAST_ACTIVE], 10);
            if (!isNaN(parsed) && Date.now() - parsed >= this.timeoutMs()) {
              this.lockSession();
            }
          }
        }
      );
    }
  }

  /**
   * Starts listening to user interaction and begins the interval timer
   */
  startTracking(): void {
    if (this.isTracking || typeof window === 'undefined') return;
    this.isTracking = true;

    // Attach passive activity listeners to window
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => {
      window.addEventListener(evt, this.boundActivityHandler, { passive: true });
    });

    window.addEventListener('storage', this.boundStorageHandler);
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
    window.addEventListener('focus', this.boundVisibilityHandler);

    // Chrome Extension storage change listener
    if (this.isChromeExtension() && (window as any).chrome?.storage?.onChanged) {
      (window as any).chrome.storage.onChanged.addListener(this.boundChromeStorageHandler);
    }

    // Heartbeat ticker to evaluate time elapsed every second
    this.checkIntervalId = setInterval(() => {
      this.evaluateSessionHealth();
    }, 1000);
  }

  /**
   * Stops listeners and interval timer
   */
  stopTracking(): void {
    if (!this.isTracking || typeof window === 'undefined') return;
    this.isTracking = false;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((evt) => {
      window.removeEventListener(evt, this.boundActivityHandler);
    });

    window.removeEventListener('storage', this.boundStorageHandler);
    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    window.removeEventListener('focus', this.boundVisibilityHandler);

    if (this.isChromeExtension() && (window as any).chrome?.storage?.onChanged) {
      (window as any).chrome.storage.onChanged.removeListener(this.boundChromeStorageHandler);
    }

    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Throttled activity handler for mouse/keyboard/touch events
   */
  private onUserActivity(): void {
    if (this.isLocked() || !this.rrApi.currentUser()) return;

    const now = Date.now();
    if (now - this.lastRecordedTime > this.lastActivityThrottleMs) {
      this.lastRecordedTime = now;
      this.recordActivityNow();
    }
  }

  /**
   * Records active timestamp in memory and localStorage for cross-tab sync
   */
  private recordActivityNow(): void {
    const now = Date.now();
    this.lastActiveTimestamp = now;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, now.toString());
    }
    if (this.isChromeExtension()) {
      (window as any).chrome.storage.local.set({ [STORAGE_KEY_LAST_ACTIVE]: now.toString() });
    }
  }

  /**
   * Evaluates if session should be locked based on elapsed idle time
   */
  private evaluateSessionHealth(): void {
    if (this.isLocked() || !this.rrApi.currentUser()) return;

    const elapsed = Date.now() - this.lastActiveTimestamp;
    const remainingMs = Math.max(0, this.timeoutMs() - elapsed);
    this.remainingSeconds.set(Math.ceil(remainingMs / 1000));

    if (elapsed >= this.timeoutMs()) {
      this.lockSession();
    }
  }

  /**
   * Triggers immediate check on tab focus or visibility change
   */
  private onVisibilityChange(): void {
    if (typeof document === 'undefined' || document.hidden || this.isLocked()) return;

    // Check latest timestamp from localStorage in case user was active in another tab
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedLast = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE);
      if (storedLast) {
        const parsed = parseInt(storedLast, 10);
        if (!isNaN(parsed)) {
          this.lastActiveTimestamp = parsed;
        }
      }
    }

    this.evaluateSessionHealth();
  }

  /**
   * Listens for cross-tab synchronization events
   */
  private onStorageEvent(event: StorageEvent): void {
    if (event.key === STORAGE_KEY_IS_LOCKED) {
      if (event.newValue === 'true') {
        this.isLocked.set(true);
      } else if (event.newValue === 'false') {
        this.isLocked.set(false);
        this.lastActiveTimestamp = Date.now();
      }
    } else if (event.key === STORAGE_KEY_LAST_ACTIVE && event.newValue) {
      const parsed = parseInt(event.newValue, 10);
      if (!isNaN(parsed)) {
        this.lastActiveTimestamp = parsed;
      }
    }
  }

  /**
   * Enters the locked state
   */
  lockSession(): void {
    if (this.isLocked()) return;

    this.isLocked.set(true);
    this.errorMessage.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_IS_LOCKED, 'true');
    }

    if (this.isChromeExtension()) {
      (window as any).chrome.storage.local.set({ [STORAGE_KEY_IS_LOCKED]: 'true' });
      if ((window as any).chrome.action) {
        (window as any).chrome.action.setBadgeText({ text: 'LOCK' });
        (window as any).chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
      }
    }
  }

  /**
   * Verifies credentials and unlocks the session
   */
  async verifyAndUnlock(credential: string): Promise<boolean> {
    const user = this.rrApi.currentUser();
    if (!user) {
      await this.logout();
      return false;
    }

    if (!credential || !credential.trim()) {
      this.errorMessage.set('Please enter your credentials to unlock.');
      return false;
    }

    this.isVerifying.set(true);
    this.errorMessage.set(null);

    try {
      if (user.role === 'admin') {
        // Admin credentials verification
        await this.rrApi.login({
          username: user.email || user.id,
          password: credential.trim(),
        });
      } else {
        // Employee credentials verification (can be DOB or password matching their account)
        await this.rrApi.login({
          empId: user.id,
          dob: credential.trim(),
        });
      }

      // Unlock upon successful authentication
      this.unlockSession();
      toast.success('Session unlocked successfully. Welcome back!');
      return true;
    } catch (err: any) {
      console.error('Session unlock failed:', err);
      const msg = err.error?.message || 'Invalid credentials. Please try again.';
      this.errorMessage.set(msg);
      toast.error(msg);
      return false;
    } finally {
      this.isVerifying.set(false);
    }
  }

  /**
   * Restores session state after successful unlock
   */
  unlockSession(): void {
    this.isLocked.set(false);
    this.errorMessage.set(null);
    this.recordActivityNow();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_IS_LOCKED, 'false');
    }

    if (this.isChromeExtension()) {
      (window as any).chrome.storage.local.set({ [STORAGE_KEY_IS_LOCKED]: 'false' });
      if ((window as any).chrome.action) {
        (window as any).chrome.action.setBadgeText({ text: '' });
      }
    }
  }

  /**
   * Clears inactivity tracking storage
   */
  private clearStorageState(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY_LAST_ACTIVE);
      localStorage.removeItem(STORAGE_KEY_IS_LOCKED);
    }

    if (this.isChromeExtension()) {
      (window as any).chrome.storage.local.remove([STORAGE_KEY_LAST_ACTIVE, STORAGE_KEY_IS_LOCKED]);
      if ((window as any).chrome.action) {
        (window as any).chrome.action.setBadgeText({ text: '' });
      }
    }
  }

  /**
   * Full session termination
   */
  async logout(): Promise<void> {
    this.stopTracking();
    this.clearStorageState();
    this.isLocked.set(false);
    await this.rrApi.logout();
  }

  /**
   * Helper to set custom timeout (e.g. for testing)
   */
  setTimeoutDuration(ms: number): void {
    this.timeoutMs.set(ms);
    this.remainingSeconds.set(Math.floor(ms / 1000));
  }
}
