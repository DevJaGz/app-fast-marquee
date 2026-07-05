/**
 * jsdom doesn't implement the idle-callback APIs, unlike every real browser this library
 * targets. Polyfill them here so specs can simulate the asymmetric Safari case (only
 * `cancelIdleCallback` missing) instead of the jsdom case (neither API present).
 */
if (typeof window.requestIdleCallback !== 'function') {
  window.requestIdleCallback = (callback: IdleRequestCallback): number =>
    setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 0) as unknown as number;
}

if (typeof window.cancelIdleCallback !== 'function') {
  window.cancelIdleCallback = (handle: number): void => clearTimeout(handle);
}
