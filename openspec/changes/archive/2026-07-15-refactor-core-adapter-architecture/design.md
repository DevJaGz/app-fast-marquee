# Design: refactor-core-adapter-architecture

## Context

Today the library's engine logic is spread across Angular `@Injectable` services ([`marquee.service.ts`](../../../projects/ngx-fast-marquee/src/services/marquee.service.ts), [`marquee-duplication.service.ts`](../../../projects/ngx-fast-marquee/src/services/marquee-duplication.service.ts), [`reduced-motion.service.ts`](../../../projects/ngx-fast-marquee/src/services/reduced-motion.service.ts)) that receive the component instance through an abstract [`MarqueeModel`](../../../projects/ngx-fast-marquee/src/models/marquee.model.ts) and write to the DOM through `Renderer2`. The [component](../../../projects/ngx-fast-marquee/src/components/ngx-fast-marquee/ngx-fast-marquee.component.ts) is `standalone: false`, declares `ngOnChanges` (which never fires — all inputs are signal `input()`s), detects projected-content changes by diffing `innerHTML` inside `ngAfterContentChecked` on **every** change-detection cycle, and uses `NgZone.runOutsideAngular` + `setTimeout` for resize debouncing and initial scheduling (including a `setTimeout(0)` hack the source itself flags as unexplained).

This refactor is a **ground-up redesign** and a **pure refactor with no behavior change**. The marquee's feature behavior — including every edge correction — is specified and e2e-locked by the prerequisite [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) change; this change consumes that contract and keeps its e2e suite green. The current code is read **only to enumerate the features that must survive** — it is never treated as a good solution. Each feature's mechanism is re-derived from first principles.

The [branch-model and version-line decision](../../../knowledge/decisions/branch-model-version-lines.md) requires a framework-agnostic `core/` architecture that the future Angular 12 Patchable line will host its own copy of. Each line's `core/` copy is independently dialected to that line's own Angular-floor minimum TypeScript rather than a single shared floor — verified against the official [Angular compatibility table](https://angular.dev/reference/versions) (2026-07-06): the `20.x` line's Angular-20 floor requires TypeScript `>=5.8.0 <6.0.0` (first stable release `5.8.2`); the `12.x` line's Angular-12 floor requires TypeScript `~4.2.3`. This change establishes the architecture and pins only the `20.x` line's `core/` dialect at the TypeScript 5.8.2 floor; the `12.x` line's own `core/` rewrite (and its 4.2.3-floor dialect check) is a separate future change. The refactor pursues goals G1 (clean, maintainable), G2 (maximum performance), G3 (minimum bundle size), under rules A1–A6 below.

Constraints from [operational guardrails](../../../knowledge/guardrails.md): edits to [`.eslintrc.json`](../../../.eslintrc.json), tsconfig files, and any new devDependency require explicit human confirmation (granted 2026-07-06 for this refactor); the library `version`/`peerDependencies`/README compatibility table are frozen.

Primitive-selection guidance was verified against the official Angular 20 docs: [signals](https://v20.angular.dev/guide/signals), [`linkedSignal`](https://v20.angular.dev/guide/signals/linked-signal), [`effect`](https://angular.dev/guide/signals/effect) (incl. [SSR caveats](https://angular.dev/guide/signals/effect#server-side-rendering-caveats)), and [CSS animations](https://v20.angular.dev/guide/animations/css). Key rulings: `computed()` is the endorsed vehicle for state derived from inputs; propagating state through `effect()` is explicitly discouraged; `ResizeObserver`/`MutationObserver` are officially **preferred over** `effect`/`afterRenderEffect` for reacting to DOM/size changes; `effect()` is blessed for "custom DOM behavior that can't be expressed with template syntax" provided it writes no signal; native CSS (keyframes + custom properties + `prefers-reduced-motion`) is the recommended animation layer.

## Feature inventory (the only thing taken from the current code)

| #    | Feature                                     | Observable contract to preserve                                                              |
| ---- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| F1   | `direction` (`left\|right\|up\|down`)       | sets scroll axis + direction                                                                 |
| F2   | `speed` qualitative (`slow\|medium\|fast`)  | maps to a preset duration                                                                     |
| F3   | `speed` numeric (px/s)                      | duration = (animated track size ÷ 2) ÷ speed, in seconds                                      |
| F4   | `autoFill`                                  | duplicate items to fill the container; travel distance 50% (filled) vs 100% (unfilled)       |
| F5   | `maskStartPercentage`/`maskEndPercentage`/`maskPercentage` | edge-fade gradient                                                             |
| F6   | `play`                                      | running / paused                                                                             |
| F7   | `pauseOnHover` / `pauseOnClick`             | pause on `:hover` / `:active`                                                                |
| F8   | `useSystemReducedMotion`                    | when opted-in **and** OS prefers reduced motion → not animated                               |
| F9   | `mounted` output                            | emits once after first render                                                               |
| F10  | `updated` output                            | emits after each completed measure/duplicate cycle                                          |
| F11  | Idle-callback guard                         | unchanged (separate spec requirement)                                                        |
| F12  | React to projected-content & container-size changes | re-measure + rebuild duplicates automatically                                       |

The precise observable behavior of each feature (including corrected edges) is specified by [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md); this table is only the architecture-side inventory of what the new engine/adapter must implement.

## Goals / Non-Goals

**Goals:**

- Establish `core/` (pure TS engine) + `adapter/` (thin Angular shell) under [`projects/ngx-fast-marquee/src/`](../../../projects/ngx-fast-marquee/src/).
- Re-derive every feature's mechanism from scratch: CSS/`computed` for all pure state; observers for DOM-originated change; one `effect()` for the input→imperative bridge; no `ngOnChanges`/`ngAfterContentChecked`/`NgZone`/`Renderer2` (G1, G2, A5).
- Mechanical enforcement of A1 (ESLint), A2 (TypeScript 5.8.2 dialect check), A6 (lint restriction on the `after*` family + review of the single `effect()`).
- Preserve the template-level binding surface byte-for-byte (parity contract) and preserve the behavior contract locked by [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) (its e2e suite stays green, re-run unchanged).
- Measure `npm pack` size and a minimal standalone-consumer bundle before/after and record the deltas (G3).

**Non-Goals:**

- Any behavior change or edge correction, and authoring the feature-behavior spec/e2e suite — all owned by [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md).
- Creating the `12.x` branch, the decorator adapter, or any backport machinery (A4 procedures are documented, not exercised).
- Rewriting `core/` a second time at the `12.x` line's TypeScript 4.2.3 floor — a separate future change.
- Version bumps, peer-range changes, README compatibility-table changes, publishing, CI workflows.
- New marquee features.
- Promoting `core/` to a separate package (forbidden while only one Active line consumes it).

## Decisions

### D1 — Target layout

```
projects/ngx-fast-marquee/src/
├── core/                          # THE ENGINE — zero @angular/*, zero RxJS
│   ├── marquee-engine.ts          # orchestrator: requestReplan() → batched read → compute → write
│   ├── measurement.ts             # rect reads, axis selection, middle-size math
│   ├── duplication.ts             # duplicate-count math + clone/prune DOM writes (native APIs)
│   ├── animation.ts               # CSS custom-property / data-attribute names + value computation
│   ├── reduced-motion.ts          # prefers-reduced-motion source (matchMedia + change listener)
│   ├── idle-callback-compat.ts    # moved from utils/ (already pure; A3 precedent)
│   ├── types.ts                   # Direction, Speed, engine config/plan types
│   └── index.ts
├── adapter/                       # THE SHELL — thin Angular layer
│   ├── ngx-fast-marquee.component.ts|.html|.scss
│   ├── ngx-fast-marquee.module.ts # thin wrapper importing+exporting the standalone component
│   ├── fast-marquee.providers.ts  # provideFastMarquee()
│   └── index.ts
└── public-api.ts                  # exports unchanged symbols (module, component, providers, types)
```

`models/` (the `MarqueeModel` abstract class) disappears: the engine takes plain element handles + configuration snapshots instead of a component instance. `types/` and `utils/` dissolve into `core/`. Child `AGENTS.md` files are reorganized to match.

### D2 — Core owns all DOM interaction; `Renderer2` is dropped

**Choice:** the engine receives the host and inner element handles and performs measurement reads and duplication writes directly (native `getBoundingClientRect`, `cloneNode`, `setAttribute`, `style.setProperty`), batched read-phase-then-write-phase per cycle (G2, A5).

**Why:** every cross-line behavior lives in `core`; adapters stay thin. Duplication and measurement are the heart of the marquee — leaving the DOM writes in the adapter would force the future `12.x` adapter to re-implement them. `Renderer2` was the only reason the services needed Angular, yet the current code already reads the DOM directly (`getBoundingClientRect`) and only writes through `Renderer2`, so it buys no real SSR safety today — just indirection. The engine only ever runs in a real browser (gated behind `afterNextRender` + `isPlatformBrowser`), never on the server.

**Alternative considered:** core returns a pure "update plan" and the adapter applies it. Rejected: doubles the surface both adapters must implement and moves the trickiest cross-line behavior (clone/prune sequencing, observer suspension) into per-line code.

### D3 — Per-feature primitive selection (the core of the redesign)

Each feature is assigned the least-powerful primitive that fully expresses it. Preference order: **CSS → `computed()` → DOM observer → one `effect()`.**

| Feature                       | Chosen mechanism                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| F1 direction                  | **CSS** via `[attr.data-direction]` bound from a `computed`                                             |
| F2 speed (qualitative)        | **CSS** via `[attr.data-speed]` bound from a `computed`                                                 |
| F3 speed (numeric)            | **`computed` → `[style.--_animation-duration]`** reading the `measuredSize` signal                     |
| F4 autoFill (travel %)        | **`computed` → `[style.--_move-percentage]`** (50/100)                                                  |
| F4 autoFill (duplication)     | **Engine (imperative)**: prune→clone into a `DocumentFragment`; count math in `core/duplication.ts`     |
| F5 masks                      | **`computed` → `[style.--_mask-start-percentage]` / `[style.--_mask-end-percentage]`**                 |
| F6 play                       | **`computed` → `[style.--_animation-play-state]`**                                                      |
| F7 pauseOnHover / pauseOnClick| **CSS**: `[attr.data-pause-on-hover]` / `[attr.data-pause-on-click]` + CSS `:hover` / `:active`         |
| F8 reduced motion             | **Live `matchMedia` → signal**, folded into `animated = computed(...)` → `[attr.data-animated]`; CSS `@media` fallback |
| F9 mounted                    | `afterNextRender` → `mounted.emit()` (client-only, SSR-safe)                                            |
| F10 updated                   | Engine emits after each completed cycle                                                                 |
| F11 idle guard                | Unchanged; `provideAppInitializer` factory (D7)                                                         |
| F12 content / resize          | **`MutationObserver`** (inner content) + **debounced `ResizeObserver`** (host)                          |
| input → replan bridge         | **one `effect()`** reading `autoFill`/`direction`/`animated`, calling `engine.requestReplan()`          |

**Why this split works:** all pure input-derived state is a `computed()` bound declaratively, so OnPush + signal inputs re-evaluate it exactly when an input changes — no dirty-checking, no imperative writes (G2), and post-init input changes apply as the behavior contract requires. The only irreducibly imperative work — measuring and cloning DOM — is owned by the engine and triggered either by DOM-originated events (observers) or by the single input-bridge `effect()`. Angular's role shrinks to "apply signal values to the DOM," which is exactly what OnPush is for, and the identical engine drives the future decorator adapter.

**`measuredSize`** is a plain writable signal the engine `.set()`s after each measurement. The numeric-speed duration is a `computed` over it, so resize/content changes update timing with no extra code.

### D-effect — Exactly one sanctioned `effect()`; the third observer is deleted

**Choice:** a single `effect()` reads the duplication-affecting inputs (`autoFill`, `direction`, `animated`) and calls `engine.requestReplan()`. It **sets no signal and reads no DOM inline** — it marks the engine dirty and schedules a post-render flush the engine owns (so the actual measure/clone happens after the DOM is committed, not in the effect's pre-DOM phase).

**Why:** the trigger here is a **signal** change (an input), not a DOM change, so a `MutationObserver` is the wrong tool. The Angular docs explicitly bless `effect()` for "custom DOM behavior that can't be expressed with template syntax," and the discouraged pattern — propagating *state* through effects — is avoided because this effect writes no signal. This **replaces the previous design's third observer** (a host-attribute `MutationObserver` with an `attributeFilter` allowlist that re-read the very `data-*` attributes the component had just written) with three lines, eliminating that design's two largest risks (allowlist gaps and the write→observe self-trigger loop).

**Governance:** A6 keeps a mechanical lint ban on `afterRender`/`afterEveryRender`/`afterRenderEffect` and on `effect()` used for state propagation; the single bridge `effect()` is permitted and reviewed to confirm it writes no signal. A unit test asserts an input change schedules exactly one replan with no `ExpressionChangedAfterItHasBeenChecked` error.

### D-reduced-motion — Implementation of live reduced motion (behavior owned by `specify-marquee-behavior`)

The *live reduced-motion behavior* is specified by [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md); this refactor re-implements it on the new architecture: `core/reduced-motion.ts` opens `matchMedia('(prefers-reduced-motion: reduce)')`, exposes its current match as a signal, and subscribes to its `change` event (torn down via `DestroyRef`). `animated = computed(() => !(useSystemReducedMotion() && prefersReducedMotion()))`. A CSS `@media (prefers-reduced-motion: reduce)` rule on `:host([data-respect-reduced-motion="true"])` backs it up so the visual result is correct even before the first cycle. The e2e reduced-motion tests from the prerequisite change gate this.

### D-drop-linkedSignal — evaluated, not adopted

`linkedSignal` fits "writable state derived from a source that resets when the source changes." The only candidate here is `measuredSize` (resets when `direction` flips axis), but its reset requires a **DOM read**, which is impure and cannot live in a `linkedSignal` computation. A plain writable signal set by the engine after an actual measurement is correct; `linkedSignal` would be misapplied. Recorded so the choice is explicit.

### D-outputs — `mounted`/`updated` emission mechanism (semantics owned by `specify-marquee-behavior`)

The observable `mounted`/`updated` *semantics* (`mounted` once; `updated` once per observable layout change; never idle or on pure-visual input changes) are specified by [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md). This refactor implements them as the most efficient, deterministic mechanism: `mounted` emits from `afterNextRender`; `updated` is emitted from the engine's **single cycle-commit callback**, deduplicated by a layout signature (measured size + fill result), so it fires exactly once per layout-changing cycle and never on idle CD or CSS-only input changes. The output names/payloads are preserved (Template-Level API Stability).

### D4 — Standalone component; `NgxFastMarqueeModule` becomes a wrapper

The component flips to `standalone: true`; the module changes from `declarations` to `imports`+`exports`. Both consumption styles keep working, standalone consumers get direct imports and better tree-shaking (G3), and the `prefer-standalone` ESLint suppression disappears (G1).

### D5 — Construction stays side-effect-free, with one documented exemption

The constructor keeps the defensive `ensureIdleCallbackFallback()` call required by the existing Idle Callback Browser Compatibility requirement (it must run at instantiation time to protect non-`@defer` paths). It is explicitly exempted from A5's "no DOM before `afterNextRender`" because it touches only globals (never the DOM), is idempotent, and no-ops on the server. Everything else — measurement, observers, duplication, the reduced-motion listener — starts inside `afterNextRender`, guarded by `isPlatformBrowser`.

### D6 — Enforcement mechanics (maintainer-approved 2026-07-06)

- **A1/A6 (ESLint):** an override block in [`.eslintrc.json`](../../../.eslintrc.json) scoped to `projects/ngx-fast-marquee/src/core/**` with `no-restricted-imports` for `@angular/*` and `rxjs`; a second override scoped to `adapter/**` with `no-restricted-imports` naming the banned `@angular/core` symbols (`afterRender`, `afterEveryRender`, `afterRenderEffect`). `effect` is **not** name-banned (the bridge uses it); its "no state propagation" constraint is a reviewed convention plus the unit test in D-effect.
- **A2 (dialect):** a dedicated `tsconfig.core-dialect.json` compiled by a **TypeScript 5.8.2 devDependency installed under an npm alias** (`"typescript-20x-floor": "npm:typescript@5.8.2"`) via a new `check:core-dialect` npm script, so grammar newer than the `20.x` line's floor in `core/` fails mechanically. A future `12.x` change adds its own `typescript-12x-floor` alias at `4.2.3` — out of scope here.
- **A3/A4:** code review + the backport commit-hygiene procedure recorded in the knowledge base (no mechanical gate in this change).

Per [operational guardrails](../../../knowledge/guardrails.md) these edits are confirmation-gated; **the maintainer granted that confirmation on 2026-07-06, scoped to this refactor**. The lint-only fallback for A2 is dropped.

### D7 — `provideFastMarquee()` migrates to `provideAppInitializer` (maintainer ruling 2026-07-06)

**Choice:** the exported `provideFastMarquee()` keeps its name, signature, and guarantee, but its internals move from the `APP_INITIALIZER` multi-provider to `provideAppInitializer(ensureIdleCallbackFallback)`. The A6 allowlist includes `provideAppInitializer` (stable since v19, therefore stable at the floor).

**Why:** it is the current idiom, removes the multi-provider boilerplate (G1), and runs during application bootstrap before the first change-detection pass — exactly the timing the Idle Callback Browser Compatibility requirement depends on.

### D8 — Bundle-size measurement protocol (G3)

`npm run build:lib && npm pack` on the pre-refactor commit and again after, from the same clean state; **additionally**, build a minimal standalone-consumer app importing `NgxFastMarqueeComponent` and record its production bundle size both times, because the real tree-shaking win (dropping `NgModule`/`CommonModule` wiring, services, `Renderer2`) surfaces in the consumer build, not the tarball. Record tarball + unpacked + consumer-bundle bytes in the change and the knowledge log, earmarked for the `20.1.0` release notes. No `package.json` version field is touched.

## Risks / Trade-offs

- [Engine's own duplication writes re-trigger the content `MutationObserver` → loop] → the content observer is disconnected during the write phase and reconnected after; a unit test mutates content once and asserts exactly one engine cycle.
- [The bridge `effect()` is later edited to set a signal → CD errors/loops] → reviewed constraint + a unit test asserting one replan per input change and no `ExpressionChangedAfterItHasBeenChecked`.
- [Behavioral drift during the rebuild] → the black-box e2e behavior suite from [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) is the green net: it asserts observable input→output only (never internal `data-*`/`--_*` names or clone counts), so it holds across the from-scratch mechanism change and is re-run unchanged as this refactor's gate. New pure-function `core/` unit tests add white-box coverage of the extracted math.
- [TypeScript 5.8.2 npm alias confuses IDE/tooling] → the alias is a devDependency used only by the `check:core-dialect` script's explicit `-p` invocation; the workspace `typescript` (`~5.9.3`) stays the resolution default. The one-minor gap is low-risk today but the pin matters once the workspace `typescript` advances further ahead of Angular 20's frozen floor.
- [`ResizeObserver`/`MutationObserver`/`matchMedia` in core vs A3] → all long-established across evergreen browsers for years. The engine accepts triggers; it does not mandate their source, so a legacy adapter could swap in a `window:resize` fallback.
- [Hydration/`@defer` idempotence] → the initial engine cycle prunes any pre-existing `aria-hidden` clones before duplicating (remove-then-create), making the cycle idempotent by construction.

## Test Strategy

The **black-box e2e behavior suite** and its `playground` scenario are owned by the prerequisite [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) change; this refactor **re-runs that suite unchanged as its behavior gate** and adds white-box coverage of the new architecture:

- **Pure-function unit tests (`core/`, no TestBed, no DOM).** The extracted math/logic and its edge cases, asserted as input→output: duplicate-count resolution (smaller/larger than container, single item, empty, even-count seam), numeric-speed rate/duration (positive, `0`, negative), mask resolution (symmetric shorthand, independent start/end, explicit-edge precedence, horizontal vs vertical axis), reduced-motion policy truth table, and engine-loop invariants (one cycle per mutation, none when idle, no self-trigger, one deduplicated `updated` per layout-changing cycle).
- **Adapter TestBed tests.** Template-surface parity (selector + every binding combination compiles/behaves), standalone direct import, `NgxFastMarqueeModule` import, no DOM access before `afterNextRender`, and exactly one engine replan per duplication-affecting input change with no `ExpressionChangedAfterItHasBeenChecked`.

## Migration Plan

Single-branch refactor on `chore/refactor-core-adapter-architecture`, landing **after** [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md); no data or consumer migration (template surface unchanged). Rollback = revert the merge commit. Ordering: baseline `npm pack` + consumer-bundle measurement → `core/` built from scratch to green with its pure unit tests → adapter built from scratch to green with its TestBed tests → module/provider wrappers → gated tooling (ESLint/tsconfig/devDependency) → docs/knowledge sync → full gates including the prerequisite change's e2e suite re-run unchanged (`npm run lint`, `npm run format`, `npm run test:lib`, `npm run test:app`, `pnpm e2e`) → post-refactor measurement.

## Open Questions

1. **SSR verification depth:** assert A5 with a jsdom-level "server-ish" unit test (no new deps), or add `@angular/platform-server` as a devDependency for a real server-render test (confirmation-gated). Default: jsdom-level now, platform-server later if the demo app adopts SSR.

## Resolved Questions (maintainer rulings)

- **Feature behavior and its corrections** (mask precedence, zero/negative speed, mask-independent-of-motion, `updated`/`mounted` semantics, live reduced motion, post-init reactivity) → all owned and e2e-locked by the prerequisite [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) change; this refactor implements them on the new architecture without changing behavior. See D-reduced-motion, D-outputs.
- **Single sanctioned `effect()`** (2026-07-06) → approved; A6 permits exactly one bridge `effect()` and lint-bans only the `after*` family and effect-based state propagation. See D-effect.
- **`provideFastMarquee()` internals** → migrate to `provideAppInitializer`. See D7.
- **A2 mechanism / gated tooling** → confirmation granted for the `.eslintrc.json` overrides, `tsconfig.core-dialect.json`, and the `typescript-20x-floor` (TypeScript 5.8.2 npm-alias) devDependency; lint-only fallback dropped. See D6.
