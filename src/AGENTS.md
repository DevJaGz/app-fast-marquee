# src — Application Source Root

Application source root for `app-fast-marquee`.

## Navigation

| Node | Path |
|------|------|
| App module | [`src/app/AGENTS.md`](app/AGENTS.md) |
| Static assets | [`src/assets/AGENTS.md`](assets/AGENTS.md) |
| Global SCSS | [`src/styles/AGENTS.md`](styles/AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../AGENTS.md) — it is the mandatory single source of truth.

- Selector prefix for all application components: `app` (configured in [`angular.json`](../angular.json)).
- All new components use inline SCSS (`inlineStyle: true`), `changeDetection: OnPush`. These are Angular CLI schematics defaults — do not override.
- SCSS partials in [`src/styles/`](styles/) are importable without relative paths (`includePaths` is set). Import them with `@use 'filename'` (without path prefix).
- Build target: `npm run build:app`. Dev server: `npm run start`. Unit tests (Vitest): `npm run test:app`.
- The home feature renders `<ngx-fast-marquee>` inside `@defer (on idle)` with `provideFastMarquee()` in bootstrap — see [`src/app/AGENTS.md`](app/AGENTS.md). E2e coverage lives in [`e2e/AGENTS.md`](../e2e/AGENTS.md).
- SSR uses the current `@angular/ssr` application-builder API: [`server.ts`](../server.ts) is a plain Express app wired through `AngularNodeAppEngine`/`createNodeRequestHandler`/`writeResponseToNodeResponse` from `@angular/ssr/node` (no `CommonEngine`). [`src/main.server.ts`](main.server.ts) bootstraps via `BootstrapContext`, and [`src/app/app.config.server.ts`](app/app.config.server.ts) registers per-route rendering modes with `provideServerRendering(withRoutes(serverRoutes))` — see [`src/app/AGENTS.md`](app/AGENTS.md) for `app.routes.server.ts`. The [`angular.json`](../angular.json) build target sets `outputMode: "server"` (server bundle + build-time prerendering derived from route config, not a standalone `prerender` flag) and `security.allowedHosts` (SSRF guard for the `Host` header, empty = unrestricted).
