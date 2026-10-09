import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { NetworkStatusService } from '../../../../../shared/services/network-status.service';

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
  private networkStatus = inject(NetworkStatusService);
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private baseTitle = 'Planner';

  readonly isOnline = this.networkStatus.isOnline;

  constructor() {
    if (this.isBrowser) {
      this.baseTitle = document.title || 'Planner';
    }
  }

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

    // 3. Tauri Desktop Notification Bridge
    if (this.isTauri) {
      const w = window as any;
      try {
        if (w.__TAURI__?.core?.invoke) {
          await w.__TAURI__.core.invoke('plugin:notification|notify', {
            title,
            body: options?.body,
          });
          return;
        } else if (w.__TAURI__?.notification?.sendNotification) {
          w.__TAURI__.notification.sendNotification({
            title,
            body: options?.body,
          });
          return;
        }
      } catch (e) {
        console.debug('Tauri notification invoke error:', e);
      }
    }

    // 4. Web HTML5 Desktop Notification
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

  async shareItem(options: { title: string; text?: string; url?: string }): Promise<boolean> {
    if (!this.isBrowser) return false;

    // 1. Capacitor Share Plugin (Mobile native sheet)
    const w = window as any;
    if (this.isCapacitor && w.Capacitor?.Plugins?.Share?.share) {
      try {
        await w.Capacitor.Plugins.Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.title,
        });
        return true;
      } catch (e) {
        console.debug('Capacitor share dismissed or error:', e);
      }
    }

    // 2. Web Share API (Mobile Safari, Chrome on Android, Modern Desktop)
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (e) {
        console.debug('Web share cancelled or error:', e);
      }
    }

    // 3. Fallback: Copy to clipboard
    if (navigator.clipboard?.writeText) {
      try {
        const shareContent = [options.title, options.text, options.url].filter(Boolean).join('\n\n');
        await navigator.clipboard.writeText(shareContent);
        this.triggerHaptic('success');
        return true;
      } catch (e) {
        console.warn('Clipboard fallback failed:', e);
      }
    }

    return false;
  }

  async scheduleLocalNotification(options: {
    id: number;
    title: string;
    body: string;
    at: Date;
  }): Promise<void> {
    if (!this.isBrowser) return;

    // 1. Capacitor Native Android (Local Notifications Plugin)
    if (this.isCapacitor) {
      const w = window as any;
      if (w.Capacitor?.Plugins?.LocalNotifications?.schedule) {
        try {
          await w.Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [
              {
                id: options.id,
                title: options.title,
                body: options.body,
                schedule: { at: options.at },
              },
            ],
          });
          return;
        } catch (e) {
          console.warn('Capacitor schedule notification failed:', e);
        }
      }
    }

    // 2. Chrome Extension Alarms
    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.alarms?.create) {
        const delayInMinutes = Math.max(0.5, (options.at.getTime() - Date.now()) / (1000 * 60));
        w.chrome.alarms.create(`alarm_${options.id}`, { delayInMinutes });
        return;
      }
    }
  }

  async cancelLocalNotification(id: number): Promise<void> {
    if (!this.isBrowser) return;

    if (this.isCapacitor) {
      const w = window as any;
      if (w.Capacitor?.Plugins?.LocalNotifications?.cancel) {
        try {
          await w.Capacitor.Plugins.LocalNotifications.cancel({
            notifications: [{ id }],
          });
        } catch (e) {
          console.warn('Capacitor cancel notification failed:', e);
        }
      }
    }

    if (this.isChromeExtension) {
      const w = window as any;
      if (w.chrome?.alarms?.clear) {
        w.chrome.alarms.clear(`alarm_${id}`);
      }
    }
  }

  exportToFile(filename: string, content: string, contentType = 'application/json'): void {
    if (!this.isBrowser) return;
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export to file failed:', e);
    }
  }

  updateBadge(count: number): void {
    if (!this.isBrowser) return;

    // Document Title Indicator
    try {
      if (count > 0) {
        document.title = `(${count}) ${this.baseTitle}`;
      } else {
        document.title = this.baseTitle;
      }
    } catch {
      // Ignored
    }

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
