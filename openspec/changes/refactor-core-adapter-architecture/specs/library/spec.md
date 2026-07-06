# Delta for Library capability — ngx-fast-marquee

> The marquee's feature behavior (direction, speed, masks, auto-fill, pausing, outputs, re-measurement) is specified and e2e-locked by the prerequisite [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) change. This delta covers only the source architecture; the refactor preserves that behavior contract (its e2e suite stays green).

## ADDED Requirements

### Requirement: Core/Adapter Source Architecture

The library source SHALL be split into a pure-TypeScript engine (`core/`) and a thin Angular shell (`adapter/`), joined by the `public-api.ts` entry point. `core/` SHALL contain every cross-line behavior — measurement, duplication math and duplication DOM writes, animation-value computation, and the reduced-motion policy source — and SHALL NOT import from `@angular/*` or `rxjs` (rule A1). Each version line's `core/` copy SHALL type-check under the minimum TypeScript version required by that line's own Angular floor — not a single shared or lowest-common floor across lines — so each line's `core/` can use the best language features available at its own floor; grammar newer than a line's own floor is banned in that line's `core/` only, while `adapter/`, application, and test code remain unconstrained (rule A2). Verified against the official Angular compatibility table: the `20.x` line's Angular-20 floor requires TypeScript `>=5.8.0 <6.0.0` (first stable release `5.8.2`); the `12.x` line's Angular-12 floor requires TypeScript `~4.2.3`. This capability's `20.x`-line enforcement (TypeScript 5.8.2 floor) is established now; the `12.x` line's independently-dialected `core/` (TypeScript 4.2.3 floor) is established by a separate future change. `core/` SHALL use only browser APIs available in the legacy line's supported browsers, or ship a local fallback (rule A3). `core/` SHALL remain a folder inside the published `ngx-fast-marquee` package and SHALL NOT be published as a separate package (rule A4).

#### Scenario: Angular import in core is rejected

- **WHEN** a source file under `core/` imports from `@angular/*` or `rxjs` and the lint gate runs
- **THEN** linting fails with an import-restriction violation

#### Scenario: Modern TypeScript grammar in core is rejected

- **WHEN** a source file under the `20.x` line's `core/` uses grammar newer than that line's TypeScript 5.8.2 floor and the core dialect check runs
- **THEN** the dialect check fails, while the same grammar remains allowed in `adapter/`, application, and test code

#### Scenario: Newer platform API is used with a local fallback

- **WHEN** `core/` logic needs a browser API that is absent from the legacy line's supported browsers
- **THEN** `core/` ships a local fallback so the behavior still functions there, following the idle-callback compatibility guard precedent

#### Scenario: Core ships inside the library package

- **WHEN** the library is packed for publishing
- **THEN** the `core/` code is bundled inside the `ngx-fast-marquee` artifact, no separate core package exists, and the artifact declares no runtime dependency on RxJS or zone.js

### Requirement: SSR and Zoneless Rendering Contract

The modern adapter SHALL be safe to server-render and to run zoneless: component construction SHALL be side-effect-free apart from the idempotent idle-callback environment guard (which touches no DOM and skips on the server); no DOM read or write SHALL occur before `afterNextRender`; a server render SHALL produce the final static markup; the component SHALL be idempotent so it is safe inside `@defer` hydrate blocks; and no feature SHALL depend on Zone.js for correctness.

#### Scenario: Server render produces final static markup

- **WHEN** `<ngx-fast-marquee>` is rendered during server-side rendering
- **THEN** the projected content is emitted as final static markup, no DOM measurement or mutation is attempted, and no error is thrown

#### Scenario: Construction performs no DOM access

- **WHEN** the component class is instantiated
- **THEN** no DOM read or write occurs until the `afterNextRender` phase runs in a browser

#### Scenario: Safe inside defer hydrate blocks

- **WHEN** server-rendered marquee markup is hydrated inside a `@defer` hydrate block
- **THEN** the component initializes exactly once, without duplicating, discarding, or re-projecting its content

#### Scenario: Fully functional without Zone.js

- **WHEN** an application bootstraps with `provideZonelessChangeDetection()` and no `zone.js` polyfill
- **THEN** every marquee feature — animation, input-driven updates, content-driven updates, resize handling, and live reduced-motion response — functions correctly

### Requirement: Modern Adapter Stable-API Discipline

The modern adapter SHALL use only Angular APIs that are stable at the line's Angular floor: `signal`, `computed`, `input()`, `output()`, `model()`, signal queries, `afterNextRender`, `DestroyRef`, `inject()`, `isPlatformBrowser`, and `provideAppInitializer` (allowlisted for the provider factory by maintainer ruling, 2026-07-06). The adapter MAY use exactly one `effect()`, and only as the bridge from duplication-affecting signal inputs to imperative engine work: that `effect()` SHALL set no signal and SHALL perform no inline DOM read, scheduling a post-render engine replan instead. The adapter SHALL NOT use `effect()` for state propagation (derived state SHALL use `computed()` or `linkedSignal()`), and SHALL NOT use `afterRender`, `afterEveryRender`, `afterRenderEffect`, or any API that is experimental or developer-preview at the floor. The `provideFastMarquee()` factory SHALL be implemented with `provideAppInitializer` rather than the `APP_INITIALIZER` token.

#### Scenario: Banned render-lifecycle API is rejected

- **WHEN** adapter code imports or calls `afterRender`, `afterEveryRender`, or `afterRenderEffect` and the lint gate runs
- **THEN** linting fails with a restricted-API violation

#### Scenario: The single bridge effect propagates no state

- **WHEN** a duplication-affecting input (`autoFill`, `direction`, or the derived `animated` state) changes
- **THEN** the adapter's one `effect()` schedules exactly one engine replan, writes no signal, and no `ExpressionChangedAfterItHasBeenChecked` error occurs

#### Scenario: Adapter imports stay on the allowlist

- **WHEN** the adapter's `@angular/*` imports are audited
- **THEN** every imported symbol is on the stable-API allowlist for the line's floor (including at most one `effect` used solely as the imperative bridge)

### Requirement: Template-Level API Stability Across the Refactor

The refactor SHALL preserve the template-level binding surface unchanged: the `ngx-fast-marquee` selector, every input and output name, type, default value, and event payload, plus the `NgxFastMarqueeModule` and `provideFastMarquee()` exports. In addition, `NgxFastMarqueeComponent` SHALL be standalone and importable directly, with `NgxFastMarqueeModule` retained as a thin wrapper for `NgModule`-based consumers. The class instance surface is out of contract and MAY change.

#### Scenario: NgModule consumer is unaffected

- **WHEN** an application imports `NgxFastMarqueeModule` and uses `<ngx-fast-marquee>` with any pre-refactor binding combination
- **THEN** the template compiles and behaves identically, and every behavior specified by the `specify-marquee-behavior` feature scenarios continues to hold

#### Scenario: Standalone consumer imports the component directly

- **WHEN** a standalone component adds `NgxFastMarqueeComponent` to its `imports` array
- **THEN** the marquee renders and behaves fully without `NgxFastMarqueeModule`

#### Scenario: Bootstrap provider keeps its guarantee

- **WHEN** an application registers `provideFastMarquee()` in its bootstrap providers
- **THEN** the idle-callback guarantee continues to hold exactly as specified by the Idle Callback Browser Compatibility requirement, with the guard still running during application initialization before the first change-detection pass despite the internal migration to `provideAppInitializer`

### Requirement: Update Model and Performance

The marquee SHALL derive pure input state as declarative bindings and react to projected-content, size, and system-reduced-motion changes through change-driven notifications (observers and a live media source) rather than per-change-detection-cycle dirty checking; the scrolling animation itself SHALL run purely in CSS, independent of change detection.

#### Scenario: No per-cycle dirty checking

- **WHEN** application change detection runs with no content, size, or marquee-input change
- **THEN** the marquee performs no measurement and no DOM mutation

#### Scenario: Animation is independent of change detection

- **WHEN** the marquee is scrolling and application change detection is otherwise idle
- **THEN** the scrolling continues purely in CSS without requiring change-detection cycles
