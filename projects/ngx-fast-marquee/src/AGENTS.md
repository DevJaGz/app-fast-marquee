# ngx-fast-marquee/src — Library Source

Source root for the `ngx-fast-marquee` publishable library.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../../AGENTS.md) |
| Library Root | [`projects/ngx-fast-marquee/AGENTS.md`](../AGENTS.md) |
| Components | [`components/AGENTS.md`](components/AGENTS.md) |
| Models | [`models/AGENTS.md`](models/AGENTS.md) |
| Services | [`services/AGENTS.md`](services/AGENTS.md) |
| Types | [`types/AGENTS.md`](types/AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../../AGENTS.md) — it is the mandatory single source of truth.

- **Public API discipline**: **every** exported symbol must be re-exported from [`public-api.ts`](public-api.ts). Do not import library internals directly from the app.
- **Module entry**: [`ngx-fast-marquee.module.ts`](ngx-fast-marquee.module.ts) declares/exports the component for NgModule consumers.
