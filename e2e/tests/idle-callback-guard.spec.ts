import { expect, test, Page } from '@playwright/test';

const DEFERRED_IDLE_MARQUEE = 'ngx-fast-marquee.deferred-idle-marquee';

/**
 * 12.x branch note: this line has no `no-idle-guard` scenario/server (see
 * `e2e/support/servers.ts`) — `NgxFastMarqueeModule` always bundles `provideFastMarquee()`, and
 * under Ivy a component's declaring `NgModule` is fixed at compile time, so a "guard absent" build
 * isn't constructible. The upstream bug this sub-test reproduces (`angular/angular#53721`) is
 * specific to Angular's own `@defer (on idle)` `IdleScheduler`, absent from Angular 12. The guarded
 * sub-test below (default app, guard active) still applies and runs unmodified.
 */
const NO_IDLE_GUARD_SCENARIO_UNAVAILABLE = true;

/**
 * Simulates the Safari/iOS builds behind issue #5: `requestIdleCallback` exists
 * while `cancelIdleCallback` does not, the asymmetry that makes Angular's idle
 * scheduler throw a `ReferenceError` upstream (angular/angular#53721).
 */
function simulateSafariIdleCallbackAsymmetry(page: Page): Promise<void> {
  return page.addInitScript(() => {
    const idleWindow = window as { requestIdleCallback?: unknown; cancelIdleCallback?: unknown };
    if (typeof idleWindow.requestIdleCallback !== 'function') {
      idleWindow.requestIdleCallback = (callback: () => void) => setTimeout(callback);
    }
    delete (Window.prototype as { cancelIdleCallback?: unknown }).cancelIdleCallback;
    delete idleWindow.cancelIdleCallback;
  });
}

/**
 * Collects uncaught page errors and `console.error` output. Angular's default
 * `ErrorHandler` logs via `console.error`, so both channels must be watched;
 * wording differs per engine (Chromium: "cancelIdleCallback is not defined",
 * WebKit: "Can't find variable: cancelIdleCallback").
 */
function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

test.describe('idle-callback guard (issue #5)', () => {
  test.describe('no-idle-guard scenario', () => {
    test.skip(
      NO_IDLE_GUARD_SCENARIO_UNAVAILABLE,
      'no-idle-guard scenario is not constructible on the 12.x line — see the comment above'
    );

    test('without provideFastMarquee() the upstream crash reproduces (no-idle-guard scenario)', async () => {
      throw new Error('unreachable on 12.x — see NO_IDLE_GUARD_SCENARIO_UNAVAILABLE');
    });
  });

  test('with provideFastMarquee() the @defer (on idle) marquee loads without errors', async ({ page }) => {
    await simulateSafariIdleCallbackAsymmetry(page);
    const errors = collectPageErrors(page);

    await page.goto('/');

    await expect(page.locator(DEFERRED_IDLE_MARQUEE)).toBeVisible({ timeout: 20_000 });
    expect(await page.evaluate(() => typeof window.cancelIdleCallback)).toBe('function');
    expect(errors.filter(message => message.includes('cancelIdleCallback'))).toEqual([]);
  });
});
