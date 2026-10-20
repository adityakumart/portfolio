import { Page } from '@playwright/test';

export interface MockSessionOptions {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user';
  masterAdmin?: boolean;
  admin?: boolean;
  modules?: {
    aiSpace?: boolean;
    aiAssistant?: boolean;
    fileManager?: boolean;
    dietHydration?: boolean;
    planner?: boolean;
    game?: boolean;
    movies?: boolean;
    devTools?: boolean;
    formBuilder?: boolean;
    rr?: boolean;
    [key: string]: boolean | undefined;
  };
}

export async function injectUserSession(
  page: Page,
  options?: MockSessionOptions,
): Promise<void> {
  const session = {
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-123',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'mock-user-id',
      email: options?.email || 'qa.tester@example.com',
      firstName: options?.firstName || 'QA',
      lastName: options?.lastName || 'Tester',
      role: options?.role || 'user',
      admin: options?.admin ?? (options?.role === 'admin'),
      masterAdmin: options?.masterAdmin ?? (options?.role === 'admin'),
      modules: {
        aiSpace: true,
        aiAssistant: true,
        fileManager: true,
        dietHydration: true,
        planner: true,
        game: true,
        movies: true,
        devTools: true,
        formBuilder: true,
        rr: true,
        ...(options?.modules || {}),
      },
    },
  };

  // Mock /auth/permissions API to prevent 401 auto-logout in tests
  await page.route('**/auth/permissions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: session.user }),
    });
  });

  await page.addInitScript((s) => {
    localStorage.setItem('portfolio_auth_session', JSON.stringify(s));
    localStorage.setItem('_app_pref_rm', 'true');
  }, session);
}

export async function clearUserSession(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('portfolio_auth_session');
    localStorage.removeItem('_app_ctx_sig_v1');
    localStorage.removeItem('_app_pref_rm');
  });
}
