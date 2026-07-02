/**
 * URLs of the app servers Playwright starts for the suite (see `playwright.config.ts`
 * `webServer`). Port 4200 is the `ng serve` default; port 4201 is set by the
 * `no-idle-guard` serve configuration in `angular.json`.
 */

/** The untouched application, exactly as `pnpm start` serves it. */
export const APP_URL = 'http://localhost:4200';

/** The `no-idle-guard` scenario: the app without `provideFastMarquee()` (issue #5 repro). */
export const NO_IDLE_GUARD_APP_URL = 'http://localhost:4201';
