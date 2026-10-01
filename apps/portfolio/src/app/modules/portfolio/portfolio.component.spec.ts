import { test, expect } from '@playwright/test';

test.describe('Portfolio Module - Public Profile & Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
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

    const wasDarkInitially = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Click theme toggle with force
    await themeBtn.click({ force: true });

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
    await themeBtn.click({ force: true });
    if (wasDarkInitially) {
      await expect(page.locator('html')).toHaveClass(/dark/);
    } else {
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    }
  });

  test('should navigate to dashboard/login when clicking Enter Dashboard button', async ({ page }) => {
    const dashboardBtn = page.locator('button[aria-label="Enter Dashboard"]');
    await expect(dashboardBtn).toBeVisible();

    await dashboardBtn.click();
    await page.waitForURL(/\/(user|user\/login)/);

    // Without an active session, user guard redirects to /user/login
    await expect(page).toHaveURL(/.*\/user(\/login)?/);
  });

  test('should reveal deferred sections (Experience, Education, Skills, Certificates, Awards) upon scrolling', async ({ page }) => {
    // 1. Scroll to and trigger Work Experience deferred section
    const expPlaceholder = page.locator('[aria-label="Loading Experience"]');
    if (await expPlaceholder.count() > 0) {
      await expPlaceholder.scrollIntoViewIfNeeded();
    }
    const experienceSection = page.locator('[aria-label="Work Experience"]');
    await expect(experienceSection).toBeVisible({ timeout: 10000 });
    await expect(experienceSection.getByRole('heading', { name: 'Work Experience' })).toBeVisible();

    // 2. Scroll to and trigger Education deferred section
    const eduPlaceholder = page.locator('[aria-label="Loading Education"]');
    if (await eduPlaceholder.count() > 0) {
      await eduPlaceholder.scrollIntoViewIfNeeded();
    }
    const educationSection = page.locator('[aria-label="Education"]');
    await expect(educationSection).toBeVisible({ timeout: 10000 });
    await expect(educationSection.getByRole('heading', { name: 'Education' })).toBeVisible();

    // 3. Scroll to and trigger Technical Skills deferred section
    const skillsPlaceholder = page.locator('[aria-label="Loading Skills"]');
    if (await skillsPlaceholder.count() > 0) {
      await skillsPlaceholder.scrollIntoViewIfNeeded();
    }
    const skillsSection = page.locator('section[aria-label="Technical Skills"]');
    await expect(skillsSection).toBeVisible({ timeout: 10000 });
    await expect(skillsSection.getByRole('heading', { name: 'Technical Skills' })).toBeVisible();

    // Test tab filtering in skills
    const skillCategoryButtons = skillsSection.locator('button[hlmTabsTrigger]');
    if (await skillCategoryButtons.count() > 1) {
      const secondTab = skillCategoryButtons.nth(1);
      await secondTab.click();
      await expect(secondTab).toBeVisible();
    }

    // 4. Scroll to and trigger Certificates deferred section
    const certPlaceholder = page.locator('[aria-label="Loading Certificates"]');
    if (await certPlaceholder.count() > 0) {
      await certPlaceholder.scrollIntoViewIfNeeded();
    }
    const certificatesSection = page.locator('section[aria-label="Certificates"]');
    await expect(certificatesSection).toBeVisible({ timeout: 10000 });
    await expect(certificatesSection.getByRole('heading', { name: 'Certificates' })).toBeVisible();

    // 5. Scroll to and trigger Awards deferred section
    const awardsPlaceholder = page.locator('[aria-label="Loading Awards"]');
    if (await awardsPlaceholder.count() > 0) {
      await awardsPlaceholder.scrollIntoViewIfNeeded();
    }
    const awardsSection = page.locator('section[aria-label="Awards and Recognitions"]');
    await expect(awardsSection).toBeVisible({ timeout: 10000 });
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
