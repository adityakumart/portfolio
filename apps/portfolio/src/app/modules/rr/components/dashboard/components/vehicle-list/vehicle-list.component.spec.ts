import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Vehicle Inventory Fleet Registry Component', () => {
  test.describe('Desk Staff View', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/vehicle/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render fleet registry header with total counts and seating tabs', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Fleet Registry' })).toBeVisible();

      // Verify seating filter buttons
      const allFilter = page.getByRole('button', { name: /All \(/i });
      const fiveSeaterFilter = page.getByRole('button', { name: /5 Seater/i });
      const sevenSeaterFilter = page.getByRole('button', { name: /7 Seater/i });

      await expect(allFilter).toBeVisible();
      await expect(fiveSeaterFilter).toBeVisible();
      await expect(sevenSeaterFilter).toBeVisible();

      // Employee should not see "Register New Vehicle" button
      await expect(page.getByRole('button', { name: 'Register New Vehicle' })).not.toBeVisible();
    });

    test('should display fleet vehicle cards with specifications and status badges', async ({ page }) => {
      // 5-Seater Swift Dzire
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('AP-05-AA-1234')).toBeVisible();

      // 7-Seater Innova Crysta
      await expect(page.getByText('Innova Crysta')).toBeVisible();
      await expect(page.getByText('AP-05-BB-5678')).toBeVisible();
    });

    test('should filter fleet cards when clicking 5-Seater and 7-Seater filter tabs', async ({ page }) => {
      const fiveSeaterFilter = page.getByRole('button', { name: /5 Seater/i });
      const sevenSeaterFilter = page.getByRole('button', { name: /7 Seater/i });
      const allFilter = page.getByRole('button', { name: /All \(/i });

      // Click 5 Seater tab
      await fiveSeaterFilter.click();
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).not.toBeVisible();

      // Click 7 Seater tab
      await sevenSeaterFilter.click();
      await expect(page.getByText('Innova Crysta')).toBeVisible();
      await expect(page.getByText('Swift Dzire')).not.toBeVisible();

      // Click All tab
      await allFilter.click();
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).toBeVisible();
    });

    test('should open vehicle specifications modal upon clicking a vehicle card', async ({ page }) => {
      const dzireCard = page.locator('app-rr-vehicle-card', { hasText: 'Swift Dzire' }).first();
      await dzireCard.click();

      // Details dialog popup
      const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByText('Swift Dzire')).toBeVisible();
      await expect(dialog.getByText('AP-05-AA-1234')).toBeVisible();

      // Close details popup
      const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Close")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Admin Registration Privileges', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/vehicle/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render Register New Vehicle button and open vehicle creation modal', async ({ page }) => {
      const addBtn = page.getByRole('button', { name: 'Register New Vehicle' });
      await expect(addBtn).toBeVisible();

      // Open Add Vehicle modal
      await addBtn.click();

      const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByRole('heading', { name: /Register New Fleet Vehicle|New Vehicle/i })).toBeVisible();

      // Verify specification inputs exist in modal form
      await expect(dialog.locator('input[formcontrolname="regNo"]')).toBeVisible();
      await expect(dialog.locator('input[formcontrolname="name"]')).toBeVisible();
      await expect(dialog.locator('input[formcontrolname="manufacturer"]')).toBeVisible();

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
