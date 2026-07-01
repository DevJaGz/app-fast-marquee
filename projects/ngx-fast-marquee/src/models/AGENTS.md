# models — Library Models & Interfaces

Data models and interfaces for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../../../AGENTS.md) |
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../../../AGENTS.md) — it is the mandatory single source of truth.

- Contains data models and interfaces (e.g. [`marquee.model.ts`](marquee.model.ts)).
- Models must not import from `components/` or `services/` — they are pure data shapes.
- If exporting publicly, add the export to [`src/public-api.ts`](../public-api.ts).
