import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/portfolio/src/app',
  testMatch: [
    '**/app.spec.ts',
    '**/portfolio.component.spec.ts',
    '**/modules/portfolio/**/*.spec.ts',
    '**/user.spec.ts',
    '**/modules/user/**/*.component.spec.ts',
    '**/modules/user/**/*.spec.ts',
    '**/modules/dev-tools/**/*.spec.ts',
    '**/modules/formbuilder/**/*.spec.ts',
    '**/modules/movie-importer/**/*.spec.ts',
    '**/planner.spec.ts',
    '**/rr.spec.ts',
    '**/modules/rr/**/*.spec.ts',
    '**/diet-hydration.spec.ts',
  ],
  testIgnore: [
    '**/services/auth.spec.ts',
    '**/*.util*.spec.ts',
    '**/*.service.spec.ts',
    '**/app.component.spec.ts',
    '**/modules/dev-tools/dev-tools.component.spec.ts',
    '**/modules/dev-tools/components/**',
    '**/modules/formbuilder/create/create.component.spec.ts',
    '**/modules/user/components/game/services/**',
    '**/shared/**',
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
