import { test, expect } from '@playwright/test';
import { injectUserSession } from './test-utils/playwright-helpers';

test.describe('App Shell & Shared Navigation (<app-root>)', () => {
  test('should render root app shell and global toaster container', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible({ timeout: 10000 });

    const toaster = page.locator('hlm-toaster');
    await expect(toaster).toBeAttached({ timeout: 10000 });
  });

  test('should toggle dark/light theme when clicking theme toggle button', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    const themeBtn = page.locator('button[aria-label="Toggle color theme"]');
    await expect(themeBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(400);

    const wasDarkInitially = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );

    // Click theme toggle
    await themeBtn.click();

    // Verify dark class and localStorage
    if (wasDarkInitially) {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
      const stored = await page.evaluate(() => localStorage.getItem('darkMode'));
      expect(stored).toBe('false');
    } else {
      await expect(page.locator('html')).toHaveClass(/dark/);
      const stored = await page.evaluate(() => localStorage.getItem('darkMode'));
      expect(stored).toBe('true');
    }

    // Toggle back to initial state
    await themeBtn.click();
    if (wasDarkInitially) {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should render sidebar navigation on authenticated user routes', async ({
    page,
  }) => {
    await injectUserSession(page);
    await page.goto('/user');
    await page.waitForLoadState('domcontentloaded');

    const sidebar = page.locator('app-sidebar');
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    const navItems = sidebar.locator('a, button');
    expect(await navItems.count()).toBeGreaterThan(0);
  });

  test('should display notification button in sidebar and toggle inbox', async ({ page }) => {
    await injectUserSession(page);
    await page.goto('/user');
    await page.waitForLoadState('domcontentloaded');

    const notificationBtn = page.locator('button:has(ng-icon[name="lucideBell"]):visible');
    await expect(notificationBtn).toBeVisible({ timeout: 10000 });

    // Click to toggle notification inbox popover
    await notificationBtn.click();
    const inbox = page.locator('app-notification-inbox');
    await expect(inbox).toBeAttached();
  });
});
