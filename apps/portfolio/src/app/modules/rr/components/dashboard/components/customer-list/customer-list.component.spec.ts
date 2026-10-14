import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Customer List Registry Component', () => {
  test.describe('Desk Staff Access', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/customer/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render regular customers header and search input', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Regular Customers' })).toBeVisible();

      const searchInput = page.locator('input[placeholder*="Search by name, phone, ID"]');
      await expect(searchInput).toBeVisible();

      // Desk employee should not see "New Member" creation button
      await expect(page.getByRole('button', { name: /New Member/i })).not.toBeVisible();
    });

    test('should render customers table with membership IDs, tiers, and details', async ({ page }) => {
      const table = page.locator('table[hlmTable]');
      await expect(table).toBeVisible();

      // Headers
      await expect(table.getByRole('columnheader', { name: 'Member ID' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Customer Name' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Contact Details' })).toBeVisible();
      await expect(table.getByRole('columnheader', { name: 'Membership Tier' })).toBeVisible();

      // Record verification
      await expect(table.getByText('RR-MEM-001')).toBeVisible();
      await expect(table.getByText('Suresh Varma')).toBeVisible();
      await expect(table.getByText('9876543210')).toBeVisible();
      await expect(table.getByText('suresh.varma@example.com')).toBeVisible();
      await expect(table.getByText('GOLD')).toBeVisible();

      // Record verification for member without email
      await expect(table.getByText('RR-MEM-002')).toBeVisible();
      await expect(table.getByText('Kalyan Chowdary')).toBeVisible();
      await expect(table.getByText('No email')).toBeVisible();
    });

    test('should open customer KYC details dialog on view action', async ({ page }) => {
      // Find view button
      const viewBtn = page.locator('button:has([name="lucideEye"]), button[hlmTooltip*="View"]').first();
      await expect(viewBtn).toBeVisible({ timeout: 10000 });
      await viewBtn.click();

      // Modal appears
      await expect(page.getByText('Customer Membership Profile')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Suresh Varma')).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Close")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Admin Customer Management Privileges', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/customer/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should display New Member button and trigger registration modal for admin', async ({ page }) => {
      const newMemberBtn = page.getByRole('button', { name: /New Member/i });
      await expect(newMemberBtn).toBeVisible({ timeout: 10000 });

      await newMemberBtn.click();

      await expect(page.getByText('Register Regular Customer')).toBeVisible({ timeout: 10000 });

      // Verify that Email Address is optional
      await expect(page.getByText('Email Address (Optional)')).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });
  });
});
