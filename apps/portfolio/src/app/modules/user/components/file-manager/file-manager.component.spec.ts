import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

test.describe('User Module Subroute - File Manager (/user/files)', () => {
  test.beforeEach(async ({ page }) => {
    await injectUserSession(page, {
      modules: { fileManager: true },
    });
    await page.goto('/portfolio/user/files');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render File Vault header, USER VAULT badge, and isolated scope', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'File Vault' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('USER VAULT')).toBeVisible();
    await expect(page.getByText('Isolated Scope:')).toBeVisible();
  });

  test('should render action buttons for refresh, new folder, and upload file', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /New Folder/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload File/i })).toBeVisible();
  });

  test('should toggle inline folder creation input when clicking New Folder', async ({ page }) => {
    const newFolderBtn = page.getByRole('button', { name: /New Folder/i });
    await expect(newFolderBtn).toBeVisible({ timeout: 10000 });

    // Click to open input
    await newFolderBtn.click();
    const folderInput = page.locator('input[placeholder*="Folder name"]');
    await expect(folderInput).toBeVisible();

    // Click again to toggle off
    await newFolderBtn.click();
    await expect(folderInput).toBeHidden();
  });
});
