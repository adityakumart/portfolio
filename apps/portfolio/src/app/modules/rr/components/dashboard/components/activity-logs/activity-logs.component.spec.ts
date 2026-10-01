import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Activity Audit Logs Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_ADMIN_USER });
    await page.goto('/user/rr/activity-logs');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render system activity logs header, subtitle, and refresh button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'System Activity Logs' })).toBeVisible();
    await expect(page.getByText('Real-time audit log of system operations')).toBeVisible();

    const refreshBtn = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshBtn).toBeVisible();
  });

  test('should display audit logs table with logged actions and users', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    await expect(table).toBeVisible();

    // Verify logged actions from mock
    await expect(page.getByText('Started rental booking for Swift Dzire')).toBeVisible();
    await expect(page.getByText('Desk Agent (RRA002)')).toBeVisible();
    await expect(page.getByText('Admin Operator (RRA001)')).toBeVisible();
  });
});
