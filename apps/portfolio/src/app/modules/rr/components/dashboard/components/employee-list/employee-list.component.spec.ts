import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Staff Registry Employee List Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_ADMIN_USER });
    await page.goto('/user/rr/employee/list');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render staff registry header and register new employee button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Staff Registry' })).toBeVisible();

    const registerBtn = page.getByRole('button', { name: 'Register New Employee' });
    await expect(registerBtn).toBeVisible();
  });

  test('should render staff table with employee ID, role badges, and contact details', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    await expect(table).toBeVisible();

    // Table columns
    await expect(table.getByRole('columnheader', { name: 'Employee ID' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Staff Full Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Assigned Role' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Contact Phone' })).toBeVisible();

    // Record 1: Admin Operator
    await expect(table.getByText('RRA001')).toBeVisible();
    await expect(table.getByText('Admin Operator')).toBeVisible();
    await expect(table.getByText('ADMIN', { exact: true })).toBeVisible();
    await expect(table.getByText('9494873336')).toBeVisible();

    // Record 2: Desk Agent
    await expect(table.getByText('RRA002')).toBeVisible();
    await expect(table.getByText('Desk Agent')).toBeVisible();
    await expect(table.getByText('EMPLOYEE', { exact: true })).toBeVisible();
    await expect(table.getByText('9494893336')).toBeVisible();
  });

  test('should open employee registration modal on clicking Register New Employee', async ({ page }) => {
    const registerBtn = page.getByRole('button', { name: 'Register New Employee' });
    await registerBtn.click();

    const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: /Register Staff Member|New Employee/i })).toBeVisible();

    // Inputs in form
    await expect(dialog.locator('input[formcontrolname="id"]')).toBeVisible();
    await expect(dialog.locator('input[formcontrolname="firstName"]')).toBeVisible();
    await expect(dialog.locator('input[formcontrolname="lastName"]')).toBeVisible();

    // Hidden password input
    const hiddenPasswordInput = dialog.locator('input[formcontrolname="password"]');
    await expect(hiddenPasswordInput).toBeAttached();
    await expect(hiddenPasswordInput).toHaveAttribute('type', 'hidden');

    // Close modal
    const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });
});
