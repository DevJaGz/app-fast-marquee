## 1. Idle-callback compatibility guard

- [x] 1.1 Create `projects/ngx-fast-marquee/src/utils/idle-callback-compat.util.ts` exporting `ensureIdleCallbackFallback()`, which, only when `typeof window !== 'undefined'`, independently checks `typeof window.requestIdleCallback !== 'function'` and `typeof window.cancelIdleCallback !== 'function'` and assigns a `setTimeout`/`clearTimeout`-backed fallback for whichever side is missing, never touching a side that already exists.
- [x] 1.2 Create `projects/ngx-fast-marquee/src/providers/fast-marquee.providers.ts` exporting `provideFastMarquee(): Provider[]`, returning `[{ provide: APP_INITIALIZER, useValue: ensureIdleCallbackFallback, multi: true }]`.
- [x] 1.3 Export `provideFastMarquee` from `projects/ngx-fast-marquee/src/public-api.ts` as new public API. Keep `ensureIdleCallbackFallback` internal (not exported from `public-api.ts`).
- [x] 1.4 Add `provideFastMarquee()`'s providers to `NgxFastMarqueeModule`'s `@NgModule({ providers: [...] })` in `ngx-fast-marquee.module.ts`, so existing `NgModule`-based consumers get the guard automatically at bootstrap with no code change.
- [x] 1.5 Call `ensureIdleCallbackFallback()` defensively from the top of `NgxFastMarqueeComponent`'s constructor as well (belt-and-suspenders for non-`@defer` instantiation paths) — but do not treat this call site as sufficient protection for `@defer (on idle)` usage.

## 2. Unit tests (Jasmine/Karma)

- [x] 2.1 Add `idle-callback-compat.util.spec.ts` covering: both APIs missing → both get fallbacks; only `requestIdleCallback` present (the reported Safari case) → only `cancelIdleCallback` gets a fallback and the existing `requestIdleCallback` reference is untouched; only `cancelIdleCallback` present → only `requestIdleCallback` gets a fallback; both natively present → neither is overwritten. Save/restore `window.requestIdleCallback`/`window.cancelIdleCallback` around each test.
- [x] 2.2 Add `fast-marquee.providers.spec.ts` asserting `provideFastMarquee()` returns an `APP_INITIALIZER` multi-provider whose factory is `ensureIdleCallbackFallback`.
- [x] 2.3 Add an ordering test using a `TestBed`-configured host component with `@defer (on idle) { <ngx-fast-marquee /> }` in its template: seed the asymmetric environment (`requestIdleCallback` defined, `cancelIdleCallback` deleted), configure `TestBed` with `provideFastMarquee()` in `providers`, trigger the idle callback, and assert no error is thrown and the deferred content renders. This is the test that actually proves the fix, as distinct from testing the guard utility's shape in isolation.
- [x] 2.4 Run `ng test ngx-fast-marquee` (or `npx ng test ngx-fast-marquee`), confirm all specs pass, then stop the Karma/Chrome process and verify the port it opened is released before finishing (per this repo's clean-up convention).

## 3. Documentation

- [x] 3.1 Update `projects/ngx-fast-marquee/README.md`: add `provideFastMarquee()` to the standalone `bootstrapApplication()` example as a required step for anyone using `@defer` around the marquee; note that the `NgModule` usage example needs no change since `NgxFastMarqueeModule` now registers it automatically. Link issue #5 and upstream `angular/angular#53721` for context.
- [x] 3.2 Update `projects/ngx-fast-marquee/AGENTS.md` (and `src/AGENTS.md` if it enumerates file structure) to reflect the new `utils/` and `providers/` folders, per this repo's auto-update convention.
- [x] 3.3 Bump the library version in `projects/ngx-fast-marquee/package.json` (minor bump — new public API) and sync the Angular-compatibility/version table in the README per library conventions.

## 4. Verification

- [x] 4.1 Run `npm run lint` (or `npm run lint:fix`) and `npm run format` (or `npm run prettier:fix`) and resolve any violations.
- [x] 4.2 Run `npm run build:lib` to confirm the library compiles, `provideFastMarquee` appears correctly in the generated type definitions, and `ensureIdleCallbackFallback` is not leaked as a public export.
- [x] 4.3 Manually reproduce in a real WebKit engine (e.g. Playwright `webkit` with an init script defining `window.requestIdleCallback` and deleting `window.cancelIdleCallback`): render a page with `@defer (on idle) { <ngx-fast-marquee /> }` (a) without `provideFastMarquee()` in bootstrap providers — confirm the crash still occurs, documenting the limit of what the library can guarantee without the required integration step — and (b) with `provideFastMarquee()` — confirm no `ReferenceError`/`NG0200` appears.
- [x] 4.4 Add a `@defer (on idle)`-wrapped usage of `<ngx-fast-marquee>` to the demo app (`src/`), wire `provideFastMarquee()` into its bootstrap config, run `npm run start`, and visually confirm it renders and animates correctly; then stop the dev server and verify its port is released.
