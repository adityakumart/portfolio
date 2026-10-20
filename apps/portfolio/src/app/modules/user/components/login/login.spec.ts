import { test, expect } from '@playwright/test';
import { clearUserSession } from '../../../../test-utils/playwright-helpers';

test.describe('Login Component (<app-login>)', () => {
  test.beforeEach(async ({ page }) => {
    await clearUserSession(page);
    await page.goto('/user/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render login card with Welcome back heading and auth tabs', async ({
    page,
  }) => {
    const loginCard = page.locator('section[hlmCard]');
    await expect(loginCard).toBeVisible({ timeout: 10000 });

    await expect(
      loginCard.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible();

    const signInTab = loginCard.locator('button[hlmTabsTrigger="login"]');
    const signUpTab = loginCard.locator('button[hlmTabsTrigger="signup"]');

    await expect(signInTab).toBeVisible();
    await expect(signUpTab).toBeVisible();
  });

  test('should toggle between Sign In and Sign Up tabs', async ({ page }) => {
    const loginCard = page.locator('section[hlmCard]');
    const signInTab = loginCard.locator('button[hlmTabsTrigger="login"]');
    const signUpTab = loginCard.locator('button[hlmTabsTrigger="signup"]');

    // Click Sign Up tab
    await signUpTab.click();
    await expect(page.locator('#signup-email')).toBeVisible();

    // Click back to Sign In tab
    await signInTab.click();
    await expect(page.locator('#login-email')).toBeVisible();
  });

  test('should disable Sign In button when form fields are empty or invalid', async ({
    page,
  }) => {
    const emailInput = page.locator('#login-email');
    const submitBtn = page.getByRole('button', { name: 'Sign In', exact: true });

    await expect(submitBtn).toBeDisabled();

    // Fill invalid email format
    await emailInput.fill('invalid-email-address');
    await emailInput.blur();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(submitBtn).toBeDisabled();
  });

  test('should toggle password visibility icon and input type', async ({ page }) => {
    const loginTab = page.locator('div[hlmTabsContent="login"]');
    const passwordInput = loginTab.locator('#login-password');
    const toggleBtn = loginTab.locator('button[aria-label="Show password"]');

    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password
    const hideBtn = loginTab.locator('button[aria-label="Hide password"]');
    await hideBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
