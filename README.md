<div align="center">

# ✨ Ngx Fast Marquee — Monorepo

**Demo application and publishable Angular library in a single monorepo.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20--22-dd0031?logo=angular&logoColor=white)](projects/ngx-fast-marquee/README.md#angular-compatibility)
[![Sponsor](https://img.shields.io/badge/sponsor-%E2%9D%A4-db61a2?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/DevJaGz)

[Live Demo](https://ngx-fast-marquee.web.app/) · [StackBlitz Playground](https://stackblitz.com/edit/stackblitz-starters-5zvdjumb?file=src%2Fmain.ts) · [Library README](projects/ngx-fast-marquee/README.md) · [Report an Issue](https://github.com/DevJaGz/app-fast-marquee/issues)

</div>

---

This repository contains two deliverables:

- **[`ngx-fast-marquee`](projects/ngx-fast-marquee/)** — a publishable Angular component library that adds fast, lightweight marquee animations to any Angular application.
- **[`app-fast-marquee`](src/)** — a live demo application built with Angular 20 that showcases the library in action.

For library-specific installation, usage, and API docs, see [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).

## Contents

- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Build](#-build)
- [Testing](#-testing)
- [Lint & Format](#-lint--format)
- [Repo Structure](#-repo-structure)
- [AI Agent Harness](#-ai-agent-harness)
- [License](#-license)

## 🧰 Prerequisites

| Tool                           | Minimum version |
| ------------------------------ | --------------- |
| [Node.js](https://nodejs.org/) | 18.16.0         |
| [npm](https://www.npmjs.com/)  | 9.5.1           |
| [pnpm](https://pnpm.io/)       | 8.6.12          |

## 📥 Installation

```bash
pnpm install
```

[pnpm](https://pnpm.io/) is the repository's package manager ([`pnpm-lock.yaml`](pnpm-lock.yaml) is the only lockfile) — use `pnpm` for all repo commands, not `npm`.

## 🚀 Development

Start the dev server:

```bash
pnpm start
```

Then open [http://localhost:4200](http://localhost:4200) in your browser.

## 🏗️ Build

Build the demo application:

```bash
pnpm build:app
```

Build and package the library:

```bash
pnpm build:lib
```

## 🧪 Testing

### Unit tests

```bash
pnpm test:app
pnpm test:lib
```

Runs unit tests via [Vitest](https://vitest.dev/) (the `@angular/build:unit-test` builder).

### End-to-end tests

```bash
pnpm e2e
```

Runs the full Playwright suite in Docker ([`e2e/support/e2e-docker.mjs`](e2e/support/e2e-docker.mjs) → [`docker-compose.e2e.yml`](docker-compose.e2e.yml)). Requires Docker.

```bash
pnpm e2e:local
```

Runs the same suite locally (`ng e2e`). Requires a one-time browser install:

```bash
pnpm exec playwright install chromium webkit
```

The suite verifies the Safari/iOS idle-callback guard ([issue #5](https://github.com/DevJaGz/app-fast-marquee/issues/5)) in Chromium and WebKit. See [`e2e/AGENTS.md`](e2e/AGENTS.md) for architecture and conventions.

## 🎨 Lint & Format

| Command             | Description           |
| ------------------- | --------------------- |
| `pnpm lint`         | ESLint check          |
| `pnpm lint:fix`     | ESLint auto-fix       |
| `pnpm format`       | Prettier write        |
| `pnpm prettier:fix` | Prettier + ESLint fix |

## 🗂️ Repo Structure

```
app-fast-marquee/
├── src/                          # Demo application source
├── projects/ngx-fast-marquee/   # Publishable library
├── e2e/                          # Playwright end-to-end suite
├── openspec/                     # OpenSpec specs and changes
├── .agents/skills/               # Angular agent skills
├── .cursor/commands/             # OpenSpec Cursor commands
└── build12/                      # Stale snapshot (out of scope)
```

| Path                                                       | Description                   |
| ---------------------------------------------------------- | ----------------------------- |
| [`src/`](src/)                                             | Demo application source       |
| [`projects/ngx-fast-marquee/`](projects/ngx-fast-marquee/) | Publishable library           |
| [`e2e/`](e2e/)                                             | Playwright end-to-end suite   |
| [`openspec/`](openspec/)                                   | OpenSpec specs and changes    |
| [`.agents/skills/`](.agents/skills/)                       | Angular agent skills          |
| [`.cursor/commands/`](.cursor/commands/)                   | OpenSpec Cursor commands      |
| [`build12/`](build12/)                                     | Stale snapshot (out of scope) |

## 🤖 AI Agent Harness

This repo includes an AI agent harness for [Cursor](https://www.cursor.com/). Agents must start by reading [`AGENTS.md`](AGENTS.md).

Angular coding guidance is in [`.agents/skills/angular-developer/SKILL.md`](.agents/skills/angular-developer/SKILL.md).

For non-trivial changes, use the OpenSpec workflow:

1. `/opsx:propose` — draft a new change
2. `/opsx:apply` — implement tasks from an existing change
3. `/opsx:archive` — finalise and archive a completed change

Specs live in [`openspec/specs/`](openspec/specs/).

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
