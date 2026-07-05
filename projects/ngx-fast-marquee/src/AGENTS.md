# ngx-fast-marquee/src — Library Source

Source root for the `ngx-fast-marquee` publishable library.

## Navigation

| Node | Path |
|------|------|
| Library Root | [`projects/ngx-fast-marquee/AGENTS.md`](../AGENTS.md) |
| Components | [`components/AGENTS.md`](components/AGENTS.md) |
| Models | [`models/AGENTS.md`](models/AGENTS.md) |
| Providers | [`providers/AGENTS.md`](providers/AGENTS.md) |
| Services | [`services/AGENTS.md`](services/AGENTS.md) |
| Types | [`types/AGENTS.md`](types/AGENTS.md) |
| Utils | [`utils/AGENTS.md`](utils/AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../../AGENTS.md) — it is the mandatory single source of truth.

- **Public API discipline**: **every** exported symbol must be re-exported from [`public-api.ts`](public-api.ts). Do not import library internals directly from the app.
  - **Exception**: internal helpers under [`utils/`](utils/AGENTS.md) (e.g. `ensureIdleCallbackFallback`) are deliberately kept out of [`public-api.ts`](public-api.ts); consumers integrate through `provideFastMarquee()` from [`providers/`](providers/AGENTS.md).
- **Module entry**: [`ngx-fast-marquee.module.ts`](ngx-fast-marquee.module.ts) declares/exports the component for NgModule consumers and registers `provideFastMarquee()` so NgModule apps get the idle-callback guard automatically.
- **Signal-based public API**: the component's inputs/outputs/queries use `input()`/`output()`/`viewChild()`, not `@Input()`/`@Output()`/`@ViewChild()`. [`MarqueeModel`](models/AGENTS.md) declares its abstract properties as `Signal<T>`, so anything reading from a `MarqueeModel` instance (e.g. [`MarqueeService`](services/AGENTS.md), [`MarqueeDuplicationService`](services/AGENTS.md)) must call them as functions (`direction()`, not `direction`).
