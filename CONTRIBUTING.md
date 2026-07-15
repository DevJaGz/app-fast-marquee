# Contributing to app-fast-marquee

This repository contains two deliverables: the demo application [`app-fast-marquee`](src/) and the publishable library [`ngx-fast-marquee`](projects/ngx-fast-marquee/).

**All mandatory repository conventions live in [`knowledge/conventions.md`](knowledge/conventions.md)** — read them before contributing; this guide is only the human quick-start. AI agents must additionally follow [`knowledge/guardrails.md`](knowledge/guardrails.md).

---

## 1. Getting Started

**Prerequisites** (from [`package.json`](package.json) `engines`; this branch hosts the Patchable `12.x` line, see [branch-model-version-lines.md](knowledge/decisions/branch-model-version-lines.md))

| Tool | Supported versions |
|------|--------------------|
| [Node.js](https://nodejs.org/) | `^14.15.0` |
| [npm](https://docs.npmjs.com/) | `>=6.14.8` |

```bash
git clone <repo-url>
cd app-fast-marquee
npm install
```

---

## 2. Development Workflow

1. Branch off `master` with a descriptive name:
   - `feat/my-feature`
   - `fix/the-bug`
2. Start the dev server: [`npm run start`](package.json)
3. Build the demo app: [`npm run build:app`](package.json)
4. Build the library: [`npm run build:lib`](package.json)

---

## 3. Quality Gates

Lint and formatting are mandatory and enforced by the [Husky](https://typicode.github.io/husky/) [pre-commit hook](.husky/pre-commit) — see repository convention 2 in [`knowledge/conventions.md`](knowledge/conventions.md).

| Check | Command |
|-------|---------|
| ESLint (check / fix) | [`npm run lint`](package.json) / [`npm run lint:fix`](package.json) |
| Prettier (write / fix) | [`npm run format`](package.json) / [`npm run prettier:fix`](package.json) |
| Unit tests ([Karma](https://karma-runner.github.io/)/[Jasmine](https://jasmine.github.io/), see convention 7) | [`npm run test:app`](package.json) / [`npm run test:lib`](package.json) |
| Core dialect floor (TypeScript `4.2.3`) | [`npm run check:core-dialect`](package.json) |
| E2E ([Playwright](https://playwright.dev/) in Docker, two services — see [`e2e/AGENTS.md`](e2e/AGENTS.md)) | [`npm run e2e`](package.json) |

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
