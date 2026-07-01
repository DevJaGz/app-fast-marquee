# Contributing to app-fast-marquee

This repository contains two deliverables: the demo application [`app-fast-marquee`](src/) and the publishable library [`ngx-fast-marquee`](projects/ngx-fast-marquee/).

---

## 1. Getting Started

**Prerequisites**

| Tool | Minimum version |
|------|----------------|
| [Node.js](https://nodejs.org/) | 18.16.0 |
| [npm](https://docs.npmjs.com/) | 9.5.1 |
| [pnpm](https://pnpm.io/) | 8.6.12 |

```bash
git clone <repo-url>
cd app-fast-marquee
pnpm install
```

---

## 2. Development Workflow

1. Branch off `main` with a descriptive name:
   - `feat/my-feature`
   - `fix/the-bug`
2. Start the dev server: [`npm run start`](package.json)
3. Build the demo app: [`npm run build:app`](package.json)
4. Build the library: [`npm run build:lib`](package.json)

---

## 3. Lint & Format Gate

Run these before every commit. The [Husky](https://typicode.github.io/husky/) [pre-commit hook](.husky/pre-commit) runs lint-staged automatically on staged [`.ts`](src/), [`.html`](src/), [`.scss`](src/), and [`.json`](package.json) files, but you should verify manually before pushing.

| Check | Command |
|-------|---------|
| ESLint (check) | [`npm run lint`](package.json) |
| ESLint (auto-fix) | [`npm run lint:fix`](package.json) |
| Prettier (write) | [`npm run format`](package.json) |
| Prettier (fix) | [`npm run prettier:fix`](package.json) |

Config files: [`.eslintrc.json`](.eslintrc.json), [`projects/ngx-fast-marquee/.eslintrc.json`](projects/ngx-fast-marquee/.eslintrc.json), [`.prettierrc.json`](.prettierrc.json).

> **Never** pass `--no-verify` or otherwise bypass ESLint or Prettier unless explicitly instructed by a maintainer.

---

## 4. Running Tests

```bash
ng test
```

Runs [Karma](https://karma-runner.github.io/)/[Jasmine](https://jasmine.github.io/) unit tests. All tests must pass before opening a PR.

---

## 5. Commit Messages (Conventional Commits)

Format: `<type>(<scope>): <description>`

**Example:** `feat(library): add pause-on-hover input`

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructure, no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependencies |

[commitlint](https://commitlint.js.org/) enforces this format automatically via [`commitlint.config.js`](commitlint.config.js). See the [Conventional Commits spec](https://www.conventionalcommits.org/) for full details.

---

## 6. Pull Request Flow

1. Push your branch and open a PR targeting `main`.
2. Write a clear description of **what** changed and **why**.
3. Ensure lint, format, and tests all pass.
4. For changes touching the library public API, update [`projects/ngx-fast-marquee/README.md`](projects/ngx-fast-marquee/README.md).
5. PR review is required before merging.

---

## 7. OpenSpec Change Workflow

For any non-trivial change (new features, architecture decisions, breaking changes), use the OpenSpec workflow inside [Cursor](https://cursor.com/):

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `/opsx:propose` | Draft a proposal, design, and task list |
| 2 | `/opsx:apply` | Implement the tasks |
| 3 | `/opsx:archive` | Archive the completed change |

Specs live in [`openspec/specs/`](openspec/specs/), split into [`openspec/specs/library/`](openspec/specs/library/) and [`openspec/specs/application/`](openspec/specs/application/) capability folders.

---

## 8. AGENTS.md Upkeep

Every change that modifies code, structure, dependencies, scripts, or conventions **must** update the relevant [`AGENTS.md`](AGENTS.md) (root + affected child) in the **same commit**. This keeps the AI agent harness accurate.

Child [`AGENTS.md`](AGENTS.md) files:

- [`src/AGENTS.md`](src/AGENTS.md) — application source
- [`projects/ngx-fast-marquee/AGENTS.md`](projects/ngx-fast-marquee/AGENTS.md) — library source

> Before generating any Angular code, read [`.agents/skills/angular-developer/SKILL.md`](.agents/skills/angular-developer/SKILL.md).
