import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PlatformAdapterService {
  private platformId = inject(PLATFORM_ID);

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

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isBrowser) return false;

    // Chrome Extension notifications don't require explicit window.Notification permission if in manifest
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
