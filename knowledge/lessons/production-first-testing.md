---
type: Lesson
title: Production-First Testing
description: Production runtime code must never be modified to satisfy tests — tests adapt via timers, spies, mocks, and e2e scenarios instead.
tags:
  - testing
  - library
timestamp: 2026-07-13T18:35:00Z
---

# What happened

The core [`MarqueeEngine`](../../projects/ngx-fast-marquee/src/core/marquee-engine.ts) carried a `scheduleFlush` optional on its options interface, documented explicitly as a _"Test seam"_, so unit tests could synchronously run post-`requestAnimationFrame` cycles. Production never passed it; only [`marquee-engine.spec.ts`](../../projects/ngx-fast-marquee/src/core/marquee-engine.spec.ts) did. The adapter also exposed a public `marqueeInnerRef` used only internally.

# What to do instead

| Need                                                       | Approach                                                                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Async flush timing (`requestAnimationFrame`, `setTimeout`) | [`vi.useFakeTimers()`](https://vitest.dev/guide/mocking.html#timers) + `vi.advanceTimersToNextFrameAsync()` / `vi.advanceTimersByTimeAsync()` in library unit tests                  |
| Observe internal calls without changing signatures         | `vi.spyOn(SomeClass.prototype, 'method')` from the spec (see [`ngx-fast-marquee.component.spec.ts`](../../projects/ngx-fast-marquee/src/adapter/ngx-fast-marquee.component.spec.ts)) |
| Different bootstrap / provider wiring                      | E2e scenario + `fileReplacements` (see [`e2e/AGENTS.md`](../../e2e/AGENTS.md))                                                                                                       |
| Browser API gaps in jsdom                                  | Test harness polyfills in [`test-setup.ts`](../../projects/ngx-fast-marquee/src/test-setup.ts), not production                                                                       |

# Rule

Convention **#14** in [conventions.md](../conventions.md): production-first testing — no test seams in runtime code.
