import { test, expect } from '@playwright/test';

test.describe('ExperienceComponent (<app-experience>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Scroll down to trigger deferred Work Experience section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const target = page.locator('app-experience, [aria-label="Loading Experience"]').first();
    await target.scrollIntoViewIfNeeded().catch(() => {});
  });

  test('should render the experience component container and card', async ({ page }) => {
    const experienceComponent = page.locator('app-experience');
    await expect(experienceComponent).toBeVisible({ timeout: 10000 });

    const card = experienceComponent.locator('div[hlmCard][aria-label="Work Experience"]');
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading', { name: 'Work Experience' })).toBeVisible();
  });

  test('should render timeline work items with company links and positions', async ({ page }) => {
    const experienceComponent = page.locator('app-experience');
    await expect(experienceComponent).toBeVisible({ timeout: 10000 });

    const workItems = experienceComponent.locator('.timeline-work-item');
    const count = await workItems.count();
    expect(count).toBeGreaterThan(0);

    const firstItem = workItems.first();
    const companyLink = firstItem.locator('h3 a');
    await expect(companyLink).toBeVisible();
    await expect(companyLink).toHaveAttribute('target', '_blank');
    await expect(companyLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Position title
    const position = firstItem.locator('.text-sky-500').first();
    await expect(position).toBeVisible();
    expect((await position.textContent())?.trim().length).toBeGreaterThan(0);

    // Date badge
    const dateBadge = firstItem.locator('[hlmBadge]').first();
    await expect(dateBadge).toBeVisible();
  });

  test('should render separators between consecutive timeline items', async ({ page }) => {
    const experienceComponent = page.locator('app-experience');
    await expect(experienceComponent).toBeVisible({ timeout: 10000 });

    const workItems = experienceComponent.locator('.timeline-work-item');
    const workCount = await workItems.count();

    if (workCount > 1) {
      const separators = experienceComponent.locator('hlm-separator');
      await expect(separators.first()).toBeVisible();
      expect(await separators.count()).toBe(workCount - 1);
    }
  });

  test('should contain child app-projects component within work items that have projects', async ({ page }) => {
    const experienceComponent = page.locator('app-experience');
    await expect(experienceComponent).toBeVisible({ timeout: 10000 });

    const projectsComponent = experienceComponent.locator('app-projects');
    expect(await projectsComponent.count()).toBeGreaterThan(0);
    await expect(projectsComponent.first()).toBeVisible();
  });
});
