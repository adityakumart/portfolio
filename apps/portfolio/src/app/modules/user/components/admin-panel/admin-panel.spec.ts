import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../../../test-utils/playwright-helpers';

test.describe('Admin Panel Component (<app-admin-panel>)', () => {
  test.describe('Unauthorized Access Protection', () => {
    test('should redirect non-admin user away from /user/admin to /user', async ({
      page,
    }) => {
      await injectUserSession(page, {
        role: 'user',
        masterAdmin: false,
        admin: false,
      });

      await page.goto('/user/admin');
      await page.waitForURL(/.*\/user(?!\/admin)/, { timeout: 15000 });
      await expect(page).toHaveURL(/.*\/user(?!\/admin)/);
    });
  });

  test.describe('Master Admin Console Features', () => {
    test.beforeEach(async ({ page }) => {
      // Mock admin data endpoints if requested
      await page.route('**/admin/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ users: [], metrics: {} }),
        });
      });

      await injectUserSession(page, {
        role: 'admin',
        masterAdmin: true,
        admin: true,
      });

      await page.goto('/user/admin');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render Master Admin Console header and DB Protected badge', async ({
      page,
    }) => {
      await expect(
        page.getByRole('heading', { name: 'Master Admin Console' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('DB Protected')).toBeVisible();
    });

    test('should render and switch between navigation tabs (Overview, User Permissions, Movies)', async ({
      page,
    }) => {
      const overviewBtn = page.getByRole('button', { name: 'Overview', exact: true });
      const usersBtn = page.getByRole('button', { name: 'User Permissions', exact: true });
      const moviesBtn = page.getByRole('button', { name: 'Movies', exact: true });

      await expect(overviewBtn).toBeVisible({ timeout: 10000 });
      await expect(usersBtn).toBeVisible();
      await expect(moviesBtn).toBeVisible();

      // Switch to User Permissions tab
      await usersBtn.click();
      await expect(usersBtn).toHaveClass(/bg-background/);

      // Switch to Movies tab
      await moviesBtn.click();
      await expect(moviesBtn).toHaveClass(/bg-background/);

      // Switch back to Overview
      await overviewBtn.click();
      await expect(overviewBtn).toHaveClass(/bg-background/);
    });
  });
});
