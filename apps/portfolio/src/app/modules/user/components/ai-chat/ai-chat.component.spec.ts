import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

test.describe('User Module Subroute - AI Space (/user/chat)', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      modules: { aiSpace: true },
    });
    await page.goto('/portfolio/user/chat');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render AI Space header, Ready status badge, and sidebar', async ({ page }) => {
    await expect(page.getByText('AI Space').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ready')).toBeVisible();
    await expect(page.getByRole('button', { name: /New Chat/i })).toBeVisible();
    await expect(page.getByText('Recent Chats', { exact: true })).toBeVisible();
  });

  test('should display empty state with prompt suggestions on initial session', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'How can I help you today?' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Code Helper')).toBeVisible();
  });

  test('should control prompt input and send button enablement', async ({ page }) => {
    const promptInput = page.locator('textarea[placeholder="Ask AI Assistant..."]');
    await expect(promptInput).toBeVisible({ timeout: 10000 });

    const sendBtn = page.locator('button:has(ng-icon[name="lucideSend"])');
    // Initially disabled when textarea is empty
    await expect(sendBtn).toBeDisabled();

    // Type text enables send button
    await promptInput.fill('Can you explain TypeScript generics?');
    await expect(sendBtn).toBeEnabled();

    // Clear input disables button again
    await promptInput.fill('');
    await expect(sendBtn).toBeDisabled();
  });
});
