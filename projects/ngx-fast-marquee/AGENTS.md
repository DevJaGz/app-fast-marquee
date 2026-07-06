# ngx-fast-marquee — Publishable Library

Publishable Angular component library for the fast-marquee monorepo.

## Navigation

| Node | Path |
|------|------|
| Consumer documentation | [`README.md`](README.md) — install, usage, public API, Angular compatibility |
| Library Source | [`src/AGENTS.md`](src/AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Selector prefix**: `ngx-fast-marquee` (set in [`angular.json`](../../angular.json)).
- **Build**: `npm run build:lib`. Output goes to `dist/ngx-fast-marquee/`.
- **Tests**: `npm run test:lib` (Vitest, jsdom environment). Since the library's own `build` architect target uses the `ng-packagr` builder (incompatible with the `@angular/build:unit-test` builder's `buildTarget` option), [`angular.json`](../../angular.json) defines a dedicated `test-build` architect target (`@angular/build:application`) used only to compile spec files. jsdom doesn't implement the idle-callback APIs, so [`src/test-setup.ts`](src/test-setup.ts) polyfills them before tests run — keep it in sync if idle-callback behavior changes.
- **No app-only dependencies**: do not add dependencies that are only needed by the demo app. Keep peer deps lean.
- Every new public symbol (component, service, type, model, provider function) must be exported through [`src/public-api.ts`](src/public-api.ts).
- Keep the library's own [`README.md`](README.md), Angular compatibility table, and semver version in sync with any public API changes.
- **Idle-callback guard**: the library ships `provideFastMarquee()` ([`src/providers/AGENTS.md`](src/providers/AGENTS.md)) backed by an internal utility ([`src/utils/AGENTS.md`](src/utils/AGENTS.md)) to work around a Safari/iOS `@defer` crash ([angular/angular#53721](https://github.com/angular/angular/issues/53721)); keep the [`README.md`](README.md) setup instructions in sync with it.
- Library ESLint config: [`projects/ngx-fast-marquee/.eslintrc.json`](.eslintrc.json).
