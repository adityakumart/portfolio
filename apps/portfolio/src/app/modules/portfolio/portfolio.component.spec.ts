import { test, expect } from '@playwright/test';

test.describe('Portfolio Module - Public Profile & Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');
    await page.locator('app-hero').waitFor({ state: 'visible' });
  });

  test('should render page title and SEO meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/Aditya Kumar T|Portfolio/i);

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
  });

  test('should display hero section with personal info, badges, and social links', async ({ page }) => {
    const heroSection = page.locator('section[aria-label="Hero Introduction"]');
    await expect(heroSection).toBeVisible();

    // Verify main headline and author name
    await expect(heroSection.locator('h1')).toContainText("Hi, I'm");
    await expect(heroSection.locator('h1')).toContainText('Aditya Kumar T');

    // Verify badges in hero
    await expect(heroSection.getByText('Product Group Lead Frontend')).toBeVisible();
    await expect(heroSection.getByText('Design systems')).toBeVisible();
    await expect(heroSection.getByText('AI-accelerated delivery')).toBeVisible();

    // Verify social profile links
    const socialLinks = heroSection.locator('a[aria-label$="Profile"]');
    expect(await socialLinks.count()).toBeGreaterThan(0);

    const firstSocial = socialLinks.first();
    await expect(firstSocial).toHaveAttribute('href', /^https?:\/\//);
    await expect(firstSocial).toHaveAttribute('target', '_blank');

    // Verify featured skillset card
    await expect(heroSection.getByText('Featured skillset')).toBeVisible();
    await expect(heroSection.getByText('Performance', { exact: true })).toBeVisible();
    await expect(heroSection.getByText('Accessibility', { exact: true })).toBeVisible();
    await expect(heroSection.getByText('Component architecture', { exact: true })).toBeVisible();
  });

  test('should display About Me and Quick Facts summary sections', async ({ page }) => {
    const summarySection = page.locator('section[aria-label="About Me and Quick Facts"]');
    await expect(summarySection).toBeVisible();

    // About Me card
    await expect(summarySection.getByRole('heading', { name: 'About Me' })).toBeVisible();
    const paragraphs = summarySection.locator('p');
    expect(await paragraphs.count()).toBeGreaterThan(0);

    // Quick Facts card
    await expect(summarySection.getByRole('heading', { name: 'Quick Facts' })).toBeVisible();
    await expect(summarySection.getByText('Experience', { exact: true })).toBeVisible();
    await expect(summarySection.getByText('Location', { exact: true })).toBeVisible();
    await expect(summarySection.getByText('Specialty', { exact: true })).toBeVisible();
  });

  test('should toggle dark/light theme when clicking theme toggle button', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label="Toggle color theme"]');
    await expect(themeBtn).toBeVisible();
    await page.waitForTimeout(400);

    const wasDarkInitially = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Click theme toggle
    await themeBtn.click();

    // Verify dark class and localStorage
    if (wasDarkInitially) {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
      const stored = await page.evaluate(() => localStorage.getItem('darkMode'));
      expect(stored).toBe('false');
    } else {
      await expect(page.locator('html')).toHaveClass(/dark/);
      const stored = await page.evaluate(() => localStorage.getItem('darkMode'));
      expect(stored).toBe('true');
    }

    // Toggle back
    await themeBtn.click();
    if (wasDarkInitially) {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should navigate to dashboard/login when clicking Enter Dashboard button', async ({ page }) => {
    const dashboardBtn = page.locator('button[aria-label="Enter Dashboard"]');
    await expect(dashboardBtn).toBeVisible();
    await page.waitForTimeout(400);

    await dashboardBtn.click();
    await page.waitForURL(/\/(user|user\/login)/, { timeout: 15000 });

    // Without an active session, user guard redirects to /user/login
    await expect(page).toHaveURL(/.*\/user(\/login)?/);
  });

  test('should reveal deferred sections (Experience, Education, Skills, Certificates, Awards) upon scrolling', async ({ page }) => {
    // Scroll page downwards to trigger deferred sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // 1. Trigger Work Experience deferred section
    const expTarget = page.locator('app-experience, [aria-label="Loading Experience"]').first();
    await expTarget.scrollIntoViewIfNeeded().catch(() => {});
    const experienceSection = page.locator('[aria-label="Work Experience"]');
    await expect(experienceSection).toBeVisible({ timeout: 15000 });
    await expect(experienceSection.getByRole('heading', { name: 'Work Experience' })).toBeVisible();

    // 2. Trigger Education deferred section
    const eduTarget = page.locator('app-education, [aria-label="Loading Education"]').first();
    await eduTarget.scrollIntoViewIfNeeded().catch(() => {});
    const educationSection = page.locator('[aria-label="Education"]');
    await expect(educationSection).toBeVisible({ timeout: 15000 });
    await expect(educationSection.getByRole('heading', { name: 'Education' })).toBeVisible();

    // 3. Trigger Technical Skills deferred section
    const skillsTarget = page.locator('app-skills, [aria-label="Loading Skills"]').first();
    await skillsTarget.scrollIntoViewIfNeeded().catch(() => {});
    const skillsSection = page.locator('section[aria-label="Technical Skills"]');
    await expect(skillsSection).toBeVisible({ timeout: 15000 });
    await expect(skillsSection.getByRole('heading', { name: 'Technical Skills' })).toBeVisible();

    // Test tab filtering in skills
    const skillCategoryButtons = skillsSection.getByRole('tab');
    if (await skillCategoryButtons.count() > 1) {
      const secondTab = skillCategoryButtons.nth(1);
      await secondTab.click();
      await expect(secondTab).toBeVisible();
    }

    // 4. Trigger Certificates deferred section
    const certTarget = page.locator('app-certificates, [aria-label="Loading Certificates"]').first();
    await certTarget.scrollIntoViewIfNeeded().catch(() => {});
    const certificatesSection = page.locator('section[aria-label="Certificates"]');
    await expect(certificatesSection).toBeVisible({ timeout: 15000 });
    await expect(certificatesSection.getByRole('heading', { name: 'Certificates' })).toBeVisible();

    // 5. Trigger Awards deferred section
    const awardsTarget = page.locator('app-awards, [aria-label="Loading Awards"]').first();
    await awardsTarget.scrollIntoViewIfNeeded().catch(() => {});
    const awardsSection = page.locator('section[aria-label="Awards and Recognitions"]');
    await expect(awardsSection).toBeVisible({ timeout: 15000 });
    await expect(awardsSection.getByRole('heading', { name: 'Awards & Recognitions' })).toBeVisible();
  });

  test('should maintain responsive layout on mobile viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const heroSection = page.locator('section[aria-label="Hero Introduction"]');
    await expect(heroSection).toBeVisible();

    // Verify floating theme and dashboard controls remain visible and accessible on mobile
    const themeBtn = page.locator('button[aria-label="Toggle color theme"]');
    const dashboardBtn = page.locator('button[aria-label="Enter Dashboard"]');
    await expect(themeBtn).toBeVisible();
    await expect(dashboardBtn).toBeVisible();

    // Verify no unexpected horizontal page overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
