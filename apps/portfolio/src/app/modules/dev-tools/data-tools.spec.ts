import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../test-utils/playwright-helpers';

test.describe('DevTools Module - Data Tools & Converters', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page);
  });

  test.describe('JSON to TypeScript Interface Generator', () => {
    test('should generate interface code from valid JSON input', async ({ page }) => {
      await page.goto('/user/dev-tools/converters/json-to-typescript');
      await page.waitForLoadState('domcontentloaded');

      const interfaceNameInput = page.locator('input[formControlName="interfaceName"]');
      const jsonTextarea = page.locator('textarea[formControlName="jsonInput"]');
      const generateBtn = page.locator('button', { hasText: 'Generate Interface' });

      await expect(interfaceNameInput).toBeVisible();
      await expect(jsonTextarea).toBeVisible();

      await interfaceNameInput.fill('UserProfile');
      await jsonTextarea.fill('{"id": 1, "username": "alex", "isActive": true}');

      await expect(generateBtn).toBeEnabled();
      await generateBtn.click();

      // Output section should appear with generated TypeScript
      const outputSection = page.locator('.output-section');
      await expect(outputSection).toBeVisible({ timeout: 5000 });
      await expect(outputSection).toContainText('interface UserProfile');
      await expect(outputSection).toContainText('username: string');
      await expect(outputSection).toContainText('isActive: boolean');
    });

    test('should disable generate button when JSON input is empty or invalid', async ({
      page,
    }) => {
      await page.goto('/user/dev-tools/converters/json-to-typescript');
      await page.waitForLoadState('domcontentloaded');

      const interfaceNameInput = page.locator('input[formControlName="interfaceName"]');
      const jsonTextarea = page.locator('textarea[formControlName="jsonInput"]');
      const generateBtn = page.locator('button', { hasText: 'Generate Interface' });

      await interfaceNameInput.fill('TestInterface');
      await jsonTextarea.fill('{invalid_json}');

      await expect(generateBtn).toBeDisabled();
      await expect(page.locator('text=Please enter valid JSON format')).toBeVisible();
    });
  });

  test.describe('Base64 Converter', () => {
    test('should render base64 tool page', async ({ page }) => {
      await page.goto('/user/dev-tools/encode-decode/base64');
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(/.*\/user\/dev-tools\/encode-decode\/base64/);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('JWT Decoder', () => {
    test('should render JWT tool page', async ({ page }) => {
      await page.goto('/user/dev-tools/encode-decode/jwt');
      await page.waitForLoadState('domcontentloaded');

      await expect(page).toHaveURL(/.*\/user\/dev-tools\/encode-decode\/jwt/);
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
