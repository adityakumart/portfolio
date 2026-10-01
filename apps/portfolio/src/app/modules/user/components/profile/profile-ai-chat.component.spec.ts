import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

test.describe('User Module Subroute - Profile AI Assistant (/user/ai)', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      modules: { aiAssistant: true },
    });
    await page.goto('/portfolio/user/ai');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render AI Developer Assistant header and Online badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Developer Assistant' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Online • Gemini Sandbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /Clear Chat/i })).toBeVisible();
  });

  test('should display initial assistant greeting message and input field', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Developer Assistant' })).toBeVisible({ timeout: 10000 });

    const promptTextarea = page.locator('textarea[placeholder*="Ask a technical question"]');
    await expect(promptTextarea).toBeVisible({ timeout: 10000 });

    const sendBtn = page.locator('button:has(ng-icon[name="lucideSend"])');
    await expect(sendBtn).toBeDisabled();

    // Typing prompt enables send button
    await promptTextarea.fill('What is an Angular Signal?');
    await expect(sendBtn).toBeEnabled();
  });
});
