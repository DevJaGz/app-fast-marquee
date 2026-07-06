# Tasks: refactor-core-adapter-architecture

## 1. Baseline, prerequisite, and gated decisions

- [ ] 1.1 Record the pre-refactor bundle baseline: `npm run build:lib` + `npm pack` on the current commit, **plus** a minimal standalone-consumer production build; note tarball, unpacked, and consumer-bundle bytes in this change (append a `measurements` note next to this file) (design D8)
- [x] 1.2 Prerequisite: [`specify-marquee-behavior`](../../specify-marquee-behavior/proposal.md) owns the marquee feature-behavior spec and the black-box e2e suite (with its `playground` scenario) and lands first; this refactor consumes that contract and re-runs its e2e suite unchanged as the behavior gate (design Test Strategy)
- [x] 1.3 Maintainer ruling recorded (2026-07-06): permit exactly one sanctioned `effect()` as the input→imperative-replan bridge (sets no signal); lint-ban only `afterRender`/`afterEveryRender`/`afterRenderEffect` and effect-based state propagation (design D-effect)
- [x] 1.5 Maintainer ruling recorded (2026-07-06): migrate `provideFastMarquee()` internals to `provideAppInitializer`; the A6 allowlist includes `provideAppInitializer` for the provider factory (design D7)
- [x] 1.6 Maintainer confirmation granted (2026-07-06), scoped to this refactor, for the gated tooling edits: ESLint overrides in [.eslintrc.json](../../../.eslintrc.json), new `tsconfig.core-dialect.json`, and the `typescript-20x-floor` (TypeScript 5.8.2 npm-alias) devDependency — the lint-only fallback is dropped (design D6)
- [x] 1.7 Verified against the official [Angular compatibility table](https://angular.dev/reference/versions) (2026-07-06): each version line's `core/` dialect floor is its own line's Angular-floor minimum TypeScript — `20.x` line → TypeScript `>=5.8.0 <6.0.0` (first stable `5.8.2`); `12.x` line → TypeScript `~4.2.3`. This change enforces the `20.x` floor only; the `12.x` line's own `core/` dialect is a separate future change

## 2. Core engine — built from scratch (pure TypeScript, rules A1–A3)

- [ ] 2.1 Scaffold `projects/ngx-fast-marquee/src/core/` per design D1 and move `Direction`/`Speed` from [types/](../../../projects/ngx-fast-marquee/src/types/) into `core/types.ts` alongside the engine config/plan types
- [ ] 2.2 Implement `core/measurement.ts`: rect reads (`getBoundingClientRect`), axis selection by direction, middle-size math — as pure functions taking element handles (no component instance, no `Renderer2`)
- [ ] 2.3 Implement `core/duplication.ts`: re-derive the duplicate-count math and perform clone/prune as direct DOM writes (prune `aria-hidden` clones first, then `cloneNode` into a `DocumentFragment`); validate the count math against the pure unit tests (task 2.8) and the prerequisite change's auto-fill e2e tests
- [ ] 2.4 Implement `core/animation.ts`: the single source-of-truth mapping of each input to its `data-*`/`--_*` name and value computation (consumed by the adapter's `computed()` bindings and the engine)
- [ ] 2.5 Implement `core/reduced-motion.ts`: a `matchMedia('(prefers-reduced-motion: reduce)')` source exposing current match + a `change` subscription with an explicit teardown handle (design D-reduced-motion)
- [ ] 2.6 Move [idle-callback-compat.util.ts](../../../projects/ngx-fast-marquee/src/utils/idle-callback-compat.util.ts) (and its spec) into `core/` unchanged
- [ ] 2.7 Implement `core/marquee-engine.ts`: `requestReplan()` scheduler → batched read → compute → write cycle; content `MutationObserver` and debounced host `ResizeObserver`; content-observer suspension during the write phase; idempotent prune-then-duplicate initial cycle; `measuredSize` exposed for the adapter to bind (design D2, D3, A5) — **no host-attribute observer** (the input bridge is the adapter's single `effect()`)
- [ ] 2.8 Write pure `core/` unit tests (no TestBed; input→output only), covering the feature math/logic and its edge cases from the spec: duplicate-count resolution for F4 (content smaller than / larger than container, single item, empty content, even-count seam adjustment); numeric-speed rate/duration for F3 (positive value, `0` and negative → no motion); mask resolution for F5 (symmetric shorthand, independent start/end, explicit-edge-overrides-shorthand precedence, horizontal vs vertical axis); reduced-motion policy truth table for F8; and engine-loop tests (exactly one cycle per content mutation; no work when idle; no self-triggering during writes; one deduplicated `updated` per committed layout-changing cycle, none when idle — design D-outputs)
- [ ] 2.9 Keep `core/` source within the `20.x` line's TypeScript 5.8.2 dialect floor and long-established platform APIs while building (A2/A3 — mechanical check lands in task group 4)

## 3. Adapter — built from scratch (rules A5–A6, goals G1–G2)

- [ ] 3.1 Author `adapter/ngx-fast-marquee.component.ts` as `standalone: true`, OnPush, with identical signal inputs/outputs (names, types, defaults, payloads) — matching the pre-refactor template surface exactly
- [ ] 3.2 Express every pure state via `computed()` bound declaratively (design D3): `[attr.data-direction]`, `[attr.data-speed]`, `[attr.data-pause-on-hover]`, `[attr.data-pause-on-click]`, `[attr.data-animated]`, `[style.--_animation-play-state]`, `[style.--_move-percentage]`, `[style.--_mask-start-percentage]`, `[style.--_mask-end-percentage]`; numeric-speed `[style.--_animation-duration]` as a `computed` over the engine's `measuredSize` signal
- [ ] 3.3 Fold reduced motion into `animated = computed(() => !(useSystemReducedMotion() && prefersReducedMotion()))` using the core source from task 2.5, and add the CSS `@media (prefers-reduced-motion: reduce)` fallback rule (design D-reduced-motion)
- [ ] 3.4 Add the **single** bridge `effect()` reading `autoFill`/`direction`/`animated` and calling `engine.requestReplan()` — sets no signal, reads no DOM inline (design D-effect)
- [ ] 3.5 Boot the engine from `afterNextRender` guarded by `isPlatformBrowser`; tear down observers and the reduced-motion listener via `DestroyRef`; keep only the constructor `ensureIdleCallbackFallback()` guard with its documented A5 exemption (design D5). No `NgZone`, `@HostListener`, `ngOnChanges`, `ngAfterContentChecked`, `Renderer2`, or `MarqueeModel`
- [ ] 3.6 Preserve `mounted`/`updated` output semantics as specified by the prerequisite change: `mounted` once from `afterNextRender`; `updated` from the engine's single cycle-commit callback, deduplicated by a layout signature so it fires once per layout-changing cycle and never on idle CD or pure-visual input changes (design D-outputs)
- [ ] 3.7 Author `adapter/ngx-fast-marquee.module.ts` as a thin `imports`/`exports` wrapper around the standalone component (design D4)
- [ ] 3.8 Author `adapter/fast-marquee.providers.ts` using `provideAppInitializer` (keeping the exported `provideFastMarquee()` name, signature, and bootstrap-timing guarantee) (design D7)
- [ ] 3.9 Update [public-api.ts](../../../projects/ngx-fast-marquee/src/public-api.ts) to the new paths and verify the exported symbol set is unchanged against the pre-refactor `dist` typings
- [ ] 3.10 Adapter unit tests (TestBed): template-surface parity (selector + every pre-refactor binding combination compiles and behaves), standalone direct import, `NgxFastMarqueeModule` import, no DOM access before `afterNextRender`, and an input change schedules exactly one engine replan with no `ExpressionChangedAfterItHasBeenChecked` (spec: Update Model and Performance, Modern Adapter Stable-API Discipline, Template-Level API Stability)

## 4. Enforcement tooling (maintainer-approved 2026-07-06 via task 1.6)

- [ ] 4.1 Add the A1 ESLint override (`core/**`: `no-restricted-imports` for `@angular/*`, `rxjs`) and the A6 override (`adapter/**`: banned `afterRender`, `afterEveryRender`, `afterRenderEffect`) to [.eslintrc.json](../../../.eslintrc.json)
- [ ] 4.2 Add `typescript-20x-floor` (npm alias of `typescript@5.8.2`) devDependency, `tsconfig.core-dialect.json`, and the `check:core-dialect` npm script; wire nothing into CI yet (out of scope)
- [ ] 4.3 Prove the gates: a scratch `@angular/*` import in `core/` fails lint; a scratch `afterRenderEffect` import in `adapter/` fails lint; a scratch `satisfies` in `core/` fails `check:core-dialect`; all pass clean afterwards

## 5. Verification and measurement (goal G3, behavior gate)

- [ ] 5.1 Run `npm run lint`, `npm run format`, `npm run test:lib`, `npm run test:app` — all green
- [ ] 5.2 Re-run the prerequisite change's e2e behavior suite unchanged (`pnpm e2e`, Chromium + WebKit) as the no-behavior-change gate — all green, no test-only hooks added to runtime source
- [ ] 5.3 Verify the built FESM output contains no `rxjs`/`zone.js` imports and no dead module-era code paths
- [ ] 5.4 Record the post-refactor `npm pack` and standalone-consumer-bundle measurements, compute the deltas against task 1.1, and store them in the `measurements` note earmarked for the `20.1.0` release notes (no `version`/`peerDependencies`/README compatibility-table edits)

## 6. Docs and knowledge sync (same-change rule)

- [ ] 6.1 Restructure the library `AGENTS.md` tree: update [projects/ngx-fast-marquee/AGENTS.md](../../../projects/ngx-fast-marquee/AGENTS.md) and replace the `components/`/`services/`/`models/`/`types/`/`utils/` child files with `core/` and `adapter/` equivalents; update the root [AGENTS.md](../../../AGENTS.md) if its directory map changes
- [ ] 6.2 Add a `core-adapter-architecture` decision concept to [knowledge/decisions/](../../../knowledge/decisions/) (rules A1–A6 including the single-`effect()` allowance, goals G1–G3, per-feature primitive selection, enforcement + backport commit hygiene, and the per-line TypeScript dialect floors: `20.x` → 5.8.2, `12.x` → 4.2.3), cross-link it from [branch-model-version-lines.md](../../../knowledge/decisions/branch-model-version-lines.md), and update [knowledge/index.md](../../../knowledge/index.md) and [knowledge/log.md](../../../knowledge/log.md)
- [ ] 6.3 Re-validate the change (`openspec validate refactor-core-adapter-architecture --strict`) and confirm every artifact still matches what was implemented
