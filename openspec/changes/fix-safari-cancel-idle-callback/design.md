## Context

[Issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5) reports that `ngx-fast-marquee` 0.2.3 crashes on iOS Safari with `ReferenceError: Can't find variable: cancelIdleCallback`, followed by secondary `NG0200: Circular dependency in DI detected` errors, when navigating to a routed page that renders the marquee.

Investigation of the current library source (all versions 0.1.6–0.2.3, verified against the published npm tarballs) confirms `ngx-fast-marquee` never references `requestIdleCallback`/`cancelIdleCallback` itself. The actual call site is Angular core's `@defer` idle scheduler, `IdleScheduler` in `packages/core/src/defer/idle_scheduler.ts`:

```js
const _requestIdleCallback = () => typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
const _cancelIdleCallback = () => typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;

class IdleScheduler {
  constructor() {
    ...
    this.requestIdleCallbackFn = _requestIdleCallback().bind(globalThis);
    this.cancelIdleCallbackFn = _cancelIdleCallback().bind(globalThis); // throws here
  }
  static ɵprov = ɵɵdefineInjectable({ token: IdleScheduler, providedIn: 'root', factory: () => new IdleScheduler() });
}
```

Both functions gate on the existence of `requestIdleCallback` only. If `requestIdleCallback` exists but `cancelIdleCallback` doesn't, the constructor's second assignment evaluates the bare `cancelIdleCallback` identifier and throws. This is confirmed live in `@angular/core` 18.2.14 (the version actually installed in this repo), 20.0.0, and 21.2.17 (fesm2022 bundles inspected directly), and is tracked upstream at `angular/angular#53721`; the proposed fix (`angular/angular#53722`, "fix(core): guard `cancelIdleCallback` correctly") was **closed without merging**. A maintainer (`JoostK`) noted Safari has shipped `requestIdleCallback` behind an experimental/partial rollout in some builds without `cancelIdleCallback` — exactly the asymmetric case that trips this guard, matching the reporter's iOS 18.6.2 environment.

**Crash-timing trace for `@defer (on idle) { <ngx-fast-marquee /> }`:**

```
ɵɵdeferOnIdle()              — during change detection of the placeholder view
 → scheduleDelayedTrigger()
   → onIdle(callback, lView)
     → injector.get(IdleScheduler)   — constructs the root singleton on first access
        → constructor: cancelIdleCallbackFn = _cancelIdleCallback()...  — THROWS HERE
   ...triggerDeferBlock() (would fetch the chunk and construct <ngx-fast-marquee>) is the
      scheduled `callback` — it never runs, because scheduling itself threw.
```

The `IdleScheduler` singleton is constructed the *first time any* `@defer (on idle)` block on the page registers its trigger — which happens during change detection of the block's placeholder, strictly **before** the deferred chunk (containing `NgxFastMarqueeComponent`) is fetched or instantiated. A fix placed inside that component (e.g. its constructor) therefore runs, at best, after the crash has already happened and prevented the component from ever loading — or never runs at all, since `triggerDeferBlock` is exactly the callback the crash prevents from firing. This ordering problem is structural, not a matter of where inside the component the guard call is placed: no code that ships only inside a `@defer`-deferred chunk can run early enough to prevent this crash.

`ngx-fast-marquee` is the kind of below-the-fold, route-level widget that host apps commonly wrap in `@defer` (default or `on idle` trigger) for performance, making it the visible trigger for a bug that actually lives in `@angular/core` and that we cannot patch upstream or control the timeline for.

## Goals / Non-Goals

**Goals:**
- Prevent the `ReferenceError: Can't find variable: cancelIdleCallback` (and its `NG0200` fallout) from occurring on any page that renders `ngx-fast-marquee`, **including when it's wrapped in `@defer (on idle)`**, regardless of the host app's Angular version or the browser's idle-callback support level — provided the consumer has wired the guard per their usage pattern (see below).
- For the library's currently-documented `NgModule` usage pattern (`imports: [BrowserModule, NgxFastMarqueeModule]`), require **zero additional consumer change** — the guard rides along on the module's own providers, which are already part of the eagerly-bootstrapped root injector.
- For standalone-component usage (importing `NgxFastMarqueeComponent` directly, e.g. inside a `@defer` block), require exactly **one line** of consumer integration (`provideFastMarquee()` in bootstrap providers) — this is unavoidable because no library-shipped code can run early enough from inside a deferred chunk.
- Never override a genuinely native `requestIdleCallback`/`cancelIdleCallback` implementation.
- Remain a no-op outside real browser contexts (SSR).

**Non-Goals:**
- Fixing `@angular/core` upstream (tracked separately at `angular/angular#53721`; out of this repo's control).
- Providing a spec-accurate `requestIdleCallback` polyfill (real idle-deadline scheduling). The fallback only needs to be non-throwing and functionally adequate for Angular's `IdleScheduler`, which itself already falls back to `setTimeout`/`clearTimeout` semantics when neither API exists.
- Changing `ngx-fast-marquee`'s own resize/update timing logic (`_onResize`, `_startMarqueeUpdeting`), which already uses `setTimeout` and is unrelated to this bug.
- Automatically protecting standalone consumers who wrap the component in `@defer` but forget to add `provideFastMarquee()`. This is a documented required step, not something the library can silently guarantee (see Context — it's structurally impossible).

## Decisions

**1. Fix activation point: an eager `APP_INITIALIZER`-based provider, not the component constructor.**
The crash-timing trace above proves the component constructor runs too late for `@defer (on idle)` usage — the offending `IdleScheduler` construction happens before the deferred chunk is even fetched. The only way to run before it is to hook into application initialization itself. Angular's `APP_INITIALIZER` multi-provider token runs its factories during app bootstrap, before the first change detection cycle, which is before any `@defer` trigger can be registered anywhere in the app. `APP_INITIALIZER` is used (over the newer `provideEnvironmentInitializer`, added in Angular v19) because it's been available since early Angular and works across this library's full `>=17.0.0` peer range.

**2. Ship the initializer as a public `provideFastMarquee(): Provider[]` function, and also bake it into `NgxFastMarqueeModule`'s `providers`.**
Two consumer shapes exist today: (a) the README's current `NgModule`-based pattern, where `NgxFastMarqueeModule` is imported eagerly at the app root — registering the same `APP_INITIALIZER` provider inside that module's own `providers` array means those consumers get the fix for free, with no visible change to their code; (b) standalone-component consumers who import `NgxFastMarqueeComponent` directly (the pattern most likely to be wrapped in `@defer`, since `@defer` operates on standalone dependencies) — these consumers have no eagerly-loaded module to hook into, so they must explicitly add `provideFastMarquee()` to their `bootstrapApplication()` providers. Both paths call the same underlying `ensureIdleCallbackFallback()` utility, so there's a single source of truth for the fallback logic.

**3. Keep a defensive call to `ensureIdleCallbackFallback()` in `NgxFastMarqueeComponent`'s constructor too, but document that it does not cover `@defer`.**
This is cheap, idempotent, and harmless. It covers instantiation paths that don't go through `@defer` at all (e.g. `ViewContainerRef.createComponent`, plain synchronous rendering) as extra defense-in-depth, and guarantees the guard has run by the time the component is usable even if a consumer's bootstrap wiring is incomplete for those paths. It must not be relied upon as *the* fix for the `@defer` race — that's `provideFastMarquee()`'s job.

**4. Detect environment via `typeof window !== 'undefined'`, patch `window` directly.**
Angular's `IdleScheduler` resolves `requestIdleCallback`/`cancelIdleCallback` as bare identifiers, which resolve through the global object (`window` in browsers). Patching `window.requestIdleCallback`/`window.cancelIdleCallback` makes them resolve identically to a native implementation from any caller's perspective, including Angular core's. `typeof window !== 'undefined'` is `false` during SSR, satisfying the SSR no-op requirement without `PLATFORM_ID`/`isPlatformBrowser` DI plumbing.

**5. Patch only the missing side; never touch an existing implementation; no idempotency flag needed.**
Check `requestIdleCallback` and `cancelIdleCallback` independently via `typeof`, and only assign a `setTimeout`/`clearTimeout`-backed fallback for whichever side is missing. Cheap enough to repeat on every call site (bootstrap initializer, module load, component construction) without a module-level "already patched" flag.

**6. Fallback shape matches what Angular's own `IdleScheduler` already expects.**
Our polyfill mirrors Angular's own no-idle-support contract (`requestIdleCallback` fallback returns a `setTimeout` handle consumable by the `clearTimeout`-based `cancelIdleCallback` fallback), so behavior stays consistent with what Angular itself already does when neither API exists.

## Risks / Trade-offs

- **[Risk] Standalone consumers who wrap the component in `@defer (on idle)` but forget to add `provideFastMarquee()` remain exposed to the crash.** → Mitigation: document this prominently as a required setup step (not a footnote) in the README's "Getting Started" section, immediately next to the standalone usage example; this is an inherent limit of what a library can guarantee once code is split behind a lazy boundary, not a gap we can close further.
- **[Risk] The `NgModule`-embedded provider only helps while `NgxFastMarqueeModule` itself is loaded eagerly; a consumer who lazy-loads a *feature module* containing it reintroduces the same race.** → Mitigation: document explicitly that any lazy-loading of the module (not just `@defer` on the component) requires `provideFastMarquee()` at root bootstrap instead.
- **[Risk] Silently masking a real upstream Angular bug for years if it never gets fixed.** → Acceptable: the workaround is cheap, harmless when both natives exist, and is a no-op once `angular/angular#53721` is eventually fixed and the consumer's Angular version picks it up.
- **[Risk] Patching `window.requestIdleCallback`/`cancelIdleCallback` could interact with other code doing its own (incorrectly) both-or-neither feature detection.** → Mitigation: we only fill genuine gaps and never remove/replace an existing native function, so any other code sees a consistent, always-symmetric pair after our guard runs — strictly safer than the pre-existing asymmetric state.
- **[Risk] Adding an `APP_INITIALIZER` entry adds one more factory to the app's init chain.** → Negligible: the factory is synchronous and does a handful of `typeof` checks.

## Migration Plan

Ship as a minor release (new public API surface: `provideFastMarquee()`), not a silent patch.
- **`NgModule` consumers** (current README pattern): no action needed — the fix activates automatically because `NgxFastMarqueeModule`'s providers now include it.
- **Standalone-component consumers**, especially anyone wrapping `<ngx-fast-marquee>` in `@defer`: add `provideFastMarquee()` to `bootstrapApplication()`'s `providers` array. Call this out explicitly in release notes and at the top of the README's standalone usage section.
- Non-breaking to existing rendering behavior either way; rollback is a simple downgrade if unexpected regressions surface.

## Open Questions

None — root cause, crash-timing trace, fix activation point, and verification strategy are all confirmed against the actual upstream Angular source (18.2.14 through 21.2.17) and the reported error signature.
