---
type: Decision
title: Core/Adapter Library Architecture
description: Pure-TypeScript core/ engine plus thin Angular adapter/ shell architecture with rules A1–A6 (including the single sanctioned effect()), goals G1–G3, per-feature primitive selection, mechanical enforcement, backport commit hygiene, and per-line TypeScript dialect floors (20.x → 5.8.2, 12.x → 4.2.3).
tags:
  - library
  - architecture
status: implemented
timestamp: 2026-07-12T16:00:00Z
---

# What was decided

The library source under [`projects/ngx-fast-marquee/src/`](../../projects/ngx-fast-marquee/src/) is split into two layers joined by an unchanged [`public-api.ts`](../../projects/ngx-fast-marquee/src/public-api.ts):

## `core/` — THE ENGINE

Pure TypeScript with zero [`@angular/*`](https://angular.dev/) imports and zero RxJS. Owns:

- Measurement (rect reads, axis selection, middle-size math)
- Duplication math and DOM writes (clone/prune via native APIs)
- Animation-value computation (CSS custom-property and data-attribute names + values)
- Reduced-motion policy source ([`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) + change listener)
- Idle-callback guard ([`idle-callback-compat.ts`](../../projects/ngx-fast-marquee/src/core/idle-callback-compat.ts))
- Marquee engine orchestrator ([`marquee-engine.ts`](../../projects/ngx-fast-marquee/src/core/marquee-engine.ts): `requestReplan()` → batched read → compute → write)

## `adapter/` — THE SHELL

Thin Angular layer. On the `20.x` line it uses signals, OnPush, and a standalone component; a future decorator adapter on the `12.x` line will wrap the same engine. The adapter applies signal values to the DOM declaratively and boots the engine client-side.

## Goals

| Goal   | Aim                                                                                                                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1** | Clean, maintainable code — no module-era idioms (`ngOnChanges`, `ngAfterContentChecked`, `NgZone`, `Renderer2`, `@Injectable` services)                                                                     |
| **G2** | Maximum performance — no per-cycle dirty checking; pure state via `computed()` bindings; imperative work only where irreducible                                                                             |
| **G3** | Minimum bundle size — standalone direct import, dropped service/module wiring, measured before/after via [`npm pack`](https://docs.npmjs.com/cli/commands/npm-pack) and a minimal standalone-consumer build |

## Rules A1–A6

| Rule   | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A1** | No `@angular/*` or `rxjs` imports in `core/` — enforced by an ESLint [`no-restricted-imports`](../../.eslintrc.json) override scoped to [`projects/ngx-fast-marquee/src/core/**`](../../projects/ngx-fast-marquee/src/core/)                                                                                                                                                                                                                                                                                                                                                                                                     |
| **A2** | Each line's `core/` type-checks at **that line's own** Angular-floor minimum TypeScript, not a shared floor. The `20.x` line pins TypeScript **5.8.2** via the [`typescript-20x-floor`](../../package.json) npm alias and a [`check:core-dialect`](../../package.json) script over [`tsconfig.core-dialect.json`](../../projects/ngx-fast-marquee/tsconfig.core-dialect.json). The `12.x` line will pin **4.2.3** in a future change                                                                                                                                                                                             |
| **A3** | `core/` uses only long-established platform APIs ([`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), `matchMedia`, [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect), [`cloneNode`](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode)) or ships a local fallback (precedent: idle-callback guard)                                                                                                                              |
| **A4** | `core/` stays a folder inside the published package — not a separate npm package. Synchronized Active-first via [`git cherry-pick`](https://git-scm.com/docs/git-cherry-pick). Backport-bound fixes isolate `core/` changes in dedicated commits (commit hygiene)                                                                                                                                                                                                                                                                                                                                                                |
| **A5** | SSR/zoneless contract: side-effect-free construction except the idempotent idle-callback guard (touches globals only, never the DOM); no DOM reads/writes before [`afterNextRender`](https://angular.dev/api/core/afterNextRender); final static server markup; idempotent for [`@defer`](https://angular.dev/guide/defer) hydrate blocks (remove-then-create clone cycle); no Zone.js dependency for correctness                                                                                                                                                                                                                |
| **A6** | Adapter restricted to the stable-API allowlist (`signal`, `computed`, `input()`, `output()`, `model()`, signal queries, `afterNextRender`, `DestroyRef`, `inject()`, `isPlatformBrowser`, `provideAppInitializer`) **plus exactly one sanctioned `effect()`** used solely as the input→imperative-replan bridge — it sets no signal and reads no DOM inline. [`afterRender`](https://angular.dev/api/core/afterRender), [`afterEveryRender`](https://angular.dev/api/core/afterEveryRender), and [`afterRenderEffect`](https://angular.dev/api/core/afterRenderEffect) are lint-banned; effect-based state propagation is banned |

## Per-feature primitive selection

Each feature uses the least-powerful primitive that fully expresses it. Preference order: **CSS → `computed()` → DOM observers → the one `effect()`.**

| Feature                         | Mechanism                                                                                                                                           |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direction                       | **CSS** via `[attr.data-direction]` bound from a `computed`                                                                                         |
| Speed (qualitative)             | **CSS** via `[attr.data-speed]` bound from a `computed`                                                                                             |
| Speed (numeric)                 | **`computed` → `[style.--_animation-duration]`** reading the engine's `measuredSize` signal                                                         |
| `autoFill` travel %             | **`computed` → `[style.--_move-percentage]`** (50/100)                                                                                              |
| `autoFill` duplication          | **Engine (imperative)**: prune→clone; count math in [`core/duplication.ts`](../../projects/ngx-fast-marquee/src/core/duplication.ts)                |
| Masks                           | **`computed` → `[style.--_mask-start-percentage]` / `[style.--_mask-end-percentage]`**                                                              |
| `play`                          | **`computed` → `[style.--_animation-play-state]`**                                                                                                  |
| `pauseOnHover` / `pauseOnClick` | **CSS**: `[attr.data-pause-on-hover]` / `[attr.data-pause-on-click]` + CSS `:hover` / `:active`                                                     |
| Reduced motion                  | Live `matchMedia` → signal, folded into `animated = computed(...)` → `[attr.data-animated]`; CSS `@media (prefers-reduced-motion: reduce)` fallback |
| `mounted`                       | [`afterNextRender`](https://angular.dev/api/core/afterNextRender) → `mounted.emit()` (client-only, SSR-safe)                                        |
| `updated`                       | Engine's deduplicated cycle-commit callback (layout signature: measured size + fill result)                                                         |
| Content / resize                | **`MutationObserver`** (inner content) + debounced **`ResizeObserver`** (host)                                                                      |
| Input → replan bridge           | **One `effect()`** reading `autoFill`/`direction`/`animated`, calling `engine.requestReplan()`                                                      |

`measuredSize` is a writable signal the engine `.set()`s after each measurement; numeric-speed duration reacts to resize and content changes through the `computed` binding with no extra imperative code.

# Rationale

The [branch-model and version-line decision](branch-model-version-lines.md) requires a framework-agnostic engine that the future Angular 12 Patchable line can host its own copy of. Coupling engine logic to Angular `@Injectable` services and a component-instance `MarqueeModel` abstraction (see the [refactor design](../../openspec/changes/refactor-core-adapter-architecture/design.md)) made nothing shareable across lines.

Re-deriving each feature from first principles against official Angular 20 guidance ([signals](https://v20.angular.dev/guide/signals), [`computed`](https://v20.angular.dev/guide/signals), [CSS animations](https://v20.angular.dev/guide/animations/css)) yields the right split: all pure input-derived state is declarative `computed()` bindings that OnPush re-evaluates exactly when an input changes — no per-cycle dirty checking (G2). The only irreducibly imperative work (measurement and DOM duplication) lives in the engine, triggered by DOM-originated observers or the single input-bridge `effect()`. Angular's role shrinks to applying signal values to the DOM, which is exactly what OnPush is for.

# What it affects

- [`projects/ngx-fast-marquee/src/`](../../projects/ngx-fast-marquee/src/) layout — `components/`, `services/`, `models/`, `types/`, `utils/`, `providers/` dissolve into `core/` + `adapter/`
- [`.eslintrc.json`](../../.eslintrc.json) — A1/A6 import-restriction overrides for `core/**` and `adapter/**`
- [`tsconfig.core-dialect.json`](../../projects/ngx-fast-marquee/tsconfig.core-dialect.json) + [`check:core-dialect`](../../package.json) script + [`typescript-20x-floor`](../../package.json) devDependency — A2 mechanical enforcement for the `20.x` line
- The future `12.x` line — independently-dialected `core/` copy and decorator adapter (out of scope for the `20.x` refactor)
- The [marquee behavior contract](marquee-behavior-contract.md) — observable behavior is preserved unchanged; the black-box e2e suite is the refactor's acceptance gate

# Citations

[1] [refactor-core-adapter-architecture design](../../openspec/changes/refactor-core-adapter-architecture/design.md) — full design record: layout, per-feature primitive table, enforcement mechanics, and test strategy.

[2] [library spec](../../openspec/specs/library/library.spec.md) — behavioral requirements for the core/adapter architecture, dialect rules, SSR contract, and adapter API discipline.

[3] [Branch Model and Two-Version-Line Publishing Strategy](branch-model-version-lines.md) — per-line `core/` copies, dialect floors, and the Active/Patchable synchronization model.
