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
      await expect(table.getByText('GOLD')).toBeVisible();
    });

    test('should open customer KYC details dialog on view action', async ({ page }) => {
      // Find view button
      const viewBtn = page.locator('button[hlmTooltip="View KYC Profile"]').first();
      await expect(viewBtn).toBeVisible();
      await viewBtn.click();

      // Modal appears
      const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByText('Suresh Varma')).toBeVisible();

      // Close modal
      const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Close")').first();
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
      await expect(newMemberBtn).toBeVisible();

      await newMemberBtn.click();

      const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByRole('heading', { name: /Register Regular Customer|New Member/i })).toBeVisible();

      // Close modal
      const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });
  });
});
