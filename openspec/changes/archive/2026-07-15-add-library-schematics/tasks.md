# Tasks: add-library-schematics

## 1. Workspace tooling

- [x] 1.1 Add `@angular-devkit/schematics` and `@schematics/angular` (both `^20.x`, matching the installed `@angular/cli` major) to the root `package.json` devDependencies and install with `pnpm install`
- [x] 1.2 Scaffold `projects/ngx-fast-marquee/schematics/` — `collection.json` declaring `ng-add`, empty `migrations.json` (`{"schematics": {}}`), `ng-add/schema.json` (project option), and `tsconfig.schematics.json` (CommonJS, node module resolution, `outDir` → `dist/ngx-fast-marquee/schematics`, spec files excluded)

## 2. ng-add schematic

- [x] 2.1 Implement `ng-add/index.ts`: resolve the target project, no-op with an informational log when `provideFastMarquee` is already registered, otherwise delegate the provider insertion to `addRootProvider` from `@schematics/angular/utility` (imports `provideFastMarquee` from `ngx-fast-marquee`)
- [x] 2.2 Implement the fallback path: any resolution/edit failure logs the README's manual `provideFastMarquee()` setup instructions through the schematic context logger, leaves the tree unchanged, and completes without error
- [x] 2.3 Wire library packaging fields in `projects/ngx-fast-marquee/package.json`: `"schematics": "./schematics/collection.json"`, `"ng-add": {"save": "dependencies"}`, `"ng-update": {"migrations": "./schematics/migrations.json"}`

## 3. Build integration

- [x] 3.1 Add a Node copy script (`.mjs`, Windows-safe) that copies `collection.json`, `migrations.json`, and `ng-add/schema.json` into `dist/ngx-fast-marquee/schematics/` after the schematics `tsc` compile
- [x] 3.2 Update root `package.json` scripts: `build:lib` runs the ng-packagr build, then the schematics `tsc` compile, then the copy script
- [x] 3.3 Run `pnpm build:lib` and verify the dist artifact: compiled `ng-add/index.js` plus all three JSON files present under `dist/ngx-fast-marquee/schematics/`, and the dist `package.json` still carries the `schematics`, `ng-add`, and `ng-update` fields (D4 risk check)

## 4. Tests

- [x] 4.1 Add a schematics Vitest config (node environment, no jsdom) and a root `test:schematics` package script (run as `pnpm test:schematics`)
- [x] 4.2 Write `ng-add/index.spec.ts` with `SchematicTestRunner` covering the spec scenarios: standalone app-config insertion, NgModule root-module insertion, idempotent re-run, and unrecognized-shape fallback (no edit, logged instructions, successful completion)
- [x] 4.3 Add a test resolving the empty `migrations.json` collection to confirm `ng update` sees zero migrations without error

## 5. Documentation and knowledge base

- [x] 5.1 Update `projects/ngx-fast-marquee/README.md` with the `ng add ngx-fast-marquee` install path (manual install retained) — **confirmation-gated per guardrails; ask the user before editing**
- [x] 5.2 Update `projects/ngx-fast-marquee/AGENTS.md` (schematics tree, build/test commands) and root `AGENTS.md` (new `test:schematics` command row, `build:lib` description) per the auto-update convention
- [x] 5.3 Append the change to `knowledge/log.md`; update any knowledge page that records the library's packaging/publishing behavior if one covers it

## 6. Verification gate

- [x] 6.1 Run `pnpm lint`, `pnpm format`, `pnpm test:lib`, `pnpm test:schematics`, and `pnpm build:lib` — all green
- [x] 6.2 Smoke-test end-to-end: `pnpm pack` the dist artifact and run `ng add` from the tarball in a scratch Angular 20 standalone app outside the repo; verify `provideFastMarquee()` lands in `app.config.ts`
