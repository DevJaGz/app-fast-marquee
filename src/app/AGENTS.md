# src/app — Application Module

Angular application module root.

## Navigation

| Node | Path |
|------|------|
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../AGENTS.md) — it is the mandatory single source of truth.

- Feature architecture: `core/` (app-wide singletons: layout, guards, interceptors), `shared/` (reusable components, directives, pipes), `features/` (page-level feature components/routes).
- All components are **standalone** (no NgModule declarations except the root app config).
- Use the [`angular-developer`](../../.agents/skills/angular-developer/SKILL.md) skill before generating any Angular code.
- Route configuration lives in [`src/app/app.routes.ts`](app.routes.ts).
- The bootstrap config ([`app.config.ts`](app.config.ts)) must keep `provideFastMarquee()` registered: the home feature renders `<ngx-fast-marquee>` inside `@defer (on idle)`, which crashes on some Safari/iOS builds without it (see [`projects/ngx-fast-marquee/src/providers/AGENTS.md`](../../projects/ngx-fast-marquee/src/providers/AGENTS.md)).
