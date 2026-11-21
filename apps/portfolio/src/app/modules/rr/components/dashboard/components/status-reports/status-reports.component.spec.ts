import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_MANAGER_USER,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Status Reports Component', () => {
  test.describe('RBAC & Role-Based Access Controls', () => {
    test('Admin should access Status Reports view and see sidebar link', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/reports');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('app-rr-status-reports').waitFor({ state: 'attached', timeout: 15000 });

      await expect(page.locator('h2', { hasText: 'Status Reports' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Admin & Manager Access')).toBeVisible();

      // Check sidebar navigation item (expand if collapsed)
      const sidebar = page.locator('aside.sidebar');
      if (await sidebar.evaluate((el) => el.classList.contains('collapsed'))) {
        await page.locator('.sidebar-toggle-btn').click();
      }
      await expect(sidebar.getByText('Status Reports')).toBeVisible();
    });

    test('Manager should access Status Reports view and see sidebar link', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_MANAGER_USER });
      await page.goto('/user/rr/reports');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('app-rr-status-reports').waitFor({ state: 'attached', timeout: 15000 });

      await expect(page.locator('h2', { hasText: 'Status Reports' })).toBeVisible({ timeout: 15000 });
      await expect(page.getByText('Admin & Manager Access')).toBeVisible();

      // Check sidebar navigation item (expand if collapsed)
      const sidebar = page.locator('aside.sidebar');
      if (await sidebar.evaluate((el) => el.classList.contains('collapsed'))) {
        await page.locator('.sidebar-toggle-btn').click();
      }
      await expect(sidebar.getByText('Status Reports')).toBeVisible();
    });

    test('Employee should NOT see Status Reports in sidebar and get redirected if accessing directly', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');

      // Expand sidebar to verify label is not present
      const sidebar = page.locator('aside.sidebar');
      if (await sidebar.evaluate((el) => el.classList.contains('collapsed'))) {
        await page.locator('.sidebar-toggle-btn').click();
      }
      await expect(sidebar.getByText('Status Reports')).not.toBeVisible();

      // Attempt direct navigation to /user/rr/reports
      await page.goto('/user/rr/reports');
      await page.waitForLoadState('domcontentloaded');

      // Should redirect back to dashboard
      await expect(page).toHaveURL(/.*\/user\/rr\/dashboard/, { timeout: 15000 });
    });
  });

  test.describe('Filter Toolbar & DD-MM-YYYY Date Controls', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/reports');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('app-rr-status-reports').waitFor({ state: 'attached', timeout: 15000 });
    });

    test('should render segmented horizon bar with Monthly, Yearly, and Custom Date Range', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Monthly/i })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole('button', { name: /Yearly/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Custom Date Range/i })).toBeVisible();
    });

    test('should switch to Custom Date Range and display DD-MM-YYYY date pickers', async ({ page }) => {
      await page.getByRole('button', { name: /Custom Date Range/i }).click();

      const fromInput = page.locator('input[placeholder="DD-MM-YYYY"]').first();
      const toInput = page.locator('input[placeholder="DD-MM-YYYY"]').last();

      await expect(fromInput).toBeVisible({ timeout: 10000 });
      await expect(toInput).toBeVisible({ timeout: 10000 });
    });

    test('should render table headers with DD-MM-YYYY indicators', async ({ page }) => {
      const table = page.locator('table');
      await expect(table.getByRole('columnheader', { name: /Pickup Date/i })).toContainText('DD-MM-YYYY');
      await expect(table.getByRole('columnheader', { name: /Return Date/i })).toContainText('DD-MM-YYYY');
    });

    test('should toggle status and payment filter pills', async ({ page }) => {
      const activeFilterBtn = page.getByRole('button', { name: /Active Rentals/i });
      await expect(activeFilterBtn).toBeVisible({ timeout: 10000 });
      await activeFilterBtn.click();

      const settledFilterBtn = page.getByRole('button', { name: /Fully Settled/i });
      await expect(settledFilterBtn).toBeVisible({ timeout: 10000 });
      await settledFilterBtn.click();
    });
  });

  test.describe('Live KPI Telemetry Cards & Export Actions', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/reports');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('app-rr-status-reports').waitFor({ state: 'attached', timeout: 15000 });
    });

    test('should render all 6 KPI summary metric cards', async ({ page }) => {
      const view = page.locator('app-rr-status-reports');
      await expect(view.getByText('Total Bookings')).toBeVisible({ timeout: 15000 });
      await expect(view.locator('span', { hasText: 'Active Rentals' })).toBeVisible();
      await expect(view.getByText('Gross Revenue')).toBeVisible();
      await expect(view.getByText('Collected')).toBeVisible();
      await expect(view.getByText('Pending Receivables')).toBeVisible();
      await expect(view.getByText('Fleet Distance')).toBeVisible();
    });

    test('should display enabled Download PDF and Export CSV buttons', async ({ page }) => {
      const pdfBtn = page.getByRole('button', { name: /Download PDF/i });
      const csvBtn = page.getByRole('button', { name: /Export CSV \/ Excel/i });

      await expect(pdfBtn).toBeVisible({ timeout: 15000 });
      await expect(pdfBtn).toBeEnabled();

      await expect(csvBtn).toBeVisible();
      await expect(csvBtn).toBeEnabled();
    });
  });
});
