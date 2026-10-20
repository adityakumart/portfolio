import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Announcements & Ticker Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_ADMIN_USER });
    await page.goto('/user/rr/announcements');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Announcements & Ticker Desk title banner', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Announcements & Ticker Desk' }),
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('heading', { name: /Homepage Live Scrolling Marquee/i }),
    ).toBeVisible();

    const addBtn = page.getByRole('button', { name: 'Add Announcement' });
    await expect(addBtn).toBeVisible();
  });

  test('should render announcement cards from mock data', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Announcements & Ticker Desk' }),
    ).toBeVisible({ timeout: 10000 });

    // Verify announcements list or cards exist
    const cards = page.locator('.announcement-card, [hlmCard], .border.rounded-2xl');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should open Add Announcement modal when clicking Add Announcement button', async ({
    page,
  }) => {
    const addBtn = page.getByRole('button', { name: 'Add Announcement' });
    await addBtn.click();

    // Dialog should open
    const dialog = page.locator('[role="dialog"], hlm-dialog, .fixed.inset-0').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
