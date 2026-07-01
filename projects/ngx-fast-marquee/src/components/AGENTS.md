# components — Library Components

Standalone Angular components for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../../../AGENTS.md) |
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../../../AGENTS.md) — it is the mandatory single source of truth.

- **Barrel**: all component exports are re-exported from [`index.ts`](index.ts).
- All components are **standalone** (no NgModule wrapping at component level; NgModule lives in `src/` for backward-compat consumers).
- Each new component must be added to [`index.ts`](index.ts) and to [`src/public-api.ts`](../public-api.ts).
- Use the [`angular-developer`](../../../../.agents/skills/angular-developer/SKILL.md) skill for component conventions.
