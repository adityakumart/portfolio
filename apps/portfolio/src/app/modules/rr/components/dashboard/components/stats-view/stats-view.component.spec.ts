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
      const filter5Seater = page.getByRole('button', { name: /5\s*Seater/i });
      const filter7Seater = page.getByRole('button', { name: /7\s*Seater/i });

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
      const closeAccordionBtn = page.getByRole('button', { name: /Collapse View/i });
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

    test('should expand In Service category and display Available By date in listed vehicle cards', async ({ page }) => {
      const maintenanceCard = page.locator('div[hlmCard]').filter({ hasText: 'In Service' });
      await maintenanceCard.click();

      // Accordion banner for Fleet In Service & Maintenance
      await expect(page.getByText('Fleet In Service & Maintenance')).toBeVisible({ timeout: 5000 });

      // Scorpio N is in maintenance with availableBy: 2026-10-25
      const scorpioCard = page.locator('app-rr-vehicle-card', { hasText: 'Scorpio N' }).first();
      await expect(scorpioCard).toBeVisible();
      await expect(scorpioCard.getByText('IN SERVICE')).toBeVisible();
      await expect(scorpioCard.getByText(/Available By/i)).toBeVisible();
      await expect(scorpioCard.getByText('25-10-2026')).toBeVisible();
    });

    test('should expand In-Contract category and display Available By date in listed vehicle cards', async ({ page }) => {
      const contractCard = page.locator('div[hlmCard]').filter({ hasText: 'In-Contract' });
      await contractCard.click();

      // Accordion banner for In-Contract Fleet
      await expect(page.getByText('In-Contract Fleet')).toBeVisible({ timeout: 5000 });

      // Honda City is in contract with availableBy: 2026-11-15
      const cityCard = page.locator('app-rr-vehicle-card', { hasText: 'Honda City' }).first();
      await expect(cityCard).toBeVisible();
      await expect(cityCard.getByText('IN CONTRACT')).toBeVisible();
      await expect(cityCard.getByText(/Available By/i)).toBeVisible();
      await expect(cityCard.getByText('15-11-2026')).toBeVisible();
    });
  });
});
