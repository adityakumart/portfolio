import { test, expect } from '@playwright/test';

test.describe('AwardsComponent (<app-awards>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Scroll down to trigger deferred Awards section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const target = page.locator('app-awards, [aria-label="Loading Awards"]').first();
    await target.scrollIntoViewIfNeeded().catch(() => {});
  });

  test('should render Awards & Recognitions container section and heading', async ({ page }) => {
    const awardsComponent = page.locator('app-awards');
    await expect(awardsComponent).toBeVisible({ timeout: 10000 });

    const section = awardsComponent.locator('section[aria-label="Awards and Recognitions"]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: 'Awards & Recognitions' })).toBeVisible();
    await expect(section.getByText('Key achievements and honors received.')).toBeVisible();
  });

  test('should render award cards with titles, awarder, date, and description summary', async ({ page }) => {
    const awardsComponent = page.locator('app-awards');
    await expect(awardsComponent).toBeVisible({ timeout: 10000 });

    const awardCards = awardsComponent.locator('.award-card-with-accent');
    const count = await awardCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = awardCards.first();
    const title = firstCard.locator('h3');
    await expect(title).toBeVisible();
    expect((await title.textContent())?.trim().length).toBeGreaterThan(0);

    const awarder = firstCard.locator('.text-sky-500');
    await expect(awarder).toBeVisible();
    expect((await awarder.textContent())?.trim().length).toBeGreaterThan(0);

    const date = firstCard.locator('.text-xs span.text-muted-foreground');
    await expect(date).toBeVisible();
    expect((await date.textContent())?.trim().length).toBeGreaterThan(0);

    const summary = firstCard.locator('[hlmCardContent] p');
    await expect(summary).toBeVisible();
    expect((await summary.textContent())?.trim().length).toBeGreaterThan(0);
  });
});
