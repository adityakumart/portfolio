import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  clearRRSession,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEE_USER,
} from '../../rr-test.helper';

test.describe('RR Module - Dashboard Shell Component', () => {
  test.describe('Authentication Guarding', () => {
    test('should redirect unauthenticated access from dashboard to /user/rr/login', async ({ page }) => {
      await clearRRSession(page);
      await setupRRRouteMocks(page);

      await page.goto('/user/rr/dashboard');
      await page.waitForURL(/.*\/user\/rr\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);
    });
  });

  test.describe('Authenticated Desk Staff Experience', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render header with brand, employee name, initials, and role badge', async ({ page }) => {
      const header = page.locator('header.app-header');
      await expect(header).toBeVisible();

      // Brand
      await expect(header.locator('.app-title')).toHaveText('RoadReady');

      // User details pill
      await expect(header.getByText('Desk Agent')).toBeVisible();
      await expect(header.getByText('EMPLOYEE')).toBeVisible();
      await expect(header.locator('hlm-avatar')).toContainText('DA');
    });

    test('should open user profile dialog and inspect desk agent credentials', async ({ page }) => {
      const header = page.locator('header.app-header');
      const profileTrigger = header.locator('button[hlmBtn]').filter({ hasText: 'Desk Agent' });
      await profileTrigger.click();

      // Click "View Profile"
      const viewProfileItem = page.getByRole('menuitem', { name: /View Profile/i });
      await expect(viewProfileItem).toBeVisible();
      await viewProfileItem.click();

      // Dialog opens
      const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Desk Agent Profile')).toBeVisible();

      // Verify fields
      await expect(dialog.locator('input[value="RRA002"]')).toBeVisible();
      await expect(dialog.locator('input[value="Desk Agent"]')).toBeVisible();
      await expect(dialog.locator('input[value="agent@rams-cars.com"]')).toBeVisible();
      await expect(dialog.locator('input[value="EMPLOYEE"]')).toBeVisible();

      // Dismiss dialog
      await dialog.getByRole('button', { name: 'Dismiss' }).click();
      await expect(dialog).not.toBeVisible();
    });

    test('should render employee navigation links and hide administrative items', async ({ page }) => {
      const sidebar = page.locator('aside.sidebar');
      await expect(sidebar).toBeVisible();

      // Standard links visible to employee
      await expect(sidebar.getByText('Overview')).toBeVisible();
      await expect(sidebar.getByText('Active Rentals')).toBeVisible();
      await expect(sidebar.getByText('Vehicles Inventory')).toBeVisible();
      await expect(sidebar.getByText('Regular Customers')).toBeVisible();
      await expect(sidebar.getByText('Historical Logs')).toBeVisible();

      // Admin-only links NOT visible to employee
      await expect(sidebar.getByText('Staff Registry')).not.toBeVisible();
      await expect(sidebar.getByText('Audit Logs')).not.toBeVisible();
    });

    test('should toggle sidebar collapse and expand states', async ({ page }) => {
      const sidebar = page.locator('aside.sidebar');
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await expect(toggleBtn).toBeVisible();

      // Initial state is collapsed
      await expect(sidebar).toHaveClass(/collapsed/);

      // Expand sidebar
      await toggleBtn.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);

      // Collapse sidebar again
      await toggleBtn.click();
      await expect(sidebar).toHaveClass(/collapsed/);
    });

    test('should sign out and redirect to login page', async ({ page }) => {
      const header = page.locator('header.app-header');
      const profileTrigger = header.locator('button[hlmBtn]').filter({ hasText: 'Desk Agent' });
      await profileTrigger.click();

      const logoutItem = page.getByRole('menuitem', { name: /Logout/i });
      await expect(logoutItem).toBeVisible();
      await logoutItem.click();

      // Redirection to login
      await page.waitForURL(/.*\/user\/rr\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);

      // Session storage cleared
      const user = await page.evaluate(() => sessionStorage.getItem('rr_user'));
      expect(user).toBeNull();
    });
  });

  test.describe('Authenticated Executive Admin Experience', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render admin badge and reveal administrative menu items', async ({ page }) => {
      const header = page.locator('header.app-header');
      await expect(header.getByText('Admin Operator')).toBeVisible();
      await expect(header.getByText('ADMIN')).toBeVisible();

      const sidebar = page.locator('aside.sidebar');
      // Expand sidebar to view text labels
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await toggleBtn.click();

      // Admin links are visible
      await expect(sidebar.getByText('Staff Registry')).toBeVisible();
      await expect(sidebar.getByText('Audit Logs')).toBeVisible();
    });

    test('should navigate to Staff Registry and Audit Logs via sidebar links', async ({ page }) => {
      const sidebar = page.locator('aside.sidebar');
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await toggleBtn.click();

      // Click Staff Registry
      const staffLink = sidebar.locator('li.menu-item', { hasText: 'Staff Registry' });
      await staffLink.click();
      await page.waitForURL(/.*\/user\/rr\/employee\/list/);
      await expect(page).toHaveURL(/.*\/user\/rr\/employee\/list/);

      // Click Audit Logs
      const auditLink = sidebar.locator('li.menu-item', { hasText: 'Audit Logs' });
      await auditLink.click();
      await page.waitForURL(/.*\/user\/rr\/activity-logs/);
      await expect(page).toHaveURL(/.*\/user\/rr\/activity-logs/);
    });
  });
});
