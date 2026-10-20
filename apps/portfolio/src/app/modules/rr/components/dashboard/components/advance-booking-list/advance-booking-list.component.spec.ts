import { test, expect } from '@playwright/test';
import {
  setupRRRouteMocks,
  injectRRSession,
  MOCK_EMPLOYEE_USER,
} from '../../../../rr-test.helper';

test.describe('RR Module - Advance Booking List Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupRRRouteMocks(page);
    await injectRRSession(page, { user: MOCK_EMPLOYEE_USER });
    await page.goto('/user/rr/booking/advance');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render advance booking header and Reserve Booking action button', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Advance Booking' }),
    ).toBeVisible({ timeout: 10000 });

    const reserveBtn = page.getByRole('button', { name: 'Reserve Booking' });
    await expect(reserveBtn).toBeVisible();
  });

  test('should render search bar and total reservations count', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search reserved vehicle"]');
    await expect(searchInput).toBeVisible();

    await expect(page.getByText('Total Reservations:')).toBeVisible();
  });

  test('should render advance bookings table structure with columns', async ({ page }) => {
    const table = page.locator('table');
    await expect(table).toBeVisible();

    await expect(table.getByRole('columnheader', { name: 'Vehicle Details' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Customer Name' })).toBeVisible();
  });

  test('should open Reserve Booking dialog when clicking Reserve Booking button', async ({
    page,
  }) => {
    const reserveBtn = page.getByRole('button', { name: 'Reserve Booking' });
    await reserveBtn.click();

    // Dialog should open
    const dialog = page.locator('[role="dialog"], hlm-dialog, app-reserve-booking-dialog').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
