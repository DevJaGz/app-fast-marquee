# core — Framework-Agnostic Engine

Pure TypeScript marquee engine for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`../AGENTS.md`](../AGENTS.md) |

## Modules

| Module | Path |
|--------|------|
| Types | [`types.ts`](types.ts) — `Direction`, `Speed`, engine config/plan types |
| Measurement | [`measurement.ts`](measurement.ts) — rect reads, axis selection, middle-size math |
| Duplication | [`duplication.ts`](duplication.ts) — clone/prune math and DOM writes |
| Animation | [`animation.ts`](animation.ts) — CSS custom-property and data-attribute value resolution |
| Reduced motion | [`reduced-motion.ts`](reduced-motion.ts) — [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) source with live change listener |
| Idle-callback guard | [`idle-callback-compat.ts`](idle-callback-compat.ts) — Safari/iOS idle-callback compatibility guard ([angular/angular#53721](https://github.com/angular/angular/issues/53721)); [`idle-callback.types.d.ts`](idle-callback.types.d.ts) — ambient `requestIdleCallback`/`cancelIdleCallback` DOM typings, absent from TypeScript 4.2.3's lib (added ~4.4) |
| Engine orchestrator | [`marquee-engine.ts`](marquee-engine.ts) — `requestReplan()` → batched read → compute → write |
| Barrel | [`index.ts`](index.ts) — re-exports all core modules |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **No Angular/RxJS** (rule A1): zero `@angular/*` or `rxjs` imports in `core/` — ESLint-enforced via [`../../.eslintrc.json`](../../.eslintrc.json).
- **TypeScript dialect floor** (rule A2): grammar must stay within the **12.x line's own** `4.2.3` floor (Angular 12.0.x's minimum supported TypeScript — not the `20.x` line's `5.8.2` floor; each line is dialected to its own Angular floor, see [branch-model-version-lines.md](../../../../knowledge/decisions/branch-model-version-lines.md)), checked by [`npm run check:core-dialect`](../../../../package.json) against [`../../tsconfig.core-dialect.json`](../../tsconfig.core-dialect.json).
- **Tests**: co-located pure [`*.spec.ts`](marquee-engine.spec.ts) files (no TestBed), run in a **real browser** via Karma/`ChromeHeadless` (not jsdom) — `requestAnimationFrame`/`ResizeObserver`/`MutationObserver` are native, so specs wait on real async timing (`requestAnimationFrame` + a macrotask) rather than fake-timer-advancing them; run with [`npm run test:lib`](../../../../package.json). Follow convention **#14** in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — no test seams in production code; use `jasmine.createSpy`/`spyOn` in specs.
- Full architecture rules: [Core/Adapter Library Architecture](../../../../knowledge/decisions/core-adapter-architecture.md).
