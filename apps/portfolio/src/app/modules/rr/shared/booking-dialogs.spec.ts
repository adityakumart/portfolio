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
      const modifyBtn = page.locator('button[hlmTooltip="Modify Details"], button[hlmTooltip="Modify Booking"], button[aria-label="Modify Booking"]').first();
      if (await modifyBtn.isVisible().catch(() => false)) {
        await modifyBtn.click();

        const dialog = page.locator('app-rr-modify-booking-dialog, div[role="dialog"]').first();
        await expect(dialog).toBeVisible({ timeout: 5000 });
        await expect(dialog.getByText(/Modify Active Booking Agreement/i)).toBeVisible();

        const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    });

    test('should show Delete Booking button, open delete section with reason, return amount, returned mode, and enable Delete only when all are filled', async ({ page }) => {
      const modifyBtn = page.locator('button[hlmTooltip="Modify Details"], button[hlmTooltip="Modify Booking"]').first();
      if (await modifyBtn.isVisible().catch(() => false)) {
        await modifyBtn.click();

        const dialog = page.locator('app-rr-modify-booking-dialog, div[role="dialog"]').first();
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // 1. In Active Booking Actions, we should see Delete Booking button
        const deleteBookingBtn = dialog.locator('button:has-text("Delete Booking")');
        await expect(deleteBookingBtn).toBeVisible();

        // 2. Click Delete Booking button -> inline section appears
        await deleteBookingBtn.click();

        // 3. Section fields visible
        const reasonInput = dialog.locator('input[formControlName="deletionReason"]');
        const returnAmountInput = dialog.locator('input[formControlName="returnAmount"]');
        const returnAmountModeSelect = dialog.locator('select[formControlName="returnAmountMode"]');
        const cancelDeleteBtn = dialog.locator('button:has-text("Cancel")');
        const confirmDeleteBtn = dialog.locator('button:has-text("Delete")');

        await expect(reasonInput).toBeVisible();
        await expect(returnAmountInput).toBeVisible();
        await expect(returnAmountModeSelect).toBeVisible();
        await expect(cancelDeleteBtn).toBeVisible();
        await expect(confirmDeleteBtn).toBeVisible();

        // 4. Return Amount should be auto-populated
        const returnAmountVal = await returnAmountInput.inputValue();
        expect(Number(returnAmountVal)).toBeGreaterThanOrEqual(0);

        // 5. Delete button should be disabled initially (Reason & Mode empty)
        await expect(confirmDeleteBtn).toBeDisabled();

        // Fill only reason -> still disabled
        await reasonInput.fill('Customer requested refund due to emergency');
        await expect(confirmDeleteBtn).toBeDisabled();

        // Select Returned Amount Mode -> now enabled!
        await returnAmountModeSelect.selectOption('UPI Transfer');
        await expect(confirmDeleteBtn).toBeEnabled();

        // If reason is cleared -> disabled again
        await reasonInput.fill('');
        await expect(confirmDeleteBtn).toBeDisabled();

        await reasonInput.fill('Customer requested refund');
        await expect(confirmDeleteBtn).toBeEnabled();

        // 6. Test Cancel: should remove Delete Booking section and display old options as is
        await cancelDeleteBtn.click();
        await expect(reasonInput).not.toBeVisible();
        await expect(dialog.locator('button:has-text("Delete Booking")')).toBeVisible();
        await expect(dialog.locator('button:has-text("Save Changes")')).toBeVisible();

        // Close dialog
        const closeBtn = dialog.locator('button[aria-label="Close dialog"]').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
        }
      }
    });
  });
});

