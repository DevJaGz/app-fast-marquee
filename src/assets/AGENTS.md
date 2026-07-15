# src/assets — Static Assets

Static assets served with the application.

## Navigation

| Node | Path |
|------|------|
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **12.x branch**: empty except for [`.gitkeep`](.gitkeep) — the `20.x` line's fonts/images belonged to the showcase homepage, which this branch doesn't port (scoped to the e2e behavior-contract surface only, see [`src/AGENTS.md`](../AGENTS.md)).
- Any static assets (fonts, images, icons) added here must be referenced via the `assets` array in [`angular.json`](../../angular.json).
