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

  test('should display status column with Active and Pending Activation badges and activate button', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    await expect(table.getByRole('columnheader', { name: 'Status' })).toBeVisible();

    // Verify Active badge for active employees
    await expect(table.getByText('ACTIVE').first()).toBeVisible();

    // Verify Pending Activation badge for new employee RRA003
    await expect(table.getByText('PENDING ACTIVATION')).toBeVisible();

    // Verify Activate button is present
    const activateBtn = table.locator('button[hlmTooltip="Activate Staff Member"]').first();
    await expect(activateBtn).toBeVisible();
    await activateBtn.click();
  });

  test('should show Reset Password button in modify staff record modal', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    const editBtn = table.locator('button[hlmTooltip="Modify Staff Record"]').first();
    await editBtn.click();

    const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByRole('heading', { name: /Modify Staff Record/i })).toBeVisible();

    // Verify Reset Password button is visible
    const resetBtn = dialog.getByRole('button', { name: /Reset Password/i });
    await expect(resetBtn).toBeVisible();

    // Close modal
    const cancelBtn = dialog.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();
  });

  test('should display initial credential choice (DOB vs Temporary Password) and allow generating temporary password', async ({ page }) => {
    const registerBtn = page.getByRole('button', { name: 'Register New Employee' });
    await registerBtn.click();

    const dialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Initial Credential selection card must be visible
    await expect(dialog.getByText('Initial Credential for First Login')).toBeVisible();
    await expect(dialog.getByLabel('Date of Birth (DOB)')).toBeVisible();
    await expect(dialog.getByLabel('Temporary Password')).toBeVisible();

    // Select Temporary Password option
    await dialog.getByLabel('Temporary Password').click();

    // Temporary password input and action buttons become visible
    const tempPassInput = dialog.locator('input[placeholder="Temporary password"]');
    await expect(tempPassInput).toBeVisible();
    await expect(dialog.locator('button[hlmTooltip="Generate Random Password"]')).toBeVisible();
    await expect(dialog.locator('button[hlmTooltip="Copy to Clipboard"]')).toBeVisible();

    // Password must be auto-generated
    const initialVal = await tempPassInput.inputValue();
    expect(initialVal.length).toBeGreaterThan(6);

    // Clicking generate updates the password
    await dialog.locator('button[hlmTooltip="Generate Random Password"]').click();
    const updatedVal = await tempPassInput.inputValue();
    expect(updatedVal.length).toBeGreaterThan(6);

    // Close modal
    const closeBtn = dialog.locator('button[aria-label="Close dialog"], button:has-text("Cancel")').first();
    await closeBtn.click();
  });

  test('should open interactive Reset Password dialog from modify modal, support DOB and temp password, and show credential on reset', async ({ page }) => {
    const table = page.locator('table[hlmTable]');
    const editBtn = table.locator('button[hlmTooltip="Modify Staff Record"]').first();
    await editBtn.click();

    const editDialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });

    const resetBtn = editDialog.getByRole('button', { name: /Reset Password/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Interactive Reset Password modal must open
    const resetDialog = page.locator('div[role="dialog"], .fixed.inset-0.z-50').last();
    await expect(resetDialog.getByRole('heading', { name: 'Reset User Password' })).toBeVisible();
    await expect(resetDialog.getByText("Reset to User's Date of Birth (DOB)")).toBeVisible();
    await expect(resetDialog.getByText("Generate New Temporary Password")).toBeVisible();

    // Select temporary password option
    await resetDialog.getByLabel("Generate New Temporary Password").click();
    const tempPassInput = resetDialog.locator('input[placeholder="Temporary password"]');
    await expect(tempPassInput).toBeVisible();

    // Click confirm reset
    const confirmBtn = resetDialog.getByRole('button', { name: /Confirm & Reset Password/i });
    await confirmBtn.click();

    // Success view with temporary password and copy button appears
    await expect(resetDialog.getByText('Password Reset Completed')).toBeVisible();
    await expect(resetDialog.getByRole('button', { name: 'Done' })).toBeVisible();

    // Close reset dialog
    await resetDialog.getByRole('button', { name: 'Done' }).click();
  });
});
