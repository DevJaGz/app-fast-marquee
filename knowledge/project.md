---
type: Project
title: app-fast-marquee
description: Monorepo hosting the publishable ngx-fast-marquee Angular library and its demo application, with a Playwright e2e suite.
tags:
  - overview
  - status
timestamp: 2026-07-16T00:00:00Z
---

# What it is

A single Angular workspace containing:

- **[ngx-fast-marquee](../projects/ngx-fast-marquee/AGENTS.md)** — a lightweight, publishable marquee component library (published on npm, real consumer audience). This is the product.
- **[Demo application](../src/AGENTS.md)** — showcases the library and doubles as its integration testbed; deployed as the docs site ([https://ngx-fast-marquee.web.app/](https://ngx-fast-marquee.web.app/)).
- **[E2E suite](../e2e/AGENTS.md)** — Playwright (Chromium + WebKit), runnable in Docker.

# Goals

1. Ship a dependency-lean marquee component that works across a wide Angular version range.
2. Keep the shipped library bundle as small as possible.
3. Maximize runtime performance and efficiency.
4. Maximize developer experience for library consumers.
5. Keep the library resilient to host-app patterns outside its control — see the [idle-callback guard decision](decisions/idle-callback-guard.md).
6. Serve old and new Angular consumers via two version lines — see the [branch-model and version-line plan](decisions/branch-model-version-lines.md) (planned).

# Current state (verified 2026-07-16)

- Workspace: Angular `^20.3.25`, zoneless, signal-based APIs, OnPush enforced by ESLint (see the [Angular 20 idiom-adoption decision](decisions/angular-20-idiom-adoption.md)).
- Package manager: **pnpm** on this line (`develop`, later `master`) — [pnpm-lock.yaml](../pnpm-lock.yaml) is the only lockfile; run all repo commands with `pnpm`, never `npm` (verified 2026-07-15).
- Unit tests: Vitest via the experimental `@angular/build:unit-test` builder (both projects). The app currently has zero `*.spec.ts` files, so `pnpm test:app` reports "No tests found" — known, not a regression.
- Lint: ESLint `^8.57.0` with `@angular-eslint` `^20.7.0` and `@typescript-eslint` `^8.62.1`.
- Library: version `20.0.0`, peers `@angular/common`/`@angular/core` `>=20.0.0 <23.0.0` — set 2026-07-16 per the [branch-model and version-line plan](decisions/branch-model-version-lines.md) with maintainer confirmation; **not published yet**. Any further change to version/peers still requires explicit confirmation (see [guardrails](guardrails.md)).
- Branches: `develop` (interim trunk, `20.x` Active line), `12.x` (Maintenance/Patchable line at `12.0.0`), `master` (frozen until the final `develop` → `master` merge). One release tag exists: `v0.1.7`; `v20.0.0`/`v12.0.0` tags are deferred to the actual publish commits.

# Where to look next

- Terminology: [glossary.md](glossary.md)
- Conventions: [conventions.md](conventions.md)
- Commands and directory maps: [AGENTS.md](../AGENTS.md)
- Behavioral requirements: [openspec/specs/](../openspec/specs/)
