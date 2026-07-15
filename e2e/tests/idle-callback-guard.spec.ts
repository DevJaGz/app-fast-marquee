import { expect, test, Page } from '@playwright/test';

const DEFERRED_IDLE_MARQUEE = 'ngx-fast-marquee.deferred-idle-marquee';

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

/**
 * No `no-idle-guard` sub-test on this branch: `NgxFastMarqueeModule` always bundles
 * `provideFastMarquee()`, and under Ivy a component's declaring `NgModule` is fixed at compile
 * time, so a "guard absent" build isn't constructible here. See
 * `knowledge/decisions/idle-callback-guard.md`.
 */
test.describe('idle-callback guard (issue #5)', () => {
  test('with provideFastMarquee() the @defer (on idle) marquee loads without errors', async ({ page }) => {
    await simulateSafariIdleCallbackAsymmetry(page);
    const errors = collectPageErrors(page);

    await page.goto('/');

    await expect(page.locator(DEFERRED_IDLE_MARQUEE)).toBeVisible({ timeout: 20_000 });
    expect(await page.evaluate(() => typeof window.cancelIdleCallback)).toBe('function');
    expect(errors.filter(message => message.includes('cancelIdleCallback'))).toEqual([]);
  });
});
