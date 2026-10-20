import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../test-utils/playwright-helpers';

test.describe('Movie Importer Module', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept backend movie count or list APIs if called
    await page.route('**/movies/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ count: 42, years: [1995, 1996, 1997], data: [] }),
      });
    });

    await injectUserSession(page, {
      role: 'admin',
      masterAdmin: true,
      modules: { movies: true },
    });
  });

  test('should render Movie Importer header and database metrics', async ({ page }) => {
    await page.goto('/user/movies');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1')).toContainText('Telugu Movie JSON Importer');
    await expect(page.getByText('In Database', { exact: true })).toBeVisible();
    await expect(page.getByText('Years Logged', { exact: true })).toBeVisible();
  });

  test('should toggle between file upload mode and paste JSON mode', async ({ page }) => {
    await page.goto('/user/movies');
    await page.waitForLoadState('domcontentloaded');

    const pasteTab = page.locator('button', { hasText: 'Paste JSON Array' });
    const fileTab = page.locator('button', { hasText: 'Upload JSON File(s)' });

    await expect(pasteTab).toBeVisible();
    await expect(fileTab).toBeVisible();

    // Click Paste tab
    await pasteTab.click();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    // Switch back to File tab
    await fileTab.click();
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('should show parsing error when invalid JSON is entered in paste mode', async ({
    page,
  }) => {
    await page.goto('/user/movies');
    await page.waitForLoadState('domcontentloaded');

    const pasteTab = page.locator('button', { hasText: 'Paste JSON Array' });
    await pasteTab.click();

    const textarea = page.locator('textarea');
    await textarea.fill('{ invalid json format }');

    // Error banner should be displayed
    await expect(page.locator('text=JSON Parsing Error:')).toBeVisible({ timeout: 5000 });
  });

  test('should parse valid movie JSON and display pre-validation summary', async ({
    page,
  }) => {
    await page.goto('/user/movies');
    await page.waitForLoadState('domcontentloaded');

    const pasteTab = page.locator('button', { hasText: 'Paste JSON Array' });
    await pasteTab.click();

    const sampleMovies = JSON.stringify([
      {
        title: 'Aadaalla Majaka',
        cast: 'Vikram, Sivaranjani',
        englishTranslation: 'Women Are No Joke',
        teluguTranslation: 'Aadaallatho Pettukunte Anthuleni Gola!',
        year: 1995,
      },
    ]);

    const textarea = page.locator('textarea');
    await textarea.fill(sampleMovies);

    // Pre-validation summary should appear
    await expect(page.getByText('Pre-Validation Summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('1 total objects')).toBeVisible();
  });
});
