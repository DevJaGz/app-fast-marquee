# Ngx Fast Marquee

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://your-build-url.com)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](https://opensource.org/licenses/MIT)

## Description

This repository contains two deliverables:

- **[`ngx-fast-marquee`](projects/ngx-fast-marquee/)** — a publishable Angular component library that adds fast, lightweight marquee animations to any Angular application.
- **[`app-fast-marquee`](src/)** — a demo application exercising the library's e2e behavior-contract surface.

For library-specific installation, usage, and API docs, see [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).

**12.x branch**: this branch hosts the Patchable Angular 12 line — a self-contained workspace on Node `^14.15.0`, npm-based (not pnpm). See [`AGENTS.md`](AGENTS.md) and [branch-model-version-lines.md](knowledge/decisions/branch-model-version-lines.md).

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| [Node.js](https://nodejs.org/) | `^14.15.0` (see [`.node-version`](.node-version)) |
| [npm](https://www.npmjs.com/) | `>=6.14.8` |

## Installation

```bash
npm install
```

## Development

Start the dev server:

```bash
npm run start
```

Then open [http://localhost:4200](http://localhost:4200) in your browser.

## Build

Build the demo application:

```bash
npm run build:app
```

Build and package the library:

```bash
npm run build:lib
```

## Testing

### Unit tests

```bash
npm run test:app
npm run test:lib
```

Runs unit tests via [Karma](https://karma-runner.github.io/) / [Jasmine](https://jasmine.github.io/) in `ChromeHeadless`.

### End-to-end tests

```bash
npm run e2e
```

Runs the full Playwright suite in Docker, two services — app (Node 14) + Playwright (modern Node), since Angular CLI 12 has no Playwright builder and this branch's toolchain can't share a container with modern Node ([`e2e/support/e2e-docker.mjs`](e2e/support/e2e-docker.mjs) → [`docker-compose.e2e.yml`](docker-compose.e2e.yml)). Requires Docker. There is no local (non-Docker) variant on this branch.

The suite verifies the Safari/iOS idle-callback guard ([issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5)) in Chromium and WebKit. See [`e2e/AGENTS.md`](e2e/AGENTS.md) for architecture and conventions.

## Lint & Format

| Command | Description |
|---------|-------------|
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier write |
| `npm run prettier:fix` | Prettier + ESLint fix |

## Repo Structure

```
app-fast-marquee/
├── src/                          # Demo application source
├── projects/ngx-fast-marquee/   # Publishable library
├── e2e/                          # Playwright end-to-end suite
├── openspec/                     # OpenSpec specs and changes
├── .agents/skills/               # Angular agent skills
└── .cursor/commands/             # OpenSpec Cursor commands
```

| Path | Description |
|------|-------------|
| [`src/`](src/) | Demo application source |
| [`projects/ngx-fast-marquee/`](projects/ngx-fast-marquee/) | Publishable library |
| [`e2e/`](e2e/) | Playwright end-to-end suite |
| [`openspec/`](openspec/) | OpenSpec specs and changes |
| [`.agents/skills/`](.agents/skills/) | Angular agent skills |
| [`.cursor/commands/`](.cursor/commands/) | OpenSpec Cursor commands |

## AI Agent Harness

This repo includes an AI agent harness for [Cursor](https://www.cursor.com/). Agents must start by reading [`AGENTS.md`](AGENTS.md).

Angular coding guidance is in [`.agents/skills/angular-developer/SKILL.md`](.agents/skills/angular-developer/SKILL.md).

For non-trivial changes, use the OpenSpec workflow:

1. `/opsx:propose` — draft a new change
2. `/opsx:apply` — implement tasks from an existing change
3. `/opsx:archive` — finalise and archive a completed change

Specs live in [`openspec/specs/`](openspec/specs/).

## Library Documentation

Full installation instructions, usage examples, and API reference for the `ngx-fast-marquee` component are in [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).
