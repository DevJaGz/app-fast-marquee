## ADDED Requirements

### Requirement: Idle Callback Browser Compatibility

The library SHALL remain fully functional in browser environments where the global `requestIdleCallback`/`cancelIdleCallback` APIs are absent, or where only one of the two is available (asymmetric support), such as certain Safari/iOS builds. The library SHALL ensure both functions exist and are mutually consistent (both native, or both `setTimeout`/`clearTimeout`-backed fallbacks) so that no caller — including Angular core's own `@defer` idle scheduler — can trigger an uncaught `ReferenceError` for a missing idle-callback identifier. The library SHALL NOT overwrite a native implementation that is already present.

This guarantee applies to `NgModule`-based consumption (`NgxFastMarqueeModule` imported eagerly at the app root) automatically. For standalone-component consumption where `NgxFastMarqueeComponent` may be rendered inside a `@defer` block, this guarantee requires the consumer to register the library's provided initializer at application bootstrap, because Angular constructs its idle scheduler during change detection of the `@defer` placeholder — before the deferred chunk containing the component is fetched or instantiated — so no code shipped only inside that chunk can run early enough on its own.

#### Scenario: Neither idle-callback API is available

- **WHEN** the library's compatibility guard runs in a browser where `requestIdleCallback` and `cancelIdleCallback` are both undefined
- **THEN** it installs `setTimeout`/`clearTimeout`-based fallbacks for both, so any caller can invoke either function without throwing

#### Scenario: Only requestIdleCallback is available (asymmetric support)

- **WHEN** the library's compatibility guard runs in a browser where `requestIdleCallback` exists but `cancelIdleCallback` is undefined
- **THEN** it defines a `clearTimeout`-backed fallback for `cancelIdleCallback` only, leaving the existing `requestIdleCallback` untouched

#### Scenario: Only cancelIdleCallback is available (asymmetric support)

- **WHEN** the library's compatibility guard runs in a browser where `cancelIdleCallback` exists but `requestIdleCallback` is undefined
- **THEN** it defines a `setTimeout`-backed fallback for `requestIdleCallback` only, leaving the existing `cancelIdleCallback` untouched

#### Scenario: Both idle-callback APIs are natively available

- **WHEN** the library's compatibility guard runs in a browser that natively supports both `requestIdleCallback` and `cancelIdleCallback`
- **THEN** it leaves both native implementations untouched and installs no fallback

#### Scenario: Non-browser (SSR) environment

- **WHEN** the library's compatibility guard runs during server-side rendering where no browser global object is available
- **THEN** it skips installing any idle-callback fallback and does not throw

#### Scenario: NgModule consumer gets the guard automatically before any `@defer` trigger

- **WHEN** an application imports `NgxFastMarqueeModule` eagerly at the app root (the library's documented `NgModule` usage) and later renders `@defer (on idle) { <ngx-fast-marquee /> }` in an asymmetric-support browser
- **THEN** the idle-callback compatibility guard has already run as part of application initialization, before the `@defer` block's placeholder is change-detected, so constructing Angular's idle scheduler does not throw

#### Scenario: Standalone consumer must register the bootstrap provider for `@defer` usage

- **WHEN** an application uses the standalone `NgxFastMarqueeComponent` directly inside a `@defer (on idle)` block in an asymmetric-support browser
- **THEN** the crash is prevented only if the application registered `provideFastMarquee()` in its bootstrap providers; the component's own constructor-level guard call runs after the deferred chunk loads and cannot, by itself, prevent this specific crash
