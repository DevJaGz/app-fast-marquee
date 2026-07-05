import { vi } from 'vitest';
import { ensureIdleCallbackFallback } from './idle-callback-compat.util';

/**
 * View of `window` where the idle-callback APIs are optional and writable, so tests can
 * simulate browsers with missing or asymmetric idle-callback support.
 */
interface IdleCallbackPatchableWindow {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const idleWindow = window as unknown as IdleCallbackPatchableWindow;

describe('ensureIdleCallbackFallback', () => {
  let originalRequestIdleCallback: IdleCallbackPatchableWindow['requestIdleCallback'];
  let originalCancelIdleCallback: IdleCallbackPatchableWindow['cancelIdleCallback'];

  beforeEach(() => {
    originalRequestIdleCallback = idleWindow.requestIdleCallback;
    originalCancelIdleCallback = idleWindow.cancelIdleCallback;
  });

  afterEach(() => {
    if (originalRequestIdleCallback) {
      idleWindow.requestIdleCallback = originalRequestIdleCallback;
    } else {
      delete idleWindow.requestIdleCallback;
    }
    if (originalCancelIdleCallback) {
      idleWindow.cancelIdleCallback = originalCancelIdleCallback;
    } else {
      delete idleWindow.cancelIdleCallback;
    }
  });

  it('installs fallbacks for both APIs when neither is available', () => {
    delete idleWindow.requestIdleCallback;
    delete idleWindow.cancelIdleCallback;

    ensureIdleCallbackFallback();

    expect(typeof idleWindow.requestIdleCallback).toBe('function');
    expect(typeof idleWindow.cancelIdleCallback).toBe('function');
  });

  it('installs only the cancelIdleCallback fallback when requestIdleCallback already exists (reported Safari case)', () => {
    const existingRequestIdleCallback: NonNullable<IdleCallbackPatchableWindow['requestIdleCallback']> = () => 1;
    idleWindow.requestIdleCallback = existingRequestIdleCallback;
    delete idleWindow.cancelIdleCallback;

    ensureIdleCallbackFallback();

    expect(idleWindow.requestIdleCallback).toBe(existingRequestIdleCallback);
    expect(typeof idleWindow.cancelIdleCallback).toBe('function');
  });

  it('installs only the requestIdleCallback fallback when cancelIdleCallback already exists', () => {
    const existingCancelIdleCallback: NonNullable<IdleCallbackPatchableWindow['cancelIdleCallback']> = () => undefined;
    delete idleWindow.requestIdleCallback;
    idleWindow.cancelIdleCallback = existingCancelIdleCallback;

    ensureIdleCallbackFallback();

    expect(typeof idleWindow.requestIdleCallback).toBe('function');
    expect(idleWindow.cancelIdleCallback).toBe(existingCancelIdleCallback);
  });

  it('leaves both implementations untouched when both are already available', () => {
    const existingRequestIdleCallback: NonNullable<IdleCallbackPatchableWindow['requestIdleCallback']> = () => 1;
    const existingCancelIdleCallback: NonNullable<IdleCallbackPatchableWindow['cancelIdleCallback']> = () => undefined;
    idleWindow.requestIdleCallback = existingRequestIdleCallback;
    idleWindow.cancelIdleCallback = existingCancelIdleCallback;

    ensureIdleCallbackFallback();

    expect(idleWindow.requestIdleCallback).toBe(existingRequestIdleCallback);
    expect(idleWindow.cancelIdleCallback).toBe(existingCancelIdleCallback);
  });

  it('installs a consistent fallback pair: scheduling runs the callback and cancelling prevents it', async () => {
    delete idleWindow.requestIdleCallback;
    delete idleWindow.cancelIdleCallback;

    ensureIdleCallbackFallback();

    const ranCallback = vi.fn();
    const cancelledCallback = vi.fn();
    window.requestIdleCallback(ranCallback);
    const cancelledHandle = window.requestIdleCallback(cancelledCallback);
    window.cancelIdleCallback(cancelledHandle);

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(ranCallback).toHaveBeenCalled();
    expect(cancelledCallback).not.toHaveBeenCalled();
  });
});
