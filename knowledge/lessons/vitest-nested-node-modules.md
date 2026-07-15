---
type: Lesson
title: A Standalone Vitest Root Can Create a Nested node_modules Git Silently Tracks
description: A Vitest config that sets a custom `root` outside the workspace root writes its cache to a `node_modules/.vite` folder scoped to that root — and a root-anchored `.gitignore` entry won't catch it.
tags:
  - testing
  - vitest
  - git
timestamp: 2026-07-15T20:00:00Z
---

# What happened

[`projects/ngx-fast-marquee/schematics/vitest.config.ts`](../../projects/ngx-fast-marquee/schematics/vitest.config.ts) runs as a plain Vitest CLI invocation (`pnpm test:schematics`), not through the Angular `@angular/build:unit-test` builder used by the app and library — see [conventions.md](../conventions.md) convention 7. Its config sets `root` to the schematics folder itself. Vite/Vitest derives its cache directory as `<root>/node_modules/.vite` unless told otherwise, and since that folder isn't its own package (no local `package.json`), Vite created a brand-new `node_modules` directory there on first run.

[`.gitignore`](../../.gitignore) only had `/node_modules` (anchored to the repo root), so this nested folder wasn't ignored. It was staged and committed whole in the `add-library-schematics` change (commit `fff26d0`), landing a Vitest test-results cache file (`node_modules/.vite/vitest/<hash>/results.json`) in version control.

# What to do instead

- Any `.gitignore` entry for a tool-generated directory that can plausibly appear more than once in a monorepo (`node_modules`, build caches) should be **unanchored** (`node_modules`, not `/node_modules`) so it matches at every depth, not just the root. [angular/components' own root `.gitignore`](https://github.com/angular/components/blob/main/.gitignore) does exactly this — `node_modules` with no leading slash.
- A Vitest/Vite config that sets a custom `root` outside the workspace root must also set an explicit `cacheDir` pointing somewhere already ignored (this repo uses `.angular/cache/`, the same tree the Angular builder's own Vitest runs cache into) — never let it default, or it will (re-)create a `node_modules` folder wherever `root` points.
- Angular's own component library takes this further structurally: both [`src/material/schematics/`](https://github.com/angular/components/tree/main/src/material/schematics) and [`src/cdk/schematics/`](https://github.com/angular/components/tree/main/src/cdk/schematics) have no real `package.json` (each ships only a 2-line `{"type": "commonjs"}` marker, byte-identical between the two), no `node_modules`, and no isolated test-runner root at all — tests run via a shared `tsconfig-test.json` (Jasmine) through the monorepo's Bazel-driven build graph (`BUILD.bazel`). The underlying principle carries over even without Bazel: don't give a subfolder its own isolated toolchain root/cache unless it truly is an independent package.

# Fix applied

`.gitignore`'s `node_modules` rule was unanchored; `vitest.config.ts` gained an explicit `cacheDir` under `.angular/cache/vitest-schematics/`; the wrongly-tracked file and the stray directory were removed. Verified against angular/components directly (2026-07-15): its root `.gitignore` already uses the unanchored form, and neither `material/schematics/` nor `cdk/schematics/` carries a `node_modules` or isolated test-cache root — confirming both fixes match the reference project's actual pattern, not just a plausible guess.

# Citations

[1] [angular/components root `.gitignore`](https://github.com/angular/components/blob/main/.gitignore) — `node_modules` rule is unanchored (line 10).
[2] [angular/components `src/material/schematics/`](https://github.com/angular/components/tree/main/src/material/schematics) — reference layout with no per-folder `node_modules` or isolated test root.
[3] [angular/components `src/cdk/schematics/`](https://github.com/angular/components/tree/main/src/cdk/schematics) — same pattern; `package.json` is a bare `{"type": "commonjs"}` marker, not a real dependency tree.
