---
type: Lesson
title: Angular 20 Upgrade Pitfalls
description: Non-obvious traps hit during the Angular 19 to 20 migration — worth re-reading before any future framework upgrade or signal/test-infrastructure work.
tags:
  - angular
  - upgrade
  - vitest
  - signals
timestamp: 2026-07-06T00:00:00Z
---

Findings from the 2026-07-05 upgrade (see the [decision concept](../decisions/angular-20-idiom-adoption.md) for what/why). Each item cost real debugging time.

# Build & test infrastructure

- **Vitest builder vs `ng-packagr`**: the `@angular/build:unit-test` builder needs a `buildTarget` shaped like `@angular/build:application`; the library's real `build` target uses `ng-packagr`, which is incompatible. Fix: a dedicated `test-build` architect target in [angular.json](../../angular.json) (only `tsConfig` is required) used solely to compile specs.
- **jsdom lacks idle callbacks**: `requestIdleCallback`/`cancelIdleCallback` don't exist in jsdom, so [test-setup.ts](../../projects/ngx-fast-marquee/src/test-setup.ts) polyfills them — keep it in sync with any idle-callback behavior change, or the issue-#5 regression specs silently degrade.

# Signal migration

- **Don't trust `--best-effort-mode` on inputs**: the signal-input migration turned `maskStartPercentage!: number` (definite-assignment `!`) into `input.required<number>()`, but the JSDoc default was `0` and no caller bound it — would have thrown at runtime. Always cross-check migrated inputs against JSDoc defaults and real call sites; three inputs needed correction to `input(0)`.
- **Signal inputs ripple into abstractions**: `MarqueeModel` had to be retyped from plain values to `Signal<T>`, changing every destructured read in `MarqueeService`/`MarqueeDuplicationService` from `direction` to `direction()`. Expect this class of bug whenever a plain property becomes a signal.
- **e2e fixtures mirror app config**: [app.config.no-idle-guard.ts](../../e2e/fixtures/app.config.no-idle-guard.ts) must mirror [app.config.ts](../../src/app/app.config.ts) (minus the guard) — the zoneless provider had to be added there too or the scenario would silently diverge.

# Tooling quirks (Windows / this machine)

- **`inject-migration` schematic fails on this Windows setup** with "Could not find any files to migrate" for any `--path` — likely a drive-letter-casing mismatch (`c:/` vs `C:/`) in its file filter. The 5 affected files were converted manually. `cleanup-unused-imports` and `self-closing-tags` schematics work fine.
- **CLI schematics auto-stage their changes** (internal `git add`), so mixed staged/unstaged status after a migration run is expected, not something to "fix".
- **Stray CLI artifact files can break Prettier**: a file literally named `ter --stat -- package.json` (a dumped diff) appeared at repo root and made `npm run format` fail parsing it as JSON. If format/lint suddenly fails with a JSON parse error mentioning `diff --git`, check `git status --short` for oddly-named root files.
- **Node via fnm**: `node`/`npm` are not on PATH for scripting shells. Reliable per-call fix in PowerShell: `& fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression` at the start of each call (shell state does not persist between calls). `pnpm` works standalone.

# Known open follow-up

- `NG0953: Unexpected emit for destroyed OutputRef` warning in `fast-marquee-defer-ordering.spec.ts`: a leftover `setTimeout` in `MarqueeService` fires after fixture teardown. Diagnostic-only (tests pass); surfaced by signal outputs where `EventEmitter` used to stay silent.
