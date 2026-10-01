import { test, expect } from '@playwright/test';

test.describe('SkillsComponent (<app-skills>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Scroll down to trigger deferred Skills section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const target = page.locator('app-skills, [aria-label="Loading Skills"]').first();
    await target.scrollIntoViewIfNeeded().catch(() => {});
  });

  test('should render Technical Skills container and section description', async ({ page }) => {
    const skillsComponent = page.locator('app-skills');
    await expect(skillsComponent).toBeVisible({ timeout: 10000 });

    const section = skillsComponent.locator('section[aria-label="Technical Skills"]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: 'Technical Skills' })).toBeVisible();
    await expect(
      section.getByText('A curated skillset aligned with modern frontend product delivery', { exact: false })
    ).toBeVisible();
  });

  test('should render Spartan UI tabs for skill categories', async ({ page }) => {
    const skillsComponent = page.locator('app-skills');
    await expect(skillsComponent).toBeVisible({ timeout: 10000 });

    const triggers = skillsComponent.getByRole('tab');
    await expect(triggers).toHaveCount(4);

    await expect(triggers.nth(0)).toContainText('All Capabilities');
    await expect(triggers.nth(1)).toContainText('Frontend & UI');
    await expect(triggers.nth(2)).toContainText('Backend & Data');
    await expect(triggers.nth(3)).toContainText('Dev & AI Tools');
  });

  test('should filter visible skill cards when selecting different category tabs', async ({ page }) => {
    const skillsComponent = page.locator('app-skills');
    await expect(skillsComponent).toBeVisible({ timeout: 10000 });

    const triggers = skillsComponent.getByRole('tab');
    const allCards = skillsComponent.locator('.skill-card-with-accent');
    const initialCount = await allCards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Switch to "Frontend & UI"
    await triggers.nth(1).click();
    const frontendCards = skillsComponent.locator('.skill-card-with-accent');
    const frontendCount = await frontendCards.count();
    expect(frontendCount).toBeGreaterThan(0);
    expect(frontendCount).toBeLessThanOrEqual(initialCount);

    // Switch to "Backend & Data"
    await triggers.nth(2).click();
    const backendCards = skillsComponent.locator('.skill-card-with-accent');
    const backendCount = await backendCards.count();
    expect(backendCount).toBeGreaterThan(0);

    // Switch back to "All Capabilities"
    await triggers.nth(0).click();
    expect(await skillsComponent.locator('.skill-card-with-accent').count()).toBe(initialCount);
  });

  test('should render skill keywords with interactive tooltip and badge buttons', async ({ page }) => {
    const skillsComponent = page.locator('app-skills');
    await expect(skillsComponent).toBeVisible({ timeout: 10000 });

    const firstCard = skillsComponent.locator('.skill-card-with-accent').first();
    const keywordButtons = firstCard.locator('button[hlmBadge]');
    const count = await keywordButtons.count();
    expect(count).toBeGreaterThan(0);

    const firstKeyword = keywordButtons.first();
    await expect(firstKeyword).toBeVisible();
    await expect(firstKeyword).toHaveAttribute('aria-label', /skill$/i);
  });
});
