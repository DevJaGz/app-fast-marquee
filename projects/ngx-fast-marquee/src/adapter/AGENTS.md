# adapter — Angular Shell

Thin Angular wrapper for the `ngx-fast-marquee` library core engine.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`../AGENTS.md`](../AGENTS.md) |

## Modules

| Module | Path |
|--------|------|
| Component | [`ngx-fast-marquee.component.ts`](ngx-fast-marquee.component.ts) — standalone, OnPush, signal inputs/outputs, [`computed()`](https://angular.dev/api/core/computed)-driven bindings; boots the core [`MarqueeEngine`](../core/marquee-engine.ts) from [`afterNextRender`](https://angular.dev/api/core/afterNextRender) |
| Module | [`ngx-fast-marquee.module.ts`](ngx-fast-marquee.module.ts) — thin `NgModule` wrapper for NgModule consumers; auto-registers the idle-callback guard |
| Providers | [`fast-marquee.providers.ts`](fast-marquee.providers.ts) — [`provideFastMarquee()`](fast-marquee.providers.ts) via [`provideAppInitializer`](https://angular.dev/api/core/provideAppInitializer); standalone consumers must register it at bootstrap for [`@defer`](https://angular.dev/guide/defer) usage — see [Idle-Callback Guard](../../../../knowledge/decisions/idle-callback-guard.md) |
| Barrel | [`index.ts`](index.ts) |
| Tests | [`ngx-fast-marquee.component.spec.ts`](ngx-fast-marquee.component.spec.ts), [`fast-marquee.providers.spec.ts`](fast-marquee.providers.spec.ts), [`fast-marquee-defer-ordering.spec.ts`](fast-marquee-defer-ordering.spec.ts) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Stable-API allowlist** (rule A6): adapter uses only the sanctioned Angular primitives plus exactly one `effect()` as the input→replan bridge; the `afterRender*` family is lint-banned — see [Core/Adapter Library Architecture](../../../../knowledge/decisions/core-adapter-architecture.md) for the full rules.
- **Tests**: co-located [`*.spec.ts`](ngx-fast-marquee.component.spec.ts) files; run with [`npm run test:lib`](../../../../package.json). Follow convention **#14** in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — no test seams in production code.
- **Public exports**: every new public symbol must be re-exported through [`../public-api.ts`](../public-api.ts).
- **README sync**: keep the library [`README.md`](../README.md) in sync with public API changes.
