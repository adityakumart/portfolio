import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/portfolio/src/app',
  testMatch: [
    '**/portfolio.component.spec.ts',
    '**/modules/portfolio/**/*.spec.ts',
    '**/user.spec.ts',
    '**/modules/user/**/*.component.spec.ts',
    '**/planner.spec.ts',
    '**/rr.spec.ts',
    '**/modules/rr/**/*.spec.ts',
    '**/diet-hydration.spec.ts',
  ],
  testIgnore: [
    '**/services/auth.spec.ts',
    '**/*.util.spec.ts',
  ],
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] || 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cmd.exe /c npx nx serve portfolio',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180 * 1000,
  },
});
