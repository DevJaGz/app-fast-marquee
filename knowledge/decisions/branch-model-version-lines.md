---
type: Decision
title: Branch Model and Two-Version-Line Publishing Strategy
description: Branch-per-version-line model (Active/Patchable/Archived) and the 20.x / 12.x npm publishing lines with the major-equals-Angular-floor rule, plus each line's own verified minimum-TypeScript dialect floor for core/.
tags:
  - release
  - branching
  - library
status: implemented
timestamp: 2026-07-16T16:00:00Z
---

**Status: executed — branch cutover, version bumps, publishing, release tags, and the `develop` → `master` merge are all done.** The `12.x` line branch exists, the branch-local OpenSpec workflow is adopted, both lines' library versions/peers are set per the floor rule, and both lines are published on npm with immutable `vX.Y.Z` tags on their publish commits (2026-07-16, maintainer-directed, see "Current state vs plan" below). The interim `develop` trunk was fast-forward merged into `master` and deleted the same day — `master` now directly hosts the Active `20.x` line, as the branch model always intended.

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

## Branch-local OpenSpec workflow

Adopted by the [adopt-two-line-branch-model](../../openspec/changes/archive/2026-07-15-adopt-two-line-branch-model/design.md) change (decision D1):

1. `openspec/specs/` on each version-line branch describes only that line's own behavior.
2. An OpenSpec change lives and archives on the branch where its tasks execute — there is no combined change spanning both line branches.
3. Cross-line contracts (today, only API parity) are mirrored verbatim into both branches' specs, so each branch's spec states the identical contract text independently.

## Required invariants

- Exactly one Active branch exists.
- At most one Patchable branch exists.
- Archived branches are permanently read-only.
- Non-Active branches never publish the `latest` package.
- Non-Active branches never deploy the documentation site.

# Rationale

A real npm audience spans old and new Angular majors. One codebase cannot idiomatically serve Angular 12 (decorators, NgModules, zone.js) and Angular 20 (signals, zoneless) at once; separate self-contained branches per line keep each toolchain coherent, while the floor rule makes compatibility legible from the version number alone. The single-ruleset protection and one-commit retirement procedure minimize manual release-ops.

# What it affects

- [projects/ngx-fast-marquee/package.json](../../projects/ngx-fast-marquee/package.json) `version`/`peerDependencies` and the library README compatibility table — set 2026-07-16 with maintainer confirmation; **any further change still requires explicit confirmation** (see [guardrails](../guardrails.md)).
- Future CI/CD workflows, repository rulesets, and docs deployment.
- The `12.x` line implies a future independently-dialected `core/` restructuring of the library source (each line hosts its own copy, per the [core dialect floors](#core-dialect-floors-per-line-not-shared) above — not a single shared `core/`).

# Current state vs plan (verified 2026-07-16)

- Long-lived branches today: `master`, `develop`, and `12.x`. `develop` is the **interim trunk**: it carries the complete `20.x` modernization and stands in for `master` until both version lines work; the final `develop` → `master` merge is a deliberate future release milestone, not automatic. `master` stays frozen until that merge. `12.x` was cut from `develop` (commit `6ae63f8`) to host the Patchable line's Angular 12 conversion — see the sibling `adapt-12x-line` change, which lives exclusively on `12.x` per the branch-local OpenSpec workflow above.
- `refactor/build-12` was verified fully merged into `develop` and deleted (safe `git branch -d`; no remote counterpart existed). The stale `build12/` toolchain-reference snapshot was deleted from `develop` after `12.x` was cut.
- **Version bumps executed (2026-07-16, maintainer-confirmed)**: this branch's library is at `20.0.0` with peers `>=20.0.0 <23.0.0`; the `12.x` branch is at `12.0.0` with peers `>=12.0.0 <20.0.0` plus a `publishConfig` npm dist-tag `v12` guard (so a plain `npm publish` from the Patchable line can never take `latest`, per the invariants above). Both branches' README compatibility tables now list all three tiers — `20.x` Active, `12.x` Maintenance, `0.x` **deprecated** — with real install commands, and publish the template-level API parity contract. A `LICENSE` file (MIT) now ships in the package on both lines.
- **First publish executed (2026-07-16, maintainer-directed)**: `ngx-fast-marquee@20.0.0` published from `develop` commit `b7ad54d` (`dist/ngx-fast-marquee` built via `pnpm build:lib` on Node `22.22.3`) — no `publishConfig.tag`, so it took the `latest` dist-tag as intended for the Active line. `ngx-fast-marquee@12.0.0` published from `12.x` commit `7494861` (`dist/ngx-fast-marquee` built via `npm run build:lib` on Node `14.21.3`, the line's own toolchain floor) — its `publishConfig.tag: "v12"` routed it to the `v12` dist-tag, leaving `latest` untouched. Registry confirmed post-publish: `latest → 20.0.0`, `v12 → 12.0.0`. The pre-existing `0.0.1`–`0.2.3` releases were deprecated in the same session (`npm deprecate "ngx-fast-marquee@<0.3.0" "..."`) pointing consumers at the two new lines.
- Tags now exist for both publishes: `v20.0.0` (on `develop`, pushed to `origin`) and `v12.0.0` (on `12.x`, pushed to `origin`), alongside the pre-existing `v0.1.7`. No repository ruleset or retirement machinery exists yet.
- **`develop` → `master` merge executed, `develop` deleted (2026-07-16, maintainer-directed)**: with lint and both unit-test suites verified green, `develop` was fast-forward merged into `master` and pushed (triggering the `firebase-hosting-merge.yml` docs-site deploy), then confirmed fully merged (`git merge-base --is-ancestor develop master`), confirmed not the repo's default branch (already `master`) and not branch-protected, and deleted both remotely and locally. `master` now directly hosts the Active `20.x` line — the interim-trunk role described above no longer applies.
- **Patch releases for doc-only fixes (2026-07-16)**: the Bundlephobia bundle-size badge in both READMEs rendered broken (upstream rate-limiting on first-time package analysis, confirmed not Angular-specific by reproducing the same failure on `primeng`; Packagephobia was tried as a replacement but sits behind a Vercel bot-detection wall) and was removed. Both lines' READMEs also had a stale StackBlitz playground link, corrected per line. Each fix shipped as its own patch — `20.0.1` (badge removal) → `20.0.2` (StackBlitz link) on `master`/`develop`-then-`master`, and `12.0.1` (badge removal) → `12.0.2` (StackBlitz link) on `12.x` — since the README ships inside the published npm tarball and isn't retroactively updatable. Registry confirmed: `latest → 20.0.2`, `v12 → 12.0.2`. Tags `v20.0.1`, `v20.0.2`, `v12.0.1`, `v12.0.2` created and pushed; all four have GitHub Releases (`20.0.2` marked Latest).

# Citations

[1] Branch policy brief provided by the maintainer, 2026-07-06 (no linkable artifact; this concept is its canonical home).

[2] Version-line strategy detailed by the maintainer during the Angular 20 upgrade sessions, 2026-07-05 — see also [Angular 20 Upgrade Pitfalls](../lessons/angular-20-upgrade.md).

[3] Per-line TypeScript dialect floors verified against the [official Angular compatibility table](https://angular.dev/reference/versions) and npm's published `typescript` release history, 2026-07-06 — see also [`refactor-core-adapter-architecture`](../../openspec/changes/refactor-core-adapter-architecture/design.md).
