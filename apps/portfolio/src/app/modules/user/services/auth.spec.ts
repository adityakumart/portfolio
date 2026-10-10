import '@angular/compiler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Injector, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { AES } from 'crypto-js';
import { maskToken } from '../../../shared/utils/security.utils';
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

  const originalProtoSetItem = MockStorage.prototype.setItem;
  const originalProtoRemoveItem = MockStorage.prototype.removeItem;

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
    MockStorage.prototype.setItem = originalProtoSetItem;
    MockStorage.prototype.removeItem = originalProtoRemoveItem;
    delete (MockStorage.prototype as any).__tamperListenerAttached;
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

    const storageKey = (service as any).STORAGE_KEY;
    // Store session via internal service setStorageItem under obfuscated key
    (service as any).setStorageItem(storageKey, JSON.stringify(session));

    // In raw localStorage, data must be encrypted AES ciphertext, not plaintext JSON
    const rawStored = mockStorage.getItem(storageKey)!;
    expect(rawStored).toBeTruthy();
    expect(rawStored.startsWith('{')).toBe(false);

    // Reading through getStorageItem decrypts it properly
    const decryptedStr = (service as any).getStorageItem(storageKey);
    const decrypted = JSON.parse(decryptedStr!);
    expect(decrypted.access_token).toBe('valid-token');
    expect(decrypted.user.email).toBe('u1@test.com');
  });

  it('should transparently migrate legacy portfolio_auth_session key to obfuscated _app_ctx_sig_v1 key on read', () => {
    const session = {
      access_token: 'migrated-token',
      refresh_token: 'refresh-token',
      expires_in: 900,
      user: { id: 'u1', role: 'admin' },
    };

    // Store legacy un-obfuscated session directly in mockStorage
    mockStorage.setItem('portfolio_auth_session', JSON.stringify(session));

    // Reading through getStorageItem with obfuscated key finds and migrates it
    const decrypted = (service as any).getStorageItem('_app_ctx_sig_v1');
    expect(decrypted).toBeTruthy();
    expect(JSON.parse(decrypted!).access_token).toBe('migrated-token');

    // Legacy key must be cleaned up and new obfuscated key created
    expect(mockStorage.getItem('portfolio_auth_session')).toBeNull();
    expect(mockStorage.getItem('_app_ctx_sig_v1')).toBeTruthy();
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
    const rawStored = mockStorage.getItem('_app_ctx_sig_v1')!;
    expect(rawStored.startsWith('{')).toBe(false);

    const decryptedStr = (service as any).getStorageItem('_app_ctx_sig_v1');
    const updatedStored = JSON.parse(decryptedStr!);
    expect(updatedStored.user.masterAdmin).toBe(true);
    expect(updatedStored.user.modules.aiSpace).toBe(true);
    // Data minimization: PII (email, names) is never saved to storage
    expect(updatedStored.user.email).toBeUndefined();
  });

  it('should enforce data minimization by keeping full user profile in memory and stripping PII from storage on login', async () => {
    const fullUser = {
      id: 'u-123',
      email: 'sensitive-pii@example.com',
      first_name: 'John',
      last_name: 'Doe',
      fullName: 'John Doe',
      role: 'admin' as const,
      masterAdmin: true,
      modules: { aiSpace: true, aiAssistant: false, fileManager: true, dietHydration: false },
    };

    vi.spyOn(mockHttpClient, 'post').mockReturnValue(
      of({
        access_token: 'auth-jwt-token',
        refresh_token: 'auth-refresh-token',
        expires_in: 3600,
        user: fullUser,
      }),
    );

    const loginRes = await service.login('sensitive-pii@example.com', 'password123');

    // 1. Reactive memory retains full user profile including PII
    expect(loginRes.user).toEqual(fullUser);
    expect(service.currentUser()?.email).toBe('sensitive-pii@example.com');
    expect(service.currentUser()?.fullName).toBe('John Doe');

    // 2. Storage contains ONLY minimized authorization context without PII
    const rawCipher = mockStorage.getItem('_app_ctx_sig_v1')!;
    expect(rawCipher).toBeTruthy();
    const decryptedStr = (service as any).getStorageItem('_app_ctx_sig_v1');
    const storedSession = JSON.parse(decryptedStr!);

    expect(storedSession.user.id).toBe('u-123');
    expect(storedSession.user.role).toBe('admin');
    expect(storedSession.user.masterAdmin).toBe(true);
    expect(storedSession.user.email).toBeUndefined();
    expect(storedSession.user.first_name).toBeUndefined();
    expect(storedSession.user.last_name).toBeUndefined();
    expect(storedSession.user.fullName).toBeUndefined();
  });

  it('should support Remember Me architecture: sessionStorage when false, localStorage when true', async () => {
    const mockSession = new MockStorage();
    (global as any).window.sessionStorage = mockSession;

    const fullUser = {
      id: 'u-456',
      email: 'remember@test.com',
      role: 'user' as const,
    };

    vi.spyOn(mockHttpClient, 'post').mockReturnValue(
      of({
        access_token: 'tok-1',
        refresh_token: 'ref-1',
        expires_in: 3600,
        user: fullUser,
      }),
    );

    // 1. Login with rememberMe = false -> saves to sessionStorage
    await service.login('remember@test.com', 'password', false);
    expect(mockSession.getItem('_app_ctx_sig_v1')).toBeTruthy();
    expect(mockStorage.getItem('_app_ctx_sig_v1')).toBeNull();

    // 2. Login with rememberMe = true -> saves to localStorage
    await service.login('remember@test.com', 'password', true);
    expect(mockStorage.getItem('_app_ctx_sig_v1')).toBeTruthy();
    expect(mockStorage.getItem('_app_pref_rm')).toBe('true');
  });

  it('should not trigger logout during login even when storage tamper listener is active', async () => {
    (service as any).platformId = 'browser';
    (service as any).setupStorageTamperListener();

    const mockSession = new MockStorage();
    (global as any).window.sessionStorage = mockSession;

    vi.spyOn(mockHttpClient, 'post').mockReturnValue(
      of({
        access_token: 'new-valid-token',
        user: { id: 'u1', email: 'test@example.com', modules: {} },
      }),
    );

    const logoutSpy = vi.spyOn(service, 'logout');

    await service.login('test@example.com', 'password', true);

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(service.currentUser()).toBeTruthy();
    expect(mockStorage.getItem('_app_ctx_sig_v1')).toBeTruthy();
  });

  it('should sanitize tokens in logging via maskToken', () => {
    expect(maskToken(null)).toBe('null');
    expect(maskToken(undefined)).toBe('null');
    expect(maskToken('short')).toBe('***');
    expect(maskToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature')).toBe(
      'eyJhbG...ture',
    );
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

  describe('Signed Storage Envelope & Client-Side TTL (Phase 4 / Measure 2)', () => {
    it('should package payload into signed envelope and verify integrity', () => {
      const payload = { userId: 'usr-123', role: 'admin' };
      const envelope = service.createEnvelope(payload, 2 * 60 * 60 * 1000);

      expect(envelope.payload).toEqual(payload);
      expect(typeof envelope.storedAt).toBe('number');
      expect(envelope.ttlMs).toBe(7200000);
      expect(typeof envelope.checksum).toBe('string');
      expect(envelope.checksum.length).toBe(64); // SHA-256 hex string

      const verified = service.verifyEnvelope(envelope);
      expect(verified).toEqual(payload);
    });

    it('should reject expired storage envelope and purge data from storage', () => {
      const payload = { access_token: 'old-token', user: { id: 'usr-exp' } };
      // Expired envelope: stored 3 hours ago with 1-hour TTL
      const expiredEnvelope = {
        payload,
        storedAt: Date.now() - 3 * 60 * 60 * 1000,
        ttlMs: 60 * 60 * 1000,
        checksum: (service as any).createEnvelope(payload, 60 * 60 * 1000).checksum,
      };

      const encrypted = (service as any).encryptData(JSON.stringify(expiredEnvelope));
      mockStorage.setItem((service as any).STORAGE_KEY, encrypted);

      const result = (service as any).getStorageItem((service as any).STORAGE_KEY);
      expect(result).toBeNull();
      // Should purge expired key from storage
      expect(mockStorage.getItem((service as any).STORAGE_KEY)).toBeNull();
    });

    it('should detect envelope checksum mismatch when payload is tampered with and purge storage', () => {
      const payload = { access_token: 'token-123', user: { id: 'usr-tamper', role: 'viewer' } };
      const validEnvelope = service.createEnvelope(payload, 3600000);

      // Maliciously tamper with payload without valid signature
      const tamperedEnvelope = {
        ...validEnvelope,
        payload: { ...payload, user: { ...payload.user, role: 'superadmin' } },
      };

      const encrypted = (service as any).encryptData(JSON.stringify(tamperedEnvelope));
      mockStorage.setItem((service as any).STORAGE_KEY, encrypted);

      const result = (service as any).getStorageItem((service as any).STORAGE_KEY);
      expect(result).toBeNull();
      expect(mockStorage.getItem((service as any).STORAGE_KEY)).toBeNull();
    });
  });
});
