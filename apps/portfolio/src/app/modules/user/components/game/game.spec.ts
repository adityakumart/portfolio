import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../../../test-utils/playwright-helpers';

test.describe('Game Arena Component (<app-game>)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept movies dataset for the game engine
    await page.route('**/movies/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              _id: '1',
              title: 'RRR',
              year: 2022,
              englishTranslation: 'Rise Roar Revolt',
              teluguTranslation: 'Roudram Ranam Rudhiram',
              cast: 'NTR, Ram Charan',
            },
            {
              _id: '2',
              title: 'Baahubali',
              year: 2015,
              englishTranslation: 'The One with Strong Arms',
              teluguTranslation: 'Baahubali',
              cast: 'Prabhas, Rana',
            },
          ],
        }),
      });
    });

    await injectUserSession(page, {
      modules: { game: true },
    });
  });

  test('should render Game Dashboard setup screen with title and player inputs', async ({
    page,
  }) => {
    await page.goto('/user/game');
    await page.waitForLoadState('domcontentloaded');

    // Title banner
    await expect(
      page.getByRole('heading', { name: 'Telugu Movie Guesser' }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Multiplayer Guessing Arena')).toBeVisible();

    // Start Guessing Game button
    const startBtn = page.getByRole('button', { name: /Start Guessing Game/i });
    await expect(startBtn).toBeVisible();
  });

  test('should adjust turn duration using preset buttons', async ({ page }) => {
    await page.goto('/user/game');
    await page.waitForLoadState('domcontentloaded');

    const preset30s = page.getByRole('button', { name: '30s', exact: true });
    await expect(preset30s).toBeVisible({ timeout: 10000 });
    await preset30s.click();

    // Verify Start Game button reflects 30s per player
    const startBtn = page.getByRole('button', { name: /Start Guessing Game \(30s per player\)/i });
    await expect(startBtn).toBeVisible();
  });

  test('should transition to gameplay when clicking Start Guessing Game', async ({
    page,
  }) => {
    await page.goto('/user/game');
    await page.waitForLoadState('domcontentloaded');

    const startBtn = page.getByRole('button', { name: /Start Guessing Game/i });
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    // Expect transition to gameplay component
    const gameplay = page.locator('app-gameplay');
    await expect(gameplay).toBeVisible({ timeout: 10000 });
  });
});
