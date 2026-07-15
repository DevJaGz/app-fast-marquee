import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';

/**
 * Renders `<ngx-fast-marquee>` only after an idle callback fires, mirroring the 20.x line's
 * `@defer (on idle)` usage (Angular 12 has no `@defer`). Reproduces the same scheduling shape
 * as Angular's own `IdleScheduler` — cancel any prior handle, then request a new one — so the
 * upstream angular/angular#53721 crash (Safari ships `requestIdleCallback` without
 * `cancelIdleCallback`) surfaces identically without `provideFastMarquee()`. See
 * `knowledge/decisions/idle-callback-guard.md`.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  showMarquee = false;
  private _idleHandle: number | undefined;

  constructor(private readonly _cdr: ChangeDetectorRef, private readonly _ngZone: NgZone) {}

  ngOnInit(): void {
    const idleWindow = window as unknown as {
      requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback: (handle: number) => void;
    };
    idleWindow.cancelIdleCallback(0);
    // An explicit timeout guarantees the callback fires even if the page never reports a true
    // idle period (e.g. under automated-test load) — real browsers don't bound requestIdleCallback
    // otherwise. zone.js doesn't reliably patch requestIdleCallback, so the callback can run
    // outside the Angular zone — NgZone.run() guarantees the state change actually reaches the DOM.
    this._idleHandle = idleWindow.requestIdleCallback(
      () => {
        this._ngZone.run(() => {
          this.showMarquee = true;
          this._cdr.markForCheck();
        });
      },
      { timeout: 2000 }
    );
  }

  ngOnDestroy(): void {
    if (this._idleHandle !== undefined) {
      (window as unknown as { cancelIdleCallback: (handle: number) => void }).cancelIdleCallback(this._idleHandle);
    }
  }
}
