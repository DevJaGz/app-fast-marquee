# Tasks: specify-marquee-behavior

## 1. Behavior rulings (recorded)

- [x] 1.1 Maintainer rulings recorded (2026-07-06): mask precedence — `maskPercentage` is a symmetric shorthand that explicit `maskStartPercentage`/`maskEndPercentage` override per edge; numeric `speed` `0`/negative → no motion; mask fade applies independently of play/reduced-motion; `updated` emits once per observable layout change (never idle or on pure-visual changes), `mounted` once; reduced motion honored live; post-init input changes apply (design D-mask-semantics, D-speed-bounds, D-outputs, D-live-reduced-motion)
- [x] 1.2 Feature functionality is defined by black-box behavior tests derived from the spec feature scenarios, not from the current code (design D-black-box)

## 2. Behavior corrections on the current implementation (minimal)

- [ ] 2.1 Mask precedence: fix [marquee.service.ts](../../../projects/ngx-fast-marquee/src/services/marquee.service.ts) so `maskPercentage` is a symmetric shorthand and an explicitly-set `maskStartPercentage`/`maskEndPercentage` overrides it per edge (spec: Edge-Fade Mask)
- [ ] 2.2 Mask independent of motion: move the mask CSS out of the `[data-animated='true']` scope in [ngx-fast-marquee.component.scss](../../../projects/ngx-fast-marquee/src/components/ngx-fast-marquee/ngx-fast-marquee.component.scss) so a mask input > 0 fades edges even when paused/not animating (spec: Edge-Fade Mask)
- [ ] 2.3 Numeric speed bounds: guard [marquee.service.ts](../../../projects/ngx-fast-marquee/src/services/marquee.service.ts) so `speed` `0`/negative yields no motion (spec: Marquee Speed)
- [ ] 2.4 Post-init input reactivity: make input changes after initialization apply (minimal bridge from the signal inputs to the existing update path, replacing reliance on the never-firing `ngOnChanges`) in [ngx-fast-marquee.component.ts](../../../projects/ngx-fast-marquee/src/components/ngx-fast-marquee/ngx-fast-marquee.component.ts) (spec: Scroll Direction and Play State, Marquee Speed)
- [ ] 2.5 `updated`/`mounted` semantics: emit `updated` once per observable layout change (dedup; never idle or on pure-visual input changes) and `mounted` once (spec: Lifecycle Outputs)
- [ ] 2.6 Live reduced motion: subscribe to `matchMedia('(prefers-reduced-motion: reduce)')` `change` in [reduced-motion.service.ts](../../../projects/ngx-fast-marquee/src/services/reduced-motion.service.ts) and re-evaluate the animated state live, with a CSS `@media (prefers-reduced-motion: reduce)` fallback (spec: Interaction and Reduced-Motion Pausing)

## 3. Playground e2e scenario

- [ ] 3.1 Add the `playground` fixture route/component under [e2e/fixtures/](../../../e2e/fixtures/): one `<ngx-fast-marquee>` binding every input from URL query params over fixed known content, with `(mounted)`/`(updated)` bound to DOM counters — no test hooks in [src/](../../../src/)
- [ ] 3.2 Wire the scenario: `fileReplacements` build config + serve config in [angular.json](../../../angular.json), a `webServer` entry + `PLAYGROUND_APP_URL` in [playwright.config.ts](../../../playwright.config.ts)/[e2e/support/servers.ts](../../../e2e/support/servers.ts) (second scenario — no static-serve migration yet)

## 4. Black-box e2e behavior suite (one reliable test per feature)

- [ ] 4.1 Direction + play (F1, F6): child bounding-box moves along −X/+X/−Y/+Y per `direction`; frozen when `play=false`; direction/play changes after init apply
- [ ] 4.2 Speed (F2, F3): fast > medium > slow displacement per unit time; numeric rate ≈ N·Δt within tolerance; `0`/negative → no motion; numeric change after init re-rates
- [ ] 4.3 Auto-fill (F4): fills container with no leading-edge gap across a cycle; `false` → intrinsic size; content wider than container and single/empty content handled without error
- [ ] 4.4 Mask (F5): resolved mask transparent at faded edge(s) and opaque center; symmetric shorthand; independent start/end; explicit-edge-overrides-shorthand; vertical axis; applies while paused
- [ ] 4.5 Interaction pause (F7): motion stops while hovering / while pressed and resumes; no effect when disabled
- [ ] 4.6 Reduced motion (F8): opt-in only; live toggle via `emulateMedia({ reducedMotion })`
- [ ] 4.7 Lifecycle outputs (F9, F10): `mounted` counter is 1; `updated` counter increments on content/resize but not when idle or on pure-visual input changes
- [ ] 4.8 Responsive re-measure (F12): content add/remove re-fills seamlessly; resize re-fills to cover the new size after settling

## 5. Gates

- [ ] 5.1 Run `npm run lint`, `npm run format`, `npm run test:lib`, `npm run test:app` — all green
- [ ] 5.2 Run `pnpm e2e` — the full suite (idle-guard + the new behavior suite) green on Chromium + WebKit, no test-only hooks in runtime source

## 6. Docs and knowledge sync (same-change rule)

- [ ] 6.1 Update the [e2e AGENTS.md](../../../e2e/AGENTS.md) scenario table with the `playground` scenario and its fixture/tests
- [ ] 6.2 Record the corrected marquee behavior contract in [knowledge/decisions/](../../../knowledge/decisions/) (the six corrections and their rationale), update [knowledge/index.md](../../../knowledge/index.md) and [knowledge/log.md](../../../knowledge/log.md)
- [ ] 6.3 Re-validate the change (`openspec validate specify-marquee-behavior --strict`)
