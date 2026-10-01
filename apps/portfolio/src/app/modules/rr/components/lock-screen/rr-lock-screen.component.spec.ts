import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_EMPLOYEE_USER,
  MOCK_ADMIN_USER,
} from '../../rr-test.helper';

test.describe('RR Module - Security Lock Screen Component', () => {
  test.describe('Locked State Presentation & Controls', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      // Inject session with isLocked: true
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER, isLocked: true });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should display modal lock overlay when session is locked', async ({ page }) => {
      const lockOverlay = page.locator('div[aria-labelledby="lock-screen-title"]');
      await expect(lockOverlay).toBeVisible({ timeout: 10000 });

      await expect(lockOverlay.getByRole('heading', { name: 'Session Locked' })).toBeVisible();
      await expect(lockOverlay.getByText('Your workspace was locked after 5 minutes of inactivity')).toBeVisible();

      // Check current user strip
      await expect(lockOverlay.getByText('Desk Agent')).toBeVisible();
      await expect(lockOverlay.getByText('EMPLOYEE')).toBeVisible();
    });

    test('should toggle credential input visibility between password and text', async ({ page }) => {
      const credInput = page.locator('#rr-lock-credential');
      await expect(credInput).toBeVisible();
      await expect(credInput).toHaveAttribute('type', 'password');

      // Toggle button
      const toggleBtn = page.locator('button[aria-label="Toggle password visibility"]');
      await toggleBtn.click();
      await expect(credInput).toHaveAttribute('type', 'text');

      await toggleBtn.click();
      await expect(credInput).toHaveAttribute('type', 'password');
    });

    test('should verify credential and unlock session', async ({ page }) => {
      const credInput = page.locator('#rr-lock-credential');
      const unlockBtn = page.getByRole('button', { name: /Unlock Session/i });

      // Initially unlock is disabled when input is empty
      await expect(unlockBtn).toBeDisabled();

      // Enter valid DOB/password
      await credInput.fill('1990-05-15');
      await expect(unlockBtn).toBeEnabled();

      // Submit unlock
      await unlockBtn.click();

      // Lock screen overlay dismissed, revealing dashboard
      const lockOverlay = page.locator('div[aria-labelledby="lock-screen-title"]');
      await expect(lockOverlay).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Overview Dashboard' })).toBeVisible();
    });

    test('should logout from locked state and redirect to login page', async ({ page }) => {
      const logoutBtn = page.getByRole('button', { name: /Log out & switch account/i });
      await expect(logoutBtn).toBeVisible();

      await logoutBtn.click();

      await page.waitForURL(/.*\/user\/rr\/login/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);

      // Lock state and session cleared
      const user = await page.evaluate(() => sessionStorage.getItem('rr_user'));
      expect(user).toBeNull();
    });
  });

  test.describe('Executive Admin Lock View', () => {
    test('should display admin badge and label on lock screen', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER, isLocked: true });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');

      const lockOverlay = page.locator('div[aria-labelledby="lock-screen-title"]');
      await expect(lockOverlay).toBeVisible({ timeout: 10000 });

      await expect(lockOverlay.getByText('Admin Operator')).toBeVisible();
      await expect(lockOverlay.getByText('ADMIN')).toBeVisible();
      await expect(lockOverlay.getByText('Enter Admin Password')).toBeVisible();
    });
  });
});
