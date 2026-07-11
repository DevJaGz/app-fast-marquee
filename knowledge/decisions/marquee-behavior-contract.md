---
type: Decision
title: Marquee Behavior Contract (corrected, black-box-locked)
description: Six maintainer-approved corrections to the marquee's buggy/undefined edges (mask precedence, mask-independent-of-motion, numeric speed floor, post-init input reactivity, mounted/updated semantics, live reduced motion), locked in by a black-box e2e suite that survives the from-scratch refactor.
tags:
  - library
  - marquee
  - e2e
status: implemented
timestamp: 2026-07-06T00:00:00Z
---

# What was decided

The marquee's feature functionality is defined by observable input→output behavior — not by whatever the current code happens to do — and six buggy/undefined edges in that behavior were corrected on the current implementation (minimal, throwaway fixes ahead of a from-scratch refactor):

1. **Mask precedence** — `maskPercentage` is a symmetric shorthand fading both edges; an explicitly-set `maskStartPercentage`/`maskEndPercentage` (`> 0`) overrides the shorthand for its own edge only. Previously the shorthand's `0 != null` guard always won, so an explicit per-edge value could never take effect.
2. **Mask independent of motion** — the mask fade applies whenever a mask input is `> 0`, regardless of play/reduced-motion state. Previously the mask CSS lived inside the `[data-animated='true']` scope, so a paused/non-animating marquee showed no fade.
3. **Numeric speed floor** — a numeric `speed` of `0` or negative produces no motion (treated as stopped), rather than an undefined/degenerate animation duration.
4. **Post-init input reactivity** — input changes made after initialization apply live. The component relied on the never-firing `ngOnChanges` (signal inputs don't trigger it); a bridge of per-input `effect()`s replaces it, each skipping its own first (subscription) run so only genuine post-init changes reach the update path.
5. **`mounted`/`updated` semantics** — `mounted` emits exactly once after first init. `updated` emits once per observable layout-affecting change (direction, autoFill/useSystemReducedMotion, a numeric speed value, a live system-reduced-motion toggle while opted in, content/resize) and never while idle or on a purely-visual input change (`play`, `mask*`, `pauseOnHover`, `pauseOnClick`, a qualitative `speed`).
6. **Live reduced motion** — the system `prefers-reduced-motion` preference is honored live: `ReducedMotionService` now exposes it as a signal backed by a `matchMedia` `change` listener (previously read once at construction), with a CSS `@media (prefers-reduced-motion: reduce)` fallback so the static result is correct regardless of timing. `useSystemReducedMotion` stays opt-in — the preference has no effect unless a consumer sets it.

# Why

The current implementation predates signal inputs and had accumulated undefined edges (mask clobber, no post-init reactivity, unbounded speed, once-only reduced-motion read) that made its actual behavior ambiguous. A from-scratch refactor was about to replace the underlying mechanism entirely, so the maintainer ruled on each edge first (2026-07-06) and had the correct contract locked in by an e2e suite written against **inputs and outputs**, not implementation details — so the suite carries unchanged through the refactor instead of needing to be rewritten alongside it.

# What it affects

- [marquee.service.ts](../../projects/ngx-fast-marquee/src/services/marquee.service.ts) — mask precedence (correction 1), mask-independent-of-motion CSS relocation (correction 2, in [ngx-fast-marquee.component.scss](../../projects/ngx-fast-marquee/src/components/ngx-fast-marquee/ngx-fast-marquee.component.scss)), numeric speed floor (correction 3).
- [ngx-fast-marquee.component.ts](../../projects/ngx-fast-marquee/src/components/ngx-fast-marquee/ngx-fast-marquee.component.ts) — the post-init `effect()` bridge (correction 4) and its `updated`/`mounted` emission rules (correction 5).
- [reduced-motion.service.ts](../../projects/ngx-fast-marquee/src/services/reduced-motion.service.ts) — the live `matchMedia` signal (correction 6).
- A new `playground` e2e scenario ([e2e/AGENTS.md](../../e2e/AGENTS.md)) binds every marquee input to URL query params over fixed content, so the black-box suite (`e2e/tests/marquee-*.spec.ts`) can drive and assert every feature and edge case without adding test hooks to [src/](../../src/).
- This behavior contract is the durable asset for the in-flight from-scratch refactor: its e2e suite is the acceptance bar the refactor must keep passing unchanged.

# Citations

[1] [specify-marquee-behavior change](../../openspec/changes/specify-marquee-behavior/design.md) — full design record: maintainer rulings, verification techniques, and the black-box testing rationale.

[2] [specify-marquee-behavior tasks](../../openspec/changes/specify-marquee-behavior/tasks.md) — the corrections and e2e suite as implemented tasks.
