import {
  Injectable,
  inject,
  PLATFORM_ID,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NetworkStatusService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);

  readonly isOnline = signal<boolean>(true);
  readonly isDismissed = signal<boolean>(false);
  readonly showRestored = signal<boolean>(false);
  readonly wasOffline = signal<boolean>(false);

  readonly shouldShowToast = computed(() => {
    return (!this.isOnline() && !this.isDismissed()) || this.showRestored();
  });

  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;
  private restoredTimeoutId: any = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const initialOnline =
        typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.isOnline.set(initialOnline);
      if (!initialOnline) {
        this.wasOffline.set(true);
      }

      this.onlineListener = () => this.handleOnline();
      this.offlineListener = () => this.handleOffline();

      window.addEventListener('online', this.onlineListener);
      window.addEventListener('offline', this.offlineListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.onlineListener) {
        window.removeEventListener('online', this.onlineListener);
      }
      if (this.offlineListener) {
        window.removeEventListener('offline', this.offlineListener);
      }
    }
    if (this.restoredTimeoutId) {
      clearTimeout(this.restoredTimeoutId);
    }
  }

  private handleOffline(): void {
    if (this.restoredTimeoutId) {
      clearTimeout(this.restoredTimeoutId);
      this.restoredTimeoutId = null;
    }

    this.isOnline.set(false);
    this.isDismissed.set(false);
    this.showRestored.set(false);
    this.wasOffline.set(true);
  }

  private handleOnline(): void {
    this.isOnline.set(true);

    if (this.wasOffline()) {
      this.showRestored.set(true);

      if (this.restoredTimeoutId) {
        clearTimeout(this.restoredTimeoutId);
      }

      this.restoredTimeoutId = setTimeout(() => {
        this.showRestored.set(false);
      }, 3500);
    }

    this.isDismissed.set(false);
  }

  dismiss(): void {
    this.isDismissed.set(true);
  }

  checkConnection(): boolean {
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined') {
      const current = navigator.onLine;
      if (current && !this.isOnline()) {
        this.handleOnline();
      } else if (!current && this.isOnline()) {
        this.handleOffline();
      }
      return current;
    }
    return true;
  }
}
