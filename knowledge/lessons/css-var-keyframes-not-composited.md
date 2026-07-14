---
type: Lesson
title: CSS Custom Properties in Keyframes Block Compositor Acceleration
description: CSS animations on keyframes containing var() references fall back to main-thread invalidation and cannot run on the compositor thread — a silent performance trap in Chromium.
tags:
  - performance
  - css
  - animations
  - chromium
timestamp: 2026-07-14T00:00:00Z
---

# What happened

The marquee component's stylesheet animated using `@keyframes move { to { transform: var(--_translation); } }`. Visually indistinguishable from static keyframes on an idle page, this design prevented the animation from compositing in Chromium. The equivalent React library ([react-fast-marquee](https://github.com/FormidableLabs/react-fast-marquee)), using literal `translateX` keyframes, ran composited and stayed smooth under main-thread load. The problem surfaced during the July 2026 performance comparison.

# The issue

Chromium's compositor thread cannot pre-compute keyframe values because custom properties must be re-resolved on every animation tick — the variable's value may change via script or cascade at any moment. Unlike static `to { transform: translateX(100px); }`, which the compositor compiles once to efficient GPU instructions, `to { transform: var(--_translation); }` forces the browser back to main-thread style recalculation and rasterization for every frame. The animation stutters silently whenever the main thread is busy (script execution, garbage collection, etc.), with no error or warning to surface the problem.

This applies **only to custom properties inside keyframe bodies**. Using `var()` for animation properties on the element itself—`animation-duration: var(--duration)`—is resolved once at style time and poses no performance cost.

# Solution

Enumerate static keyframe variants and select `animation-name` via attribute selectors or class bindings. Selection happens once at style time; the chosen variant's fixed keyframes stay compositor-friendly.

```scss
// Instead of:
@keyframes move {
  to {
    transform: var(--_translation);
  }
}

// Use:
@keyframes move-x {
  to {
    transform: translateX(var(--_distance));
  } // ❌ Still has var() in body
}

// Better — split variants:
@keyframes move-x {
  to {
    transform: translateX(500px);
  }
}

@keyframes move-y {
  to {
    transform: translateY(500px);
  }
}

.marquee[data-axis='x'] {
  animation-name: move-x;
}

.marquee[data-axis='y'] {
  animation-name: move-y;
}
```

If distance varies at runtime, update `animation-duration` or `animation-delay` instead — these are compositor-safe. For axis selection, bind the animation name to an input signal and apply it conditionally.

# Verification

Open Chrome DevTools **Performance** panel and record while the animation runs:

- Non-composited ("Main thread") animations show a red/orange bar under "Rendering" or "Rasterization."
- Composited animations appear as green "Composite Layer" with no main-thread style recalculation.

Lighthouse also flags this: run an audit and check for the **"Avoid non-composited animations"** finding.

# Citations

- [1] [Chromium issue 40890539 — compositor-accelerated var() substitutions](https://issues.chromium.org/issues/40890539) — Open upstream tracking request for native support (not yet resolved).

- [2] [The gotcha with animating custom properties](https://www.bram.us/2023/02/01/the-gotcha-with-animating-custom-properties/) — Bram.us explainer on why variables in keyframes disqualify compositor acceleration.

- [3] [Lighthouse: Avoid non-composited animations](https://developer.chrome.com/docs/lighthouse/performance/non-composited-animations) — Chrome DevTools audit and detection guide.
