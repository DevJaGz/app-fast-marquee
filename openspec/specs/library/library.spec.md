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

### Requirement: Core/Adapter Source Architecture

The library source SHALL be split into a pure-TypeScript engine (`core/`) and a thin Angular shell (`adapter/`), joined by the `public-api.ts` entry point. `core/` SHALL contain every cross-line behavior — measurement, duplication math and duplication DOM writes, animation-value computation, and the reduced-motion policy source — and SHALL NOT import from `@angular/*` or `rxjs` (rule A1). Each version line's `core/` copy SHALL type-check under the minimum TypeScript version required by that line's own Angular floor — not a single shared or lowest-common floor across lines — so each line's `core/` can use the best language features available at its own floor; grammar newer than a line's own floor is banned in that line's `core/` only, while `adapter/`, application, and test code remain unconstrained (rule A2). Verified against the official Angular compatibility table: the `20.x` line's Angular-20 floor requires TypeScript `>=5.8.0 <6.0.0` (first stable release `5.8.2`); the `12.x` line's Angular-12 floor requires TypeScript `~4.2.3`. This capability's `20.x`-line enforcement (TypeScript 5.8.2 floor) is established now; the `12.x` line's independently-dialected `core/` (TypeScript 4.2.3 floor) is established by a separate future change. `core/` SHALL use only browser APIs available in the legacy line's supported browsers, or ship a local fallback (rule A3). `core/` SHALL remain a folder inside the published `ngx-fast-marquee` package and SHALL NOT be published as a separate package (rule A4).

#### Scenario: Angular import in core is rejected

- **WHEN** a source file under `core/` imports from `@angular/*` or `rxjs` and the lint gate runs
- **THEN** linting fails with an import-restriction violation

#### Scenario: Modern TypeScript grammar in core is rejected

- **WHEN** a source file under the `20.x` line's `core/` uses grammar newer than that line's TypeScript 5.8.2 floor and the core dialect check runs
- **THEN** the dialect check fails, while the same grammar remains allowed in `adapter/`, application, and test code

#### Scenario: Newer platform API is used with a local fallback

- **WHEN** `core/` logic needs a browser API that is absent from the legacy line's supported browsers
- **THEN** `core/` ships a local fallback so the behavior still functions there, following the idle-callback compatibility guard precedent

#### Scenario: Core ships inside the library package

- **WHEN** the library is packed for publishing
- **THEN** the `core/` code is bundled inside the `ngx-fast-marquee` artifact, no separate core package exists, and the artifact declares no runtime dependency on RxJS or zone.js

### Requirement: SSR and Zoneless Rendering Contract

The modern adapter SHALL be safe to server-render and to run zoneless: component construction SHALL be side-effect-free apart from the idempotent idle-callback environment guard (which touches no DOM and skips on the server); no DOM read or write SHALL occur before `afterNextRender`; a server render SHALL produce the final static markup; the component SHALL be idempotent so it is safe inside `@defer` hydrate blocks; and no feature SHALL depend on Zone.js for correctness.

#### Scenario: Server render produces final static markup

- **WHEN** `<ngx-fast-marquee>` is rendered during server-side rendering
- **THEN** the projected content is emitted as final static markup, no DOM measurement or mutation is attempted, and no error is thrown

#### Scenario: Construction performs no DOM access

- **WHEN** the component class is instantiated
- **THEN** no DOM read or write occurs until the `afterNextRender` phase runs in a browser

#### Scenario: Safe inside defer hydrate blocks

- **WHEN** server-rendered marquee markup is hydrated inside a `@defer` hydrate block
- **THEN** the component initializes exactly once, without duplicating, discarding, or re-projecting its content

#### Scenario: Fully functional without Zone.js

- **WHEN** an application bootstraps with `provideZonelessChangeDetection()` and no `zone.js` polyfill
- **THEN** every marquee feature — animation, input-driven updates, content-driven updates, resize handling, and live reduced-motion response — functions correctly

### Requirement: Modern Adapter Stable-API Discipline

The modern adapter SHALL use only Angular APIs that are stable at the line's Angular floor: `signal`, `computed`, `input()`, `output()`, `model()`, signal queries, `afterNextRender`, `DestroyRef`, `inject()`, `isPlatformBrowser`, and `provideAppInitializer` (allowlisted for the provider factory by maintainer ruling, 2026-07-06). The adapter MAY use exactly one `effect()`, and only as the bridge from duplication-affecting signal inputs to imperative engine work: that `effect()` SHALL set no signal and SHALL perform no inline DOM read, scheduling a post-render engine replan instead. The adapter SHALL NOT use `effect()` for state propagation (derived state SHALL use `computed()` or `linkedSignal()`), and SHALL NOT use `afterRender`, `afterEveryRender`, `afterRenderEffect`, or any API that is experimental or developer-preview at the floor. The `provideFastMarquee()` factory SHALL be implemented with `provideAppInitializer` rather than the `APP_INITIALIZER` token.

#### Scenario: Banned render-lifecycle API is rejected

- **WHEN** adapter code imports or calls `afterRender`, `afterEveryRender`, or `afterRenderEffect` and the lint gate runs
- **THEN** linting fails with a restricted-API violation

#### Scenario: The single bridge effect propagates no state

- **WHEN** a duplication-affecting input (`autoFill`, `direction`, or the derived `animated` state) changes
- **THEN** the adapter's one `effect()` schedules exactly one engine replan, writes no signal, and no `ExpressionChangedAfterItHasBeenChecked` error occurs

#### Scenario: Adapter imports stay on the allowlist

- **WHEN** the adapter's `@angular/*` imports are audited
- **THEN** every imported symbol is on the stable-API allowlist for the line's floor (including at most one `effect` used solely as the imperative bridge)

### Requirement: Template-Level API Stability Across the Refactor

The refactor SHALL preserve the template-level binding surface unchanged: the `ngx-fast-marquee` selector, every input and output name, type, default value, and event payload, plus the `NgxFastMarqueeModule` and `provideFastMarquee()` exports. In addition, `NgxFastMarqueeComponent` SHALL be standalone and importable directly, with `NgxFastMarqueeModule` retained as a thin wrapper for `NgModule`-based consumers. The class instance surface is out of contract and MAY change.

#### Scenario: NgModule consumer is unaffected

- **WHEN** an application imports `NgxFastMarqueeModule` and uses `<ngx-fast-marquee>` with any pre-refactor binding combination
- **THEN** the template compiles and behaves identically, and every behavior specified by the `specify-marquee-behavior` feature scenarios continues to hold

#### Scenario: Standalone consumer imports the component directly

- **WHEN** a standalone component adds `NgxFastMarqueeComponent` to its `imports` array
- **THEN** the marquee renders and behaves fully without `NgxFastMarqueeModule`

#### Scenario: Bootstrap provider keeps its guarantee

- **WHEN** an application registers `provideFastMarquee()` in its bootstrap providers
- **THEN** the idle-callback guarantee continues to hold exactly as specified by the Idle Callback Browser Compatibility requirement, with the guard still running during application initialization before the first change-detection pass despite the internal migration to `provideAppInitializer`

### Requirement: Update Model and Performance

The marquee SHALL derive pure input state as declarative bindings and react to projected-content, size, and system-reduced-motion changes through change-driven notifications (observers and a live media source) rather than per-change-detection-cycle dirty checking; the scrolling animation itself SHALL run purely in CSS, independent of change detection.

#### Scenario: No per-cycle dirty checking

- **WHEN** application change detection runs with no content, size, or marquee-input change
- **THEN** the marquee performs no measurement and no DOM mutation

#### Scenario: Animation is independent of change detection

- **WHEN** the marquee is scrolling and application change detection is otherwise idle
- **THEN** the scrolling continues purely in CSS without requiring change-detection cycles

### Requirement: Two-Version-Line Template API Parity

The library SHALL publish two version lines — the Active `20.x` line and the Patchable `12.x` line (hosted on the `12.x` branch) — that expose an identical template-level binding surface: the `ngx-fast-marquee` selector; the inputs `direction`, `speed`, `autoFill`, `play`, `maskPercentage`, `maskStartPercentage`, `maskEndPercentage`, `pauseOnHover`, `pauseOnClick`, and `useSystemReducedMotion` with the same accepted value types and the same defaults; the outputs `mounted` and `updated` with the same emission semantics and payloads; the `NgxFastMarqueeModule` NgModule; and the `provideFastMarquee()` provider function. The class instance surface (direct property access on the component instance, signal wrapper types) is explicitly out of contract between lines. Each line's major version SHALL equal that line's Angular floor. Changes to any element of this binding surface on one line SHALL NOT be made without honoring the contract on the other line.

#### Scenario: A consumer template is portable across lines

- **WHEN** a template that binds any combination of the contractual inputs and outputs on `<ngx-fast-marquee>` compiles against one version line
- **THEN** the same template compiles against the other line and produces the behavior this spec defines, with no template edits

#### Scenario: Behavior contract applies to both lines

- **WHEN** the black-box behavior suite covering the requirements in this spec (direction/play, speed, auto-fill, masks, interaction/reduced-motion pausing, lifecycle outputs, responsive re-measurement) runs against an application consuming either version line
- **THEN** every scenario passes, unmodified

### Requirement: ng-add Installation Schematic

The published `ngx-fast-marquee` package SHALL ship an `ng add` schematic so that running `ng add ngx-fast-marquee` in a consumer workspace installs the package as a runtime dependency and registers `provideFastMarquee()` in the target application's root providers. The schematic SHALL support both standalone bootstrap projects (provider inserted into the application config passed to `bootstrapApplication`) and `NgModule`-based projects (provider inserted into the root module's `providers`). The schematic SHALL be idempotent: when `provideFastMarquee()` is already registered it SHALL NOT add a duplicate. When the workspace or project shape is not recognized, the schematic SHALL make no source edit, SHALL print the library README's manual setup instructions, and SHALL complete without failing the `ng add` run. The compiled schematic factories and their collection/schema JSON files SHALL be included in the packaged library artifact.

#### Scenario: Standalone application gets the provider wired

- **WHEN** `ng add ngx-fast-marquee` runs against a standalone-bootstrap application whose root providers do not yet include `provideFastMarquee()`
- **THEN** the schematic adds `provideFastMarquee()` to the root providers with the corresponding import from `ngx-fast-marquee`, and the package is saved to the workspace `dependencies`

#### Scenario: NgModule-based application gets the provider wired

- **WHEN** `ng add ngx-fast-marquee` runs against an `NgModule`-bootstrapped application whose root module does not yet register `provideFastMarquee()`
- **THEN** the schematic adds `provideFastMarquee()` to the root module's `providers` with the corresponding import from `ngx-fast-marquee`

#### Scenario: Re-running the schematic adds no duplicate

- **WHEN** `ng add ngx-fast-marquee` runs against an application that already registers `provideFastMarquee()` in its root providers
- **THEN** the schematic leaves the existing registration untouched and does not add a second one

#### Scenario: Unrecognized project shape falls back to manual instructions

- **WHEN** `ng add ngx-fast-marquee` runs against a workspace whose bootstrap shape the schematic cannot locate or safely edit
- **THEN** the schematic modifies no source file, logs the manual `provideFastMarquee()` setup instructions, and the `ng add` command still completes successfully

#### Scenario: Packaged artifact carries the schematics

- **WHEN** the library is built for publishing via the library build
- **THEN** `dist/ngx-fast-marquee/` contains the compiled schematic factories with their collection and schema JSON files, and the artifact's `package.json` declares the `schematics` collection entry point

### Requirement: ng-update Migration Collection

The published `ngx-fast-marquee` package SHALL declare an `ng update` migration collection via the `ng-update.migrations` field of its `package.json`, resolvable inside the published artifact. The collection MAY contain zero migrations until a release introduces a breaking change that needs one; an empty collection SHALL NOT cause `ng update ngx-fast-marquee` to fail.

#### Scenario: ng update resolves the empty collection without error

- **WHEN** a consumer runs `ng update ngx-fast-marquee` against a published version whose migration collection contains no migrations
- **THEN** the update completes without error and applies no migration

#### Scenario: Packaged artifact declares the migration collection

- **WHEN** the library is built for publishing via the library build
- **THEN** the artifact's `package.json` contains an `ng-update.migrations` entry pointing at a migration collection JSON file that exists inside the artifact
