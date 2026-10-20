import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../test-utils/playwright-helpers';

test.describe('DevTools Module - Hub & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page);
  });

  test('should default redirect to percentage calculator when navigating to /user/dev-tools', async ({
    page,
  }) => {
    await page.goto('/user/dev-tools');
    await page.waitForURL(/.*\/user\/dev-tools\/calculator\/percentage/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/user\/dev-tools\/calculator\/percentage/);

    // Verify calculator header is rendered
    await expect(page.getByRole('heading', { name: /Percentage/i })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to Experience Calculator route', async ({ page }) => {
    await page.goto('/user/dev-tools/calculator/experience');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Experience Calculator/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button', { hasText: 'View Saved List' })).toBeVisible();
  });

  test('should navigate to JSON to TypeScript converter route', async ({ page }) => {
    await page.goto('/user/dev-tools/converters/json-to-typescript');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /JSON to TypeScript/i })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[formControlName="interfaceName"]')).toBeVisible();
  });

  test('should navigate to Base64 encode/decode route', async ({ page }) => {
    await page.goto('/user/dev-tools/encode-decode/base64');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveURL(/.*\/user\/dev-tools\/encode-decode\/base64/);
    await expect(page.locator('body')).toBeVisible();
  });
});
