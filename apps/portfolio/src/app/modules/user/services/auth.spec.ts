import '@angular/compiler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Injector, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
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

  it('should refresh permissions from backend and update currentUser and session', async () => {
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
    const updatedStored = JSON.parse(
      mockStorage.getItem('portfolio_auth_session')!,
    );
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

  it('should refresh permissions on activity when more than 5 minutes have elapsed', () => {
    const refreshSpy = vi
      .spyOn(service, 'refreshPermissions')
      .mockResolvedValue(null);

    // Set lastPermissionsCheckTime to 6 minutes ago
    (service as any).lastPermissionsCheckTime = Date.now() - 6 * 60 * 1000;

    (service as any).checkActivityPermissionsRefresh();

    expect(refreshSpy).toHaveBeenCalled();
  });
});

