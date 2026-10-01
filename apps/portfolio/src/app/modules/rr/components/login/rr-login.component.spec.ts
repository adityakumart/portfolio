import { test, expect } from '@playwright/test';
import { setupRRRouteMocks, clearRRSession } from '../../rr-test.helper';

test.describe('RR Module - Login Component', () => {
  test.beforeEach(async ({ page }) => {
    await clearRRSession(page);
    await setupRRRouteMocks(page);
    await page.goto('/user/rr/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render left visual branding pane with fleet metrics on desktop', async ({ page }) => {
    const visualPane = page.locator('.login-visual-pane');
    await expect(visualPane).toBeVisible();

    await expect(visualPane.getByText('Secure Fleet Gateway')).toBeVisible();
    await expect(visualPane.getByRole('heading', { name: 'Fleet Operations' })).toBeVisible();

    // Check quick metrics
    await expect(visualPane.getByText('50+')).toBeVisible();
    await expect(visualPane.getByText('24/7')).toBeVisible();
    await expect(visualPane.getByText('100%')).toBeVisible();
  });

  test('should render role selection tabs and toggle form between Rental Desk and Executive Admin', async ({ page }) => {
    const card = page.locator('div[hlmCard]');
    await expect(card).toBeVisible();

    const employeeTab = card.locator('button[hlmTabsTrigger="employee"]');
    const adminTab = card.locator('button[hlmTabsTrigger="admin"]');

    await expect(employeeTab).toBeVisible();
    await expect(adminTab).toBeVisible();

    // Default is Rental Desk (Employee)
    await expect(card.getByRole('heading', { name: 'Rental Desk Authentication' })).toBeVisible();
    await expect(page.locator('#empId')).toBeVisible();

    // Switch to Executive Admin
    await adminTab.click();
    await expect(card.getByRole('heading', { name: 'Fleet Administration Access' })).toBeVisible();
    await expect(page.locator('#adminUsername')).toBeVisible();
    await expect(page.locator('#adminPassword')).toBeVisible();

    // Switch back to Rental Desk
    await employeeTab.click();
    await expect(card.getByRole('heading', { name: 'Rental Desk Authentication' })).toBeVisible();
    await expect(page.locator('#empId')).toBeVisible();
  });

  test('should validate employee ID pattern and required date of birth', async ({ page }) => {
    const empIdInput = page.locator('#empId');
    const submitBtn = page.locator('button[type="submit"]');

    // Invalid format (not matching RRA + 3 digits)
    await empIdInput.fill('INVALID123');
    await empIdInput.blur();
    await expect(page.getByText('ID must follow pattern like RRA001')).toBeVisible();

    // Clear and leave empty
    await empIdInput.fill('');
    await empIdInput.blur();
    await expect(page.getByText('Employee ID is required.')).toBeVisible();

    // Valid format
    await empIdInput.fill('RRA002');
    await expect(page.getByText('Employee ID is required.')).not.toBeVisible();
    await expect(page.getByText('ID must follow pattern like RRA001')).not.toBeVisible();
  });

  test('should quick-fill desk staff credentials with Demo button and login successfully', async ({ page }) => {
    const demoEmployeeBtn = page.getByRole('button', { name: 'Demo Desk Staff' });
    await expect(demoEmployeeBtn).toBeVisible();

    // Click demo button
    await demoEmployeeBtn.click();

    // Verify input populated
    const empIdInput = page.locator('#empId');
    await expect(empIdInput).toHaveValue('RRA002');

    // Submit employee login
    const submitBtn = page.locator('div[hlmTabsContent="employee"] button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify successful redirection to dashboard
    await page.waitForURL(/.*\/user\/rr\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/user\/rr\/dashboard/);
  });

  test('should validate admin credentials, toggle password visibility, and login via Demo Admin', async ({ page }) => {
    // Switch to admin tab
    const adminTab = page.locator('button[hlmTabsTrigger="admin"]');
    await adminTab.click();

    const usernameInput = page.locator('#adminUsername');
    const passwordInput = page.locator('#adminPassword');
    const submitBtn = page.locator('div[hlmTabsContent="admin"] button[type="submit"]');

    // Initially invalid/disabled
    await usernameInput.fill('admin');
    await passwordInput.fill('12'); // Less than 4 chars
    await passwordInput.blur();
    await expect(page.getByText('Password must be at least 4 characters.')).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // Test password toggle
    await expect(passwordInput).toHaveAttribute('type', 'password');
    const toggleBtn = page.locator('button[aria-label="Show password"]');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    const hideBtn = page.locator('button[aria-label="Hide password"]');
    await hideBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Use Demo Admin button
    const demoAdminBtn = page.getByRole('button', { name: 'Demo Admin' });
    await demoAdminBtn.click();

    await expect(usernameInput).toHaveValue('admin@rams-cars.com');
    await expect(passwordInput).toHaveValue('AdminPD');
    await expect(submitBtn).toBeEnabled();

    // Submit admin login
    await submitBtn.click();

    // Verify redirection to dashboard
    await page.waitForURL(/.*\/user\/rr\/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*\/user\/rr\/dashboard/);
  });

  test('should display error message on failed login attempt', async ({ page }) => {
    // Mock login failure
    await page.route('**/api/rr/auth/login*', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials provided. Access denied.' }),
      });
    });

    const demoEmployeeBtn = page.getByRole('button', { name: 'Demo Desk Staff' });
    await demoEmployeeBtn.click();

    const submitBtn = page.locator('div[hlmTabsContent="employee"] button[type="submit"]');
    await submitBtn.click();

    // Verify error banner is displayed
    const errorAlert = page.locator('.bg-destructive\\/10');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText('Invalid credentials provided');
  });
});
