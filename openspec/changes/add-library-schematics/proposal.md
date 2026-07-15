# Proposal: add-library-schematics

## Why

Installing [`ngx-fast-marquee`](../../../projects/ngx-fast-marquee/README.md) today is a manual two-step: install the package, then hand-edit the app config to register `provideFastMarquee()`. That second step is the one consumers forget — and it is not optional decoration: it is the guard that prevents the Safari/iOS `@defer` idle-callback crash ([angular/angular#53721](https://github.com/angular/angular/issues/53721)), which only bites at runtime on real devices. An `ng add` schematic automates exactly the step people skip. Registering the `ng update` migration collection now (empty) is cheap plumbing that lets future major bumps on the `20.x` line ship consumer-code migrations without a packaging change.

## What Changes

- **`ng add ngx-fast-marquee` schematic**: installs the package as a dependency and inserts `provideFastMarquee()` into the target project's root providers (standalone `app.config.ts` bootstrap or NgModule-based root module). When the workspace shape is not recognized, it makes no code edit and prints the manual setup instructions from the [README](../../../projects/ngx-fast-marquee/README.md) instead of failing.
- **`ng update` migration collection**: the published package registers an empty migration collection under `ng-update`, so `ng update ngx-fast-marquee` resolves from the first release that carries it; actual migrations land with future breaking changes.
- **Schematics build step**: `pnpm build:lib` gains a step that compiles the schematics (ng-packagr does not) and copies the collection JSON files into `dist/ngx-fast-marquee/`, so the published artifact carries them.
- **Docs**: library README gains `ng add` as the primary install path (manual install retained as fallback; consumer instructions stay package-manager-neutral); affected `AGENTS.md` files and the knowledge bundle updated per conventions.
- **Scope**: `20.x` line (`develop`) only. The `12.x` line keeps manual setup documented; per branch policy it takes critical fixes only.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `library`: adds an installation-schematic requirement (`ng add` wires `provideFastMarquee()`, with a safe manual-instructions fallback) and a migration-collection requirement (published package resolves `ng update ngx-fast-marquee`, collection may be empty).

## Impact

- **Library packaging**: [`projects/ngx-fast-marquee/package.json`](../../../projects/ngx-fast-marquee/package.json) gains `schematics` and `ng-update` entries (no version or peerDependencies change in this proposal; release versioning is decided separately per the two-line policy).
- **New source tree**: `projects/ngx-fast-marquee/schematics/` (collection JSON, `ng-add` factory + schema, empty `migrations.json`, own `tsconfig`, tests).
- **Workspace tooling**: root [`package.json`](../../../package.json) gains devDependencies for schematic authoring/testing (`@angular-devkit/schematics`, `@schematics/angular` at the Angular 20 major) and an updated `build:lib` script; a test script covers the schematics.
- **Docs**: [`projects/ngx-fast-marquee/README.md`](../../../projects/ngx-fast-marquee/README.md) (confirmation-gated per [guardrails](../../../knowledge/guardrails.md)), [`projects/ngx-fast-marquee/AGENTS.md`](../../../projects/ngx-fast-marquee/AGENTS.md), root [`AGENTS.md`](../../../AGENTS.md), [`knowledge/log.md`](../../../knowledge/log.md).
- **Out of scope**: any real migration content, the `12.x` branch, npm publishing, generation (`ng generate`) schematics.
