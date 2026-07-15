# app-fast-marquee — AI Agent Harness

Demo application and publishable Angular library in a single monorepo.

## Overview

| Node                 | Path                                                       |
| -------------------- | ---------------------------------------------------------- |
| Application          | [`src/`](src/)                                             |
| Library              | [`projects/ngx-fast-marquee/`](projects/ngx-fast-marquee/) |
| E2E suite            | [`e2e/`](e2e/)                                             |
| OpenSpec workflow    | [`openspec/`](openspec/)                                   |
| Knowledge base (OKF) | [`knowledge/`](knowledge/)                                 |
| Angular skills       | [`.agents/skills/`](.agents/skills/)                       |

## Key Commands

| Command             | Description                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm start`        | Serve the application in development mode                                                                                                          |
| `pnpm build:app`    | Build the application                                                                                                                              |
| `pnpm build:lib`    | Build the publishable library                                                                                                                      |
| `pnpm test:app`     | Run the application's unit tests (Vitest)                                                                                                          |
| `pnpm test:lib`     | Run the library's unit tests (Vitest)                                                                                                              |
| `pnpm lint`         | Run ESLint across the workspace                                                                                                                    |
| `pnpm lint:fix`     | Run ESLint and auto-fix violations                                                                                                                 |
| `pnpm format`       | Format code with Prettier (rewrites files)                                                                                                         |
| `pnpm prettier:fix` | Auto-fix formatting with Prettier                                                                                                                  |
| `pnpm e2e`          | Run the full e2e suite in Docker ([`e2e/support/e2e-docker.mjs`](e2e/support/e2e-docker.mjs) → [`docker-compose.e2e.yml`](docker-compose.e2e.yml)) |
| `pnpm e2e:local`    | Run the full e2e suite without Docker (`ng e2e`; needs local Playwright browsers)                                                                  |

## Branches

| Branch    | Role                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| `develop` | Interim trunk for the `20.x` Active line (stands in for `master` until both lines work) |
| `12.x`    | Patchable line (self-contained Angular 12 workspace, critical fixes only)               |
| `master`  | Frozen until the final `develop` → `master` merge (out of scope for now)                |

Full policy: [Branch Model and Two-Version-Line Publishing Strategy](knowledge/decisions/branch-model-version-lines.md).

## Navigation

| Node           | Path                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| Application    | [`src/AGENTS.md`](src/AGENTS.md)                                             |
| Library        | [`projects/ngx-fast-marquee/AGENTS.md`](projects/ngx-fast-marquee/AGENTS.md) |
| E2E suite      | [`e2e/AGENTS.md`](e2e/AGENTS.md)                                             |
| Knowledge base | [`knowledge/index.md`](knowledge/index.md)                                   |

## Conventions

All repository conventions live in [`knowledge/conventions.md`](knowledge/conventions.md) — read and follow **all** of them before any change or user reply; they are mandatory. Do not restate conventions elsewhere (convention 12). Operational guardrails (autonomous vs confirmation-required vs forbidden actions) live in [`knowledge/guardrails.md`](knowledge/guardrails.md).

## AI Agent Workflow

**Project memory** lives in the [`knowledge/`](knowledge/) OKF bundle. Start at [`knowledge/index.md`](knowledge/index.md) to locate the decisions, guardrails, and lessons relevant to the task before making implementation decisions; load only the pages the task needs.

**Angular skills** live in [`.agents/skills/`](.agents/skills/). The [`angular-developer`](.agents/skills/angular-developer/SKILL.md) skill provides Angular coding guidance — read it before generating any Angular code.

**OpenSpec change workflow**:

- `/opsx:propose` — draft a new change (design + spec + tasks)
- `/opsx:apply` — implement tasks from an existing change
- `/opsx:archive` — finalise and archive a completed change

Specs live in [`openspec/specs/`](openspec/specs/), split into [`openspec/specs/library/`](openspec/specs/library/) and [`openspec/specs/application/`](openspec/specs/application/) capability folders.
