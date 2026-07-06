---
type: Policy
title: Operational Guardrails
description: Which actions AI agents may perform autonomously, which need human confirmation, and which are forbidden — read before acting.
tags:
  - agents
  - safety
timestamp: 2026-07-06T03:00:00Z
---

These rules take precedence over any convenience convention elsewhere in the repo (including the [repository conventions](conventions.md) auto-update habits). When a task requires a confirmation-gated action, stop and ask; do not treat it as an implied sub-step of an approved task.

# Allowed without human confirmation

Unless another rule explicitly overrides them:

- Reading files
- Analyzing code
- Implementing code
- Refactoring code
- Writing documentation (including this knowledge base)

# Require human confirmation

- Installing packages
- Updating dependencies
- Modifying project configuration (e.g. [angular.json](../angular.json), [tsconfig.json](../tsconfig.json), [.eslintrc.json](../.eslintrc.json), [.prettierrc.json](../.prettierrc.json))
- Changing infrastructure (e.g. [firebase.json](../firebase.json), [docker-compose.e2e.yml](../docker-compose.e2e.yml))
- Changing CI/CD (anything under [.github/](../.github/))
- Changing build tooling

**Project-specific override**: changing the library's `version` or `peerDependencies` in [projects/ngx-fast-marquee/package.json](../projects/ngx-fast-marquee/package.json), or its README Angular-compatibility table, always requires explicit confirmation — these are governed by the [branch-model and version-line plan](decisions/branch-model-version-lines.md), not by ordinary semver habit.

# Never perform autonomously

- Publishing packages (npm or similar)
- Creating commits, unless explicitly requested
- Pushing to remote repositories, unless explicitly requested
- Merging directly into the main branch (`master`)
- Performing releases
- Any write operation against an external service, unless explicitly requested — this includes GitHub (creating or commenting on issues/PRs, labels, releases, repository settings via `gh` or the API), npm registry (dist-tag mutations, deprecations), and Firebase (deploys, hosting/project config). Read-only use of these services (e.g. `gh pr view`, `gh issue list`) is unaffected.
