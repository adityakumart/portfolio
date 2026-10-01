import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

test.describe('User Module Subroute - Profile (User Hub)', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      email: 'lead.dev@example.com',
      firstName: 'Lead',
      lastName: 'Developer',
      modules: {
        aiSpace: true,
        aiAssistant: true,
        fileManager: true,
        dietHydration: true,
        devTools: true,
        formBuilder: true,
        rr: true,
      },
    });
    await page.goto('/portfolio/user');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render User Hub header, workspace badge, and user email badge', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'User Hub' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Workspace')).toBeVisible();
    await expect(page.getByText('lead.dev@example.com')).toBeVisible();
  });

  test('should render all provisioned module cards with action buttons', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Space' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'AI Assistant' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'File Manager' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Diet & Hydration' })).toBeVisible();

    // Verify open buttons
    await expect(page.getByRole('button', { name: /Open AI Space/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open AI Assistant/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open File Manager/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Diet & Hydration/i })).toBeVisible();
  });

  test('should navigate to AI Space subroute when clicking Open AI Space', async ({ page }) => {
    const aiSpaceBtn = page.getByRole('button', { name: /Open AI Space/i });
    await aiSpaceBtn.click();

    await page.waitForURL(/.*\/user\/chat/);
    await expect(page).toHaveURL(/.*\/user\/chat/);
  });
});
