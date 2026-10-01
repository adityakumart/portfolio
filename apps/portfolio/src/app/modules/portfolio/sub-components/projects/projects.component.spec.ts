import { test, expect } from '@playwright/test';

test.describe('ProjectsComponent (<app-projects>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Scroll to Experience section where app-projects resides
    const placeholder = page.locator('[aria-label="Loading Experience"]');
    if (await placeholder.count() > 0) {
      await placeholder.scrollIntoViewIfNeeded();
    }

    const projectsComponent = page.locator('app-projects').first();
    await expect(projectsComponent).toBeVisible({ timeout: 10000 });
  });

  test('should render Key Projects heading and spartan accordion container', async ({ page }) => {
    const projects = page.locator('app-projects').first();
    await expect(projects.getByText('Key Projects')).toBeVisible();

    const accordion = projects.locator('hlm-accordion');
    await expect(accordion).toBeVisible();

    const accordionItems = accordion.locator('hlm-accordion-item');
    expect(await accordionItems.count()).toBeGreaterThan(0);
  });

  test('should display first project opened by default with description and skills list', async ({ page }) => {
    const projects = page.locator('app-projects').first();
    const firstItem = projects.locator('hlm-accordion-item').first();
    await expect(firstItem).toBeVisible();

    // Verify trigger contains project title and date badge
    const trigger = firstItem.locator('hlm-accordion-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger.locator('span.font-bold')).toBeVisible();

    // First item is opened by default
    const content = firstItem.locator('hlm-accordion-content');
    await expect(content).toBeVisible();

    // Description text
    const description = content.locator('p');
    await expect(description).toBeVisible();
    expect((await description.textContent())?.trim().length).toBeGreaterThan(0);

    // Project skills list
    const skillsList = content.locator('[role="list"][aria-label="Project Skills"]');
    await expect(skillsList).toBeVisible();
    const skillBadges = skillsList.locator('[hlmBadge]');
    expect(await skillBadges.count()).toBeGreaterThan(0);
  });

  test('should allow toggling accordion items to expand and collapse projects', async ({ page }) => {
    const projects = page.locator('app-projects').first();
    const accordionItems = projects.locator('hlm-accordion-item');

    if (await accordionItems.count() > 1) {
      const secondItem = accordionItems.nth(1);
      const secondTrigger = secondItem.locator('hlm-accordion-trigger button, hlm-accordion-trigger');

      // Click to toggle second project item
      await secondTrigger.first().click();

      const secondContent = secondItem.locator('hlm-accordion-content');
      await expect(secondContent).toBeVisible();
      await expect(secondContent.locator('p')).toBeVisible();
    }
  });
});
