# app-fast-marquee — AI Agent Harness

Demo application and publishable Angular library in a single monorepo.

## Overview

| Node | Path |
|------|------|
| Application | [`src/`](src/) |
| Library | [`projects/ngx-fast-marquee/`](projects/ngx-fast-marquee/) |
| E2E suite | [`e2e/`](e2e/) |
| OpenSpec workflow | [`openspec/`](openspec/) |
| Angular skills | [`.agents/skills/`](.agents/skills/) |
| Stale snapshot (out of scope) | [`build12/`](build12/) |

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Serve the application in development mode |
| `npm run build:app` | Build the application |
| `npm run build:lib` | Build the publishable library |
| `npm run lint` | Run ESLint across the workspace |
| `npm run lint:fix` | Run ESLint and auto-fix violations |
| `npm run format` | Check formatting with Prettier |
| `npm run prettier:fix` | Auto-fix formatting with Prettier |
| `pnpm e2e` | Run the full e2e suite in Docker ([`e2e/support/e2e-docker.mjs`](e2e/support/e2e-docker.mjs) → [`docker-compose.e2e.yml`](docker-compose.e2e.yml)) |
| `pnpm e2e:local` | Run the full e2e suite without Docker (`ng e2e`; needs local Playwright browsers) |

## Navigation

| Node | Path |
|------|------|
| Application | [`src/AGENTS.md`](src/AGENTS.md) |
| Library | [`projects/ngx-fast-marquee/AGENTS.md`](projects/ngx-fast-marquee/AGENTS.md) |
| E2E suite | [`e2e/AGENTS.md`](e2e/AGENTS.md) |

## Conventions

1. **Auto-update**: any change to code, structure, dependencies, scripts, or conventions must update the relevant [`AGENTS.md`](AGENTS.md) (root + affected child) in the same change.
2. **Lint/format gate**: all new or edited code must conform to the [ESLint config](`.eslintrc.json`) and [Prettier](`.prettierrc.json`). Run `npm run lint` (or `npm run lint:fix`) and `npm run format` before completing. Never bypass ESLint/Prettier.
3. **Markdown-link rule**: every reference to a file, directory, path, URL, or command inside any documentation file ([`AGENTS.md`](AGENTS.md), README, CONTRIBUTING) must be written as a Markdown link, never bare text.
4. **Conventional Commits**: commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format. Husky [`.husky/pre-commit`](.husky/pre-commit) runs lint-staged (lint + Prettier) automatically.
5. **Angular idioms**: follow the [`angular-developer`](.agents/skills/angular-developer/SKILL.md) skill — standalone components, signals, `@if`/`@for`, `inject()`, OnPush strategy.
6. **Clean up processes**: any agent that starts a dev server, watcher, or other process that opens a port (e.g. via `npm run start`, `ng serve`) must stop that process and verify the port is released (e.g. `Get-NetTCPConnection`/`netstat`, not just `Ctrl+C`) before finishing the task, since orphaned `node.exe` child processes can survive a plain interrupt on Windows.

## AI Agent Workflow

**Angular skills** live in [`.agents/skills/`](.agents/skills/). The [`angular-developer`](.agents/skills/angular-developer/SKILL.md) skill provides Angular coding guidance — read it before generating any Angular code.

**OpenSpec change workflow**:

- `/opsx:propose` — draft a new change (design + spec + tasks)
- `/opsx:apply` — implement tasks from an existing change
- `/opsx:archive` — finalise and archive a completed change

Specs live in [`openspec/specs/`](openspec/specs/), split into [`openspec/specs/library/`](openspec/specs/library/) and [`openspec/specs/application/`](openspec/specs/application/) capability folders.
