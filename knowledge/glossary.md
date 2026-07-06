---
type: Glossary
title: Project Glossary
description: Terminology used across decisions, specs, and release planning for app-fast-marquee.
tags:
  - terminology
timestamp: 2026-07-06T00:00:00Z
---

**Version line** — An independently published stream of `ngx-fast-marquee` targeting a specific Angular floor (e.g. the `20.x` line, the `12.x` line). Defined in the [branch-model decision](decisions/branch-model-version-lines.md).

**Active / Patchable / Archived** — Lifecycle states of a version line and its branch. _Active_: the line under development on `master`, publishes `latest`. _Patchable_: receives only critical cherry-picked fixes. _Archived_: permanently read-only.

**Retired line** — A former Active line snapshotted to its own `X.x` branch when `master` moves on; starts Patchable, later becomes Archived.

**Retirement commit** — The single commit a retired branch receives to switch its release dist-tag off `latest`, remove docs deployment, and remove scheduled CI. See the [branch-model decision](decisions/branch-model-version-lines.md).

**Floor rule** — The library's major version equals that line's minimum supported Angular major (the "Angular floor"), e.g. the Angular-20 line publishes as `20.y.z`. Deliberately not ordinary semver.

**API parity contract** — Between version lines, only the template-level binding surface is guaranteed identical (selector, input/output names/types/defaults, event payloads, `NgxFastMarqueeModule`, `provideFastMarquee()`). The class instance surface is explicitly out of contract.

**Idle-callback guard** — The `provideFastMarquee()` provider (plus `ensureIdleCallbackFallback()` utility) that patches asymmetric `requestIdleCallback`/`cancelIdleCallback` support to prevent an upstream Angular `@defer` crash on Safari. See the [idle-callback guard decision](decisions/idle-callback-guard.md).

**Scenario (e2e)** — An alternate app build served on its own port during e2e runs, produced with Angular `fileReplacements` swapping in a fixture config (e.g. `no-idle-guard`), instead of test hooks in runtime code. See [e2e/AGENTS.md](../e2e/AGENTS.md).

**Zoneless** — Both app and library run without `zone.js`, using `provideZonelessChangeDetection()`; change detection is driven by signals. See the [Angular 20 idiom-adoption decision](decisions/angular-20-idiom-adoption.md).
