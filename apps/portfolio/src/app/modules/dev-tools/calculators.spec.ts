import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../test-utils/playwright-helpers';

test.describe('DevTools Module - Calculators', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page);
  });

  test.describe('Percentage Calculator', () => {
    test('should calculate percentage increase accurately', async ({ page }) => {
      await page.goto('/user/dev-tools/calculator/percentage');
      await page.waitForLoadState('domcontentloaded');

      const initialInput = page.locator('input[name="initialValue"]');
      const finalInput = page.locator('input[name="finalValue"]');

      await expect(initialInput).toBeVisible();
      await expect(finalInput).toBeVisible();

      // Enter 100 as initial and 150 as final (50% increase)
      await initialInput.fill('100');
      await finalInput.fill('150');

      const resultBox = page.locator('.result-box');
      await expect(resultBox).toBeVisible();
      await expect(resultBox).toContainText('50');
    });

    test('should handle decrease calculation', async ({ page }) => {
      await page.goto('/user/dev-tools/calculator/percentage');
      await page.waitForLoadState('domcontentloaded');

      const initialInput = page.locator('input[name="initialValue"]');
      const finalInput = page.locator('input[name="finalValue"]');

      await initialInput.fill('200');
      await finalInput.fill('100');

      const resultBox = page.locator('.result-box');
      await expect(resultBox).toBeVisible();
      await expect(resultBox).toContainText('-50');
    });
  });

  test.describe('Experience Calculator', () => {
    test('should render experience form with personal details and action buttons', async ({
      page,
    }) => {
      await page.goto('/user/dev-tools/calculator/experience');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.getByRole('heading', { name: /Experience Calculator/i })).toBeVisible({ timeout: 10000 });

      const nameInput = page.locator('input[formControlName="name"]');
      const emailInput = page.locator('input[formControlName="email"]');

      await expect(nameInput).toBeVisible();
      await expect(emailInput).toBeVisible();

      await nameInput.fill('Alex Developer');
      await emailInput.fill('alex@example.com');
      await expect(nameInput).toHaveValue('Alex Developer');
      await expect(emailInput).toHaveValue('alex@example.com');
    });

    test('should open saved list dialog when clicking View Saved List button', async ({
      page,
    }) => {
      await page.goto('/user/dev-tools/calculator/experience');
      await page.waitForLoadState('domcontentloaded');

      const viewListBtn = page.locator('button', { hasText: 'View Saved List' });
      await expect(viewListBtn).toBeVisible();
      await viewListBtn.click();

      // Verify modal or overlay opens
      const dialog = page.locator('[role="dialog"], hlm-dialog, app-experience-list-dialog');
      await expect(dialog.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Timezone Converter', () => {
    test('should load timezone converter interface', async ({ page }) => {
      await page.goto('/user/dev-tools/calculator/timezone-converter');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveURL(/.*\/user\/dev-tools\/calculator\/timezone-converter/);
    });
  });
});
