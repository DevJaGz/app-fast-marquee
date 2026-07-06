# src/app — Application Module

Angular application module root.

## Navigation

| Node | Path |
|------|------|
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- Feature architecture: `core/` (app-wide singletons: layout, guards, interceptors), `shared/` (reusable components, directives, pipes), `features/` (page-level feature components/routes).
- All components are **standalone** (no NgModule declarations except the root app config).
- Use the [`angular-developer`](../../.agents/skills/angular-developer/SKILL.md) skill before generating any Angular code.
- Route configuration lives in [`src/app/app.routes.ts`](app.routes.ts). Server-side rendering mode per route lives in [`src/app/app.routes.server.ts`](app.routes.server.ts) (a `ServerRoute[]` consumed by [`app.config.server.ts`](app.config.server.ts) via `provideServerRendering(withRoutes(serverRoutes))`) — when adding a route to [`app.routes.ts`](app.routes.ts), add a matching entry here too and pick `RenderMode.Prerender` (SSG, the default for this app's static content), `RenderMode.Server` (per-request SSR, for routes needing request-specific data), or `RenderMode.Client` (CSR-only) based on the route's data needs.
- The bootstrap config ([`app.config.ts`](app.config.ts)) must keep `provideFastMarquee()` registered: the home feature renders `<ngx-fast-marquee>` inside `@defer (on idle)`, which crashes on some Safari/iOS builds without it (see [`projects/ngx-fast-marquee/src/providers/AGENTS.md`](../../projects/ngx-fast-marquee/src/providers/AGENTS.md)).
- The app is **zoneless** (`provideZonelessChangeDetection()` in [`app.config.ts`](app.config.ts), no `zone.js` polyfill in [`angular.json`](../../angular.json)). Any new component state that isn't read through a signal in a template (e.g. state mutated from a raw `setTimeout`/`addEventListener` callback) won't trigger change detection on its own — use `signal()`/`computed()` or call `ChangeDetectorRef.markForCheck()` explicitly.
- The e2e `no-idle-guard` scenario swaps [`app.config.ts`](app.config.ts) for [`e2e/fixtures/app.config.no-idle-guard.ts`](../../e2e/fixtures/app.config.no-idle-guard.ts) via `fileReplacements` in [`angular.json`](../../angular.json) (see [`e2e/AGENTS.md`](../../e2e/AGENTS.md)) — when changing [`app.config.ts`](app.config.ts), keep that fixture's exports in sync. Never add test-only hooks to runtime code itself.
