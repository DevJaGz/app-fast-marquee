# adapter — Angular Shell

Thin Angular wrapper for the `ngx-fast-marquee` library core engine.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`../AGENTS.md`](../AGENTS.md) |

## Modules

| Module | Path |
|--------|------|
| Component | [`ngx-fast-marquee.component.ts`](ngx-fast-marquee.component.ts) — decorator-based (non-standalone), OnPush, `@Input()`/`@Output()` with `ngOnChanges` driving `core/` recomputation; `@HostBinding` getters for the `data-*`/`--_*` host bindings (`@angular-eslint/no-host-metadata-property` forbids the `host: {}` metadata object at this line's lint floor); boots the core [`MarqueeEngine`](../core/marquee-engine.ts) from `ngAfterViewInit` + `isPlatformBrowser`; wraps `onMeasured`/`onUpdated`/reduced-motion-source callback bodies in `NgZone.run(...)` — see the zone.js note below |
| Module | [`ngx-fast-marquee.module.ts`](ngx-fast-marquee.module.ts) — `NgModule` wrapper: declares/exports the component and **always** bundles the idle-callback guard in its own `providers` (unlike the `20.x` line, there's no way to opt out of the guard while importing this module — see the idle-callback guard note below) |
| Providers | [`fast-marquee.providers.ts`](fast-marquee.providers.ts) — [`provideFastMarquee()`](fast-marquee.providers.ts) returns a classic `APP_INITIALIZER` (`multi: true`) `Provider[]`; for consumers who declare the raw component directly (bypassing `NgxFastMarqueeModule`) — see [Idle-Callback Guard](../../../../knowledge/decisions/idle-callback-guard.md) |
| Barrel | [`index.ts`](index.ts) |
| Tests | [`ngx-fast-marquee.component.spec.ts`](ngx-fast-marquee.component.spec.ts) (Angular 12 TestBed specs), [`fast-marquee.providers.spec.ts`](fast-marquee.providers.spec.ts) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Ivy binds a component's declaring `NgModule` at compile time**: a component declared by `NgxFastMarqueeModule` cannot be re-declared in a different module within the same compiled program (`NG6007`). There is no `20.x`-style "standalone component, no module" escape hatch on this line — consumers who need the raw component without the module's bundled guard must declare it directly in their own module *and* resolve `@ngx-fast-marquee` against the built `dist/` package, not the workspace source (see `tsconfig.app.no-idle-guard.json`-style overrides if this pattern is needed again).
- **zone.js 0.11.4 doesn't reliably patch `requestIdleCallback`/`ResizeObserver`/`MutationObserver`**: a callback from any of these can run outside the Angular zone, so `ChangeDetectorRef.markForCheck()` alone marks the view dirty without anything triggering the next tick to flush it (confirmed via `ng.getComponent()` in a real browser: internal state updates, DOM stays stale until an unrelated zone-tracked event incidentally ticks). Any new async engine callback wired here must wrap its body in `NgZone.run(...)`, not just call `markForCheck()`.
- **Tests**: co-located [`*.spec.ts`](ngx-fast-marquee.component.spec.ts) files; run with [`npm run test:lib`](../../../../package.json). Test hosts use `Default` change detection, not `OnPush` — a `ComponentFixture` whose *root* view is itself `OnPush` doesn't reliably re-check on a second `detectChanges()` call for a plain property mutation in this Angular 12 TestBed environment (confirmed in isolation, independent of the component under test). `NgxFastMarqueeComponent` itself stays `OnPush` as the child under test. Follow convention **#14** in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — no test seams in production code.
- **Public exports**: every new public symbol must be re-exported through [`../public-api.ts`](../public-api.ts).
- **README sync**: keep the library [`README.md`](../README.md) in sync with public API changes.
