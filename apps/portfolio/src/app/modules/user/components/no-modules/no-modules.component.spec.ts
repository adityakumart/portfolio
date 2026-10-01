import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

test.describe('User Module Subroute - No Modules (Restricted Access)', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      email: 'restricted.user@example.com',
      modules: {
        aiSpace: false,
        aiAssistant: false,
        fileManager: false,
        dietHydration: false,
        devTools: false,
        formBuilder: false,
        rr: false,
      },
    });
    await page.goto('/portfolio/user/no-modules');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Access Restricted badge and informative explanation', async ({ page }) => {
    await expect(page.getByText('Access Restricted')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'No Modules Assigned' })).toBeVisible();
    await expect(page.getByText('restricted.user@example.com')).toBeVisible();

    // Verify explanation of available modules
    await expect(page.getByText('Available Modules')).toBeVisible();
    await expect(page.getByText('AI Space')).toBeVisible();
    await expect(page.getByText('AI Assistant')).toBeVisible();
    await expect(page.getByText('File Manager')).toBeVisible();
    await expect(page.getByText('Diet & Hydration')).toBeVisible();
  });

  test('should navigate to Home when clicking the Home button', async ({ page }) => {
    const homeBtn = page.getByRole('button', { name: /Home/i });
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();

    await page.waitForURL(/\/portfolio\/?$/);
    await expect(page).toHaveURL(/.*\/portfolio\/?$/);
  });

  test('should clear session and redirect to login when clicking Log Out', async ({ page }) => {
    const logoutBtn = page.getByRole('button', { name: /Log Out/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await page.waitForURL(/.*\/user\/login/);
    await expect(page).toHaveURL(/.*\/user\/login/);

    const session = await page.evaluate(() => localStorage.getItem('portfolio_auth_session'));
    expect(session).toBeNull();
  });
});
