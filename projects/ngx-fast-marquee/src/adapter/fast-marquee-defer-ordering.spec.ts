import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { NgxFastMarqueeComponent } from './ngx-fast-marquee.component';
import { provideFastMarquee } from './fast-marquee.providers';

/**
 * Host that renders the marquee behind a real `@defer (on idle)` boundary — the scenario from
 * issue #5, where Angular's `IdleScheduler` is constructed during change detection of the
 * placeholder, before the deferred component ever loads (see `angular/angular#53721`).
 */
@Component({
  template: `
    @defer (on idle) {
    <ngx-fast-marquee>
      <div>Item 1</div>
      <div>Item 2</div>
    </ngx-fast-marquee>
    } @placeholder {
    <div class="defer-placeholder">placeholder</div>
    }
  `,
  imports: [NgxFastMarqueeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DeferOnIdleHostComponent {}

/**
 * View of `window` where the idle-callback APIs are optional and writable, so the test can
 * simulate the asymmetric Safari environment (`requestIdleCallback` without `cancelIdleCallback`).
 */
interface IdleCallbackPatchableWindow {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const idleWindow = window as unknown as IdleCallbackPatchableWindow;

describe('provideFastMarquee ordering with @defer (on idle)', () => {
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

  it('runs the guard before the on-idle trigger is scheduled, so the deferred marquee renders without throwing', async () => {
    // Seed the asymmetric environment before application initialization runs.
    delete idleWindow.cancelIdleCallback;
    expect(typeof idleWindow.requestIdleCallback).toBe('function');
    expect(idleWindow.cancelIdleCallback).toBeUndefined();

    // The component is imported directly (no NgxFastMarqueeModule), so the only
    // protection in play is `provideFastMarquee()` — mirroring a standalone consumer's
    // `bootstrapApplication()` wiring.
    TestBed.configureTestingModule({
      imports: [DeferOnIdleHostComponent],
      providers: [provideFastMarquee(), provideZonelessChangeDetection()],
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
    });
    await TestBed.compileComponents();

    // `createComponent` runs the APP_INITIALIZER guard; the first change detection pass then
    // schedules the on-idle trigger — the exact point that throws without the guard.
    const fixture = TestBed.createComponent(DeferOnIdleHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();

    // Until the browser goes idle, only the placeholder is rendered.
    expect(fixture.nativeElement.querySelector('ngx-fast-marquee')).toBeNull();
    expect(fixture.nativeElement.querySelector('.defer-placeholder')).toBeTruthy();

    // Angular's IdleScheduler registered its idle callback before this one, so once this
    // resolves the defer block has been triggered.
    await new Promise<void>(resolve => window.requestIdleCallback(() => resolve()));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ngx-fast-marquee')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.defer-placeholder')).toBeNull();
  });
});
