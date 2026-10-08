import '@angular/compiler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Injector, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { AES } from 'crypto-js';
import { AuthService } from './auth';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: {
    post: (url?: string, body?: unknown, options?: unknown) => Observable<unknown>;
    get: (url?: string, options?: unknown) => Observable<unknown>;
  };
  let mockRouter: { navigate: () => void; url: string };
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();

    (global as any).Storage = MockStorage;
    (global as any).window = {
      localStorage: mockStorage,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    (global as any).localStorage = mockStorage;

    mockHttpClient = {
      post: () => of({}),
      get: () =>
        of({
          user: { id: 'user-1', email: 'test@example.com', modules: {} },
          modules: {},
        }),
    };
    mockRouter = {
      navigate: vi.fn(),
      url: '/user',
    };

    const mockNgZone = {
      run: (fn: () => unknown) => fn(),
      runOutsideAngular: (fn: () => unknown) => fn(),
    };

    const injector = Injector.create({
      providers: [
        { provide: AuthService, useClass: AuthService },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: NgZone, useValue: mockNgZone },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = injector.get(AuthService);
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should encrypt session in localStorage and decrypt transparently when read', async () => {
    const session = {
      access_token: 'valid-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      user: { id: 'u1', email: 'u1@test.com', modules: { aiSpace: false } },
    };

    // Store session via internal service setStorageItem
    (service as any).setStorageItem('portfolio_auth_session', JSON.stringify(session));

    // In raw localStorage, data must be encrypted AES ciphertext, not plaintext JSON
    const rawStored = mockStorage.getItem('portfolio_auth_session')!;
    expect(rawStored).toBeTruthy();
    expect(rawStored.startsWith('{')).toBe(false);

    // Reading through getStorageItem decrypts it properly
    const decryptedStr = (service as any).getStorageItem('portfolio_auth_session');
    const decrypted = JSON.parse(decryptedStr!);
    expect(decrypted.access_token).toBe('valid-token');
    expect(decrypted.user.email).toBe('u1@test.com');
  });

  it('should derive device-bound encryption key and reject ciphertext from another device/browser', () => {
    (service as any).platformId = 'browser';
    (global as any).window = {
      location: { origin: 'http://localhost:4200' },
      localStorage: mockStorage,
    };
    Object.defineProperty(globalThis, 'screen', {
      value: { width: 1920, height: 1080, colorDepth: 24 },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Chrome/120', hardwareConcurrency: 8 },
      configurable: true,
      writable: true,
    });

    const key = (service as any).getDeviceBoundKey();
    expect(key).toContain('portfolio_secure_session_v1');
    expect(key).toContain('http://localhost:4200');
    expect(key).toContain('1920x1080');

    // Encrypt on Device A
    const plainText = JSON.stringify({ token: 'device-bound-secret' });
    const encrypted = (service as any).encryptData(plainText);
    expect(encrypted).toBeTruthy();

    // Successfully decrypts on Device A
    expect((service as any).decryptData(encrypted)).toBe(plainText);

    // Simulate attacker copying ciphertext to Device B (different user-agent and screen)
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'AttackerBrowser/1.0', hardwareConcurrency: 4 },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'screen', {
      value: { width: 1366, height: 768, colorDepth: 24 },
      configurable: true,
      writable: true,
    });

    // Decryption must fail (returns null) on Device B
    const compromisedDecrypted = (service as any).decryptData(encrypted);
    expect(compromisedDecrypted).toBeNull();
  });

  it('should maintain backward compatibility and decrypt sessions created with static encryption key', () => {
    (service as any).platformId = 'browser';
    (global as any).window = {
      location: { origin: 'http://localhost:4200' },
      localStorage: mockStorage,
    };
    Object.defineProperty(globalThis, 'screen', {
      value: { width: 1920, height: 1080, colorDepth: 24 },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'navigator', {
      value: { userAgent: 'Chrome/120', hardwareConcurrency: 8 },
      configurable: true,
      writable: true,
    });

    // Ciphertext created with legacy static key
    const legacyPlain = JSON.stringify({ access_token: 'legacy-token' });
    const legacyCipher = AES.encrypt(legacyPlain, 'portfolio_secure_session_v1').toString();

    // Must gracefully decrypt through fallback
    const decrypted = (service as any).decryptData(legacyCipher);
    expect(decrypted).toBe(legacyPlain);
  });

  it('should refresh permissions from backend and update currentUser and encrypted session', async () => {
    const session = {
      access_token: 'valid-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      user: { id: 'u1', email: 'u1@test.com', modules: { aiSpace: false } },
    };
    mockStorage.setItem('portfolio_auth_session', JSON.stringify(session));

    const refreshedUser = {
      id: 'u1',
      email: 'u1@test.com',
      masterAdmin: true,
      modules: { aiSpace: true, aiAssistant: true },
    };
    vi.spyOn(mockHttpClient, 'get').mockReturnValue(
      of({ user: refreshedUser, modules: refreshedUser.modules }),
    );

    const result = await service.refreshPermissions();

    expect(result).toEqual(refreshedUser);
    expect(service.currentUser()).toEqual(refreshedUser);

    // Raw stored is encrypted
    const rawStored = mockStorage.getItem('portfolio_auth_session')!;
    expect(rawStored.startsWith('{')).toBe(false);

    const decryptedStr = (service as any).getStorageItem('portfolio_auth_session');
    const updatedStored = JSON.parse(decryptedStr!);
    expect(updatedStored.user.masterAdmin).toBe(true);
    expect(updatedStored.user.modules.aiSpace).toBe(true);
  });

  it('should force logout when permissions API returns 401 or 403', async () => {
    const session = {
      access_token: 'expired-or-revoked-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      user: { id: 'u1', email: 'u1@test.com' },
    };
    mockStorage.setItem('portfolio_auth_session', JSON.stringify(session));

    vi.spyOn(mockHttpClient, 'get').mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
      ),
    );
    const logoutSpy = vi
      .spyOn(service, 'logout')
      .mockImplementation(() => Promise.resolve());

    const result = await service.refreshPermissions();

    expect(result).toBeNull();
    expect(logoutSpy).toHaveBeenCalled();
  });

  it('should detect external localStorage modifications and re-verify permissions', async () => {
    const session = {
      access_token: 'valid-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      user: { id: 'u1', email: 'u1@test.com', modules: { aiSpace: false } },
    };
    mockStorage.setItem('portfolio_auth_session', JSON.stringify(session));

    const refreshSpy = vi
      .spyOn(service, 'refreshPermissions')
      .mockResolvedValue(session.user as any);

    // Call setupStorageTamperListener explicitly on the mock Storage prototype
    (service as any).platformId = 'browser';
    (service as any).setupStorageTamperListener();

    // Directly modify storage as an external actor (simulating DevTools/script)
    mockStorage.setItem(
      'portfolio_auth_session',
      JSON.stringify({
        ...session,
        user: { ...session.user, masterAdmin: true },
      }),
    );

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should refresh permissions on activity when more than 10 minutes have elapsed', () => {
    const refreshSpy = vi
      .spyOn(service, 'refreshPermissions')
      .mockResolvedValue(null);

    // Set lastPermissionsCheckTime to 11 minutes ago
    (service as any).lastPermissionsCheckTime = Date.now() - 11 * 60 * 1000;

    (service as any).checkActivityPermissionsRefresh();

    expect(refreshSpy).toHaveBeenCalled();
  });
});
