import { test, expect } from '@playwright/test';
import { injectUserSession, clearUserSession } from '../../user-test.helper';

test.describe('User Module - Planner (Notes, To-Dos & Multi-Platform Reminders)', () => {
  test.describe('Unauthenticated & Access Guard', () => {
    test.beforeEach(async ({ page }) => {
      await clearUserSession(page);
    });

    test('should redirect unauthenticated access from /user/planner to login', async ({ page }) => {
      await page.goto('/portfolio/user/planner');
      await page.waitForURL(/.*\/user\/login/);
      await expect(page).toHaveURL(/.*\/user\/login/);
    });

    test('should redirect when user lacks planner module entitlement', async ({ page }) => {
      await injectUserSession(page, {
        modules: {
          planner: false,
        },
      });
      await page.goto('/portfolio/user/planner');
      // Should redirect to user dashboard or unauthorized
      await page.waitForURL(/.*\/user(\/profile|\/login)?/);
    });
  });

  test.describe('Authenticated Planner Operations', () => {
    test.beforeEach(async ({ page }) => {
      await injectUserSession(page, {
        modules: {
          planner: true,
        },
      });

      // Mock the dashboard API response
      await page.route('**/api/user/planner/dashboard', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notes: [
              {
                id: 'mock-note-1',
                userId: 'mock-user-id',
                title: 'Architecture Strategy',
                content: 'Refactor platform adapter for offline sync.',
                tags: ['architecture', 'v2'],
                isPinned: true,
                color: '#10b981',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            todos: [
              {
                id: 'mock-todo-1',
                userId: 'mock-user-id',
                title: 'Deploy Phase 2 build',
                description: 'Complete packaging of extension and mobile.',
                status: 'pending',
                priority: 'urgent',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '18:00',
                tags: ['release'],
                subtasks: [
                  { id: 'st-1', title: 'Verify Nx builds', completed: true },
                  { id: 'st-2', title: 'Run Playwright tests', completed: false },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            metrics: {
              totalNotes: 1,
              pinnedNotes: 1,
              totalTodos: 1,
              pendingTodos: 1,
              completedTodos: 0,
              todaysTodos: 1,
              overdueTodos: 0,
            },
          }),
        });
      });

      await page.goto('/portfolio/user/planner');
      await page.waitForLoadState('domcontentloaded');
    });

    test('should render planner header, search bar, and both split panels', async ({ page }) => {
      await expect(page.locator('.page-title')).toHaveText('Notes & Planner');
      await expect(page.locator('#planner-search-input')).toBeVisible();

      // Saved Notes panel
      const notesPanel = page.locator('.notes-panel');
      await expect(notesPanel).toBeVisible();
      await expect(notesPanel.getByText('Architecture Strategy')).toBeVisible();

      // To-Do List panel
      const todosPanel = page.locator('.todos-panel');
      await expect(todosPanel).toBeVisible();
      await expect(todosPanel.getByText('Deploy Phase 2 build')).toBeVisible();
      await expect(todosPanel.getByText('urgent')).toBeVisible();
    });

    test('should open Note modal and create note', async ({ page }) => {
      // Mock create note API
      await page.route('**/api/user/planner/notes', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'new-note-99',
              userId: 'mock-user-id',
              title: 'Playwright Created Note',
              content: 'Verification notes for testing automated test runner.',
              tags: ['e2e'],
              isPinned: false,
              color: '#3b82f6',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }),
          });
        }
      });

      // Click + Note button
      await page.locator('button:has-text("+ Note")').click();

      // Modal should appear
      const sheet = page.locator('app-planner-note-editor-sheet');
      await expect(sheet).toBeVisible();
      await expect(sheet.locator('.sheet-title')).toHaveText('New Note');

      // Fill in note form
      await page.locator('#note-title-input').fill('Playwright Created Note');
      await page.locator('#note-content-input').fill('Verification notes for testing automated test runner.');

      // Click Save Note
      await page.locator('button.btn-save:has-text("Create Note")').click();

      // Modal should close and new note appear
      await expect(sheet).not.toBeVisible();
      await expect(page.getByText('Playwright Created Note')).toBeVisible();
    });

    test('should toggle task completion status', async ({ page }) => {
      // Mock toggle API
      await page.route('**/api/user/planner/todos/mock-todo-1/toggle', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-todo-1',
            userId: 'mock-user-id',
            title: 'Deploy Phase 2 build',
            status: 'completed',
            completedAt: new Date().toISOString(),
          }),
        });
      });

      const todoCard = page.locator('app-planner-todo-item').first();
      await expect(todoCard).toBeVisible();

      // Click checkbox
      await todoCard.locator('.todo-checkbox').click();

      // Card should receive completed class
      await expect(todoCard.locator('.todo-item-card')).toHaveClass(/completed/);
    });

    test('should allow expanding subtasks accordion and viewing progress', async ({ page }) => {
      const todoCard = page.locator('app-planner-todo-item').first();
      const progressWrap = todoCard.locator('.subtask-progress-bar-wrap');
      await expect(progressWrap).toBeVisible();
      await expect(progressWrap).toContainText('1/2 subtasks');

      // Click to expand subtasks
      await progressWrap.click();
      const subtasksContainer = todoCard.locator('.subtasks-container');
      await expect(subtasksContainer).toBeVisible();
      await expect(subtasksContainer.getByText('Verify Nx builds')).toBeVisible();
      await expect(subtasksContainer.getByText('Run Playwright tests')).toBeVisible();
    });

    test('should switch views via mobile segmented tabs in small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const segTabs = page.locator('.segmented-tabs');
      await expect(segTabs).toBeVisible();

      // Click Notes tab
      await segTabs.getByRole('button', { name: /Notes/ }).click();
      await expect(page.locator('.notes-panel')).toBeVisible();
      await expect(page.locator('.todos-panel')).not.toBeVisible();

      // Click Tasks tab
      await segTabs.getByRole('button', { name: /Tasks/ }).click();
      await expect(page.locator('.todos-panel')).toBeVisible();
      await expect(page.locator('.notes-panel')).not.toBeVisible();

      // Floating action button should be visible on mobile
      const fab = page.locator('.main-fab');
      await expect(fab).toBeVisible();
    });
  });
});
