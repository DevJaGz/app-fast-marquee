## Why

On Safari/iOS, `ngx-fast-marquee` v0.2.3 crashes navigation to any page that renders it with `ReferenceError: Can't find variable: cancelIdleCallback` ([issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5)), which then cascades into spurious `NG0200: Circular dependency in DI detected` errors. Root cause: Angular's own `@defer` `IdleScheduler` (`packages/core/src/defer/idle_scheduler.ts`) decides whether to use native idle-callback APIs by checking only `typeof requestIdleCallback !== 'undefined'`, then unconditionally references the bare `cancelIdleCallback` identifier in that branch — it never checks `cancelIdleCallback` independently. Some WebKit/Safari builds expose `requestIdleCallback` behind an experimental flag/partial rollout without `cancelIdleCallback`, so the guard passes but the bare reference throws. This is a confirmed, still-unfixed upstream bug (`angular/angular#53721`; the fix PR `angular/angular#53722` was closed without merging), present in `@angular/core` 18.2.14 through at least 21.2.17. `ngx-fast-marquee` doesn't call idle-callback APIs itself, but it is exactly the kind of below-the-fold, route-level content teams wrap in `@defer` — making it the visible trigger for a bug we cannot patch upstream.

Critically, the crash happens at `@defer (on idle)` trigger-scheduling time — when Angular first constructs its `IdleScheduler` singleton — which runs during change detection of the placeholder view, **before** the deferred chunk containing `NgxFastMarqueeComponent` is ever fetched or instantiated. Any fix that only runs from inside the component (e.g. its constructor) executes strictly after the crash site in that scenario and cannot prevent it. The fix must instead run eagerly, at application-initialization time, before Angular processes any `@defer` block.

## What Changes

- Add an idle-callback compatibility guard (`ensureIdleCallbackFallback()`) that ensures `requestIdleCallback`/`cancelIdleCallback` are always both present and mutually consistent on `window` (native+native, or polyfill+polyfill via `setTimeout`/`clearTimeout`) — never native-plus-missing. SSR-safe (no-op outside a browser context) and non-destructive (never overwrites an existing native implementation).
- Add a public `provideFastMarquee()` provider function (`{ provide: APP_INITIALIZER, useValue: ensureIdleCallbackFallback, multi: true }`) that standalone-component consumers add to their `bootstrapApplication()` providers. `APP_INITIALIZER` factories run during application initialization, before the first change detection pass, which is early enough to run before any `@defer` block can ever construct Angular's `IdleScheduler`.
- Register the same provider inside `NgxFastMarqueeModule`'s own `providers` array, so consumers following this library's currently-documented `NgModule`-based usage (`imports: [BrowserModule, NgxFastMarqueeModule]`) get the guard automatically at bootstrap with **no additional change**, since that module is already imported eagerly at the app root in the documented pattern.
- Keep a defensive call to `ensureIdleCallbackFallback()` in `NgxFastMarqueeComponent`'s constructor as well, as belt-and-suspenders for non-`@defer` instantiation paths (e.g. dynamic component creation). This does **not** protect the `@defer (on idle)` scenario by itself — `provideFastMarquee()` (directly, or transitively via `NgxFastMarqueeModule`) is the part that does.
- Add Jasmine/Karma unit tests that (a) verify the guard utility's fallback behavior in isolation, and (b) prove ordering — that installing `provideFastMarquee()` before a `@defer (on idle)` block is processed prevents the crash in a simulated asymmetric-support environment.
- Document the required one-line bootstrap integration (standalone apps) and the automatic behavior (NgModule apps) in the library `README.md`.
- Add a Playwright end-to-end suite ([`e2e/`](e2e/)) that automates verification in Chromium and WebKit: the default app (with guard) and a `no-idle-guard` scenario (without guard) that reproduces the upstream crash, runnable via [`pnpm e2e`](package.json) (Docker) or [`pnpm e2e:local`](package.json) (local).

## Capabilities

### New Capabilities

_None — this hardens existing library behavior rather than introducing a new capability._

### Modified Capabilities

- `library`: the library must remain functional when the host browser has asymmetric or missing `requestIdleCallback`/`cancelIdleCallback` support (e.g. Safari/iOS), including when the marquee is rendered inside a `@defer (on idle)` block — instead of depending on the consuming app's Angular version having a correct feature-detection guard, and instead of assuming a fix inside the component itself runs early enough.
- `application`: the demo app must ship an e2e suite that verifies the idle-callback guard in real browsers, including crash reproduction when `provideFastMarquee()` is omitted.

## Impact

- **Affected code**: `projects/ngx-fast-marquee/src/` — new utility (idle-callback compatibility guard), a new public provider function, a call site in `components/ngx-fast-marquee/ngx-fast-marquee.component.ts`, and a `providers` addition to `ngx-fast-marquee.module.ts`.
- **New public API**: `provideFastMarquee()` exported from `public-api.ts` — standalone consumers must add it to their bootstrap providers if they render `ngx-fast-marquee` inside a `@defer` block; documented as a required integration step, not silently automatic, for that usage pattern.
- **Affected tests**: new spec file(s) under `projects/ngx-fast-marquee/src/` exercising both the guard utility and the bootstrap-vs-`@defer` ordering, run via `ng test ngx-fast-marquee`; new Playwright e2e specs under [`e2e/tests/`](e2e/tests/) run via [`pnpm e2e`](package.json).
- **Affected docs**: `projects/ngx-fast-marquee/README.md` — new setup step plus compatibility notes; root [`AGENTS.md`](AGENTS.md), [`e2e/AGENTS.md`](e2e/AGENTS.md), and [`README.md`](README.md) — e2e commands and conventions.
- **New dev dependencies**: `@playwright/test`, `playwright-ng-schematics` (e2e only; not shipped with the library).
- **Library runtime**: implemented with native `setTimeout`/`clearTimeout`/`APP_INITIALIZER`, no new runtime packages.
- **No breaking changes to existing behavior**: additive only; existing component inputs/outputs (`Direction`, `Speed`, etc.) are untouched. Note: standalone consumers using `@defer` around the marquee must add the new provider for the fix to take effect — this is a required action for that usage pattern, not a behavior change to existing code.
