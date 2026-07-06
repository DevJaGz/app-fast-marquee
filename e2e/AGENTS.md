# e2e — End-to-End Suite

Playwright suite for the whole application. There is **one** entry point — the [`e2e` target](../angular.json) — and every test runs inside that single invocation; issue-specific checks are just test cases within the suite.

## Overview

| Node                                           | Path                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| Tests (all run together)                       | [`tests/`](tests/)                                    |
| Scenario fixtures (fileReplacements stand-ins) | [`fixtures/`](fixtures/)                              |
| Shared helpers, server URLs, Docker launcher   | [`support/`](support/)                                |
| Playwright config                              | [`playwright.config.ts`](../playwright.config.ts)     |
| Docker runner                                  | [`docker-compose.e2e.yml`](../docker-compose.e2e.yml) |

## How it runs

- [`pnpm e2e`](../package.json) — the full suite in Docker: [`support/e2e-docker.mjs`](support/e2e-docker.mjs) derives `PLAYWRIGHT_VERSION` from the installed [`@playwright/test`](../package.json) and runs [`docker compose run --rm`](../docker-compose.e2e.yml); the official Playwright image hosts the servers, browsers, and test run in one disposable container, and nothing is published to host ports.
- [`pnpm e2e:local`](../package.json) — the same suite without Docker (`ng e2e`); requires a one-time `pnpm exec playwright install chromium webkit`.
- Flow: `ng e2e` → the [`playwright-ng-schematics`](https://github.com/jfgreffier/playwright-ng-schematics) builder runs `playwright test` → Playwright's [`webServer`](../playwright.config.ts) boots the untouched app in **production configuration** (`ng serve --configuration production`, port 4200 — optimized, SSR/hydration-enabled, so the suite tests what ships) plus the [`no-idle-guard`](../angular.json) scenario app (`ng serve --configuration no-idle-guard`, port 4201) → all tests execute against Chromium and WebKit in one run.

## Scenarios

Tests target the untouched application by default (`baseURL` = port 4200). When a test needs a different app composition, it uses a **scenario**: a `fileReplacements` build configuration plus a serve configuration in [`angular.json`](../angular.json), backed by a fixture in [`fixtures/`](fixtures/). Scenario servers are started by [`playwright.config.ts`](../playwright.config.ts) within the same run — never as separately executed test commands.

Current scenarios:

| Scenario        | Purpose                                                                                                                                                                     | Fixture                                                                        | Test                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `no-idle-guard` | Reproduces the upstream [`angular/angular#53721`](https://github.com/angular/angular/issues/53721) `cancelIdleCallback` crash (issue #5) by omitting `provideFastMarquee()` | [`fixtures/app.config.no-idle-guard.ts`](fixtures/app.config.no-idle-guard.ts) | [`tests/idle-callback-guard.spec.ts`](tests/idle-callback-guard.spec.ts) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Version derivation**: the Docker image tag in [`docker-compose.e2e.yml`](../docker-compose.e2e.yml) is interpolated from `PLAYWRIGHT_VERSION`, which [`support/e2e-docker.mjs`](support/e2e-docker.mjs) sets from the installed [`@playwright/test`](../package.json) — never hardcode the tag; upgrading the package is all that's needed.
- **Decision ladder for new tests** (prefer the earliest rung that works): (1) a plain spec in [`tests/`](tests/) against the default app; (2) Playwright-side simulation — `addInitScript`, `page.route`, clock control — like the Safari simulation in [`tests/idle-callback-guard.spec.ts`](tests/idle-callback-guard.spec.ts); (3) a new scenario, only when the app's provider/DI composition itself must differ.
- **Scenario budget**: each scenario costs a dev-server instance. When a **third** scenario is added, migrate scenario serving from per-scenario `ng serve` to per-scenario `ng build` outputs hosted by a single static file server, and update [`playwright.config.ts`](../playwright.config.ts) accordingly.
- **One suite**: new tests go in [`tests/`](tests/) and must pass within the single [`pnpm e2e`](../package.json) invocation; do not add separately-run test targets.
- **No test hooks in app code**: never modify [`src/`](../src/) runtime code to enable a test — add a scenario instead.
- **Fixture sync**: a fixture that replaces a [`src/`](../src/) file must keep its exports in sync with the file it replaces.
