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
      const dialog = page.locator('dialog, [role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('Desk Agent Profile')).toBeVisible();

      // Verify fields
      const textboxes = dialog.getByRole('textbox');
      await expect(textboxes.nth(0)).toHaveValue('RRA002');
      await expect(textboxes.nth(1)).toHaveValue('Desk Agent');
      await expect(textboxes.nth(2)).toHaveValue('agent@rams-cars.com');
      await expect(textboxes.nth(3)).toHaveValue('EMPLOYEE');

      // Verify Change Password section in profile
      const changePassBtn = dialog.getByRole('button', { name: /Change Password/i });
      await expect(changePassBtn).toBeVisible();
      await changePassBtn.click();

      // Password input fields appear
      await expect(dialog.locator('input[formcontrolname="currentPassword"]')).toBeVisible();
      await expect(dialog.locator('input[formcontrolname="newPassword"]')).toBeVisible();
      await expect(dialog.locator('input[formcontrolname="confirmPassword"]')).toBeVisible();

      // Dismiss dialog
      await dialog.getByRole('button', { name: 'Dismiss' }).click();
      await expect(dialog).not.toBeVisible();
    });

    test('should render employee navigation links and hide administrative items', async ({ page }) => {
      const sidebar = page.locator('aside.sidebar');
      // Expand sidebar if collapsed
      if (await sidebar.evaluate(el => el.classList.contains('collapsed'))) {
        await page.locator('.sidebar-toggle-btn').click();
      }

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

      const wasCollapsed = await sidebar.evaluate(el => el.classList.contains('collapsed'));
      await toggleBtn.click();
      if (wasCollapsed) {
        await expect(sidebar).not.toHaveClass(/collapsed/);
      } else {
        await expect(sidebar).toHaveClass(/collapsed/);
      }
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
      await expect(header.locator('.text-cyan-500')).toHaveText(/admin/i);

      const sidebar = page.locator('aside.sidebar');
      // Expand sidebar to view text labels if collapsed
      if (await sidebar.evaluate(el => el.classList.contains('collapsed'))) {
        await page.locator('.sidebar-toggle-btn').click();
      }

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

  test.describe('Password Policy Enforcement', () => {
    test('should render password policy dialog with current password field when password is expired', async ({ page }) => {
      await setupRRRouteMocks(page);
      // Override auth/permissions to return expired password state
      await page.route('**/api/rr/auth/permissions*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: MOCK_EMPLOYEE_USER,
            role: 'employee',
            status: 'active',
            mustChangePassword: false,
            isFirstLogin: false,
            passwordAgeDays: 45,
            passwordExpiresInDays: 0,
            isBufferPeriod: false,
            isExpired: true,
          }),
        });
      });

      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');

      // The password policy modal automatically triggers
      const policyDialog = page.locator('dialog, [role="dialog"]').first();
      await expect(policyDialog).toBeVisible({ timeout: 10000 });
      await expect(policyDialog.getByText('Password Expired (45 Days)')).toBeVisible();

      // Current password, new password, and confirm password fields must all be visible
      const currentPassInput = policyDialog.locator('input[formcontrolname="currentPassword"]');
      const newPassInput = policyDialog.locator('input[formcontrolname="newPassword"]');
      const confirmPassInput = policyDialog.locator('input[formcontrolname="confirmPassword"]');

      await expect(currentPassInput).toBeVisible();
      await expect(newPassInput).toBeVisible();
      await expect(confirmPassInput).toBeVisible();

      // Fill in fields and verify successful update
      await currentPassInput.fill('OldPassword123');
      await newPassInput.fill('NewSecurePass@123');
      await confirmPassInput.fill('NewSecurePass@123');

      const submitBtn = policyDialog.getByRole('button', { name: /Set Password & Continue/i });
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();

      // Modal closes upon successful update
      await expect(policyDialog).not.toBeVisible();
    });
  });
});
