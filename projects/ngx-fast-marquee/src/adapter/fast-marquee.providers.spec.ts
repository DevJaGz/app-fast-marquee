import { APP_INITIALIZER } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFastMarquee } from './fast-marquee.providers';

/** Window view where the idle-callback APIs are optional and writable, mirroring asymmetric Safari builds. */
interface IdleCallbackPatchableWindow {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const idleWindow = window as unknown as IdleCallbackPatchableWindow;

describe('provideFastMarquee', () => {
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

  it('the registered APP_INITIALIZER runs the idle-callback guard, patching only the missing side', () => {
    delete idleWindow.cancelIdleCallback;
    expect(typeof idleWindow.requestIdleCallback).toBe('function');

    TestBed.configureTestingModule({
      providers: provideFastMarquee(),
    });
    // ApplicationInitStatus (which actually invokes APP_INITIALIZER functions during bootstrap)
    // isn't exercised by component creation alone in TestBed — call the registered
    // initializers directly to verify provideFastMarquee()'s own contract in isolation.
    const initializers = TestBed.inject(APP_INITIALIZER);
    initializers.forEach(initializer => initializer());

    expect(typeof idleWindow.cancelIdleCallback).toBe('function');
    expect(idleWindow.requestIdleCallback).toBe(originalRequestIdleCallback);
  });
});
