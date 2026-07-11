import { defineConfig, devices } from '@playwright/test';

import { APP_URL, NO_IDLE_GUARD_APP_URL, PLAYGROUND_APP_URL } from './e2e/support/servers';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 60_000,
  forbidOnly: !!process.env['CI'],
  // Motion assertions sample real animation timing; capping concurrency avoids compositor/paint
  // contention across simultaneously-running browser processes skewing those samples.
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      // Production configuration so the suite exercises the optimized, SSR/hydration-enabled
      // build that ships — dev builds mask optimizer and hydration regressions. The scenario
      // server below intentionally stays unoptimized and source-mapped for debuggable repros.
      command: 'pnpm exec ng serve --configuration production',
      url: APP_URL,
      reuseExistingServer: !process.env['CI'],
      // Optimized SSR builds boot slower than the dev configuration.
      timeout: 300_000,
    },
    {
      command: 'pnpm exec ng serve --configuration no-idle-guard',
      url: NO_IDLE_GUARD_APP_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: 'pnpm exec ng serve --configuration playground',
      url: PLAYGROUND_APP_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
