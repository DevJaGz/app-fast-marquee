---
type: Decision
title: Branch Model and Two-Version-Line Publishing Strategy
description: Planned branch-per-version-line model (Active/Patchable/Archived) and the 20.x / 12.x npm publishing lines with the major-equals-Angular-floor rule, plus each line's own verified minimum-TypeScript dialect floor for core/.
tags:
  - release
  - branching
  - library
status: planned
timestamp: 2026-07-15T12:00:00Z
---

**Status: planned — none of this is implemented yet.** The repository should evolve toward this model; agents must not partially apply it (e.g. bump versions or create branches) without explicit direction.

# What was decided

## Version lines

`ngx-fast-marquee` publishes two independent lines:

- **`20.x` line (Active, lives on `master`)** — Angular floor 20, planned peers `>=20.0.0 <23.0.0`, standalone/signal-input/zoneless source. Floor-20 rationale: oldest Angular where every needed API is stable (signal inputs/queries v19, `afterNextRender` v20, incremental hydration v20, zoneless v20.2) and still under Google LTS at adoption time.
- **`12.x` line (Patchable)** — Angular floor 12, peers `>=12.0.0 <20.0.0`, a decorator/NgModule adapter over a shared `core/`, built on the Angular 12 toolchain. Critical fixes only.

**Floor rule**: the library's major version equals the line's Angular floor (the current line will publish as `20.0.0`, not an incremental `0.x` bump). Consumer guidance: "Angular >= our major → install latest; older → install `ngx-fast-marquee@12`."

**API parity contract**: both lines expose the same template-level binding surface (selector, input/output names/types/defaults, event payloads, `NgxFastMarqueeModule`, `provideFastMarquee()`). The class instance surface is out of contract. This boundary must be published in the README and the `20.0.0` release notes before first publish, since decorator-properties → signal-inputs breaks the class surface even though the template surface is stable.

The [idle-callback guard](idle-callback-guard.md) requirement applies to both lines; it may become a no-op if the upstream Angular bug is fixed, but the API and guarantee stay (spec: [library.spec.md](../../openspec/specs/library/library.spec.md)).

## Core dialect floors (per line, not shared)

Each version line hosts its own `core/` copy (the framework-agnostic engine — see the core/adapter architecture established by the [`refactor-core-adapter-architecture`](../../openspec/changes/refactor-core-adapter-architecture/) change and recorded in [Core/Adapter Library Architecture](core-adapter-architecture.md)), and each line's `core/` is dialected to **that line's own Angular-floor minimum TypeScript** — not a single floor shared across both lines. This lets each line's `core/` take advantage of the best language features its own floor allows, alongside that line's own Angular capabilities.

Verified against the [official Angular compatibility table](https://angular.dev/reference/versions) (2026-07-06):

- **`20.x` line** — Angular 20.0.x–20.3.x require TypeScript `>=5.8.0 <6.0.0`. The first stable release in that range is `5.8.2` (`5.8.0` was Beta-only, `5.8.1` RC-only); `5.8.2` is therefore the line's `core/` dialect floor.
- **`12.x` line** — Angular 12.0.x requires TypeScript `~4.2.3`; that is the line's `core/` dialect floor.

This corrects an earlier framing (carried into the initial `refactor-core-adapter-architecture` proposal) that tied the dialect check for whichever line was being refactored to the _Patchable_ line's floor rather than to that line's _own_ floor. The `12.x` line's own `core/` rewrite — and its 4.2.3-floor dialect check — is separate future work; it is not produced by the `20.x`-focused refactor.

## Branch model

Every long-lived branch hosts exactly one version line and inherits its lifecycle state:

| Branch            | Maps to                            | Purpose                                                                                                   | Rules                                                                                                             |
| ----------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `master`          | **Active** line (currently `20.x`) | Primary development; all new features; workspace pinned to the Active Angular version                     | Protected; PRs only with required checks. Never recreated — when a new line begins, `master` _becomes_ that line. |
| `12.x`            | **Patchable** line                 | Self-contained Angular 12 workspace: own toolchain, Node `engines`, workflows, and `core/` implementation | Protected; critical cherry-picked fixes only; no features. Archived when the next line retires.                   |
| `20.x`, `24.x`, … | **Retired** lines                  | Snapshot of the previous Active workspace taken when `master` moves on                                    | Initially Patchable; Archived (read-only) once the following line retires.                                        |
| `feat/*`, `fix/*` | —                                  | Temporary working branches from their target line                                                         | Conventional Commits; deleted after merge.                                                                        |

**Retirement commit** — each retired branch gets exactly one commit that: (1) switches release config from `latest` to a permanent dist-tag (e.g. `v20-lts`); (2) removes the docs deployment workflow; (3) removes scheduled CI while keeping PR validation. This guarantees retired branches can never publish `latest` or overwrite the docs site.

**Git tags** — every release creates an immutable `vX.Y.Z` tag on the exact published commit.

**Branch protection** — one repository ruleset targeting `master` and `*.x`, so new version branches are protected automatically and retirement needs no manual protection steps. Each branch only executes the workflows it contains.

## Required invariants

- Exactly one Active branch exists.
- At most one Patchable branch exists.
- Archived branches are permanently read-only.
- Non-Active branches never publish the `latest` package.
- Non-Active branches never deploy the documentation site.

# Rationale

A real npm audience spans old and new Angular majors. One codebase cannot idiomatically serve Angular 12 (decorators, NgModules, zone.js) and Angular 20 (signals, zoneless) at once; separate self-contained branches per line keep each toolchain coherent, while the floor rule makes compatibility legible from the version number alone. The single-ruleset protection and one-commit retirement procedure minimize manual release-ops.

# What it affects

- [projects/ngx-fast-marquee/package.json](../../projects/ngx-fast-marquee/package.json) `version`/`peerDependencies` and the library README compatibility table — **frozen until this plan executes; changing them requires explicit confirmation** (see [guardrails](../guardrails.md)).
- Future CI/CD workflows, repository rulesets, and docs deployment.
- The `12.x` line implies a future independently-dialected `core/` restructuring of the library source (each line hosts its own copy, per the [core dialect floors](#core-dialect-floors-per-line-not-shared) above — not a single shared `core/`).

# Current state vs plan (verified 2026-07-06)

- Long-lived branches today: `master` and `develop`. A `develop` branch is not part of the target model; its fate is **undecided** (open question).
- Library is at `0.3.0` with peers `>=19.0.0` — pre-plan values.
- One tag exists (`v0.1.7`); no repository ruleset or retirement machinery exists yet.

## `12.x` branch state (updated 2026-07-15)

The `12.x` branch (this branch, cut from `develop`) implements the Patchable line per the [`adapt-12x-line`](../../openspec/changes/adapt-12x-line/) change: self-contained Angular `12.0.5` + TypeScript `4.2.4` workspace on Node `14.21.3`, npm-based (not pnpm). Library `version` `12.0.0`, `peerDependencies` `>=12.0.0 <20.0.0` — matches the floor rule. `core/` is dialected to TypeScript `4.2.3` (verified, see [`tsconfig.core-dialect.json`](../../projects/ngx-fast-marquee/tsconfig.core-dialect.json)). `adapter/` is decorator/`NgModule`-based (`@Input`/`@Output`/`ngOnChanges`/`@HostBinding`); `NgxFastMarqueeModule` always bundles the idle-callback guard (no `20.x`-style opt-out via standalone import — a discovered constraint of Ivy's compile-time module binding, see [`adapter/AGENTS.md`](../../projects/ngx-fast-marquee/src/adapter/AGENTS.md)). No `no-idle-guard` e2e scenario on this branch (the crash it reproduces is specific to Angular's own `@defer`, absent from Angular 12).

# Citations

[1] Branch policy brief provided by the maintainer, 2026-07-06 (no linkable artifact; this concept is its canonical home).

[2] Version-line strategy detailed by the maintainer during the Angular 20 upgrade sessions, 2026-07-05 — see also [Angular 20 Upgrade Pitfalls](../lessons/angular-20-upgrade.md).

[3] Per-line TypeScript dialect floors verified against the [official Angular compatibility table](https://angular.dev/reference/versions) and npm's published `typescript` release history, 2026-07-06 — see also [`refactor-core-adapter-architecture`](../../openspec/changes/refactor-core-adapter-architecture/design.md).
