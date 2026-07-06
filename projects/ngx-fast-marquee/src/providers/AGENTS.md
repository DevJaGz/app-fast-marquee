# providers — Library Providers

Provider functions for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- Providers: [`fast-marquee.providers.ts`](fast-marquee.providers.ts) exposes `provideFastMarquee()`, an `APP_INITIALIZER` multi-provider that runs the idle-callback compatibility guard from [`../utils/idle-callback-compat.util.ts`](../utils/idle-callback-compat.util.ts) at application bootstrap (Safari/iOS `@defer` crash, see [angular/angular#53721](https://github.com/angular/angular/issues/53721)).
- Provider functions are public API: export them through [`public-api.ts`](../public-api.ts) and document them in the library [`README.md`](../../README.md).
- Tests: [`fast-marquee.providers.spec.ts`](fast-marquee.providers.spec.ts) (provider shape) and [`fast-marquee-defer-ordering.spec.ts`](fast-marquee-defer-ordering.spec.ts) (proves the guard runs before `@defer (on idle)` scheduling).
