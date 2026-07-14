/**
 * Ensures `window.requestIdleCallback`/`window.cancelIdleCallback` are always both present
 * and mutually consistent (both native, or both `setTimeout`/`clearTimeout`-backed fallbacks).
 *
 * Some Safari/iOS builds expose `requestIdleCallback` without `cancelIdleCallback`. Angular's
 * `@defer (on idle)` idle scheduler only checks `requestIdleCallback` before referencing the bare
 * `cancelIdleCallback` identifier, so that asymmetry throws a `ReferenceError` upstream
 * (see `angular/angular#53721`). This guard patches only the missing side, never touching a side
 * that already exists, and is a no-op outside a browser context (SSR).
 */
export function ensureIdleCallbackFallback(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.requestIdleCallback !== 'function') {
    window.requestIdleCallback = ((callback: IdleRequestCallback): number =>
      setTimeout(callback) as unknown as number) as typeof window.requestIdleCallback;
  }

  if (typeof window.cancelIdleCallback !== 'function') {
    window.cancelIdleCallback = ((handle: number): void => clearTimeout(handle)) as typeof window.cancelIdleCallback;
  }
}
