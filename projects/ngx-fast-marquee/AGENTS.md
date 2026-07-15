# ngx-fast-marquee — Publishable Library

Publishable Angular component library for the fast-marquee monorepo.

## Navigation

| Node | Path |
|------|------|
| Consumer documentation | [`README.md`](README.md) — install, usage, public API, Angular compatibility |
| License | [`LICENSE`](LICENSE) — MIT text, packaged into the published tarball by ng-packagr |
| Library Source | [`src/AGENTS.md`](src/AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **12.x branch**: self-contained Angular 12 workspace — Node `^14.15.0`, TypeScript `~4.2.3`, decorator/`NgModule` adapter over the same `core/` engine architecture. See [branch-model-version-lines.md](../../knowledge/decisions/branch-model-version-lines.md).
- **Selector prefix**: `ngx-fast-marquee` (set in [`angular.json`](../../angular.json)).
- **Build**: `npm run build:lib`. Output goes to `dist/ngx-fast-marquee/` (partial-Ivy compilation, linkable by Angular 12–19 consumers — `"compilationMode": "partial"` in [`tsconfig.lib.prod.json`](tsconfig.lib.prod.json)).
- **Tests**: `npm run test:lib` (Jasmine/Karma via `ChromeHeadless` — a real browser, not jsdom, so `requestIdleCallback` is native and no jsdom polyfill is needed). Production-first testing: convention **#14** in [`knowledge/conventions.md`](../../knowledge/conventions.md) — never add test seams to production code.
- **Core dialect floor**: `core/**` must type-check under TypeScript `4.2.3` (Angular 12.0.x's minimum), enforced by [`npm run check:core-dialect`](../../package.json) against [`tsconfig.core-dialect.json`](tsconfig.core-dialect.json) — see [`src/core/AGENTS.md`](src/core/AGENTS.md).
- **No app-only dependencies**: do not add dependencies that are only needed by the demo app. Keep peer deps lean.
- Every new public symbol (component, service, type, model, provider function) must be exported through [`src/public-api.ts`](src/public-api.ts).
- Keep the library's own [`README.md`](README.md), Angular compatibility table, and semver version in sync with any public API changes — `version`/`peerDependencies` and the README compat table are guardrail-gated (see [guardrails](../../knowledge/guardrails.md)).
- **Idle-callback guard**: the library ships `provideFastMarquee()` and bundles it automatically into `NgxFastMarqueeModule`'s own `providers` ([`src/adapter/AGENTS.md`](src/adapter/AGENTS.md)), backed by an internal utility in [`src/core/`](src/core/AGENTS.md), to work around a Safari/iOS idle-callback crash ([angular/angular#53721](https://github.com/angular/angular/issues/53721)); keep the [`README.md`](README.md) setup instructions in sync with it.
- Library ESLint config: [`projects/ngx-fast-marquee/.eslintrc.json`](.eslintrc.json).
