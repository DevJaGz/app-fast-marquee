import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideFastMarquee } from './fast-marquee.providers';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EmptyHostComponent {}

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

  it('runs the idle-callback guard during application initialization, patching only the missing side', () => {
    delete idleWindow.cancelIdleCallback;
    expect(typeof idleWindow.requestIdleCallback).toBe('function');

    TestBed.configureTestingModule({
      providers: [provideFastMarquee(), provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(EmptyHostComponent);
    fixture.detectChanges();

    expect(typeof idleWindow.cancelIdleCallback).toBe('function');
    expect(idleWindow.requestIdleCallback).toBe(originalRequestIdleCallback);
  });
});
