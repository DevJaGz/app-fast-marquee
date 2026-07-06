# models — Library Models & Interfaces

Data models and interfaces for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- Contains data models and interfaces (e.g. [`marquee.model.ts`](marquee.model.ts)).
- Models must not import from `components/` or `services/` — they are pure data shapes.
- If exporting publicly, add the export to [`src/public-api.ts`](../public-api.ts).
