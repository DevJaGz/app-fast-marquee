# Application capability — app-fast-marquee

Specs for the `app-fast-marquee` demo application.

## Requirements

### Requirement: End-to-end verification of idle-callback guard

The demo application SHALL ship a Playwright end-to-end suite that verifies idle-callback guard behavior in real browser engines (Chromium and WebKit). The suite SHALL run through a single entry point ([`pnpm e2e`](../../../package.json) or [`ng e2e`](../../../angular.json)) and SHALL exercise both the guarded default app and a `no-idle-guard` scenario that omits `provideFastMarquee()` for crash reproduction.

#### Scenario: Single suite entry point

- **WHEN** [`pnpm e2e`](../../../package.json) or [`ng e2e`](../../../angular.json) is run
- **THEN** all specs under [`e2e/tests/`](../../../e2e/tests/) execute in one invocation against Chromium and WebKit project configurations

#### Scenario: Production app under test

- **WHEN** the default Playwright `baseURL` server starts
- **THEN** the demo application is served in **production** configuration on port 4200 (optimized, SSR/hydration-enabled build)

#### Scenario: Crash repro without guard

- **WHEN** Safari/iOS idle-callback asymmetry is simulated via Playwright `addInitScript` and the [`no-idle-guard`](../../../angular.json) scenario app (port 4201, fixture [`e2e/fixtures/app.config.no-idle-guard.ts`](../../../e2e/fixtures/app.config.no-idle-guard.ts)) is loaded
- **THEN** a `cancelIdleCallback` error surfaces and the deferred `@defer (on idle)` marquee does not render

#### Scenario: Guard prevents crash

- **WHEN** the same asymmetry is simulated and the default app (with `provideFastMarquee()` in bootstrap) is loaded
- **THEN** the deferred `@defer (on idle)` marquee renders without `cancelIdleCallback` errors

#### Scenario: Docker runner

- **WHEN** [`pnpm e2e`](../../../package.json) is run
- **THEN** the suite runs inside Docker via [`docker-compose.e2e.yml`](../../../docker-compose.e2e.yml) and the Playwright image tag is derived from the installed [`@playwright/test`](../../../package.json) version by [`e2e/support/e2e-docker.mjs`](../../../e2e/support/e2e-docker.mjs), not hardcoded
