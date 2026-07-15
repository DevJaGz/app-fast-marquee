# Lessons

Pitfalls and non-obvious findings from past work. Open the concept matching the area you are about to touch.

- [Angular 20 Upgrade Pitfalls](angular-20-upgrade.md) - Non-obvious traps hit during the Angular 19 to 20 migration — worth re-reading before any future framework upgrade or signal/test-infrastructure work.
- [CSS Custom Properties in Keyframes Block Compositor Acceleration](css-var-keyframes-not-composited.md) - CSS animations on keyframes containing var() references fall back to main-thread invalidation and cannot run on the compositor thread — a silent performance trap in Chromium.
- [Production-First Testing](production-first-testing.md) - Production runtime code must never be modified to satisfy tests — timers, spies, mocks, and e2e scenarios instead.
- [zone.js Doesn't Reliably Patch requestIdleCallback/ResizeObserver/MutationObserver](zonejs-async-api-gaps.md) - A callback from these APIs can run outside the Angular zone under zone.js 0.11.4 — wrap the callback body in NgZone.run(), not just markForCheck().
