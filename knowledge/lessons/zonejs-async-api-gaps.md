---
type: Lesson
title: zone.js Doesn't Reliably Patch requestIdleCallback/ResizeObserver/MutationObserver
description: A callback from these APIs can run outside the Angular zone under zone.js 0.11.4 — markForCheck() alone marks the view dirty without triggering the next tick to flush it into the DOM; wrap the callback body in NgZone.run() instead.
tags:
  - zone.js
  - change-detection
  - library
  - 12.x
status: implemented
timestamp: 2026-07-15T13:30:00Z
---

# What happened

Porting `ngx-fast-marquee`'s adapter to Angular 12 (zone-based change detection, `zone.js ~0.11.4`) for the [`adapt-12x-line`](../../openspec/changes/adapt-12x-line/) change, three unrelated-looking e2e failures shared one root cause:

- `e2e/tests/idle-callback-guard.spec.ts`'s guarded sub-test: the idle-deferred `<ngx-fast-marquee>` never appeared, even though the idle-callback guard itself worked correctly and `requestIdleCallback` genuinely fired (confirmed by wrapping it and logging).
- `e2e/tests/marquee-outputs.spec.ts`'s viewport-resize sub-test: `updated` never incremented within the test's wait window, even though the engine's `ResizeObserver`-triggered replan cycle completed correctly internally.
- A `(mounted)`/`(updated)` DOM counter fixture stayed at `0` in the rendered page while the _component instance's_ own property (inspected via `ng.getComponent()` in a real browser) already read `1`.

In every case, the component's own state updated correctly and `ChangeDetectorRef.markForCheck()` was called — but the DOM never reflected it until some _unrelated_ zone-tracked event (a real click, another timer) incidentally triggered a global Angular tick. This reproduced identically in a real browser (not just Angular 12 TestBed) and was independent of `OnPush` vs `Default` change detection strategy.

# Root cause

`markForCheck()` only marks a component (and its ancestors) dirty for the _next_ change-detection tick — it does not itself schedule that tick. Normally, `NgZone` schedules a tick automatically whenever a zone-patched async API's callback completes (`onMicrotaskEmpty` → `ApplicationRef.tick()`). But `zone.js 0.11.4`'s patch coverage for `requestIdleCallback`, `ResizeObserver`, and `MutationObserver` isn't complete/reliable in this exact toolchain (Angular 12.0.x–12.2.x, this webpack/CLI build) — a callback from one of these can execute in the _root_ zone instead of Angular's own zone, so nothing ever tells `NgZone` a task finished, and the dirty flag sits unflushed indefinitely.

# What to do instead

Wrap the body of any callback driven by `requestIdleCallback`, `ResizeObserver`, or `MutationObserver` in `NgZone.run(...)` — this unconditionally re-enters the Angular zone and schedules a tick on exit, regardless of which zone actually invoked the callback:

```ts
constructor(private readonly _ngZone: NgZone, /* … */) {}

private _bootEngine(): void {
  const engine = new MarqueeEngine({
    // …
    onMeasured: sizeInPx => {
      this._ngZone.run(() => {
        this._measuredSize = sizeInPx;
        this._cdr.markForCheck();
      });
    },
  });
}
```

Applied in [`ngx-fast-marquee.component.ts`](../../projects/ngx-fast-marquee/src/adapter/ngx-fast-marquee.component.ts) (`onMeasured`/`onUpdated`/reduced-motion-source callbacks) and [`src/app/home/home.component.ts`](../../src/app/home/home.component.ts) (idle-callback handler). `core/` stays framework-agnostic and unchanged — this is an adapter-level fix, matching the [Core/Adapter Library Architecture](../decisions/core-adapter-architecture.md) split.

# Scope

Confirmed on the `12.x` branch's Angular 12.0.x–12.2.x + zone.js 0.11.4 combination. Not confirmed (and likely absent) on the `20.x` line, which is zoneless (`provideZonelessChangeDetection()`) — zoneless change detection doesn't depend on zone.js patch coverage at all, so this class of bug cannot occur there. If the `12.x` line's zone.js version is ever bumped, re-verify whether this workaround is still necessary before removing it.

# Diagnosing this class of bug

`ng.getComponent(element)` in a real (non-prod-optimized) browser build lets you inspect a component instance's actual field values directly, bypassing the DOM — comparing that against the rendered DOM text is what surfaced this (internal state correct, DOM stale). TestBed's `fixture.detectChanges()` did **not** reproduce this specific symptom reliably (see the separate, unrelated `OnPush`-root TestBed quirk noted in [`adapter/AGENTS.md`](../../projects/ngx-fast-marquee/src/adapter/AGENTS.md)) — a real browser was necessary to confirm the zone-boundary root cause.
