# Design: adapt-12x-line

> **Branch scope**: committed, worked, and archived exclusively on the `12.x` branch.

## Context

The `12.x` branch is cut from `develop` and therefore starts as the full Angular 20 workspace: zoneless, signal-based `adapter/`, Vitest unit tests, Playwright e2e via the `ng e2e` builder, plus the `build12/` reference snapshot and the framework-agnostic `core/` engine. The library's public API surface (parity contract) is: selector `ngx-fast-marquee`; inputs `direction`, `speed`, `autoFill`, `play`, `maskPercentage`, `maskStartPercentage`, `maskEndPercentage`, `pauseOnHover`, `pauseOnClick`, `useSystemReducedMotion`; outputs `mounted`, `updated`; plus `NgxFastMarqueeModule` and `provideFastMarquee()`.

## Goals / Non-Goals

**Goals:**

- A self-contained Angular 12 workspace that builds `ngx-fast-marquee@12.0.0` with full template-level API parity.
- Behavior parity proven by the existing black-box e2e suite, unmodified.
- Branch-local docs/knowledge accurate for this line.

**Non-Goals:**

- Any change on `develop`/`master`; publishing, dist-tags, branch protection, CI/CD, retirement machinery; feature work.

## Decisions

### D1 — Convert the workspace in place; use `build12/` only as toolchain reference

Downgrade the root workspace (`package.json` deps to `~12.0.x` + TS `~4.2.3`, `angular.json` to the v12 builder set, Karma/Jasmine configs, `.browserslistrc`) using `build12/`'s config files as the reference shape. Do **not** copy `build12/`'s library or app source: its library predates the behavior contract (old inputs/services architecture) and would silently violate parity. The demo app's e2e scenario surface (routes, fixtures, `fileReplacements` scenarios) is ported from the current `src/` to NgModule/decorator idioms, since the e2e suite is the acceptance gate and drives against those pages. `fileReplacements` is supported by the v12 browser builder, so the scenario mechanism carries over.

### D2 — Toolchain hosting: Node 14 via fnm; e2e keeps modern Node

Angular CLI 12 requires Node `^12.14 || ^14.15` and breaks on Node 17+ (webpack/OpenSSL-3 hash errors). This branch pins a Node 14 toolchain (fnm-installed, recorded in `engines` and a version file) for `ng build`/`ng test`. The Playwright e2e runner stays on modern Node — it is framework-independent and only needs an HTTP endpoint; the Docker compose setup already isolates runtimes per container. **Alternative rejected — `NODE_OPTIONS=--openssl-legacy-provider` on Node 22**: fragile, unsupported by the CLI's engines check, and misrepresents what consumers of the line actually run. Installing Node 14 and the v12 dependency set is confirmation-gated per [guardrails](../../../knowledge/guardrails.md).

### D3 — Library adaptation

- **`core/` (unchanged logic, dialect-verified)**: same engine source inherited from the branch point. Audit found no post-4.2 syntax except `??=` (TS 4.0 — fine); rule A1 (no `@angular/*`/rxjs imports) still applies. Mechanical enforcement mirrors A2: a `typescript-12x-floor` npm alias pinned to `4.2.3`, a `tsconfig.core-dialect.json`, and a `check:core-dialect` script on this branch.
- **`adapter/` (rewritten for Angular 12 idioms)**: `@Component` with OnPush; plain `@Input()` properties + `ngOnChanges` feeding the same computed-value functions from `core/`; host bindings (`@HostBinding`/`host` metadata) applying the same `data-*` attributes and `--_*` CSS custom properties the 20.x adapter binds; `@Output() mounted/updated = new EventEmitter<void>()`; `ngAfterViewInit` + `isPlatformBrowser` replaces `afterNextRender`; `ngOnDestroy` replaces `DestroyRef`. The component is non-standalone, declared and exported by `NgxFastMarqueeModule`.
- **`provideFastMarquee()`**: returns a `Provider[]` containing a `multi: true` `APP_INITIALIZER` that runs the idle-callback guard — registrable in a root `NgModule`'s `providers`. `NgxFastMarqueeModule` registers the same initializer so NgModule consumers get the guard automatically (parity with the existing spec requirement).
- **`public-api.ts`** keeps the exact same four exports; template/SCSS carried over with v12 syntax (`*ngIf`/`*ngFor` instead of `@if`/`@for`).

### D4 — Unit tests port to Jasmine/Karma

`core/` specs are TestBed-free and port nearly verbatim (swap `vi.fn`/`vi.useFakeTimers` for `jasmine.createSpy`/`jasmine.clock()`); adapter specs are rewritten as Angular 12 TestBed specs. Convention 14 (no test seams in runtime code) applies unchanged.

### D5 — Acceptance gate: the existing black-box e2e suite passes unmodified

The Playwright suite runs unchanged (scenarios, assertions, fixtures) against the Angular 12 demo app build. Wiring: standalone Playwright invocation from `e2e/` on modern Node targeting the served v12 app (Docker compose preferred, with the app container on Node 14 and the Playwright container on modern Node), since the `ng e2e` Playwright builder does not exist in CLI 12. Only wiring may change — assertion changes would re-open the locked contract.

### D6 — Lint tooling at this line's floor

`@angular-eslint@12` + TS-4.2-compatible `@typescript-eslint` replace the v20-tracking config on this branch (convention 9 applied at the line's own floor). The 20.x-specific signal/zoneless lint rules (A6 allowlist, `prefer-signals`, etc.) do not apply here; the A1 `no-restricted-imports` override for `core/**` is kept. Prettier and Husky remain as-is (version-agnostic).

### D7 — Version identity (confirmation-gated)

Library `version` `12.0.0`, `peerDependencies` `@angular/common`/`@angular/core` `>=12.0.0 <20.0.0` (superseding the snapshot's `^12.0.5`), README Angular-compatibility table listing both lines. The implementing agent stops for explicit maintainer confirmation at these tasks even though this change directs them.

### D8 — Branch hygiene at the start of apply

First tasks on this branch: commit this change's artifacts (they arrive untracked in the working tree from the trunk session) and delete the inherited in-progress copy of `openspec/changes/adopt-two-line-branch-model/` — its authoritative home is `develop`.

## Risks / Trade-offs

- **[Old toolchain on a modern machine]** npm dependency resolution or native builds may fail for 2021-era packages → pin via the committed `package-lock.json` from `build12/` as starting point, Node 14 via fnm, and prefer `npm ci`-style installs; escalate to the maintainer if a transitive dep is unresolvable.
- **[Behavioral drift from zone-based change detection]** `ngOnChanges`/zone.js timing differs from signal propagation, risking extra or missed `updated` emissions → the deduplicated cycle-commit callback lives in `core/` (shared), and the e2e lifecycle scenarios are the gate; fix in the adapter until the suite passes.
- **[e2e harness assumptions]** the suite or its fixtures may assume dev-server behavior of the v20 builder (ports, paths, live-reload endpoints) → keep scenario URLs/config parametric; adjust only e2e wiring, never assertions.
- **[Parity mirror drift]** the parity requirement in this branch's spec must stay identical to the trunk's mirror → both changes copy the same requirement block; the knowledge-bundle rule instructs future edits to update both mirrors together.
- **[ng-packagr 12 output consumed by Angular 13–19]** partial-Ivy compilation from v12 must link in all supported consumer majors → `"compilationMode": "partial"` in `tsconfig.lib.prod.json` (as in the `build12/` reference) and a smoke-check of the packed output; escalate if a consumer major cannot link it.

## Migration Plan

Task order: (1) branch hygiene (commit artifacts, remove inherited trunk change copy); (2) workspace conversion; (3) library adaptation; (4) tests; (5) docs/knowledge; (6) verification and archive — all on `12.x`. Rollback: the branch can be deleted and re-cut from `develop`'s branch-point commit at any time; nothing here touches other branches.

## Open Questions

- Exact Node 14 patch version to pin (resolve at apply time from fnm's available builds; any `^14.15` works).
- Whether the demo app ports all demo pages or only the e2e scenario surface (default: scenario surface only; extend later if the docs site ever serves v12 — currently non-goal).
