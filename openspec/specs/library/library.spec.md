# Library capability — ngx-fast-marquee

Specs for the publishable `ngx-fast-marquee` Angular library.

## Requirements

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

### Requirement: Scroll Direction and Play State

The marquee SHALL scroll its projected content continuously along the axis and sign selected by `direction` while `play` is true, and SHALL freeze while `play` is false. `direction` defaults to `left`; `play` defaults to `true`. Both SHALL take effect when changed after initialization.

#### Scenario: Default direction scrolls left

- **WHEN** a marquee renders with default inputs and projected content
- **THEN** a projected child's horizontal position moves leftward over time while its cross-axis position stays fixed

#### Scenario: Each direction maps to the correct axis and sign

- **WHEN** `direction` is `left`, `right`, `up`, or `down`
- **THEN** the content scrolls respectively leftward (−X), rightward (+X), upward (−Y), or downward (+Y), and moves only along that axis

#### Scenario: Direction change after initialization applies live

- **WHEN** `direction` changes after the marquee has initialized
- **THEN** the scroll re-orients to the new axis and sign without the component being re-created

#### Scenario: Play pauses and resumes motion

- **WHEN** `play` is false **THEN** the content position does not change over time; **WHEN** `play` is true **THEN** the content scrolls; toggling `play` at runtime stops or resumes motion accordingly

### Requirement: Marquee Speed

The marquee SHALL scroll faster or slower per the `speed` input. Qualitative values `slow`, `medium` (default), and `fast` SHALL order from slowest to fastest. A positive numeric value SHALL set the scroll rate in pixels per second. A numeric value of `0` or a negative value SHALL produce no motion. A numeric `speed` change after initialization SHALL update the rate.

#### Scenario: Qualitative speed ordering

- **WHEN** identical content scrolls at `fast`, `medium`, and `slow`
- **THEN** the distance covered per unit time is greatest at `fast` and least at `slow`

#### Scenario: Numeric speed sets the pixel rate

- **WHEN** `speed` is a positive number N (pixels per second)
- **THEN** a projected child's displacement over an elapsed interval approximates N × interval within tolerance

#### Scenario: Zero or negative numeric speed produces no motion

- **WHEN** `speed` is `0` or negative
- **THEN** the content does not move

#### Scenario: Numeric speed change after initialization re-rates motion

- **WHEN** a numeric `speed` changes after initialization
- **THEN** the scroll rate updates to the new value without the component being re-created

### Requirement: Auto-Fill and Seamless Looping

When `autoFill` is true (default), the marquee SHALL duplicate the projected content so the rendered track covers at least the full container along the scroll axis and the loop is visually seamless (no empty gap appears at the leading edge across a full cycle). When `autoFill` is false, the content SHALL NOT be duplicated and SHALL occupy only its intrinsic size.

#### Scenario: Auto-fill covers the container with no gap

- **WHEN** `autoFill` is true and the projected content is smaller than the container
- **THEN** the rendered marquee fills the entire container extent along the scroll axis, leaving no empty gap

#### Scenario: Auto-fill loops seamlessly

- **WHEN** `autoFill` is true and the marquee scrolls through a full cycle
- **THEN** no empty gap ever appears at the leading edge

#### Scenario: Auto-fill disabled uses intrinsic content only

- **WHEN** `autoFill` is false
- **THEN** the content is not duplicated and occupies only its intrinsic size, and empty space may remain if it is smaller than the container

#### Scenario: Content wider than the container still loops seamlessly

- **WHEN** `autoFill` is true and the projected content already exceeds the container size
- **THEN** the marquee still loops with no visible gap

#### Scenario: Degenerate content does not error

- **WHEN** the projected content is a single item or empty
- **THEN** the marquee renders without error and produces no broken motion or gap artifacts

### Requirement: Edge-Fade Mask

The marquee SHALL fade its edges per the mask inputs. All mask inputs default to `0`, meaning fully opaque edges. `maskPercentage` is a symmetric shorthand that fades both edges. `maskStartPercentage` and `maskEndPercentage` fade the start and end edges independently and, when set, override the symmetric shorthand for their own edge. The fade SHALL follow the scroll axis and SHALL apply independently of whether the marquee is currently animating.

#### Scenario: No mask by default

- **WHEN** all mask inputs are `0`
- **THEN** the marquee edges are fully opaque with no fade

#### Scenario: Symmetric shorthand fades both edges

- **WHEN** `maskPercentage` is greater than `0` and neither `maskStartPercentage` nor `maskEndPercentage` is set
- **THEN** both the start and end edges fade while the center stays opaque

#### Scenario: Start and end fade independently

- **WHEN** only `maskStartPercentage` is set **THEN** only the start edge fades and the end edge stays opaque; **WHEN** only `maskEndPercentage` is set **THEN** only the end edge fades and the start edge stays opaque

#### Scenario: Explicit edge overrides the shorthand

- **WHEN** `maskPercentage` and `maskStartPercentage` are both set
- **THEN** the start edge uses `maskStartPercentage` and the end edge uses `maskPercentage`

#### Scenario: Mask follows the scroll axis

- **WHEN** `direction` is vertical (`up` or `down`) and a mask input is set
- **THEN** the fade applies to the top and bottom edges rather than the left and right

#### Scenario: Mask is independent of motion

- **WHEN** a mask input is greater than `0` while the marquee is paused or not animating
- **THEN** the edge fade is still applied

### Requirement: Interaction and Reduced-Motion Pausing

The marquee SHALL pause on pointer interaction and honor the system reduced-motion preference as opted in. `pauseOnHover`, `pauseOnClick`, and `useSystemReducedMotion` all default to `false`. The reduced-motion preference SHALL be honored live.

#### Scenario: Pause on hover

- **WHEN** `pauseOnHover` is true and the pointer is over the marquee **THEN** motion stops; **WHEN** the pointer leaves **THEN** motion resumes; **WHEN** `pauseOnHover` is false **THEN** hovering has no effect

#### Scenario: Pause on press

- **WHEN** `pauseOnClick` is true and the marquee is pressed **THEN** motion stops; **WHEN** released **THEN** motion resumes; **WHEN** `pauseOnClick` is false **THEN** pressing has no effect

#### Scenario: Reduced motion honored only when opted in

- **WHEN** `useSystemReducedMotion` is true and the OS prefers reduced motion **THEN** the marquee does not move; **WHEN** `useSystemReducedMotion` is true and the OS does not prefer reduced motion **THEN** it scrolls; **WHEN** `useSystemReducedMotion` is false **THEN** it scrolls regardless of the OS setting

#### Scenario: Reduced-motion preference applies live

- **WHEN** `useSystemReducedMotion` is true and the OS reduced-motion setting is toggled at runtime
- **THEN** the marquee stops or starts moving to match, without the component being re-created

### Requirement: Lifecycle Outputs

The `mounted` output SHALL emit exactly once after the marquee first initializes and renders. The `updated` output SHALL emit once each time the marquee changes its rendered layout in response to a content, size, or fill-affecting input change, and SHALL NOT emit when no such change occurs.

#### Scenario: mounted emits once

- **WHEN** the marquee initializes and first renders
- **THEN** the `mounted` output emits exactly once and never again for the life of the component

#### Scenario: updated emits when the rendered layout changes

- **WHEN** a projected-content change or a settled resize causes the marquee to re-measure and rebuild its filled layout
- **THEN** the `updated` output emits once for that change

#### Scenario: updated does not emit without a layout change

- **WHEN** change detection runs with no content, size, or fill-affecting input change — including pure-visual input changes such as `play`, `mask*`, `pauseOnHover`, `pauseOnClick`, or qualitative `speed`
- **THEN** the `updated` output does not emit

### Requirement: Responsive Re-measurement

The marquee SHALL re-measure and rebuild its filled layout automatically when the projected content or the container size changes, without consumer intervention, deferring resize-driven work until resizing settles.

#### Scenario: Projected-content change re-fills automatically

- **WHEN** items are added to, removed from, or modified within the projected content
- **THEN** the marquee re-measures and rebuilds its filled layout, remaining seamless, with no consumer intervention

#### Scenario: Resize re-fills after settling

- **WHEN** the container size changes continuously (e.g. during a window resize)
- **THEN** the marquee defers re-measurement until resizing settles, then updates once so the filled layout covers the new size
