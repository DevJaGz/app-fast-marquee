# Proposal: adapt-12x-line

> **Branch scope**: this change lives exclusively on the `12.x` branch — it is committed, worked, and archived there, never on `develop`/`master`, per the branch-local OpenSpec workflow defined by `adopt-two-line-branch-model` (the trunk-side sibling change).

## Why

The [branch-model and two-version-line decision](../../../knowledge/decisions/branch-model-version-lines.md) requires a Patchable `12.x` line: `ngx-fast-marquee@12.0.0` for Angular 12–19 consumers, built as a decorator/NgModule adapter over the line's own copy of the framework-agnostic `core/` engine. The `12.x` branch (cut from `develop` by `adopt-two-line-branch-model`) starts as a copy of the Angular 20 workspace; this change converts it into a self-contained Angular 12 workspace whose library honors the locked behavior contract and the cross-line API-parity requirement.

## What Changes

- **Workspace conversion** — the branch becomes a self-contained Angular 12 workspace: Node `^14.15` toolchain, Angular `~12.0.x`, TypeScript `~4.2.3`, `ng-packagr@^12`, Karma/Jasmine test runner, reintroduced `rxjs ~6.6.0` + `zone.js ~0.11.4` (Angular 12 requires both; the zoneless convention is 20.x-branch-scoped), v12-compatible lint tooling. The `build12/` folder is the *toolchain reference* (CLI config, builders, tsconfig shapes) — **not** an API or source reference, since its library predates the behavior contract — and is deleted once consumed.
- **Library adaptation** — `projects/ngx-fast-marquee` keeps its own `core/` copy dialected to TypeScript `4.2.3` (mechanically enforced), and replaces the signal-based `adapter/` with a decorator/NgModule adapter (`@Input()`/`@Output()`/`ngOnChanges`, non-standalone component, `NgxFastMarqueeModule`, `provideFastMarquee()` returning an `APP_INITIALIZER` provider array) exposing the identical template-level binding surface.
- **Version identity** — library `version` `12.0.0`, `peerDependencies` `>=12.0.0 <20.0.0` per the major-equals-Angular-floor rule (confirmation-gated).
- **Tests** — unit tests port to Jasmine/Karma; the black-box Playwright e2e behavior-contract suite runs unchanged against the Angular 12 build as the acceptance gate.
- **Documentation** — README (compat table, NgModule usage), `AGENTS.md` files, and the knowledge bundle updated on this branch; the stale inherited copy of the trunk-side change directory is removed.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `library`: adds the 12.x-specific requirements — Angular 12 consumption model and the TypeScript 4.2.3 core dialect floor — plus the mirrored cross-line Two-Version-Line Template API Parity requirement (identical text to the trunk-side mirror, per the branch-local OpenSpec workflow).

## Impact

- **Branch**: `12.x` only.
- **Code**: root workspace config (`package.json`, `angular.json`, `tsconfig*.json`, `karma.conf.js`, `.browserslistrc`), `projects/ngx-fast-marquee/src/core/**` (dialect pass), `projects/ngx-fast-marquee/src/adapter/**` (decorator/NgModule rewrite), `src/` demo app (Angular 12 port of the e2e scenario surface), `e2e/` runner wiring, `build12/` (deleted after consumption).
- **Library identity**: `projects/ngx-fast-marquee/package.json` `version`/`peerDependencies`, README compatibility table — confirmation-gated per [guardrails](../../../knowledge/guardrails.md).
- **Out of scope**: anything on `develop`/`master` (see `adopt-two-line-branch-model` there), npm publishing, dist-tags, branch protection, CI/CD workflows, retirement machinery.
