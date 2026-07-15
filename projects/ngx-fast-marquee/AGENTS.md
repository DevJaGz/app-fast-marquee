# ngx-fast-marquee — Publishable Library

Publishable Angular component library for the fast-marquee monorepo.

## Navigation

| Node | Path |
|------|------|
| Consumer documentation | [`README.md`](README.md) — install, usage, public API, Angular compatibility |
| License | [`LICENSE`](LICENSE) — MIT text, packaged into the published tarball by ng-packagr |
| Library Source | [`src/AGENTS.md`](src/AGENTS.md) |
| Schematics (`ng add`/`ng update`) | [`schematics/`](schematics/) — `collection.json`, `ng-add/index.ts`, `migrations.json` |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Selector prefix**: `ngx-fast-marquee` (set in [`angular.json`](../../angular.json)).
- **Build**: `pnpm build:lib`. Runs the ng-packagr build, then compiles [`schematics/`](schematics/) (`tsc -p schematics/tsconfig.schematics.json`) and copies its collection/schema JSON files ([`schematics/copy-schematics-assets.mjs`](schematics/copy-schematics-assets.mjs)) into the output. Output goes to `dist/ngx-fast-marquee/`, including `dist/ngx-fast-marquee/schematics/`.
- **Tests**: `pnpm test:lib` (Vitest, jsdom environment). Since the library's own `build` architect target uses the `ng-packagr` builder (incompatible with the `@angular/build:unit-test` builder's `buildTarget` option), [`angular.json`](../../angular.json) defines a dedicated `test-build` architect target (`@angular/build:application`) used only to compile spec files. jsdom doesn't implement the idle-callback APIs, so [`src/test-setup.ts`](src/test-setup.ts) polyfills them before tests run — keep it in sync if idle-callback behavior changes. Production-first testing: convention **#14** in [`knowledge/conventions.md`](../../knowledge/conventions.md) — never add test seams to production code.
- **Schematics tests**: `pnpm test:schematics` — plain Vitest (node environment, no jsdom, [`schematics/vitest.config.ts`](schematics/vitest.config.ts)), separate from the Angular unit-test builder since schematics are CommonJS Node code, not Angular runtime code. The script compiles the schematics and copies their JSON assets into `dist/ngx-fast-marquee/schematics/` first, then runs `SchematicTestRunner` against that compiled output — tests exercise the same artifact `ng add`/`ng update` would load from a published package. [`schematics/tsconfig.schematics.json`](schematics/tsconfig.schematics.json) excludes spec files from that build (design D3), so a separate [`schematics/tsconfig.spec.json`](schematics/tsconfig.spec.json) (`tsc --noEmit`, ESM/bundler resolution matching Vitest's own transform) type-checks the spec files without shipping them — Vitest's esbuild transform alone doesn't catch type errors. The library's own [`tsconfig.spec.json`](tsconfig.spec.json) excludes `schematics/**/*` so `pnpm test:lib` never picks up these Node-only specs.
- **No app-only dependencies**: do not add dependencies that are only needed by the demo app. Keep peer deps lean.
- Every new public symbol (component, service, type, model, provider function) must be exported through [`src/public-api.ts`](src/public-api.ts).
- Keep the library's own [`README.md`](README.md), Angular compatibility table, and semver version in sync with any public API changes.
- **Idle-callback guard**: the library ships `provideFastMarquee()` ([`src/adapter/AGENTS.md`](src/adapter/AGENTS.md)) backed by an internal utility in [`src/core/`](src/core/AGENTS.md) to work around a Safari/iOS `@defer` crash ([angular/angular#53721](https://github.com/angular/angular/issues/53721)); keep the [`README.md`](README.md) setup instructions in sync with it.
- Library ESLint config: [`projects/ngx-fast-marquee/.eslintrc.json`](.eslintrc.json).
