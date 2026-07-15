import { defineConfig, devices } from '@playwright/test';

import { APP_URL, PLAYGROUND_APP_URL } from './e2e/support/servers';

/**
 * Set by the `playwright` service in `docker-compose.e2e.yml`: the `app` service (Node 14) already
 * builds and serves both app compositions before this container starts (see its `command`), so
 * Playwright must not also try to spawn `ng serve` — that builder doesn't run under this
 * container's modern Node against this branch's Node-14-only `@angular/cli`.
 */
const EXTERNAL_SERVERS = !!process.env['E2E_EXTERNAL_SERVERS'];

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
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // chromiumSandbox: false — the playwright service runs as root inside its container;
        // Chromium's sandbox refuses to initialize as root (WebKit has no such restriction).
        chromiumSandbox: false,
        launchOptions: {
          // Chromium's HTTPS-First/"Always Use Secure Connections" mode forcibly upgrades
          // http:// navigations to https://, which fails with net::ERR_SSL_PROTOCOL_ERROR
          // against this suite's plain-HTTP app/playground servers. WebKit has no such upgrade.
          args: ['--disable-features=HttpsUpgrades,HttpsFirstModeV2ForEngagedSites,HttpsFirstModeV2ForTypicallySecureUsers'],
        },
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: EXTERNAL_SERVERS
    ? undefined
    : [
        {
          command: 'npx ng serve --configuration production',
          url: APP_URL,
          reuseExistingServer: !process.env['CI'],
          timeout: 180_000,
        },
        {
          command: 'npx ng serve --configuration playground',
          url: PLAYGROUND_APP_URL,
          reuseExistingServer: !process.env['CI'],
          timeout: 180_000,
        },
      ],
});
