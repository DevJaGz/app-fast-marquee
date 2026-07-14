# ngx-fast-marquee/src — Library Source

Source root for the `ngx-fast-marquee` publishable library.

## Navigation

| Node | Path |
|------|------|
| Library Root | [`../AGENTS.md`](../AGENTS.md) |
| Core | [`core/AGENTS.md`](core/AGENTS.md) |
| Adapter | [`adapter/AGENTS.md`](adapter/AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Public API discipline**: the package exports exactly [`Direction`](core/types.ts) and [`Speed`](core/types.ts) (types, from [`core/types.ts`](core/types.ts)), [`NgxFastMarqueeComponent`](adapter/ngx-fast-marquee.component.ts), [`NgxFastMarqueeModule`](adapter/ngx-fast-marquee.module.ts), and [`provideFastMarquee`](adapter/fast-marquee.providers.ts) through [`public-api.ts`](public-api.ts); everything else under [`core/`](core/AGENTS.md) and [`adapter/`](adapter/AGENTS.md) is internal.
- **Architecture**: [`core/`](core/AGENTS.md) is the framework-agnostic engine; [`adapter/`](adapter/AGENTS.md) is the thin Angular shell — governed by the [Core/Adapter Library Architecture](../../../knowledge/decisions/core-adapter-architecture.md) decision.
