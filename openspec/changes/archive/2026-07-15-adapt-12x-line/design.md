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

**Amendment (discovered at apply time): zone.js 0.11.4 doesn't reliably patch `requestIdleCallback`/`ResizeObserver`/`MutationObserver`.** The engine's `onMeasured`/`onUpdated` callbacks (invoked by `core/` from `requestAnimationFrame` chained off these APIs) and a consumer's own idle-callback usage can execute *outside* the Angular zone. `ChangeDetectorRef.markForCheck()` alone then marks the view dirty without anything triggering the next tick to flush it — the state updates internally (verified via Angular DevTools' `ng.getComponent()`) but never reaches the DOM until some *unrelated* zone-tracked event (a click, another timer) incidentally triggers a global tick. This reproduced identically in a real browser and in Angular 12 TestBed, and is unrelated to `OnPush` (a `Default`-strategy component showed the same staleness). Fix: `NgxFastMarqueeComponent`'s `onMeasured`/`onUpdated`/reduced-motion-source callbacks, and `src/app/home/home.component.ts`'s idle-callback handler, wrap their bodies in `NgZone.run(...)`, which unconditionally schedules a tick regardless of which zone invoked the callback. This is a real behavioral fix in the adapter (not core/, which stays framework-agnostic), not merely a test workaround — see [`adapter/AGENTS.md`](../../../projects/ngx-fast-marquee/src/adapter/AGENTS.md).

### D4 — Unit tests port to Jasmine/Karma

`core/` specs are TestBed-free and port nearly verbatim (drop the `vitest` import — Jasmine's `describe`/`it`/`expect` are ambient — and swap `vi.fn`/`vi.useFakeTimers` for `jasmine.createSpy`/real async waits). Convention 14 (no test seams in runtime code) applies unchanged.

**Amendment (discovered at apply time): Karma runs a real browser, not jsdom.** `karma-chrome-launcher`'s plain `Chrome` opens an unfocused window that throttles/pauses `requestAnimationFrame`, which the engine's flush cycle depends on — use `ChromeHeadless` instead. Real layout also means an unstyled test host has real, non-zero dimensions (unlike jsdom's implicit zero-size), so `marquee-engine.spec.ts`'s harness mocks `getBoundingClientRect` and adapter-spec hosts constrain `<ngx-fast-marquee>`'s width explicitly.

**Amendment (discovered at apply time): a `ComponentFixture` whose root view is itself `OnPush` doesn't reliably re-check on a second `detectChanges()` call for a plain (non-event-driven) property mutation**, in this Angular 12.0.x–12.2.x + zone.js 0.11.4 combination — confirmed in isolation against a trivial, unrelated component (verified with `autoDetectChanges()` too, and independent of the Angular 12 patch version). `NgxFastMarqueeComponent` itself stays `OnPush` (that's real, tested behavior — Angular 12 TestBed's `fixture.detectChanges()` does correctly force-check the *child's* own view when its `@Input`s change via a `Default`-strategy parent). Adapter-spec test hosts (`RawHostComponent`, `ModuleHostComponent`) are therefore `Default` change detection, not `OnPush` — a test-fixture-only choice with no bearing on production consumers, whose own root uses whatever strategy their app picks.

### D5 — Acceptance gate: the existing black-box e2e suite passes unmodified

The Playwright suite runs unchanged (scenarios, assertions, fixtures) against the Angular 12 demo app build. Wiring: standalone Playwright invocation from `e2e/` on modern Node targeting the served v12 app (Docker compose preferred, with the app container on Node 14 and the Playwright container on modern Node), since the `ng e2e` Playwright builder does not exist in CLI 12. Only wiring may change — assertion changes would re-open the locked contract.

**Amendment (discovered at apply time): no `no-idle-guard` scenario on this line.** Under Ivy, a component's declaring `NgModule` is fixed at compile time — a component declared by `NgxFastMarqueeModule` cannot be re-declared in a consumer's own module, even against the pre-built `dist/` package (`NG6007: declared by more than one NgModule`). Since `NgxFastMarqueeModule` always bundles `provideFastMarquee()` in its own `providers` (D3), there is no way to construct a "guard absent" build on this line at all. Separately, the upstream bug the scenario reproduces (`angular/angular#53721`) is specific to Angular's own `@defer (on idle)` `IdleScheduler`, which does not exist in Angular 12 — so the crash cannot occur here by construction, independent of the guard. Resolution: the `no-idle-guard` scenario (build config, serve config, fixture module, `NO_IDLE_GUARD_APP_URL` server) is omitted on this branch; `e2e/tests/idle-callback-guard.spec.ts`'s crash-reproduction sub-test is wrapped in its own `test.describe` and skipped with a documented reason, while its guarded sub-test (default app) stays unmodified and passes. This is wiring (whether the sub-test runs), not an assertion change. See [`e2e/AGENTS.md`](../../../e2e/AGENTS.md) and [`knowledge/decisions/idle-callback-guard.md`](../../../knowledge/decisions/idle-callback-guard.md).

### D6 — Lint tooling at this line's floor

`@angular-eslint@12` + TS-4.2-compatible `@typescript-eslint` replace the v20-tracking config on this branch (convention 9 applied at the line's own floor). The 20.x-specific signal/zoneless lint rules (A6 allowlist, `prefer-signals`, etc.) do not apply here; the A1 `no-restricted-imports` override for `core/**` is kept. `@angular-eslint/template/accessibility` is dropped from `.eslintrc.json`'s HTML override — that composed config doesn't exist in `@angular-eslint@12.7.0` (added in a later major).

**Amendment (discovered at apply time): Prettier is not version-agnostic here.** Prettier `^3.1.0` is ESM-first and dropped `resolveConfig.sync`; `eslint-plugin-prettier@4.2.1` (the version compatible with ESLint 7/`@angular-eslint@12`) calls that synchronous API, crashing under Node 14. Prettier is downgraded to `^2.8.8` on this branch — a toolchain necessity, not a behavior change; formatting output is materially the same. The unused `prettier-eslint` devDependency (referenced by no script) is dropped rather than chasing its own Prettier-3 compatibility.

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
