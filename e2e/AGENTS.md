# e2e — End-to-End Suite

Playwright suite for the whole application. There is **one** entry point — [`npm run e2e`](../package.json) — and every test runs inside that single invocation; issue-specific checks are just test cases within the suite.

## Overview

| Node                                           | Path                                                  |
| ---------------------------------------------- | ----------------------------------------------------- |
| Tests (all run together)                       | [`tests/`](tests/)                                    |
| Scenario fixtures (fileReplacements stand-ins) | [`fixtures/`](fixtures/)                              |
| Shared helpers, server URLs, Docker launcher   | [`support/`](support/)                                |
| Playwright config                              | [`playwright.config.ts`](../playwright.config.ts)     |
| Docker runner                                  | [`docker-compose.e2e.yml`](../docker-compose.e2e.yml) |

## How it runs (12.x branch)

Angular CLI 12 has no Playwright builder (`playwright-ng-schematics` targets modern Angular), and this branch's toolchain is pinned to Node 14 while Playwright needs modern Node — the two can't share one container. [`npm run e2e`](../package.json) → [`support/e2e-docker.mjs`](support/e2e-docker.mjs) derives `PLAYWRIGHT_VERSION` from the installed [`@playwright/test`](../package.json) and runs [`docker compose up`](../docker-compose.e2e.yml) with two services:

- **`app`** (Node 14): `npm ci`, builds both compositions — default (`--configuration production`) and [`playground`](../angular.json) — to separate static output directories, then serves each with `http-server` on ports 4200/4202.
- **`playwright`** (official Playwright image, modern Node): `npm ci`, waits for both `app` ports to answer (Docker Compose's internal DNS resolves `http://app:<port>`), then runs `playwright test` with [`E2E_EXTERNAL_SERVERS=1`](../playwright.config.ts) so it never tries to spawn its own `ng serve`.

Nothing is published to host ports; `e2e-docker.mjs` tears both services down (`docker compose down`) after the run, whatever the outcome. There is no local (non-Docker) variant on this branch — running two incompatible Node floors side by side outside containers isn't practical.

## Scenarios

Tests target the untouched application by default (`baseURL` = port 4200). When a test needs a different app composition, it uses a **scenario**: a `fileReplacements` build configuration plus a serve configuration in [`angular.json`](../angular.json), backed by a fixture in [`fixtures/`](fixtures/). Scenario servers are started by [`playwright.config.ts`](../playwright.config.ts) within the same run — never as separately executed test commands.

Current scenarios (12.x branch):

| Scenario     | Purpose                                                                                                                                                                                                                                              | Fixture                                                                                                                  | Test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playground` | Locks in the marquee's black-box behavior contract: one `<ngx-fast-marquee>` binding every input from URL query params over fixed known content, with `(mounted)`/`(updated)` bound to DOM counters and runtime controls for post-init input changes | [`fixtures/playground/`](fixtures/playground/), [`fixtures/app.module.playground.ts`](fixtures/app.module.playground.ts) | [`tests/marquee-direction-play.spec.ts`](tests/marquee-direction-play.spec.ts), [`tests/marquee-speed.spec.ts`](tests/marquee-speed.spec.ts), [`tests/marquee-autofill.spec.ts`](tests/marquee-autofill.spec.ts), [`tests/marquee-mask.spec.ts`](tests/marquee-mask.spec.ts), [`tests/marquee-pause.spec.ts`](tests/marquee-pause.spec.ts), [`tests/marquee-reduced-motion.spec.ts`](tests/marquee-reduced-motion.spec.ts), [`tests/marquee-outputs.spec.ts`](tests/marquee-outputs.spec.ts), [`tests/marquee-responsive.spec.ts`](tests/marquee-responsive.spec.ts) |

**No `no-idle-guard` scenario on this branch.** `NgxFastMarqueeModule` always bundles `provideFastMarquee()` in its own `providers`, and under Ivy a component's declaring `NgModule` is fixed at compile time — there is no way to render `<ngx-fast-marquee>` without the guard on this line, so a "guard absent" build isn't constructible. The upstream bug that scenario reproduces ([`angular/angular#53721`](https://github.com/angular/angular/issues/53721)) is specific to Angular's own `@defer (on idle)` `IdleScheduler`, which doesn't exist in Angular 12 either. [`tests/idle-callback-guard.spec.ts`](tests/idle-callback-guard.spec.ts) carries only the guarded sub-test (default app) on this branch — the crash-repro sub-test doesn't exist here rather than being skipped, since it can never run. See [`knowledge/decisions/idle-callback-guard.md`](../knowledge/decisions/idle-callback-guard.md).

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../knowledge/conventions.md) — they are the mandatory single source of truth.

- **Version derivation**: the Docker image tag in [`docker-compose.e2e.yml`](../docker-compose.e2e.yml) is interpolated from `PLAYWRIGHT_VERSION`, which [`support/e2e-docker.mjs`](support/e2e-docker.mjs) sets from the installed [`@playwright/test`](../package.json) — never hardcode the tag; upgrading the package is all that's needed.
- **Decision ladder for new tests** (prefer the earliest rung that works): (1) a plain spec in [`tests/`](tests/) against the default app; (2) Playwright-side simulation — `addInitScript`, `page.route`, clock control — like the Safari simulation in [`tests/idle-callback-guard.spec.ts`](tests/idle-callback-guard.spec.ts); (3) a new scenario, only when the app's provider/DI composition itself must differ.
- **Scenario budget**: each scenario costs a build + a static-server port in the `app` service. When adding one, mirror the `playground` composition's pattern in [`docker-compose.e2e.yml`](../docker-compose.e2e.yml), [`playwright.config.ts`](../playwright.config.ts), and [`e2e/support/servers.ts`](support/servers.ts).
- **One suite**: new tests go in [`tests/`](tests/) and must pass within the single [`npm run e2e`](../package.json) invocation; do not add separately-run test targets.
- **No test hooks in app code**: follow convention **#14** in [`knowledge/conventions.md`](../knowledge/conventions.md) — add a scenario instead of modifying runtime source.
- **Fixture sync**: a fixture that replaces a [`src/`](../src/) file must keep its exports in sync with the file it replaces.
