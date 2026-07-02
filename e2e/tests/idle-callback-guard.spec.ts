import { expect, test, type Page } from '@playwright/test';

import { NO_IDLE_GUARD_APP_URL } from '../support/servers';

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

test.describe('idle-callback guard (issue #5)', () => {
  test('without provideFastMarquee() the upstream crash reproduces (no-idle-guard scenario)', async ({ page }) => {
    await simulateSafariIdleCallbackAsymmetry(page);
    const errors = collectPageErrors(page);

    await page.goto(`${NO_IDLE_GUARD_APP_URL}/`);

    await expect
      .poll(() => errors.find(message => message.includes('cancelIdleCallback')), {
        message: 'expected the cancelIdleCallback ReferenceError from angular/angular#53721 to surface',
        timeout: 15_000,
      })
      .toBeTruthy();
    expect(await page.evaluate(() => typeof window.cancelIdleCallback)).toBe('undefined');
    await expect(page.locator(DEFERRED_IDLE_MARQUEE)).toHaveCount(0);
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
