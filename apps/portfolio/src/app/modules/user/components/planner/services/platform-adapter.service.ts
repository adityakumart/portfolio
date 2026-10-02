import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export interface ShortcutHandlers {
  onNewNote?: () => void;
  onNewTask?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class PlatformAdapterService {
  private platformId = inject(PLATFORM_ID);
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isChromeExtension(): boolean {
    if (!this.isBrowser) return false;
    const w = window as any;
    return typeof w.chrome !== 'undefined' && Boolean(w.chrome?.runtime?.id);
  }

  get isCapacitor(): boolean {
    if (!this.isBrowser) return false;
    const w = window as any;
    return (
      typeof w.Capacitor !== 'undefined' &&
      typeof w.Capacitor.isNativePlatform === 'function' &&
      w.Capacitor.isNativePlatform()
    );
  }

  get isTauri(): boolean {
    if (!this.isBrowser) return false;
    const w = window as any;
    return typeof w.__TAURI__ !== 'undefined' || typeof w.__TAURI_INTERNALS__ !== 'undefined';
  }

  get isStandardWeb(): boolean {
    return this.isBrowser && !this.isChromeExtension && !this.isCapacitor && !this.isTauri;
  }

  // --- Haptics Feedback (Mobile / Web) ---
  triggerHaptic(type: HapticType = 'light'): void {
    if (!this.isBrowser) return;

    // 1. Capacitor Haptics
    const w = window as any;
    if (this.isCapacitor && w.Capacitor?.Plugins?.Haptics) {
      const haptics = w.Capacitor.Plugins.Haptics;
      try {
        if (type === 'selection') {
          haptics.selectionStart?.();
        } else if (type === 'success' || type === 'warning' || type === 'error') {
          haptics.notification?.({ type: type.toUpperCase() });
        } else {
          const style = type === 'heavy' ? 'HEAVY' : type === 'medium' ? 'MEDIUM' : 'LIGHT';
          haptics.impact?.({ style });
        }
        return;
      } catch (e) {
        console.debug('Capacitor Haptics trigger error:', e);
      }
    }

    // 2. Web Vibration API Fallback
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        switch (type) {
          case 'selection':
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'heavy':
            navigator.vibrate(45);
            break;
          case 'success':
            navigator.vibrate([15, 50, 20]);
            break;
          case 'warning':
            navigator.vibrate([30, 40, 30]);
            break;
          case 'error':
            navigator.vibrate([40, 60, 40, 60, 40]);
            break;
        }
      } catch (e) {
        // Ignored on unsupported devices or background tabs
      }
    }
  }

  // --- Keyboard Shortcuts (Desktop / Web / Tauri) ---
  registerGlobalShortcuts(handlers: ShortcutHandlers): () => void {
    if (!this.isBrowser) return () => {};

    this.unregisterGlobalShortcuts();

    this.keydownListener = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Ignore shortcut if user is actively typing in an input/textarea unless it's Escape
      const target = e.target as HTMLElement;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      if (isInput) return;

      if (mod && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handlers.onNewNote?.();
      } else if (mod && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handlers.onNewTask?.();
      } else if (mod && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        handlers.onFocusSearch?.();
      }
    };

    window.addEventListener('keydown', this.keydownListener);
    return () => this.unregisterGlobalShortcuts();
  }

  unregisterGlobalShortcuts(): void {
    if (this.isBrowser && this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }
  }

  // --- Cross-Platform Unified Storage Bridge ---
  async getStorageItem<T>(key: string): Promise<T | null> {
    if (!this.isBrowser) return null;

    // Chrome Extension Storage
    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.storage?.local) {
        return new Promise((resolve) => {
          w.chrome.storage.local.get([key], (res: any) => {
            resolve(res && res[key] ? (res[key] as T) : null);
          });
        });
      }
    }

    // Standard LocalStorage
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async setStorageItem<T>(key: string, value: T): Promise<void> {
    if (!this.isBrowser) return;

    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.storage?.local) {
        return new Promise((resolve) => {
          w.chrome.storage.local.set({ [key]: value }, () => resolve());
        });
      }
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage set item error:', e);
    }
  }

  async removeStorageItem(key: string): Promise<void> {
    if (!this.isBrowser) return;

    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.storage?.local) {
        return new Promise((resolve) => {
          w.chrome.storage.local.remove([key], () => resolve());
        });
      }
    }

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage remove item error:', e);
    }
  }

  // --- Notification Permissions & Dispatch ---
  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isBrowser) return false;

    // Chrome Extension
    if (this.isChromeExtension) {
      return true;
    }

    // Capacitor Native Android
    if (this.isCapacitor) {
      const w = window as any;
      if (w.Capacitor?.Plugins?.LocalNotifications?.requestPermissions) {
        try {
          const result = await w.Capacitor.Plugins.LocalNotifications.requestPermissions();
          return result?.display === 'granted';
        } catch (e) {
          console.warn('Capacitor LocalNotifications permission request error:', e);
        }
      }
    }

    // Standard HTML5 / Desktop Web / Tauri
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (err) {
        console.warn('Could not request notification permission:', err);
        return false;
      }
    }

    return false;
  }

  async dispatchNotification(
    title: string,
    options?: { body?: string; icon?: string; tag?: string },
  ): Promise<void> {
    if (!this.isBrowser) return;

    // 1. Chrome Extension API
    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.notifications?.create) {
        w.chrome.notifications.create(options?.tag || `planner_${Date.now()}`, {
          type: 'basic',
          iconUrl: options?.icon || 'favicon.ico',
          title,
          message: options?.body || '',
          priority: 2,
        });
        return;
      }
    }

    // 2. Capacitor Android
    if (this.isCapacitor) {
      const w = window as any;
      if (w.Capacitor?.Plugins?.LocalNotifications?.schedule) {
        try {
          await w.Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [
              {
                title,
                body: options?.body || '',
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 100) },
              },
            ],
          });
          return;
        } catch (e) {
          console.warn('Capacitor local notification failed:', e);
        }
      }
    }

    // 3. Web HTML5 / Tauri Desktop Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: options?.body,
          icon: options?.icon || '/assets/favicon.ico',
          tag: options?.tag,
        });
      } catch (err) {
        console.warn('HTML5 Notification dispatch failed:', err);
      }
    }
  }

  updateBadge(count: number): void {
    if (!this.isBrowser) return;

    // Chrome Extension Action Badge
    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.action?.setBadgeText) {
        w.chrome.action.setBadgeText({
          text: count > 0 ? String(count) : '',
        });
        if (w.chrome.action.setBadgeBackgroundColor) {
          w.chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Emerald
        }
      }
    }

    // Browser App Badging API (PWA / Supported browsers)
    const nav = navigator as any;
    if ('setAppBadge' in nav) {
      try {
        if (count > 0) {
          nav.setAppBadge(count);
        } else {
          nav.clearAppBadge();
        }
      } catch (e) {
        // App badge not supported or denied
      }
    }
  }
}
