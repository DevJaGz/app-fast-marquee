/**
 * URLs of the app servers Playwright starts for the suite (see `playwright.config.ts`
 * `webServer`). Port 4200 is the `ng serve` default; port 4202 is set by the `playground` serve
 * configuration in `angular.json`.
 *
 * 12.x branch note: this line has no `no-idle-guard` scenario/server. `NgxFastMarqueeModule`
 * always bundles `provideFastMarquee()` in its own `providers`, and under Ivy a component's
 * declaring `NgModule` is fixed at compile time — there is no way to render `<ngx-fast-marquee>`
 * without the guard, so a "guard absent" build isn't constructible on this line. The upstream bug
 * this scenario reproduces (`angular/angular#53721`) is specific to Angular's own `@defer (on
 * idle)` `IdleScheduler`, which doesn't exist in Angular 12 either — see
 * `e2e/tests/idle-callback-guard.spec.ts` and `knowledge/decisions/idle-callback-guard.md`.
 */

/** The untouched application, exactly as `pnpm start` serves it. */
export const APP_URL = 'http://localhost:4200';

/** The `playground` scenario: one `<ngx-fast-marquee>` driven entirely by URL query params. */
export const PLAYGROUND_APP_URL = 'http://localhost:4202';
