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
- Build target: `npm run build:app`. Dev server: `npm run start`.
