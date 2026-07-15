# Lessons

Pitfalls and non-obvious findings from past work. Open the concept matching the area you are about to touch.

- [Angular 20 Upgrade Pitfalls](angular-20-upgrade.md) - Non-obvious traps hit during the Angular 19 to 20 migration — worth re-reading before any future framework upgrade or signal/test-infrastructure work.
- [CSS Custom Properties in Keyframes Block Compositor Acceleration](css-var-keyframes-not-composited.md) - CSS animations on keyframes containing var() references fall back to main-thread invalidation and cannot run on the compositor thread — a silent performance trap in Chromium.
- [Production-First Testing](production-first-testing.md) - Production runtime code must never be modified to satisfy tests — timers, spies, mocks, and e2e scenarios instead.
- [A Standalone Vitest Root Can Create a Nested node_modules Git Silently Tracks](vitest-nested-node-modules.md) - A Vitest config that sets a custom `root` outside the workspace root writes its cache to a `node_modules/.vite` folder scoped to that root — and a root-anchored `.gitignore` entry won't catch it.
