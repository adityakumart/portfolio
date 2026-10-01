import { test, expect } from '@playwright/test';
import { setupRRRouteMocks, clearRRSession, injectRRSession, MOCK_EMPLOYEE_USER } from '../../rr-test.helper';

test.describe('RR Module - Homepage Component', () => {
  test.describe('Public Visitor Experience', () => {
    test.beforeEach(async ({ page }) => {
      await clearRRSession(page);
      await setupRRRouteMocks(page);
      await page.goto('/user/rr');
      await page.waitForLoadState('domcontentloaded');

      // Dismiss or skip car loader screen if visible to access main content immediately
      const skipBtn = page.getByRole('button', { name: /Skip animation|Skip/i });
      if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await skipBtn.click();
      }
      await page.locator('header .logo-area').waitFor({ state: 'visible', timeout: 8000 });
    });

    test('should render header brand and navigation elements', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toBeVisible();
      await expect(header.locator('h2')).toHaveText('RoadReady Rentals');

      // Verify desktop navigation anchors
      const nav = header.locator('nav');
      await expect(nav.getByRole('link', { name: 'Services' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Browse Fleet' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
      await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();

      // Verify Staff Login button for unauthenticated visitor
      const loginBtn = nav.getByRole('link', { name: /Staff Login/i });
      await expect(loginBtn).toBeVisible();
      await expect(loginBtn).toHaveAttribute('href', '/user/rr/login');
    });

    test('should render hero banner with headline, badge, and CTA buttons', async ({ page }) => {
      const hero = page.locator('section.hero');
      await expect(hero).toBeVisible();

      // Headline and description
      await expect(hero.locator('h1')).toContainText('Uncompromising Comfort for Every Journey');
      await expect(hero.getByText('PREMIUM CAR RENTALS & FLEET COMMAND')).toBeVisible();

      // CTAs
      const exploreBtn = hero.getByRole('link', { name: 'Explore Fleet' });
      const bookBtn = hero.getByRole('link', { name: 'Book Consultation' });
      await expect(exploreBtn).toBeVisible();
      await expect(bookBtn).toBeVisible();
      await expect(exploreBtn).toHaveAttribute('href', '#browse');
      await expect(bookBtn).toHaveAttribute('href', '#contact');
    });

    test('should display all five service capability cards', async ({ page }) => {
      const servicesSection = page.locator('section#services');
      await expect(servicesSection).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Our Premium Services' })).toBeVisible();

      await expect(servicesSection.getByRole('heading', { name: 'Self Drive Cars' })).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Local Sight Seeing' })).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Outstations Pickups' })).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Package Tours' })).toBeVisible();
      await expect(servicesSection.getByRole('heading', { name: 'Corporate Transits' })).toBeVisible();
    });

    test('should filter vehicles by category tabs and toggle fleet view', async ({ page }) => {
      const browseSection = page.locator('section#browse');
      await expect(browseSection).toBeVisible();

      // Verify category filter buttons
      const allBtn = browseSection.locator('button[hlmToggleGroupItem][value="all"]');
      const fiveSeaterBtn = browseSection.locator('button[hlmToggleGroupItem][value="5"]');
      const sevenSeaterBtn = browseSection.locator('button[hlmToggleGroupItem][value="7"]');
      const suvBtn = browseSection.locator('button[hlmToggleGroupItem][value="suv"]');

      await expect(allBtn).toBeVisible();
      await expect(fiveSeaterBtn).toBeVisible();
      await expect(sevenSeaterBtn).toBeVisible();
      await expect(suvBtn).toBeVisible();

      // Initially shows all vehicles
      await expect(browseSection.getByText('Swift Dzire')).toBeVisible();
      await expect(browseSection.getByText('Innova Crysta')).toBeVisible();

      // Filter by 7-Seaters
      await sevenSeaterBtn.click();
      await expect(browseSection.getByText('Innova Crysta')).toBeVisible();
      await expect(browseSection.getByText('Swift Dzire')).not.toBeVisible();

      // Return to All Fleet
      await allBtn.click();
      await expect(browseSection.getByText('Swift Dzire')).toBeVisible();
    });

    test('should open vehicle details modal when clicking a vehicle card', async ({ page }) => {
      const browseSection = page.locator('section#browse');
      const dzireCard = browseSection.locator('app-rr-vehicle-card', { hasText: 'Swift Dzire' }).first();
      await expect(dzireCard).toBeVisible();

      // Click card to open modal
      await dzireCard.click();

      // Verify modal dialog appears
      const modal = page.locator('.fixed.inset-0.z-50, [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await expect(modal.getByText('Swift Dzire')).toBeVisible();

      // Close modal using close button
      const closeBtn = modal.locator('button[aria-label="Close dialog"], button:has-text("Close"), button:has([name="lucideX"])').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    });

    test('should toggle mobile menu drawer when clicking hamburger button', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const hamburger = page.locator('.hamburger');
      await expect(hamburger).toBeVisible();

      const mobileMenu = page.locator('.mobile-menu');
      await expect(mobileMenu).not.toBeVisible();

      // Click hamburger to open
      await hamburger.click();
      await expect(mobileMenu).toBeVisible();
      await expect(mobileMenu.getByRole('link', { name: 'Services' })).toBeVisible();
      await expect(mobileMenu.getByRole('link', { name: 'Staff Login' })).toBeVisible();

      // Click again to close
      await hamburger.click();
      await expect(mobileMenu).not.toBeVisible();
    });
  });

  test.describe('Authenticated Desk Staff Experience', () => {
    test('should show Command Desk button instead of Staff Login when user is authenticated', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });

      await page.goto('/user/rr');
      await page.waitForLoadState('domcontentloaded');

      const skipBtn = page.getByRole('button', { name: /Skip animation|Skip/i });
      if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await skipBtn.click();
      }

      // Check header shows Command Desk
      const commandDeskBtn = page.locator('header nav a.nav-login-btn');
      await expect(commandDeskBtn).toBeVisible({ timeout: 8000 });
      await expect(commandDeskBtn).toContainText('Command Desk');
      await expect(commandDeskBtn).toHaveAttribute('href', '/user/rr/dashboard');
    });
  });
});
