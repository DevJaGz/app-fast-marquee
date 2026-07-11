# Decisions

Each concept records what was decided, why, the alternatives considered, and what it affects. Lifecycle is read from each concept's `status` frontmatter (`planned | implemented | superseded`); superseded decisions stay here.

- [Branch Model and Two-Version-Line Publishing Strategy](branch-model-version-lines.md) - Planned branch-per-version-line model (Active/Patchable/Archived) and the 20.x / 12.x npm publishing lines with the major-equals-Angular-floor rule, plus each line's own verified minimum-TypeScript dialect floor for core/.
- [Angular 20 Upgrade with Full Idiom Adoption](angular-20-idiom-adoption.md) - Framework major upgrades adopt the new idioms (zoneless, signal APIs, Vitest, lint enforcement), not just the breaking-change fixes.
- [Idle-Callback Guard (provideFastMarquee)](idle-callback-guard.md) - Ship an APP_INITIALIZER-based guard that patches asymmetric requestIdleCallback/cancelIdleCallback support, because the crash is an unfixed upstream Angular bug that component-level code cannot reach in time.
- [Marquee Behavior Contract (corrected, black-box-locked)](marquee-behavior-contract.md) - Six maintainer-approved corrections to the marquee's buggy/undefined edges (mask precedence, mask-independent-of-motion, numeric speed floor, post-init input reactivity, mounted/updated semantics, live reduced motion), locked in by a black-box e2e suite that survives the from-scratch refactor.
