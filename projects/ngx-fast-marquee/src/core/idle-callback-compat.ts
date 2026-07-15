/**
 * TypeScript 4.2.3 (this line's core-dialect floor, see `tsconfig.core-dialect.json`) predates the
 * standard-library `requestIdleCallback`/`cancelIdleCallback` DOM typings (added ~TS 4.4). Declared
 * here as a global augmentation so `core/` type-checks under the pinned compiler without widening
 * to `any`, and so the published package's rolled-up `.d.ts` stays self-contained (a separate
 * ambient `.d.ts` file pulled in via `/// <reference path>` doesn't survive ng-packagr's
 * declaration bundling — see `knowledge/decisions/idle-callback-guard.md`).
 */
declare global {
  interface IdleRequestOptions {
    timeout?: number;
  }

  interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
  }

  type IdleRequestCallback = (deadline: IdleDeadline) => void;

  interface Window {
    requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number;
    cancelIdleCallback(handle: number): void;
  }
}

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
