# Contributing to app-fast-marquee

This repository contains two deliverables: the demo application [`app-fast-marquee`](src/) and the publishable library [`ngx-fast-marquee`](projects/ngx-fast-marquee/).

**All mandatory repository conventions live in [`knowledge/conventions.md`](knowledge/conventions.md)** — read them before contributing; this guide is only the human quick-start. AI agents must additionally follow [`knowledge/guardrails.md`](knowledge/guardrails.md).

---

## 1. Getting Started

**Prerequisites** (from [`package.json`](package.json) `engines`)

| Tool | Supported versions |
|------|--------------------|
| [Node.js](https://nodejs.org/) | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0` |
| [npm](https://docs.npmjs.com/) | `>=9.5.1` |
| [pnpm](https://pnpm.io/) | `>=8.6.12` |

```bash
git clone <repo-url>
cd app-fast-marquee
pnpm install
```

---

## 2. Development Workflow

1. Branch off `master` with a descriptive name:
   - `feat/my-feature`
   - `fix/the-bug`
2. Start the dev server: [`pnpm start`](package.json)
3. Build the demo app: [`pnpm build:app`](package.json)
4. Build the library: [`pnpm build:lib`](package.json)

---

## 3. Quality Gates

Lint and formatting are mandatory and enforced by the [Husky](https://typicode.github.io/husky/) [pre-commit hook](.husky/pre-commit) — see repository convention 2 in [`knowledge/conventions.md`](knowledge/conventions.md).

| Check | Command |
|-------|---------|
| ESLint (check / fix) | [`pnpm lint`](package.json) / [`pnpm lint:fix`](package.json) |
| Prettier (write / fix) | [`pnpm format`](package.json) / [`pnpm prettier:fix`](package.json) |
| Unit tests ([Vitest](https://vitest.dev/), see convention 7) | [`pnpm test:app`](package.json) / [`pnpm test:lib`](package.json) |
| E2E ([Playwright](https://playwright.dev/) in Docker) | [`pnpm e2e`](package.json) |

All tests must pass before opening a PR.

---

## 4. Commit Messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`<type>(<scope>): <description>`, e.g. `feat(library): add pause-on-hover input`). [commitlint](https://commitlint.js.org/) and [`commitlint.config.js`](commitlint.config.js) are present, but there is no `commit-msg` hook — the format is checked by convention and PR review, not mechanically enforced. See repository convention 4 in [`knowledge/conventions.md`](knowledge/conventions.md).

---

## 5. Pull Request Flow

1. Push your branch and open a PR targeting `master`.
2. Write a clear description of **what** changed and **why**.
3. Ensure lint, format, and tests all pass.
4. For changes touching the library public API, update [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).
5. PR review is required before merging.

---

## 6. OpenSpec Change Workflow

For any non-trivial change (new features, architecture decisions, breaking changes), use the OpenSpec workflow in your AI agent environment:

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `/opsx:propose` | Draft a proposal, design, and task list |
| 2 | `/opsx:apply` | Implement the tasks |
| 3 | `/opsx:archive` | Archive the completed change |

Specs live in [`openspec/specs/`](openspec/specs/), split into [`openspec/specs/library/`](openspec/specs/library/) and [`openspec/specs/application/`](openspec/specs/application/) capability folders.

---

## 7. Documentation & Knowledge Upkeep

Every change that modifies code, structure, dependencies, scripts, or conventions **must** update the relevant [`AGENTS.md`](AGENTS.md) in the same commit (repository convention 1), and any change affecting a decision, policy, convention, or lesson must update the [`knowledge/`](knowledge/) bundle per the same-change rule — both defined in [`knowledge/conventions.md`](knowledge/conventions.md).

> Before generating any Angular code, read [`.agents/skills/angular-developer/SKILL.md`](.agents/skills/angular-developer/SKILL.md).
