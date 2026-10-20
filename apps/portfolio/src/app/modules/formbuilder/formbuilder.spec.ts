import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../test-utils/playwright-helpers';

test.describe('FormBuilder Module', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      modules: { formBuilder: true },
    });
  });

  test('should navigate to /user/formbuilder and render form builder canvas', async ({
    page,
  }) => {
    await page.goto('/user/formbuilder');
    await page.waitForURL(/.*\/user\/formbuilder\/create/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*\/user\/formbuilder\/create/);

    // Verify form container and insert button
    const formDiv = page.locator('#formDiv');
    await expect(formDiv).toBeVisible({ timeout: 10000 });

    const insertBtn = page.locator('button.addBtn');
    await expect(insertBtn).toBeVisible();
    await expect(insertBtn).toContainText('Insert new');
  });

  test('should open field types menu when clicking Insert new', async ({ page }) => {
    await page.goto('/user/formbuilder/create');
    await page.waitForLoadState('domcontentloaded');

    const insertBtn = page.locator('button.addBtn');
    await expect(insertBtn).toBeVisible({ timeout: 10000 });
    await insertBtn.click();

    // Verify dropdown menu opens with field choices
    const dropdownMenu = page.locator('[hlmDropdownMenu], [role="menu"]');
    await expect(dropdownMenu).toBeVisible({ timeout: 5000 });
  });

  test('should display existing questions on canvas', async ({ page }) => {
    await page.goto('/user/formbuilder/create');
    await page.waitForLoadState('domcontentloaded');

    // Verify fields list exists
    const fieldsList = page.locator('.parent');
    await expect(fieldsList).toBeVisible({ timeout: 10000 });

    // Verify parentCard items exist
    const cards = page.locator('.parentCard');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
});
