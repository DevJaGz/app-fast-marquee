# utils — Library Utilities

Framework-free utility functions for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../../../AGENTS.md) — it is the mandatory single source of truth.

- Utilities: [`idle-callback-compat.util.ts`](idle-callback-compat.util.ts) exports `ensureIdleCallbackFallback()`, the Safari/iOS idle-callback compatibility guard (see [angular/angular#53721](https://github.com/angular/angular/issues/53721)).
- Utilities in this folder are **internal**: they are deliberately not re-exported from [`public-api.ts`](../public-api.ts); consumers integrate through `provideFastMarquee()` in [`../providers/fast-marquee.providers.ts`](../providers/fast-marquee.providers.ts).
- Utilities must be SSR-safe: guard all `window`/`document` access.
- Tests: [`idle-callback-compat.util.spec.ts`](idle-callback-compat.util.spec.ts).
