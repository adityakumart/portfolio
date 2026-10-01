import { test, expect } from '@playwright/test';

test.describe('EducationComponent (<app-education>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Scroll down to trigger deferred Education section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const target = page.locator('app-education, [aria-label="Loading Education"]').first();
    await target.scrollIntoViewIfNeeded().catch(() => {});
  });

  test('should render Education container card and title', async ({ page }) => {
    const educationComponent = page.locator('app-education');
    await expect(educationComponent).toBeVisible({ timeout: 10000 });

    const card = educationComponent.locator('div[hlmCard][aria-label="Education"]');
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading', { name: 'Education' })).toBeVisible();
  });

  test('should render institution names with links and attendance dates', async ({ page }) => {
    const educationComponent = page.locator('app-education');
    await expect(educationComponent).toBeVisible({ timeout: 10000 });

    const timelineItems = educationComponent.locator('.timeline-work-item');
    const count = await timelineItems.count();
    expect(count).toBeGreaterThan(0);

    const firstItem = timelineItems.first();
    const institutionLink = firstItem.locator('h3 a');
    await expect(institutionLink).toBeVisible();
    await expect(institutionLink).toHaveAttribute('target', '_blank');
    await expect(institutionLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Date badge
    const dateBadge = firstItem.locator('[hlmBadge]');
    await expect(dateBadge).toBeVisible();
    expect((await dateBadge.textContent())?.trim().length).toBeGreaterThan(0);
  });

  test('should display courses / degree field when present', async ({ page }) => {
    const educationComponent = page.locator('app-education');
    await expect(educationComponent).toBeVisible({ timeout: 10000 });

    const courseTexts = educationComponent.locator('.text-sky-500');
    if (await courseTexts.count() > 0) {
      const firstCourse = courseTexts.first();
      await expect(firstCourse).toBeVisible();
      expect((await firstCourse.textContent())?.trim().length).toBeGreaterThan(0);
    }
  });
});
