import { test, expect } from '@playwright/test';

test.describe('CertificatesComponent (<app-certificates>)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('load');

    // Scroll down to trigger deferred Certificates section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const target = page.locator('app-certificates, [aria-label="Loading Certificates"]').first();
    await target.scrollIntoViewIfNeeded().catch(() => {});
  });

  test('should render Certificates container section and heading', async ({ page }) => {
    const certificatesComponent = page.locator('app-certificates');
    await expect(certificatesComponent).toBeVisible({ timeout: 10000 });

    const section = certificatesComponent.locator('section[aria-label="Certificates"]');
    await expect(section).toBeVisible();
    await expect(section.getByRole('heading', { name: 'Certificates' })).toBeVisible();
    await expect(section.getByText('Professional certifications and completed courses.')).toBeVisible();
  });

  test('should render certificate cards with links, issuers, and dates', async ({ page }) => {
    const certificatesComponent = page.locator('app-certificates');
    await expect(certificatesComponent).toBeVisible({ timeout: 10000 });

    const certCards = certificatesComponent.locator('.certificate-card-with-accent');
    const count = await certCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = certCards.first();
    const certLink = firstCard.locator('h3 a');
    await expect(certLink).toBeVisible();
    await expect(certLink).toHaveAttribute('target', '_blank');
    await expect(certLink).toHaveAttribute('rel', 'noopener noreferrer');
    const href = await certLink.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);

    // Issuer and Date
    const issuer = firstCard.locator('.text-sky-500');
    await expect(issuer).toBeVisible();
    expect((await issuer.textContent())?.trim().length).toBeGreaterThan(0);

    const date = firstCard.locator('.text-muted-foreground');
    await expect(date).toBeVisible();
    expect((await date.textContent())?.trim().length).toBeGreaterThan(0);
  });
});
