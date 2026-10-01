import { test, expect } from '@playwright/test';
import { injectUserSession } from '../../user-test.helper';

const MOCK_DAY_DASHBOARD = {
  date: '2026-10-01',
  meals: {
    breakfast: [
      {
        id: 'meal-1',
        userId: 'mock-user-id',
        date: '2026-10-01',
        mealType: 'breakfast',
        foodName: 'Oatmeal & Almonds',
        estimatedCalories: 350,
        mealTime: '08:30',
      },
    ],
    lunch: [
      {
        id: 'meal-2',
        userId: 'mock-user-id',
        date: '2026-10-01',
        mealType: 'lunch',
        foodName: 'Brown Rice & Grilled Chicken',
        estimatedCalories: 600,
        mealTime: '13:00',
      },
    ],
    snacks: [],
    dinner: [],
  },
  totalCalories: 950,
  hydration: {
    totalMl: 1750,
    targetMl: 2500,
    progressPercentage: 70,
    entries: [
      {
        id: 'hyd-1',
        userId: 'mock-user-id',
        date: '2026-10-01',
        amountMl: 250,
        time: '09:00',
        source: 'water',
      },
      {
        id: 'hyd-2',
        userId: 'mock-user-id',
        date: '2026-10-01',
        amountMl: 500,
        time: '11:30',
        source: 'water',
      },
    ],
  },
  junkFood: {
    recorded: false,
    consumed: false,
  },
};

const MOCK_CONFIG = {
  userId: 'mock-user-id',
  hydration: {
    dailyTargetMl: 2500,
    unit: 'ml',
    cupPresetMl: 250,
    remindersEnabled: true,
    reminderIntervalMinutes: 60,
    reminderStartTime: '09:00',
    reminderEndTime: '21:00',
  },
  junkFoodPrompt: {
    enabled: true,
    promptTime: '21:30',
  },
};

test.describe('User Module - Diet & Hydration Tracking (/user/diet-hydration)', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept backend API calls for diet & hydration
    await page.route('**/api/user/diet-hydration/day*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DAY_DASHBOARD),
      });
    });

    await page.route('**/api/user/diet-hydration/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CONFIG),
      });
    });

    await page.route('**/api/user/diet-hydration/stats*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          period: 'week',
          averageCalories: 1850,
          averageHydrationMl: 2200,
          history: [],
        }),
      });
    });

    // Inject session with dietHydration permission
    await injectUserSession(page, {
      modules: {
        dietHydration: true,
      },
    });

    await page.goto('/portfolio/user/diet-hydration');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should render page title, subtitle, and navigation tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Diet & Hydration Tracking' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Monitor your daily meals, stay hydrated')).toBeVisible();

    // Verify navigation tabs
    await expect(page.getByRole('button', { name: /Daily Overview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Habit Trends & Charts/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Settings & Goals/i })).toBeVisible();
  });

  test('should display daily overview with meal logging sections and hydration summary', async ({ page }) => {
    // Check meals rendered from mock data
    await expect(page.getByText('Oatmeal & Almonds')).toBeVisible();
    await expect(page.getByText('Brown Rice & Grilled Chicken')).toBeVisible();

    // Check Hydration summary
    await expect(page.getByText('1750', { exact: false })).toBeVisible();
  });

  test('should switch between tabs and display Settings & Goals form', async ({ page }) => {
    const settingsTab = page.getByRole('button', { name: /Settings & Goals/i });
    await settingsTab.click();

    // Verify settings tab content
    await expect(page.getByText('Hydration Target')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /Save Configuration|Save Settings/i })).toBeVisible();
  });
});
