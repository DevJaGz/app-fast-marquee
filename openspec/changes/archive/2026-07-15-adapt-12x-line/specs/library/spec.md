# Delta: library — adapt-12x-line

> Applied to the `12.x` branch's library spec only. The first requirement is the cross-line contract, mirrored verbatim from the trunk-side `adopt-two-line-branch-model` change.

## ADDED Requirements

### Requirement: Two-Version-Line Template API Parity

The library SHALL publish two version lines — the Active `20.x` line and the Patchable `12.x` line (hosted on the `12.x` branch) — that expose an identical template-level binding surface: the `ngx-fast-marquee` selector; the inputs `direction`, `speed`, `autoFill`, `play`, `maskPercentage`, `maskStartPercentage`, `maskEndPercentage`, `pauseOnHover`, `pauseOnClick`, and `useSystemReducedMotion` with the same accepted value types and the same defaults; the outputs `mounted` and `updated` with the same emission semantics and payloads; the `NgxFastMarqueeModule` NgModule; and the `provideFastMarquee()` provider function. The class instance surface (direct property access on the component instance, signal wrapper types) is explicitly out of contract between lines. Each line's major version SHALL equal that line's Angular floor. Changes to any element of this binding surface on one line SHALL NOT be made without honoring the contract on the other line.

#### Scenario: A consumer template is portable across lines

- **WHEN** a template that binds any combination of the contractual inputs and outputs on `<ngx-fast-marquee>` compiles against one version line
- **THEN** the same template compiles against the other line and produces the behavior this spec defines, with no template edits

#### Scenario: Behavior contract applies to both lines

- **WHEN** the black-box behavior suite covering the requirements in this spec (direction/play, speed, auto-fill, masks, interaction/reduced-motion pausing, lifecycle outputs, responsive re-measurement) runs against an application consuming either version line
- **THEN** every scenario passes, unmodified

### Requirement: 12.x Line Angular 12 Consumption

The `12.x` line SHALL be consumable by applications on Angular `>=12.0.0 <20.0.0`, declared via `peerDependencies`. The component SHALL be usable through `NgxFastMarqueeModule` (non-standalone declaration), and `provideFastMarquee()` SHALL return providers registrable in an Angular 12 root `NgModule` that run the idle-callback compatibility guard during application initialization. All inputs SHALL remain reactive to post-initialization changes under zone-based change detection.

#### Scenario: Angular 12 application renders the marquee via NgModule

- **WHEN** an Angular 12 application imports `NgxFastMarqueeModule` and renders `<ngx-fast-marquee>` with projected content
- **THEN** the marquee builds, renders, and animates per the requirements in this spec

#### Scenario: Idle-callback guard runs at Angular 12 bootstrap

- **WHEN** an Angular 12 application registers `provideFastMarquee()` in its root module providers (or imports `NgxFastMarqueeModule` eagerly) in a browser with absent or asymmetric idle-callback support
- **THEN** the guard has installed consistent `requestIdleCallback`/`cancelIdleCallback` implementations before any component code runs

### Requirement: 12.x Core Dialect Floor

The `12.x` line's `core/` SHALL type-check under TypeScript `4.2.3` (Angular 12.0.x's minimum supported TypeScript), enforced by a mechanical compile check pinned to that exact compiler version, and SHALL contain zero `@angular/*` and zero `rxjs` imports, matching the core/adapter architecture rules on this line.

#### Scenario: Dialect check gates the 12.x core

- **WHEN** the `12.x` branch's core-dialect check script compiles `core/**` with TypeScript `4.2.3`
- **THEN** compilation succeeds with no syntax or type errors

#### Scenario: Core purity holds on the 12.x line

- **WHEN** lint runs on the `12.x` branch
- **THEN** any `@angular/*` or `rxjs` import inside `core/**` fails the build
