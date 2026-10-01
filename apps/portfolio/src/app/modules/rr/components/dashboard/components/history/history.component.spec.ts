import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_EMPLOYEE_USER,
  MOCK_ADMIN_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Rental History Logs Component', () => {
  test.describe('Staff View', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/history');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render history logs header with staff view badge', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Rental History Logs' })).toBeVisible();
      await expect(page.getByText('My Bookings & Settlements (Staff View)')).toBeVisible();
    });

    test('should render filter toolbar controls for searching past records', async ({ page }) => {
      await expect(page.getByText('Search & Filter Logs')).toBeVisible();

      // Vehicle & customer search inputs
      const vehicleInput = page.locator('input[placeholder*="Vehicle name, reg no"]');
      await expect(vehicleInput).toBeVisible();
    });
  });

  test.describe('Admin View', () => {
    test('should render admin badge for complete historical fleet archive', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/history');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByText('All Records (Admin View)')).toBeVisible();
    });
  });
});
