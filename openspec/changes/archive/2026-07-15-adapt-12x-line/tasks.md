# Tasks: adapt-12x-line

**Run every task on the `12.x` branch.** Tasks marked **(confirm)** are confirmation-gated per [guardrails](../../../knowledge/guardrails.md) — stop and get explicit maintainer approval before executing, even though this change directs them. Tasks marked **(user/remote)** perform git-remote actions and run only on explicit request.

## 1. Branch hygiene

- [x] 1.1 On `12.x`: commit this change's artifacts (`openspec/changes/adapt-12x-line/`) — they arrive untracked in the working tree
- [x] 1.2 Delete the inherited in-progress copy of `openspec/changes/adopt-two-line-branch-model/` (its authoritative home is `develop`)

## 2. Workspace conversion

- [x] 2.1 **(confirm)** Pin the Node 14 toolchain: `fnm install` a `^14.15` version, record it in a version file and root `package.json` `engines`
- [x] 2.2 **(confirm)** Replace root workspace config with the Angular 12 toolchain using `build12/` files as reference shape: `package.json` deps (`~12.0.x`, TS `~4.2.3`, `ng-packagr@^12`, Karma/Jasmine set, `tslib ^2.1.0`, and reintroduced `rxjs ~6.6.0` + `zone.js ~0.11.4` — Angular 12 requires both; the repo's zoneless/no-zone.js convention is 20.x-branch-scoped and does not apply here, though rxjs stays banned inside `core/**` per rule A1), `angular.json` (v12 builders, `fileReplacements` scenarios preserved), root `tsconfig*.json`, `karma.conf.js`, `.browserslistrc`; seed `package-lock.json` from `build12/` and install
- [x] 2.3 **(confirm)** Replace workspace ESLint with `@angular-eslint@12` + compatible `@typescript-eslint`; keep the A1 `no-restricted-imports` override for `core/**`; drop 20.x-only signal/zoneless rules; keep Prettier/Husky unchanged
- [x] 2.4 Port the demo app's e2e scenario surface in `src/` to Angular 12 NgModule/decorator idioms (bootstrap module, routes, scenario fixtures via `fileReplacements`)
- [x] 2.5 Delete the `build12/` folder (reference fully consumed) and update root `AGENTS.md`/child AGENTS on this branch
- [x] 2.6 Verify `ng build` (app) succeeds under Node 14

## 3. Library adaptation

- [x] 3.1 Add the 12.x core-dialect enforcement: `typescript-12x-floor` npm alias pinned to `4.2.3`, `projects/ngx-fast-marquee/tsconfig.core-dialect.json`, and a `check:core-dialect` script; fix any `core/**` syntax the 4.2.3 compiler rejects (audit found only `??=`, which TS 4.0 supports)
- [x] 3.2 Rewrite `adapter/` for Angular 12: OnPush `@Component` (non-standalone) with `@Input()` properties + `ngOnChanges` driving `core/` computations; host `data-*` attributes and `--_*` CSS custom properties bound to the same values as the 20.x adapter; `@Output() mounted`/`updated` `EventEmitter<void>`; `ngAfterViewInit` + `isPlatformBrowser` for mount/engine boot; `ngOnDestroy` for teardown
- [x] 3.3 Implement `NgxFastMarqueeModule` (declares + exports the component, registers the idle-callback-guard initializer) and `provideFastMarquee()` returning an `APP_INITIALIZER` `multi: true` `Provider[]`
- [x] 3.4 Keep `public-api.ts` exports identical (`Direction`, `Speed`, component, module, provider function); carry over the component template/SCSS with v12-syntax adjustments (`*ngIf`/`*ngFor` instead of `@if`/`@for`)
- [x] 3.5 **(confirm)** Set library `version` to `12.0.0` and `peerDependencies` to `>=12.0.0 <20.0.0` in `projects/ngx-fast-marquee/package.json` — guardrail-gated
- [x] 3.6 Verify `ng build ngx-fast-marquee` succeeds with `"compilationMode": "partial"` (partial Ivy, linkable by Angular 12–19 consumers) and inspect the `npm pack` output (entry points, no stray files)

## 4. Tests

- [x] 4.1 Port `core/**` specs from Vitest to Jasmine/Karma (`jasmine.createSpy`, `jasmine.clock()`; no TestBed) and get `ng test ngx-fast-marquee` green
- [x] 4.2 Rewrite adapter specs as Angular 12 TestBed specs covering module declaration, input reactivity via `ngOnChanges`, output emissions, and the provider function
- [x] 4.3 **(confirm)** Wire the black-box Playwright e2e suite to run against the v12 app: standalone Playwright on modern Node (no `ng e2e` builder in CLI 12), preferably via Docker compose with the app container on Node 14 and the Playwright container on modern Node — e2e wiring only, assertions and scenarios stay untouched; infra edits (`docker-compose.e2e.yml`, e2e support scripts) are guardrail-gated
- [x] 4.4 Run the full e2e behavior-contract suite against the `12.x` build until every scenario passes (acceptance gate)

## 5. Documentation and knowledge

- [x] 5.1 **(confirm)** Update the library README on this branch: Angular-compatibility table (both lines), NgModule + `provideFastMarquee()` usage for Angular 12, template-parity note (class surface out of contract)
- [x] 5.2 Update `AGENTS.md` files (root, `src/`, library, `e2e/`) for the v12 toolchain, commands, and branch role; adjust `knowledge/` conventions references that are 20.x-specific (Angular idioms convention applies per-branch)
- [x] 5.3 Append the `12.x`-side entry to `knowledge/log.md` and sync `knowledge/decisions/branch-model-version-lines.md` current-state on this branch

## 6. Final verification

- [x] 6.1 `check:core-dialect`, lint, unit tests, app + lib builds, and the full e2e suite all pass; no orphaned dev-server processes/ports left (convention 6)
- [x] 6.2 Validate with `openspec validate adapt-12x-line` and archive this change on `12.x` via `/opsx:archive` (sync adds the three requirements to this branch's `openspec/specs/library/library.spec.md`)
