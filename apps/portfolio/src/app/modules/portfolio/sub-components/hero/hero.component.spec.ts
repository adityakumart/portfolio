import { test, expect } from '@playwright/test';

test.describe('HeroComponent (<app-hero>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render the hero component container and section', async ({ page }) => {
    const heroComponent = page.locator('app-hero');
    await expect(heroComponent).toBeVisible();

    const heroSection = heroComponent.locator('section.hero-panel[aria-label="Hero Introduction"]');
    await expect(heroSection).toBeVisible();
  });

  test('should display portfolio header label and author name heading', async ({ page }) => {
    const hero = page.locator('app-hero');
    await expect(hero.getByText('Frontend Developer Portfolio')).toBeVisible();

    const nameHeading = hero.locator('h1');
    await expect(nameHeading).toBeVisible();
    await expect(nameHeading).toContainText("Hi, I'm");
    await expect(nameHeading.locator('span')).not.toBeEmpty();
  });

  test('should render hero introduction description and badges', async ({ page }) => {
    const hero = page.locator('app-hero');
    await expect(
      hero.getByText('Building polished, performant interfaces', { exact: false })
    ).toBeVisible();

    // Verify key role badges
    await expect(hero.getByText('Product Group Lead Frontend')).toBeVisible();
    await expect(hero.getByText('Design systems')).toBeVisible();
    await expect(hero.getByText('AI-accelerated delivery')).toBeVisible();
  });

  test('should render social profile links with external target and valid URLs', async ({ page }) => {
    const hero = page.locator('app-hero');
    const socialLinks = hero.locator('a[aria-label$="Profile"]');
    const linkCount = await socialLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const link = socialLinks.nth(i);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('should render featured skillset glow card and capability badges', async ({ page }) => {
    const hero = page.locator('app-hero');
    const glowCard = hero.locator('.hero-glow-card');
    await expect(glowCard).toBeVisible();
    await expect(glowCard.getByText('Featured skillset')).toBeVisible();
    await expect(glowCard.locator('h2')).toBeVisible();

    // Secondary skillset badges
    await expect(hero.getByText('Performance', { exact: true })).toBeVisible();
    await expect(hero.getByText('Accessibility', { exact: true })).toBeVisible();
    await expect(hero.getByText('Component architecture', { exact: true })).toBeVisible();
  });
});
