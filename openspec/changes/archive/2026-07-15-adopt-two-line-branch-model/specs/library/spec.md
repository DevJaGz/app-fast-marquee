# Delta: library — adopt-two-line-branch-model

## ADDED Requirements

### Requirement: Two-Version-Line Template API Parity

The library SHALL publish two version lines — the Active `20.x` line and the Patchable `12.x` line (hosted on the `12.x` branch) — that expose an identical template-level binding surface: the `ngx-fast-marquee` selector; the inputs `direction`, `speed`, `autoFill`, `play`, `maskPercentage`, `maskStartPercentage`, `maskEndPercentage`, `pauseOnHover`, `pauseOnClick`, and `useSystemReducedMotion` with the same accepted value types and the same defaults; the outputs `mounted` and `updated` with the same emission semantics and payloads; the `NgxFastMarqueeModule` NgModule; and the `provideFastMarquee()` provider function. The class instance surface (direct property access on the component instance, signal wrapper types) is explicitly out of contract between lines. Each line's major version SHALL equal that line's Angular floor. Changes to any element of this binding surface on one line SHALL NOT be made without honoring the contract on the other line.

#### Scenario: A consumer template is portable across lines

- **WHEN** a template that binds any combination of the contractual inputs and outputs on `<ngx-fast-marquee>` compiles against one version line
- **THEN** the same template compiles against the other line and produces the behavior this spec defines, with no template edits

#### Scenario: Behavior contract applies to both lines

- **WHEN** the black-box behavior suite covering the requirements in this spec (direction/play, speed, auto-fill, masks, interaction/reduced-motion pausing, lifecycle outputs, responsive re-measurement) runs against an application consuming either version line
- **THEN** every scenario passes, unmodified
