import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_ADMIN_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Homepage CMS & Banner Desk Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_ADMIN_USER });
    await page.goto('/user/rr/home-content');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render Homepage CMS & Banner Manager title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Homepage CMS & Banner Manager' }),
    ).toBeVisible({ timeout: 10000 });

    const publishBtn = page.getByRole('button', { name: /Publish Changes/i });
    await expect(publishBtn).toBeVisible();

    const defaultsBtn = page.getByRole('button', { name: /Restore Defaults/i });
    await expect(defaultsBtn).toBeVisible();
  });

  test('should switch between tabs (Hero, Services, About, Contact, Footer)', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Homepage CMS & Banner Manager' }),
    ).toBeVisible({ timeout: 10000 });

    // Click Services Tab
    const servicesTab = page.getByRole('button', { name: /Services/i });
    await servicesTab.click();
    await expect(page.getByText('Services Section Header')).toBeVisible();

    // Click About Us Tab
    const aboutTab = page.getByRole('button', { name: /About Us & Stats/i });
    await aboutTab.click();
    await expect(page.getByText('About Us Header & Story')).toBeVisible();

    // Click Contact Desk Tab
    const contactTab = page.getByRole('button', { name: /Contact Desk/i });
    await contactTab.click();
    await expect(page.getByText('Direct Phone & WhatsApp Booking Desk')).toBeVisible();
  });

  test('should open Restore Defaults confirmation modal', async ({ page }) => {
    const defaultsBtn = page.getByRole('button', { name: /Restore Defaults/i });
    await defaultsBtn.click();

    const dialog = page.locator('[role="dialog"], hlm-dialog, .fixed.inset-0').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Restore Factory Defaults?')).toBeVisible();
  });
});
