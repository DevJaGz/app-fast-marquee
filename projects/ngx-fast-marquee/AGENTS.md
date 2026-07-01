# ngx-fast-marquee — Publishable Library

Publishable Angular component library for the fast-marquee monorepo.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../AGENTS.md) |
| Library Source | [`src/AGENTS.md`](src/AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../AGENTS.md) — it is the mandatory single source of truth.

- **Selector prefix**: `ngx-fast-marquee` (set in [`angular.json`](../../angular.json)).
- **Build**: `npm run build:lib`. Output goes to `dist/ngx-fast-marquee/`.
- **No app-only dependencies**: do not add dependencies that are only needed by the demo app. Keep peer deps lean.
- Every new public symbol (component, service, type, model) must be exported through [`src/public-api.ts`](src/public-api.ts).
- Keep the library's own [`README.md`](README.md), Angular compatibility table, and semver version in sync with any public API changes.
- Library ESLint config: [`projects/ngx-fast-marquee/.eslintrc.json`](.eslintrc.json).
