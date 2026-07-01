# Ngx Fast Marquee

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://your-build-url.com)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](https://opensource.org/licenses/MIT)

## Description

This repository contains two deliverables:

- **[`ngx-fast-marquee`](projects/ngx-fast-marquee/)** — a publishable Angular component library that adds fast, lightweight marquee animations to any Angular application.
- **[`app-fast-marquee`](src/)** — a live demo application built with Angular 18.2 that showcases the library in action.

For library-specific installation, usage, and API docs, see [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| [Node.js](https://nodejs.org/) | 18.16.0 |
| [npm](https://www.npmjs.com/) | 9.5.1 |
| [pnpm](https://pnpm.io/) | 8.6.12 |

## Installation

```bash
pnpm install
```

`npm install` also works if pnpm is not available.

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

```bash
ng test
```

Runs unit tests via [Karma](https://karma-runner.github.io/) / [Jasmine](https://jasmine.github.io/).

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
├── openspec/                     # OpenSpec specs and changes
├── .agents/skills/               # Angular agent skills
├── .cursor/commands/             # OpenSpec Cursor commands
└── build12/                      # Stale snapshot (out of scope)
```

| Path | Description |
|------|-------------|
| [`src/`](src/) | Demo application source |
| [`projects/ngx-fast-marquee/`](projects/ngx-fast-marquee/) | Publishable library |
| [`openspec/`](openspec/) | OpenSpec specs and changes |
| [`.agents/skills/`](.agents/skills/) | Angular agent skills |
| [`.cursor/commands/`](.cursor/commands/) | OpenSpec Cursor commands |
| [`build12/`](build12/) | Stale snapshot (out of scope) |

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
