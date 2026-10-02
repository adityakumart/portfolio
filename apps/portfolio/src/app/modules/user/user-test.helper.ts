import { Page } from '@playwright/test';

export interface UserSessionOptions {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  modules?: Record<string, boolean>;
}

export async function injectUserSession(page: Page, options?: UserSessionOptions) {
  const session = {
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-123',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: options?.id || 'mock-user-id',
      email: options?.email || 'qa.tester@example.com',
      firstName: options?.firstName || 'QA',
      lastName: options?.lastName || 'Tester',
      role: options?.role || 'user',
      modules: {
        aiSpace: true,
        aiAssistant: true,
        fileManager: true,
        dietHydration: true,
        devTools: true,
        formBuilder: true,
        rr: true,
        planner: true,
        ...options?.modules,
      },
    },
  };

  await page.addInitScript((s) => {
    localStorage.setItem('portfolio_auth_session', JSON.stringify(s));
  }, session);
}

export async function clearUserSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('portfolio_auth_session');
  });
}
