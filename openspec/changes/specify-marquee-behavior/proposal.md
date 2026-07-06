# Proposal: specify-marquee-behavior

## Why

The marquee's features — direction, speed, edge masks, auto-fill, play/pause, pointer and reduced-motion pausing, the `mounted`/`updated` outputs, and content/resize re-measurement — have **never been captured as a specification**, and the library ships **no behavioral tests** for any of them (the only e2e test covers the idle-callback guard; the engine services have no unit specs at all). Several behaviors are also buggy or undefined at the edges:

- `maskPercentage` blindly clobbers `maskStartPercentage`/`maskEndPercentage` (its `0 != null` guard always fires), so asymmetric masks silently don't work.
- Every input is a signal `input()`, but the component drives updates from `ngOnChanges`, which never fires for signal inputs — so changing `direction`/`speed`/`mask*` **after** mount is silently ignored.
- Numeric `speed` of `0` or negative is undefined.
- Edge masking is coupled to the animated state rather than to the mask inputs.
- `updated` fires per internal cycle rather than per observable layout change.

The planned [core/adapter refactor](../refactor-core-adapter-architecture/proposal.md) rebuilds the engine from scratch. Doing that safely requires a **black-box behavior contract locked by tests first** — otherwise "no behavior change" is unverifiable. This change establishes that contract: it **defines each feature's functionality as input→output behavior**, **corrects** the buggy/undefined edges (maintainer-approved), and **locks** it with an end-to-end suite — so the subsequent refactor is a pure, green-gated restructuring.

## What Changes

- Add behavior requirements to the `library` capability specifying every marquee feature as observable input→output behavior, with edge cases: **Scroll Direction and Play State**, **Marquee Speed**, **Auto-Fill and Seamless Looping**, **Edge-Fade Mask**, **Interaction and Reduced-Motion Pausing**, **Lifecycle Outputs**, and **Responsive Re-measurement**.
- Apply the maintainer-approved behavior corrections to the current implementation (minimally — the durable asset is the tests, which carry unchanged into the refactor):
  - **Mask precedence**: `maskPercentage` is a symmetric shorthand; an explicitly set `maskStartPercentage`/`maskEndPercentage` overrides it for that edge.
  - **Post-init input reactivity**: input changes applied after initialization take effect (fixing the dead `ngOnChanges`).
  - **Numeric `speed` `0`/negative**: produces no motion.
  - **Mask independent of motion**: the edge fade applies whenever a mask input is > 0, regardless of play/reduced-motion state.
  - **`updated` semantics**: emits once per observable layout change (never idle, never on pure-visual input changes); `mounted` emits once.
  - **Live reduced motion**: the system `prefers-reduced-motion` preference is honored live (OS toggles apply without re-creating the component).
- Build the **`playground` e2e scenario** — a [`fixtures/`](../../../e2e/fixtures/) route/component that renders one `<ngx-fast-marquee>` binding every input from URL query params over fixed content and surfaces the `mounted`/`updated` outputs as DOM counters — wired via a `fileReplacements` build/serve config in [`angular.json`](../../../angular.json) and a `webServer` entry in [`playwright.config.ts`](../../../playwright.config.ts). This is the second e2e scenario; no static-serve migration is triggered yet (see the [e2e scenario budget](../../../e2e/AGENTS.md)).
- Author the **black-box e2e behavior suite** in [`e2e/tests/`](../../../e2e/tests/), asserting observable output only (never internal `data-*`/`--_*` names, clone counts, or service calls), on Chromium + WebKit within the single [`pnpm e2e`](../../../package.json) run.
- No architecture restructuring, no version/peer/README changes, no new marquee features.

## Capabilities

### New Capabilities

None — all requirements land in the existing `library` capability.

### Modified Capabilities

- `library`: adds the marquee feature-behavior requirements listed above. The existing Idle Callback Browser Compatibility requirement is unaffected.

## Impact

- **Library source**: minimal, targeted edits under [`projects/ngx-fast-marquee/src/`](../../../projects/ngx-fast-marquee/src/) to apply the six corrections. These are intentionally small; the [core/adapter refactor](../refactor-core-adapter-architecture/proposal.md) replaces this code wholesale while keeping this change's e2e suite green.
- **e2e**: a new `playground` scenario (fixture route/component, `angular.json` serve config, `playwright.config.ts` server) and the behavior test suite; the [e2e AGENTS.md](../../../e2e/AGENTS.md) scenario table is updated in the same change. **No test hooks in [`src/`](../../../src/)** runtime code.
- **npm surface**: unchanged — template-level binding surface (selector, input/output names/types/defaults/payloads) is preserved; only previously-broken behavior begins working.
- **Frozen values**: `version`, `peerDependencies`, and the README compatibility table are untouched (guardrail-frozen).
- **Sequencing**: this change is a **prerequisite** for [`refactor-core-adapter-architecture`](../refactor-core-adapter-architecture/proposal.md), which consumes the behavior contract and keeps its e2e suite green.
- **Knowledge base**: the corrected behavior decisions are recorded in [`knowledge/`](../../../knowledge/) with index and [log](../../../knowledge/log.md) updates in the same change.
