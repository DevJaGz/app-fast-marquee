/**
 * URLs of the app servers Playwright starts for the suite (see `playwright.config.ts`
 * `webServer`). Port 4200 is the `ng serve` default; ports 4201/4202 are set by the
 * `no-idle-guard`/`playground` serve configurations in `angular.json`.
 */

/** The untouched application, exactly as `pnpm start` serves it. */
export const APP_URL = 'http://localhost:4200';

/** The `no-idle-guard` scenario: the app without `provideFastMarquee()` (issue #5 repro). */
export const NO_IDLE_GUARD_APP_URL = 'http://localhost:4201';

/** The `playground` scenario: one `<ngx-fast-marquee>` driven entirely by URL query params. */
export const PLAYGROUND_APP_URL = 'http://localhost:4202';
