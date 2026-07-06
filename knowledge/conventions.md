---
type: Policy
title: Project Conventions
description: Mandatory repository conventions - lint gate, commits, Angular idioms, tooling floors, and the same-change rule for keeping this knowledge bundle current.
tags:
  - conventions
timestamp: 2026-07-06T03:00:00Z
---

# Repository Conventions

The single source of truth for how to work in this repo. Every [AGENTS.md](../AGENTS.md) file points here; child AGENTS.md files add only node-local specifics.

1. **Auto-update**: any change to code, structure, dependencies, scripts, or conventions must update the relevant [AGENTS.md](../AGENTS.md) (root + affected child) in the same change.
2. **Lint/format gate**: all new or edited code must conform to the [ESLint config](../.eslintrc.json) and [Prettier](../.prettierrc.json). Run `npm run lint` (or `npm run lint:fix`) and `npm run format` before completing. Never bypass ESLint/Prettier.
3. **Markdown-link rule**: every reference to a file, directory, path, URL, or command inside any documentation file ([AGENTS.md](../AGENTS.md) files, README, CONTRIBUTING, concepts in this bundle) must be written as a Markdown link, never bare text.
4. **Conventional Commits**: commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format. Husky [.husky/pre-commit](../.husky/pre-commit) runs lint-staged (lint + Prettier) automatically; there is no `commit-msg` hook, so commit message format is a reviewed convention, not a mechanically enforced one.
5. **Angular idioms**: follow the [angular-developer skill](../.agents/skills/angular-developer/SKILL.md) — standalone components, signals, `@if`/`@for`, `inject()`, OnPush strategy. Both the app and the library are **zoneless** (`provideZonelessChangeDetection()` in [src/app/app.config.ts](../src/app/app.config.ts); no `zone.js` dependency) and use signal-based `input()`/`output()`/`viewChild()` exclusively — do not introduce `@Input()`/`@Output()`/`@ViewChild()` decorators or reintroduce `zone.js` in new code. This is enforced by [.eslintrc.json](../.eslintrc.json)'s `@angular-eslint/prefer-signals`, `@angular-eslint/prefer-output-emitter-ref`, `@angular-eslint/prefer-inject`, and `@angular-eslint/prefer-on-push-component-change-detection` rules — `npm run lint` fails if these idioms regress.
6. **Clean up processes**: any agent that starts a dev server, watcher, or other process that opens a port (e.g. via `npm run start`, `ng serve`) must stop that process and verify the port is released (e.g. `Get-NetTCPConnection`/`netstat`, not just `Ctrl+C`) before finishing the task, since orphaned `node.exe` child processes can survive a plain interrupt on Windows.
7. **Unit tests run on Vitest**: both projects' `test` architect targets use the experimental `@angular/build:unit-test` builder with `runner: "vitest"` (configured in [angular.json](../angular.json)), not Karma. See [src/AGENTS.md](../src/AGENTS.md) and [projects/ngx-fast-marquee/AGENTS.md](../projects/ngx-fast-marquee/AGENTS.md) for project-specific setup notes.
8. **Node engine floor**: [package.json](../package.json) `engines.node` tracks Angular's own supported Node range — bump it in lockstep with every Angular major upgrade, never independently. See [package.json](../package.json) for the current range and the [Angular version compatibility guide](https://angular.dev/reference/versions) for what each Angular major requires; [project.md](project.md) holds the dated snapshot of the current value.
9. **Lint tooling floor**: `@angular-eslint/*` and `@typescript-eslint/*` in [package.json](../package.json) must track the installed `@angular/core` major and TypeScript version respectively — bump them in the same change as any Angular major upgrade. A version lag silently disables new `@angular-eslint` rules and can leave `@typescript-eslint` running against a TypeScript version it doesn't officially support. [project.md](project.md) holds the dated snapshot of the current versions.
10. **Knowledge base**: durable project memory lives in this bundle, navigable from [index.md](index.md). Respect [guardrails.md](guardrails.md) before acting. Any change that alters a decision, policy, convention, or lesson must update the bundle in the same change (bump the concept's `timestamp`, keep its parent [index.md](index.md) entry in sync, and append to [log.md](log.md)). If you are creating or restructuring a concept rather than just updating one, also read [meta.md](meta.md) for OKF frontmatter, type vocabulary, and linking rules.
