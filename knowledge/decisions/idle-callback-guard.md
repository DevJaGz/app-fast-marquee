---
type: Decision
title: Idle-Callback Guard (provideFastMarquee)
description: Ship an APP_INITIALIZER-based guard that patches asymmetric requestIdleCallback/cancelIdleCallback support, because the crash is an unfixed upstream Angular bug that component-level code cannot reach in time.
tags:
  - library
  - safari
  - defer
status: implemented
timestamp: 2026-07-12T16:00:00Z
---

# What was decided

The library ships `provideFastMarquee()` — an eager `APP_INITIALIZER`-based provider (also baked into `NgxFastMarqueeModule.providers`) that polyfills whichever of `window.requestIdleCallback`/`window.cancelIdleCallback` is missing, never overriding a native implementation, and no-ops during SSR.

# Why

[Issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5): iOS Safari crashes with `ReferenceError: Can't find variable: cancelIdleCallback` when the marquee sits inside `@defer (on idle)`. The root cause is **not this library** — it is `@angular/core`'s `IdleScheduler`, which gates both functions on `requestIdleCallback` alone; some Safari builds ship `requestIdleCallback` without `cancelIdleCallback`. Upstream tracked at [angular/angular#53721](https://github.com/angular/angular/issues/53721); the proposed fix was closed without merging.

The crash happens while _scheduling_ the deferred block — before the library's chunk is even fetched — so no code inside the component can run early enough. Only a bootstrap-time provider works. Full crash-timing trace, alternatives, and risk analysis: [archived OpenSpec design](../../openspec/changes/archive/2026-07-02-fix-safari-cancel-idle-callback/design.md).

# Consumer contract

- `NgModule` consumers: fix rides along automatically on the module's providers.
- Standalone/`@defer` consumers: must add `provideFastMarquee()` to `bootstrapApplication()` providers — one line, structurally unavoidable, documented prominently in the library README.

# What it affects

- Library adapter/core (see [`fast-marquee.providers.ts`](../../projects/ngx-fast-marquee/src/adapter/fast-marquee.providers.ts) and [`idle-callback-compat.ts`](../../projects/ngx-fast-marquee/src/core/idle-callback-compat.ts)), the library README, and the behavioral spec [library.spec.md](../../openspec/specs/library/library.spec.md).
- Verified by the e2e suite's two-server scenario setup (guarded vs `no-idle-guard`), simulating the Safari asymmetry via Playwright `addInitScript` — see [e2e/AGENTS.md](../../e2e/AGENTS.md).
- The guarantee carries over to **both** planned version lines ([branch-model decision](branch-model-version-lines.md)) and stays as API even if the upstream bug is eventually fixed.

# Citations

[1] [Archived change 2026-07-02-fix-safari-cancel-idle-callback](../../openspec/changes/archive/2026-07-02-fix-safari-cancel-idle-callback/design.md) — full design record.

[2] [angular/angular#53721](https://github.com/angular/angular/issues/53721) — upstream bug.

[3] [Issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5) — original report.
