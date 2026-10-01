import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Dashboard Stats View Component', () => {
  test.describe('Overview Metrics & Accordion Expansion', () => {
    test.beforeEach(async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render dashboard heading and telemetry metric cards', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Overview Dashboard' })).toBeVisible();

      // Check Metric summary cards
      const totalFleetCard = page.locator('div[hlmCard]').filter({ hasText: 'Total Fleet' });
      const availableCard = page.locator('div[hlmCard]').filter({ hasText: 'Available' });
      const bookingsCard = page.locator('div[hlmCard]').filter({ hasText: 'Active Bookings' });
      const maintenanceCard = page.locator('div[hlmCard]').filter({ hasText: 'In Service' });

      await expect(totalFleetCard).toBeVisible();
      await expect(availableCard).toBeVisible();
      await expect(bookingsCard).toBeVisible();
      await expect(maintenanceCard).toBeVisible();

      // Verify counts
      await expect(totalFleetCard.locator('.text-3xl')).toHaveText('4');
      await expect(availableCard.locator('.text-3xl')).toHaveText('2');
      await expect(bookingsCard.locator('.text-3xl')).toHaveText('2');
      await expect(maintenanceCard.locator('.text-3xl')).toHaveText('1');
    });

    test('should expand accordion on metric card click and filter vehicles by seating capacity', async ({ page }) => {
      const totalFleetCard = page.locator('div[hlmCard]').filter({ hasText: 'Total Fleet' });

      // Click Total Fleet card to expand accordion
      await totalFleetCard.click();

      // Accordion banner appears
      const accordionHeader = page.locator('h3:has-text("Total Fleet Inventory")');
      await expect(accordionHeader).toBeVisible({ timeout: 5000 });

      // Check Seating capacity filter pills inside accordion
      const filterAll = page.getByRole('button', { name: /All \(/i });
      const filter5Seater = page.getByRole('button', { name: /5-Seater/i });
      const filter7Seater = page.getByRole('button', { name: /7-Seater/i });

      await expect(filterAll).toBeVisible();
      await expect(filter5Seater).toBeVisible();
      await expect(filter7Seater).toBeVisible();

      // Filter by 5-Seater: Dzire should be visible, Innova Crysta should be hidden
      await filter5Seater.click();
      await expect(page.getByText('Swift Dzire')).toBeVisible();
      await expect(page.getByText('Innova Crysta')).not.toBeVisible();

      // Filter by 7-Seater: Innova Crysta should be visible, Swift Dzire should be hidden
      await filter7Seater.click();
      await expect(page.getByText('Innova Crysta')).toBeVisible();
      await expect(page.getByText('Swift Dzire')).not.toBeVisible();

      // Close accordion using close button
      const closeAccordionBtn = page.locator('button[aria-label="Close section"], button:has([name="lucideX"])').first();
      await closeAccordionBtn.click();
      await expect(accordionHeader).not.toBeVisible();
    });

    test('should expand Active Bookings category and show active customer journeys', async ({ page }) => {
      const bookingsCard = page.locator('div[hlmCard]').filter({ hasText: 'Active Bookings' });
      await bookingsCard.click();

      // Accordion banner for bookings
      await expect(page.getByText('Active Customer Bookings')).toBeVisible({ timeout: 5000 });

      // Active booking cards displayed
      await expect(page.getByText('Suresh Varma')).toBeVisible();
      await expect(page.getByText('Venkat Rao')).toBeVisible();
    });
  });

  test.describe('Administrative Audit Activity View', () => {
    test('should display recent activity audit table for admin users', async ({ page }) => {
      await setupRRRouteMocks(page);
      await injectRRSession(page, { user: MOCK_ADMIN_USER });
      await page.goto('/user/rr/dashboard');
      await page.waitForLoadState('domcontentloaded');

      // Admin sees Recent Activity Logs section
      const auditSection = page.locator('section', { hasText: 'Recent Activity Logs' }).or(page.locator('.recent-activity-section, div:has-text("Recent Activity Logs")'));
      await expect(auditSection.first()).toBeVisible({ timeout: 5000 });

      // Verify log actions
      await expect(page.getByText('Started rental booking for Swift Dzire')).toBeVisible();
      await expect(page.getByText('Created rental booking for Innova Crysta')).toBeVisible();
    });
  });
});
