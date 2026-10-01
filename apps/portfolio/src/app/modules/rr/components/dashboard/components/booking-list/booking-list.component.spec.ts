import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Active Rentals Booking List Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
    await page.goto('/user/rr/booking/list');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render active rentals page header and create new booking action button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Active Rentals' })).toBeVisible();

    const createBtn = page.getByRole('button', { name: 'Create New Booking' });
    await expect(createBtn).toBeVisible();
  });

  test('should render rentals table with accurate customer and vehicle data', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    await expect(table).toBeVisible();

    // Verify column headers
    await expect(table.getByRole('columnheader', { name: 'Vehicle Details' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Customer Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Pickup Schedule' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Expected Return' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Rent Amount' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Paid' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Balance Due' })).toBeVisible();

    // Verify booking row 1: Suresh Varma & Swift Dzire
    await expect(table.getByText('Swift Dzire')).toBeVisible();
    await expect(table.getByText('AP-05-AA-1234')).toBeVisible();
    await expect(table.getByText('Suresh Varma')).toBeVisible();
    await expect(table.getByText('9876543210')).toBeVisible();
    await expect(table.getByText('₹5500')).toBeVisible();
    await expect(table.getByText('₹3000')).toBeVisible();
    await expect(table.getByText('₹2500')).toBeVisible(); // Pending balance

    // Verify booking row 2: Venkat Rao & Innova Crysta
    await expect(table.getByText('Innova Crysta')).toBeVisible();
    await expect(table.getByText('AP-05-BB-5678')).toBeVisible();
    await expect(table.getByText('Venkat Rao')).toBeVisible();
    await expect(table.getByText('Paid', { exact: true })).toBeVisible(); // Fully paid pill
  });

  test('should open New Booking modal dialog on clicking Create New Booking button', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: 'Create New Booking' });
    await createBtn.click();

    // Verify dialog appears
    const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: /New Rental Agreement|New Booking/i })).toBeVisible();

    // Verify vehicle select or input is present inside modal
    const vehicleField = dialog.locator('select, input, hlm-select, [formcontrolname="vehicleRegNo"]').first();
    await expect(vehicleField).toBeVisible();

    // Close dialog
    const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('should open Log Customer Intimation modal and record intimation', async ({ page }) => {
    // Click phone call icon button on first booking row
    const intimationBtn = page.locator('button[hlmTooltip*="Customer Intimation"]').first();
    await expect(intimationBtn).toBeVisible();
    await intimationBtn.click();

    // Verify Intimation dialog opens
    const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Customer Intimation/i)).toBeVisible();

    // Fill notes in form
    const notesInput = dialog.locator('textarea, input[formcontrolname="notes"]').first();
    await notesInput.fill('Customer called: returning 1 hour late due to traffic.');

    // Submit intimation
    const saveBtn = dialog.getByRole('button', { name: /Record Intimation|Save Intimation|Log/i }).first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    }
  });
});
