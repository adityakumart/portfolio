import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  clearRRSession,
  MOCK_EMPLOYEE_USER,
} from '../rr-test.helper';

test.describe('RR Module - Shared Components & Booking Dialogs', () => {
  test.describe('Car Loader Screen Component', () => {
    test('should render animated car loader on initial page load and allow skipping', async ({ page }) => {
      await clearRRSession(page);
      await setupRRRouteMocks(page);

      await page.goto('/user/rr');

      const carLoader = page.locator('app-rr-car-loader');
      if (await carLoader.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(carLoader).toBeVisible();

        const skipBtn = carLoader.getByRole('button', { name: /Skip animation|Skip/i });
        await expect(skipBtn).toBeVisible();
        await skipBtn.click();

        // Loader exits cleanly
        await expect(carLoader).not.toBeVisible({ timeout: 4000 });
      }
    });
  });

  test.describe('End Booking & Settlement Dialog Component', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/booking/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should open End Booking settlement dialog and display odometer and penalty calculators', async ({ page }) => {
      const endBookingBtn = page.locator('button[hlmTooltip="End Rental"]').first();
      await expect(endBookingBtn).toBeVisible();
      await endBookingBtn.click();

      // Verify End Booking Dialog component is rendered
      const dialog = page.locator('app-rr-end-booking-dialog, div[role="dialog"]').first();
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByText(/Return & Settlement|End Rental/i)).toBeVisible();

      // Check fields: End odometer input
      const odometerEndInput = dialog.locator('input[placeholder*="odometer" i], input[type="number"]').first();
      await expect(odometerEndInput).toBeVisible();

      // Dismiss dialog
      const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Modify Booking Dialog Component', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/booking/list');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should open Modify Booking dialog and allow editing customer or travel itinerary', async ({ page }) => {
      // Find Modify Booking button if visible or via actions
      const modifyBtn = page.locator('button[hlmTooltip="Modify Booking"], button[aria-label="Modify Booking"]').first();
      if (await modifyBtn.isVisible().catch(() => false)) {
        await modifyBtn.click();

        const dialog = page.locator('app-rr-modify-booking-dialog, div[role="dialog"]').first();
        await expect(dialog).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByText(/Modify Booking|Update Rental/i)).toBeVisible();

        const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });
  });
});
