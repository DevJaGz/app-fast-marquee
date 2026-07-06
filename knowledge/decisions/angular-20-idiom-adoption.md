---
type: Decision
title: Angular 20 Upgrade with Full Idiom Adoption
description: Framework major upgrades adopt the new idioms (zoneless, signal APIs, Vitest, lint enforcement), not just the breaking-change fixes.
tags:
  - angular
  - upgrade
  - conventions
status: implemented
timestamp: 2026-07-06T00:00:00Z
---

# What was decided

The Angular 19 → 20 upgrade (completed 2026-07-05, see [Citations](#citations)) went beyond keeping the workspace compiling:

- **Zoneless**: `provideZonelessChangeDetection()` in both app and library; `zone.js` removed.
- **Signal APIs**: all `@Input()`/`@Output()`/`@ViewChild()` decorators replaced with `input()`/`output()`/`viewChild()`.
- **Vitest**: replaced Karma for both projects via the experimental `@angular/build:unit-test` builder.
- **Lint enforcement**: `@angular-eslint` bumped to the 20.x line and four opt-in rules enabled (`prefer-inject`, `prefer-signals`, `prefer-output-emitter-ref`, `prefer-on-push-component-change-detection`) so the idioms cannot silently regress. Codified as repository conventions 5, 7, and 9 in [conventions.md](../conventions.md).

# Rationale

Maintainer directive: a major upgrade must deliver "ALL its benefits" — a mechanical `ng update` plus breaking-change checklist was explicitly rejected as insufficient. This is a **standing policy for future majors**, not a one-off: when Angular 21+ lands, adopt its new idioms in the same effort, and keep the lint tooling (`@angular-eslint`, `@typescript-eslint`) and Node `engines` floor in lockstep (repository conventions 8–9 in [conventions.md](../conventions.md)).

# Alternatives considered

- _Mechanical upgrade only_ (fix breaking changes, keep Karma/zone.js/decorators) — rejected by the maintainer.
- _Type-aware `no-uncalled-signals` lint rule_ — deliberately skipped: it needs `parserOptions.project`, which is not configured and is a known fragility source; noted as a possible future improvement.

# What it affects

- All component/service source in [src/](../../src/) and [projects/ngx-fast-marquee/](../../projects/ngx-fast-marquee/).
- [angular.json](../../angular.json) test targets, [.eslintrc.json](../../.eslintrc.json), [package.json](../../package.json) tooling versions.
- Deliberately **not** the library's `version`/`peerDependencies` — governed by the [branch-model plan](branch-model-version-lines.md).

# Pitfalls encountered

Recorded separately in [lessons/angular-20-upgrade.md](../lessons/angular-20-upgrade.md).

# Citations

[1] Repo history: commits [f3ea57b](https://github.com/DevJaGz/app-fast-marquee/commit/f3ea57b) (Angular 19), [556e09f](https://github.com/DevJaGz/app-fast-marquee/commit/556e09f) (Angular 20), [fecabab](https://github.com/DevJaGz/app-fast-marquee/commit/fecabab) (eslint 20 line).

[2] Maintainer direction during the upgrade sessions, 2026-07-05 (no linkable artifact; recorded here as the primary source).
