import { test, expect } from '@playwright/test';

test.describe('SummaryComponent (<app-summary>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render the summary component container and section', async ({ page }) => {
    const summaryComponent = page.locator('app-summary');
    await expect(summaryComponent).toBeVisible();

    const summarySection = summaryComponent.locator('section[aria-label="About Me and Quick Facts"]');
    await expect(summarySection).toBeVisible();
  });

  test('should render About Me card with title and biographical paragraphs', async ({ page }) => {
    const summary = page.locator('app-summary');
    const aboutMeHeading = summary.getByRole('heading', { name: 'About Me' });
    await expect(aboutMeHeading).toBeVisible();

    // Verify presence of paragraph content
    const paragraphs = summary.locator('[hlmCardContent]').first().locator('p');
    const count = await paragraphs.count();
    expect(count).toBeGreaterThan(0);

    const firstText = await paragraphs.first().textContent();
    expect(firstText?.trim().length).toBeGreaterThan(10);
  });

  test('should render Quick Facts card with Experience, Location, and Specialty details', async ({ page }) => {
    const summary = page.locator('app-summary');
    const quickFactsHeading = summary.getByRole('heading', { name: 'Quick Facts' });
    await expect(quickFactsHeading).toBeVisible();

    // Verify Experience entry
    await expect(summary.getByText('Experience', { exact: true })).toBeVisible();
    await expect(summary.getByText('8+ years delivering frontend products', { exact: false })).toBeVisible();

    // Verify Location entry
    await expect(summary.getByText('Location', { exact: true })).toBeVisible();

    // Verify Specialty entry
    await expect(summary.getByText('Specialty', { exact: true })).toBeVisible();
    await expect(
      summary.getByText('Modern web applications, motion UI', { exact: false })
    ).toBeVisible();
  });
});
