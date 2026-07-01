# src/app — Application Module

Angular application module root.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../AGENTS.md) |
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../AGENTS.md) — it is the mandatory single source of truth.

- Feature architecture: `core/` (app-wide singletons: layout, guards, interceptors), `shared/` (reusable components, directives, pipes), `features/` (page-level feature components/routes).
- All components are **standalone** (no NgModule declarations except the root app config).
- Use the [`angular-developer`](../../.agents/skills/angular-developer/SKILL.md) skill before generating any Angular code.
- Route configuration lives in [`src/app/app.routes.ts`](app.routes.ts).
