import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  clearRRSession,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEE_USER,
} from './rr-test.helper';

test.describe('RoadReady (RR) Module - End-to-End Suite', () => {
  test.describe('Phase 1: Public Customer Portal & Fleet Showcase', () => {
    test.beforeEach(async ({ page }) => {
      await clearRRSession(page);
      await setupRRRouteMocks(page);
      await page.goto('/user/rr');
      await page.waitForLoadState('domcontentloaded');

      // Dismiss car loading screen if visible
      const skipBtn = page.getByRole('button', { name: /Skip animation|Skip/i });
      if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await skipBtn.click();
      }
      await page.locator('header .logo-area').waitFor({ state: 'visible', timeout: 8000 });
    });

    test('should load public landing page with header, hero showcase, and services', async ({ page }) => {
      await expect(page.locator('header h2')).toHaveText('RoadReady Rentals');
      await expect(page.locator('section.hero h1')).toContainText('Uncompromising Comfort for Every Journey');

      // Check capabilities
      const servicesSection = page.locator('section#services');
      await expect(servicesSection).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Self Drive Cars' })).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Corporate Transits' })).toBeVisible();
    });

    test('should filter fleet cards by category and inspect vehicle details dialog', async ({ page }) => {
      const browseSection = page.locator('section#browse');
      await expect(browseSection).toBeVisible();

      // Verify filter toggle group
      const sevenSeaterBtn = browseSection.locator('button[hlmToggleGroupItem][value="7"]');
      await sevenSeaterBtn.click();

      // Only 7-seaters visible
      await expect(browseSection.getByText('Innova Crysta')).toBeVisible();
      await expect(browseSection.getByText('Swift Dzire')).not.toBeVisible();

      // Click card to open modal dialog
      const innovaCard = browseSection.locator('app-rr-vehicle-card', { hasText: 'Innova Crysta' }).first();
      await innovaCard.click();

      const modal = page.locator('.fixed.inset-0.z-50, [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal.getByText('Innova Crysta')).toBeVisible();

      // Dismiss modal
      const closeBtn = modal.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Close")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });

    test('should navigate to staff authentication portal when clicking Staff Login', async ({ page }) => {
      const loginLink = page.locator('header nav a.nav-login-btn');
      await expect(loginLink).toBeVisible();
      await loginLink.click();

      await page.waitForURL(/.*\/user\/rr\/login/);
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);
    });
  });

  test.describe('Phase 2: Authentication & Role-Based Access Control', () => {
    test.beforeEach(async ({ page }) => {
      await clearRRSession(page);
      await setupRRRouteMocks(page);
    });

    test('should redirect unauthenticated access from protected dashboard routes to login', async ({ page }) => {
      await page.goto('/user/rr/dashboard');
      await page.waitForURL(/.*\/user\/rr\/login/);
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);

      await page.goto('/user/rr/booking/list');
      await page.waitForURL(/.*\/user\/rr\/login/);
      await expect(page).toHaveURL(/.*\/user\/rr\/login/);
    });

    test('should complete desk staff authentication flow using demo credentials', async ({ page }) => {
      await page.goto('/user/rr/login');
      await page.waitForLoadState('domcontentloaded');

      // Click Demo Desk Staff
      const demoBtn = page.getByRole('button', { name: 'Demo Desk Staff' });
      await demoBtn.click();

      // Submit login form
      const submitBtn = page.locator('div[hlmTabsContent="employee"] button[type="submit"]');
      await submitBtn.click();

      // Redirection to dashboard
      await page.waitForURL(/.*\/user\/rr\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/user\/rr\/dashboard/);

      // Verify logged in desk agent details in header
      const header = page.locator('header.app-header');
      await expect(header.getByText('Desk Agent')).toBeVisible();
      await expect(header.getByText('EMPLOYEE')).toBeVisible();
    });

    test('should complete executive admin authentication flow and expose administrative controls', async ({ page }) => {
      await page.goto('/user/rr/login');
      await page.waitForLoadState('domcontentloaded');

      // Switch to admin tab and use Demo Admin
      const adminTab = page.locator('button[hlmTabsTrigger="admin"]');
      await adminTab.click();

      const demoAdminBtn = page.getByRole('button', { name: 'Demo Admin' });
      await demoAdminBtn.click();

      const submitBtn = page.locator('div[hlmTabsContent="admin"] button[type="submit"]');
      await submitBtn.click();

      await page.waitForURL(/.*\/user\/rr\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/user\/rr\/dashboard/);

      // Admin header credentials
      const header = page.locator('header.app-header');
      await expect(header.getByText('Admin Operator')).toBeVisible();
      await expect(header.getByText('ADMIN')).toBeVisible();

      // Admin sidebar navigation contains Staff Registry and Audit Logs
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await toggleBtn.click();
      const sidebar = page.locator('aside.sidebar');
      await expect(sidebar.getByText('Staff Registry')).toBeVisible();
      await expect(sidebar.getByText('Audit Logs')).toBeVisible();
    });
  });

  test.describe('Phase 3: Fleet Command Console & Operational Workflows', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should interact with dashboard telemetry cards and expand fleet inventory', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Overview Dashboard' })).toBeVisible();

      // Click Total Fleet card
      const totalFleetCard = page.locator('div[hlmCard]').filter({ hasText: 'Total Fleet' });
      await totalFleetCard.click();

      // Verify accordion content opens
      await expect(page.getByText('Total Fleet Inventory')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).toBeVisible();
    });

    test('should navigate to Active Rentals and verify rental agreement records', async ({ page }) => {
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await toggleBtn.click();

      const sidebar = page.locator('aside.sidebar');
      const activeRentalsLink = sidebar.locator('li.menu-item', { hasText: 'Active Rentals' });
      await activeRentalsLink.click();

      await page.waitForURL(/.*\/user\/rr\/booking\/list/);
      await expect(page).toHaveURL(/.*\/user\/rr\/booking\/list/);

      // Verify Active Rentals table
      await expect(page.getByRole('heading', { name: 'Active Rentals' })).toBeVisible();
      const table = page.locator('table[hlmTable]');
      await expect(table).toBeVisible();
      await expect(table.getByText('Suresh Varma')).toBeVisible();
      await expect(table.getByText('Swift Dzire')).toBeVisible();

      // Verify Create New Booking button triggers modal
      const createBtn = page.getByRole('button', { name: 'Create New Booking' });
      await createBtn.click();
      const modal = page.locator('div[role="dialog"], .fixed.inset-0.z-50').first();
      await expect(modal).toBeVisible({ timeout: 5000 });

      // Close modal
      const closeBtn = modal.locator('button[aria-label="Close dialog"], button:has([name="lucideX"]), button:has-text("Cancel")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });

    test('should navigate to Vehicles Inventory and verify fleet category filtering', async ({ page }) => {
      const toggleBtn = page.locator('.sidebar-toggle-btn');
      await toggleBtn.click();

      const sidebar = page.locator('aside.sidebar');
      const vehiclesLink = sidebar.locator('li.menu-item', { hasText: 'Vehicles Inventory' });
      await vehiclesLink.click();

      await page.waitForURL(/.*\/user\/rr\/vehicle\/list/);
      await expect(page).toHaveURL(/.*\/user\/rr\/vehicle\/list/);

      // Verify Fleet Registry header & cards
      await expect(page.getByRole('heading', { name: 'Fleet Registry' })).toBeVisible();
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).toBeVisible();

      // Filter by 5-Seater
      const fiveSeaterBtn = page.getByRole('button', { name: /5 Seater/i });
      await fiveSeaterBtn.click();
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).not.toBeVisible();
    });
  });

  test.describe('Phase 4: Security Inactivity & Session Lock', () => {
    test('should render session lock overlay and unlock cleanly with credentials', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER, isLocked: true });

      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');

      // Lock screen overlay is visible
      const lockOverlay = page.locator('div[aria-labelledby="lock-screen-title"]');
      await expect(lockOverlay).toBeVisible({ timeout: 10000 });
      await expect(lockOverlay.getByRole('heading', { name: 'Session Locked' })).toBeVisible();

      // Enter credential and unlock
      const credInput = page.locator('#rr-lock-credential');
      await credInput.fill('1990-05-15');
      const unlockBtn = page.getByRole('button', { name: /Unlock Session/i });
      await unlockBtn.click();

      // Workspace restored
      await expect(lockOverlay).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('heading', { name: 'Overview Dashboard' })).toBeVisible();
    });
  });
});
