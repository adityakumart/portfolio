import '@angular/compiler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NetworkStatusService } from './network-status.service';

describe('NetworkStatusService', () => {
  let service: NetworkStatusService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [NetworkStatusService],
    });

    service = TestBed.inject(NetworkStatusService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should be created and default to online when navigator.onLine is true', () => {
    expect(service).toBeTruthy();
    expect(service.isOnline()).toBe(true);
    expect(service.isDismissed()).toBe(false);
    expect(service.showRestored()).toBe(false);
    expect(service.shouldShowToast()).toBe(false);
  });

  it('should handle offline event and update signals', () => {
    window.dispatchEvent(new Event('offline'));

    expect(service.isOnline()).toBe(false);
    expect(service.wasOffline()).toBe(true);
    expect(service.isDismissed()).toBe(false);
    expect(service.shouldShowToast()).toBe(true);
  });

  it('should allow user to dismiss offline toast', () => {
    window.dispatchEvent(new Event('offline'));
    expect(service.shouldShowToast()).toBe(true);

    service.dismiss();

    expect(service.isDismissed()).toBe(true);
    expect(service.isOnline()).toBe(false);
    expect(service.shouldShowToast()).toBe(false);
  });

  it('should show restored toast when coming back online after being offline, then auto-dismiss', () => {
    // Drop offline
    window.dispatchEvent(new Event('offline'));
    expect(service.isOnline()).toBe(false);
    expect(service.wasOffline()).toBe(true);

    // Come back online
    window.dispatchEvent(new Event('online'));

    expect(service.isOnline()).toBe(true);
    expect(service.showRestored()).toBe(true);
    expect(service.shouldShowToast()).toBe(true);

    // Fast-forward 3.5 seconds
    vi.advanceTimersByTime(3500);

    expect(service.showRestored()).toBe(false);
    expect(service.shouldShowToast()).toBe(false);
  });

  it('should reset isDismissed state if user disconnects again', () => {
    // 1st disconnect
    window.dispatchEvent(new Event('offline'));
    service.dismiss();
    expect(service.isDismissed()).toBe(true);

    // Reconnect
    window.dispatchEvent(new Event('online'));
    vi.advanceTimersByTime(3500);

    // 2nd disconnect
    window.dispatchEvent(new Event('offline'));
    expect(service.isDismissed()).toBe(false);
    expect(service.shouldShowToast()).toBe(true);
  });

  it('should allow manually checking connection status via checkConnection', () => {
    const isConnected = service.checkConnection();
    expect(typeof isConnected).toBe('boolean');
  });
});
