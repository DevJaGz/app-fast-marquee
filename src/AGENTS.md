# src — Application Source Root

Application source root for `app-fast-marquee`.

## Navigation

| Node | Path |
|------|------|
| App module | [`src/app/AGENTS.md`](app/AGENTS.md) |
| Static assets | [`src/assets/AGENTS.md`](assets/AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../knowledge/conventions.md) — they are the mandatory single source of truth.

- **12.x branch**: this demo app is scoped to the e2e behavior-contract surface only (task 4.4's acceptance gate), not full visual parity with the `20.x` line's showcase homepage — that's an explicit non-goal (see [`openspec/changes/adapt-12x-line/design.md`](../openspec/changes/adapt-12x-line/design.md)). There is no `src/app/features/`, `src/app/shared/`, or `src/styles/` here.
- Selector prefix for all application components: `app` (configured in [`angular.json`](../angular.json)).
- Angular 12 NgModule/decorator idioms — see [`src/app/AGENTS.md`](app/AGENTS.md). No standalone components, no signals, no `@defer`/`@if`/`@for` control flow (all Angular 14+/17+ features, absent from Angular 12): use `*ngIf`/`*ngFor` and zone-based change detection.
- Build target: `npm run build:app`. Dev server: `npm run start`. Unit tests (Jasmine/Karma via `ChromeHeadless`): `npm run test:app`.
- The home feature renders `<ngx-fast-marquee>` behind a manual idle-callback gate (mirroring the `20.x` line's `@defer (on idle)` usage, which doesn't exist in Angular 12) — see [`src/app/AGENTS.md`](app/AGENTS.md). E2e coverage lives in [`e2e/AGENTS.md`](../e2e/AGENTS.md).
- No SSR on this branch — the `20.x` line's `@angular/ssr` setup (`server.ts`, `main.server.ts`, `app.config.server.ts`) doesn't carry over; this is a plain client-rendered Angular 12 app.
