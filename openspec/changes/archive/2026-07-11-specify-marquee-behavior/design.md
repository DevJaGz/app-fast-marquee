# Design: specify-marquee-behavior

## Context

The marquee's feature behavior is currently implicit in the code and unverified by tests. This change makes each feature's functionality **explicit and testable as black-box input→output behavior**, corrects the buggy/undefined edges, and locks the whole surface with an end-to-end suite — establishing the contract the [core/adapter refactor](../refactor-core-adapter-architecture/design.md) must preserve.

The feature inventory (F1–F12) is enumerated in the [refactor design](../refactor-core-adapter-architecture/design.md); this change owns their **observable behavior**, while the refactor owns the engine architecture that implements them.

Constraints from [operational guardrails](../../../knowledge/guardrails.md): the library `version`/`peerDependencies`/README compatibility table are frozen; e2e scenario changes follow the [e2e AGENTS.md](../../../e2e/AGENTS.md) decision ladder and scenario budget.

## Goals / Non-Goals

**Goals:**

- Specify every marquee feature as observable input→output behavior, with edge cases.
- Correct the buggy/undefined edges (maintainer-approved): mask precedence, post-init input reactivity, numeric `speed` `0`/negative, mask-independent-of-motion, `updated` semantics, live reduced motion.
- Lock the behavior with a black-box e2e suite that will carry unchanged into the refactor.

**Non-Goals:**

- The `core/`+`adapter/` restructuring, rule set A1–A6, SSR/zoneless contract, and pure-function `core/` unit tests — all owned by [`refactor-core-adapter-architecture`](../refactor-core-adapter-architecture/proposal.md).
- New marquee features; version/peer/README changes; publishing.

## Decisions

### D-black-box — tests assert observable behavior only

Tests couple to **inputs and outputs (the feature's expected result)**, never to how it is solved. They MUST NOT assert internal attribute/custom-property names, clone counts, or service calls, so they hold across the refactor's from-scratch mechanism change. Verification techniques:

- **Motion / direction / speed / play / pause**: sample a fixed projected child's bounding box over time; assert the sign and magnitude of the displacement along the expected axis. A paused/stopped/reduced marquee shows ~zero displacement.
- **Auto-fill**: assert the rendered track covers the container along the scroll axis (no gap) and that no empty gap appears at the leading edge across a cycle (seamlessness) — geometry, not clone count.
- **Mask**: assert the element's *resolved* mask is transparent at the faded edge(s) and opaque at the center — the browser's computed output, not the `--_*` custom-property names.
- **Reduced motion**: drive via Playwright `emulateMedia({ reducedMotion })`, including a **runtime toggle** for the live scenario.
- **Outputs**: the `playground` binds `(mounted)`/`(updated)` to DOM counters; tests read the counter text.

### D-playground — a query-param scenario, not a src hook

E2e needs to exercise arbitrary input combinations, but the demo app is a fixed showcase and [`src/`](../../../src/) must carry no test hooks. So the suite drives a **`playground` scenario**: a `fileReplacements` build/serve configuration whose fixture route renders one `<ngx-fast-marquee>` with every input bound from URL query params over fixed known content, plus `mounted`/`updated` counters. It is the second scenario (idle-guard is the first); a third would trigger the [static-serve migration](../../../e2e/AGENTS.md), so this stays on per-scenario `ng serve`.

### D-mask-semantics — corrected mask contract (maintainer rulings 2026-07-06)

All mask inputs default `0` (opaque edges). `maskPercentage` is a symmetric shorthand fading both edges; an explicitly set `maskStartPercentage`/`maskEndPercentage` overrides the shorthand for its own edge (fixes the current clobber where `maskPercentage`'s `0 != null` guard always won). The fade follows the scroll axis and applies whenever a mask input is > 0, independent of play/reduced-motion state.

### D-speed-bounds — numeric speed floor (maintainer ruling 2026-07-06)

A numeric `speed` of `0` or negative produces no motion (treated as stopped), rather than an undefined/degenerate animation duration.

### D-outputs — `mounted`/`updated` semantics (maintainer ruling 2026-07-06)

`mounted` emits exactly once after first init. `updated` emits once per observable layout change — i.e. once per completed measurement/fill cycle that changed the rendered layout (initial fill, content change, settled resize, fill-affecting input change) — and never when idle or on pure-visual input changes (`play`, `mask*`, `pauseOnHover`, `pauseOnClick`, qualitative `speed`). Fully removing `updated` is out of the question: the template-level output surface is preserved. The refactor implements this as a single deduplicated engine-commit emission; this change defines the observable contract and its dedup semantics.

### D-live-reduced-motion — honor the preference live (maintainer ruling 2026-07-06)

The system `prefers-reduced-motion` preference is honored live: toggling it at the OS level starts/stops the marquee without re-creating the component, rather than only being read once. Backed by a CSS `@media (prefers-reduced-motion: reduce)` rule so the static result is correct regardless of timing.

### D-corrections-on-current-arch — fix minimally now; the tests are the durable asset

The six corrections are implemented on the **current** implementation with the smallest reasonable edits (CSS scope changes, small guards, one input-reactivity bridge, a `matchMedia` `change` subscription). This code is replaced wholesale by the refactor; the **e2e suite authored here is the durable asset** and passes unchanged before and after the refactor, which is what makes the refactor's "no behavior change" claim verifiable.

## Test Strategy

Black-box e2e only (this change owns no `core/` yet, so there is no pure-function unit surface to test here — those land with the refactor). One reliable, concise test per feature, driven by the `playground` scenario, on Chromium + WebKit in the single suite:

| Feature | Observable assertion |
| ------- | -------------------- |
| F1 direction, F6 play | child bounding-box moves along −X/+X/−Y/+Y per direction; frozen when `play=false`; direction/play changes after init apply |
| F2/F3 speed | fast > medium > slow displacement/time; numeric rate ≈ N·Δt; `0`/negative ⇒ no motion; numeric change after init re-rates |
| F4 auto-fill | track covers container, no leading-edge gap across a cycle; `false` ⇒ intrinsic size; wider-than-container and single/empty content handled |
| F5 mask | resolved mask transparent at faded edge(s), opaque center; symmetric shorthand; independent start/end; explicit-edge overrides shorthand; vertical axis; applies while paused |
| F7 pause | motion stops while hovering / pressed and resumes; no effect when disabled |
| F8 reduced motion | opt-in only; live toggle via `emulateMedia` |
| F9/F10 outputs | `mounted` counter = 1; `updated` counter increments on content/resize, not on idle or pure-visual changes |
| F12 re-measure | content add/remove and resize re-fill (seamless / covers new size after settle) |

## Risks / Trade-offs

- [Correction code is throwaway once the refactor lands] → accepted and intended; the edits are minimal and the e2e suite (the durable asset) is written against observable behavior so it survives the rewrite.
- [Bounding-box motion assertions are timing-sensitive] → assert sign and tolerant magnitude over a sampled interval, and poll for settled DOM state rather than fixed sleeps; runs identically on both engines.
- [Mask "resolved output" check drifts toward implementation] → assert only edge-transparent/center-opaque on the computed mask, not the library's custom-property names, keeping it black-box.

## Open Questions

None blocking. SSR-specific behavior verification is owned by the refactor's A5 contract, not this change.

## Resolved Questions (maintainer rulings, 2026-07-06)

- Mask precedence, numeric `speed` `0`/negative, mask-independent-of-motion, `updated` dedup semantics, `mounted` once, and live reduced motion are all approved as specified above (D-mask-semantics, D-speed-bounds, D-outputs, D-live-reduced-motion).
- Feature functionality is defined by black-box behavior tests derived from these scenarios, not from the current code (D-black-box).
