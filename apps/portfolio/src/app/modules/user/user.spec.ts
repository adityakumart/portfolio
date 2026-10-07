import { test, expect, Page } from '@playwright/test';

// Helper to seed localStorage with mock authentication session
async function injectUserSession(page: Page, options?: { modules?: Record<string, boolean>; email?: string }) {
  const session = {
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-123',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: 'mock-user-id',
      email: options?.email || 'qa.tester@example.com',
      firstName: 'QA',
      lastName: 'Tester',
      role: 'user',
      modules: options?.modules ?? {
        aiSpace: true,
        aiAssistant: true,
        fileManager: true,
        dietHydration: true,
        devTools: true,
        formBuilder: true,
        rr: true,
        planner: true,
      },
    },
  };

  await page.addInitScript((s) => {
    localStorage.setItem('portfolio_auth_session', JSON.stringify(s));
  }, session);
}

test.describe('User Module - Authentication, Route Guards & Profile Hub', () => {
  test.describe('Unauthenticated Flows & Login Page', () => {
    test.beforeEach(async ({ page }) => {
      // Ensure no leftover auth session
      await page.addInitScript(() => {
        localStorage.removeItem('portfolio_auth_session');
      });
      await page.goto('/portfolio/user/login');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should redirect unauthenticated access from /user to /user/login', async ({ page }) => {
      await page.goto('/portfolio/user');
      await page.waitForURL(/.*\/user\/login/);
      await expect(page).toHaveURL(/.*\/user\/login/);
    });

    test('should render login card with Sign In and Sign Up tabs', async ({ page }) => {
      const loginCard = page.locator('section[hlmCard]');
      await expect(loginCard).toBeVisible({ timeout: 10000 });

      await expect(loginCard.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      await expect(loginCard.locator('button[hlmTabsTrigger="login"]')).toBeVisible();
      await expect(loginCard.locator('button[hlmTabsTrigger="signup"]')).toBeVisible();

      // Sign In form controls
      await expect(page.locator('#login-email')).toBeVisible();
      await expect(page.locator('#login-password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
    });

    test('should validate email format and password length on login form', async ({ page }) => {
      const emailInput = page.locator('#login-email');
      const passwordInput = page.locator('#login-password');
      const submitBtn = page.getByRole('button', { name: 'Sign In', exact: true });

      // Initially submit is disabled
      await expect(submitBtn).toBeDisabled();

      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await expect(page.getByText('Please enter a valid email address.')).toBeVisible();

      // Enter too short password
      await passwordInput.fill('123');
      await passwordInput.blur();
      await expect(page.getByText('Password must be at least 6 characters long.')).toBeVisible();

      // Submit remains disabled
      await expect(submitBtn).toBeDisabled();

      // Enter valid fields
      await emailInput.fill('valid.user@example.com');
      await passwordInput.fill('securePassword123');
      await expect(submitBtn).toBeEnabled();
    });

    test('should toggle password visibility between password and text input', async ({ page }) => {
      const loginTab = page.locator('div[hlmTabsContent="login"]');
      const passwordInput = loginTab.locator('#login-password');
      await passwordInput.fill('mySecretPassword');

      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click show password button scoped to login form
      const toggleBtn = loginTab.locator('button[aria-label="Show password"]');
      await toggleBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click hide password button scoped to login form
      const hideBtn = loginTab.locator('button[aria-label="Hide password"]');
      await hideBtn.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should switch to Sign Up tab and validate required registration fields', async ({ page }) => {
      const signUpTab = page.locator('button[hlmTabsTrigger="signup"]');
      await signUpTab.click();

      const loginCard = page.locator('section[hlmCard]');
      await expect(loginCard.getByRole('heading', { name: 'Create an account' })).toBeVisible();

      const firstNameInput = page.locator('#signup-firstName');
      const lastNameInput = page.locator('#signup-lastName');
      const emailInput = page.locator('#signup-email');
      const passwordInput = page.locator('#signup-password');
      const confirmPasswordInput = page.locator('#signup-confirmPassword');
      const submitBtn = page.getByRole('button', { name: 'Create Account', exact: true });

      await expect(submitBtn).toBeDisabled();

      // Fill mismatched passwords
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await emailInput.fill('john.doe@example.com');
      await passwordInput.fill('password123');
      await confirmPasswordInput.fill('differentPassword');
      await confirmPasswordInput.blur();

      await expect(page.getByText('Passwords do not match.')).toBeVisible();
      await expect(submitBtn).toBeDisabled();

      // Correct matching password
      await confirmPasswordInput.fill('password123');
      await expect(submitBtn).toBeEnabled();
    });

    test('should show admin approval message, switch to Sign In tab, and not sign in after signup', async ({ page }) => {
      await page.route('**/auth/signup', async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Admin will enable your account, please wait.',
            user: { id: 'new-user-123', email: 'alice@example.com' },
          }),
        });
      });

      const signUpTab = page.locator('button[hlmTabsTrigger="signup"]');
      await signUpTab.click();

      await page.locator('#signup-firstName').fill('Alice');
      await page.locator('#signup-lastName').fill('Smith');
      await page.locator('#signup-email').fill('alice@example.com');
      await page.locator('#signup-password').fill('password123');
      await page.locator('#signup-confirmPassword').fill('password123');

      const submitBtn = page.getByRole('button', { name: 'Create Account', exact: true });
      await submitBtn.click();

      // Expect switch back to Sign In
      await expect(page.locator('button[hlmTabsTrigger="login"]')).toBeVisible();
      // Expect admin approval message in alert or toast
      await expect(page.getByText('Admin will enable your account, please wait.').first()).toBeVisible();
      // Ensure we stay on login page and do NOT redirect to /user
      await expect(page).toHaveURL(/.*\/user\/login/);
    });
  });

  test.describe('Authenticated User Hub & Module Navigation', () => {
    test('should display User Hub with user identifier and accessible module cards', async ({ page }) => {
      await injectUserSession(page, {
        email: 'developer@example.com',
        modules: {
          aiSpace: true,
          aiAssistant: true,
          fileManager: true,
          dietHydration: true,
          devTools: true,
          formBuilder: true,
          rr: true,
          planner: true,
        },
      });

      await page.goto('/portfolio/user');
      await page.waitForLoadState('domcontentloaded');

      // Verify User Hub header and user email pill
      await expect(page.getByRole('heading', { name: 'User Hub' })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('developer@example.com')).toBeVisible();

      // Verify module cards
      await expect(page.getByRole('heading', { name: 'AI Space' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'AI Assistant' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'File Manager' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Diet & Hydration' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Notes & Planner' })).toBeVisible();
    });

    test('should block access to /user/planner when user lacks planner module access', async ({ page }) => {
      await injectUserSession(page, {
        email: 'no-planner@example.com',
        modules: {
          aiSpace: true,
          aiAssistant: true,
          fileManager: true,
          dietHydration: true,
          planner: false,
        },
      });

      await page.goto('/portfolio/user/planner');
      // createModuleGuard redirects user without access back to /user
      await page.waitForURL(/.*\/user(?!\/planner)/);
      await expect(page).toHaveURL(/.*\/user/);
    });

    test('should redirect to /user/no-modules when user has no active feature flags', async ({ page }) => {
      await injectUserSession(page, {
        email: 'unassigned@example.com',
        modules: {
          aiSpace: false,
          aiAssistant: false,
          fileManager: false,
          dietHydration: false,
          devTools: false,
          formBuilder: false,
          rr: false,
        },
      });

      await page.goto('/portfolio/user');
      await page.waitForURL(/.*\/user\/no-modules/);

      // Verify Access Restricted card
      await expect(page.getByText('Access Restricted')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'No Modules Assigned' })).toBeVisible();
      await expect(page.getByText('unassigned@example.com')).toBeVisible();
    });

    test('should logout, clear session storage, and redirect to /user/login', async ({ page }) => {
      await injectUserSession(page, { email: 'logout.test@example.com' });
      await page.goto('/portfolio/user');
      await page.waitForLoadState('domcontentloaded');

      // Click user avatar to open account dropdown menu (target visible desktop/mobile avatar)
      const userAvatar = page.locator('hlm-avatar:visible');
      await expect(userAvatar).toBeVisible({ timeout: 10000 });
      await userAvatar.click();

      // Click Sign Out button inside dropdown
      const signOutBtn = page.getByRole('menuitem', { name: /Sign Out|Log Out/i }).or(page.locator('button:has-text("Sign Out")'));
      await expect(signOutBtn).toBeVisible({ timeout: 5000 });
      await signOutBtn.click();

      // Verify redirection to login page
      await page.waitForURL(/.*\/user\/login/);
      await expect(page).toHaveURL(/.*\/user\/login/);

      // Verify localStorage is cleared
      const session = await page.evaluate(() => localStorage.getItem('portfolio_auth_session'));
      expect(session).toBeNull();
    });
  });
});
