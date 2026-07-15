# Design: add-library-schematics

## Context

`ngx-fast-marquee` is packaged with ng-packagr (`pnpm build:lib` → `dist/ngx-fast-marquee/`). The `20.x` line (`develop`, later `master`) uses **pnpm** as its package manager — all repo-side commands in this change are pnpm commands. Correct consumption requires registering `provideFastMarquee()` at bootstrap — the guard for the Safari/iOS `@defer` idle-callback crash ([angular/angular#53721](https://github.com/angular/angular/issues/53721)) — which today is a manual README step. Angular's CLI offers two package-level hooks this change adopts: the `ng add` schematic (post-install setup) and the `ng update` migration collection (cross-version code migrations). ng-packagr does not compile schematics; every library that ships them (Material, CDK, etc.) compiles them in a sidecar step and copies the JSON metadata into the dist artifact.

Constraints: `20.x` line only (`develop`); the template-level API parity contract with the `12.x` line is untouched because schematics add no template surface; per repo guardrails, README/version/peerDependencies edits are confirmation-gated and version bumps are decided at release time, not here.

## Goals / Non-Goals

**Goals:**

- `ng add ngx-fast-marquee` installs the package and wires `provideFastMarquee()` for standalone and NgModule bootstrap shapes, idempotently, with a safe manual-instructions fallback.
- `ng update ngx-fast-marquee` resolves an (initially empty) migration collection from the published artifact.
- Schematics are compiled and shipped inside `dist/ngx-fast-marquee/` by `pnpm build:lib` with no separate command for the publisher to remember.

**Non-Goals:**

- No actual migration content (lands with the first breaking change that needs one).
- No `ng generate` scaffolding schematics — the component's usage is a one-line element tag; nothing to scaffold.
- No schematics on the `12.x` line (critical fixes only per branch policy; manual setup stays documented there).
- No npm publish/dist-tag work.

## Decisions

### D1 — Use `addRootProvider` from `@schematics/angular/utility` for the code edit

The ng-add factory calls the CLI's own `addRootProvider(project, ({ code, external }) => code`${external('provideFastMarquee', 'ngx-fast-marquee')}()`)`. This single utility handles both standalone app-config and NgModule root-module projects, produces the import statement, and is the API Angular maintains for exactly this purpose.

- *Alternative — hand-rolled TypeScript AST edits*: full control, but re-implements bootstrap-shape detection the CLI already ships, and is the part most likely to break across CLI minors. Rejected.
- *Fallback behavior*: the factory wraps the edit in a guard — if the project cannot be resolved or `addRootProvider` throws (unrecognized shape), it logs the README's manual setup steps via the schematic context logger and returns the tree unchanged, so `ng add` never hard-fails on an exotic workspace.
- *Idempotency*: before editing, the factory checks whether the target file already contains a `provideFastMarquee` call and no-ops with an informational log if so.

### D2 — Resolve `@schematics/angular` from the consumer workspace; do not add it to the library's dependencies

`ng add` and `ng update` always execute inside a workspace driven by `@angular/cli`, which depends on `@schematics/angular`, so the import resolves at execution time. Adding it to the library's `dependencies` would drag CLI tooling into every consumer's production install for code that only runs during `ng add`. The workspace root `package.json` gains `@angular-devkit/schematics` and `@schematics/angular` (both at the `^20.x` major, matching the installed CLI, per the lint/tooling-floor convention pattern) as devDependencies for authoring and testing.

- *Risk accepted*: strict package managers with isolated node_modules (pnpm without hoisting — including this repo's own workspace) could fail to resolve the transitive import; the schematic tests exercise resolution in this workspace, and the consumer-side mitigation is in Risks.

### D3 — Schematics source lives at `projects/ngx-fast-marquee/schematics/`, compiled by a sidecar `tsc` step

Layout:

```
projects/ngx-fast-marquee/schematics/
  collection.json          # declares ng-add
  migrations.json          # empty migration collection ({"schematics": {}})
  ng-add/
    index.ts               # factory
    schema.json            # ng-add options (project name)
    index.spec.ts          # SchematicTestRunner tests
  tsconfig.schematics.json # CommonJS, node types, outDir dist/ngx-fast-marquee/schematics
```

`pnpm build:lib` becomes `ng build ngx-fast-marquee` followed by a schematics step: `tsc -p projects/ngx-fast-marquee/schematics/tsconfig.schematics.json` plus a small Node copy script for the JSON files (`collection.json`, `migrations.json`, `schema.json`) into `dist/ngx-fast-marquee/schematics/`. The copy script is Node (`.mjs`), not shell, so it behaves identically on Windows and in CI. Spec files are excluded from the schematics tsconfig build.

- *Alternative — ng-packagr `assets` option*: ng-packagr 20 can copy assets but does not compile TS; a tsc step is needed regardless, so the copy stays in the same sidecar script for one moving part.

### D4 — Library `package.json` wiring

[`projects/ngx-fast-marquee/package.json`](../../projects/ngx-fast-marquee/package.json) gains:

```json
"schematics": "./schematics/collection.json",
"ng-add": { "save": "dependencies" },
"ng-update": { "migrations": "./schematics/migrations.json" }
```

`ng-add.save: "dependencies"` makes the CLI record the package under `dependencies` (it is runtime code). ng-packagr copies unrecognized top-level `package.json` fields through to the dist artifact; task verification confirms the three fields survive the build.

### D5 — Test schematics with `SchematicTestRunner` under Vitest via a dedicated npm script

Tests use `SchematicTestRunner` from `@angular-devkit/schematics/testing` against in-memory trees shaped like standalone and NgModule workspaces, covering the four ng-add spec scenarios plus empty-collection resolution. The library's existing `test:lib` target compiles through the Angular `test-build` architect target, which is wrong for CommonJS node-side code, so schematics get their own Vitest config (node environment, no jsdom, no Angular builder) and a root `test:schematics` package script run via pnpm. This follows production-first testing: tests drive the schematic's public entry point; no test seams in the factory.

## Risks / Trade-offs

- [`addRootProvider` behavior shifts across CLI minors] → devDependency pinned to the workspace's own `^20.x` range; scenario tests run against that exact version so a drift breaks CI, not consumers first.
- [`@schematics/angular` not resolvable in isolated-node_modules consumer setups] → accepted for v1 (matches common ecosystem practice); if reported, vendor the few utility calls or declare an explicit dependency in a patch release.
- [ng-packagr strips the new `package.json` fields] → verified by a build-output check in tasks; if stripped, fall back to writing the fields via ng-packagr's dist-package customization or the copy script.
- [Schematic edits a user file incorrectly on exotic bootstrap code] → the factory only ever delegates the edit to the CLI utility; anything it cannot parse takes the no-edit fallback path with printed instructions.

## Migration Plan

Additive, consumer-opt-in: existing installs are untouched; new consumers may keep using manual `npm install` + provider registration (README retains it). Rollback is removing the `schematics`/`ng-add`/`ng-update` fields and the sidecar build step. Publishing the first version carrying schematics is a release-time decision (minor bump on the `20.x` line, confirmation-gated per guardrails).

## Open Questions

- None blocking. Whether the README makes `ng add` the primary install path or a co-equal alternative is a wording choice made at the docs task (README edits are confirmation-gated anyway).
