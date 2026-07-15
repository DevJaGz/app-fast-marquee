# Design: adopt-two-line-branch-model

## Context

`develop` is the integration trunk (maintainer direction, 2026-07-15): it carries the complete `20.x` modernization (Angular 20, zoneless, behavior contract + e2e suite, `core/`+`adapter/` split) and stands in for `master` until both version lines work. `refactor/build-12` was verified fully merged into `develop` and deleted. `build12/` is a stale Angular 12 workspace snapshot needed only as the toolchain reference for the `12.x` conversion. The Angular 12 adaptation itself is specified by the sibling change `adapt-12x-line`, which lives exclusively on the `12.x` branch.

## Goals / Non-Goals

**Goals:**

- Define and record the branch-local OpenSpec workflow for version-line branches.
- Cut the `12.x` branch at the right point (artifacts committed, `build12/` still present).
- Clean the trunk: `build12/` gone, docs and knowledge bundle accurate.
- Bind the 20.x line to the API-parity contract in its own spec.

**Non-Goals:**

- Any Angular 12 work (workspace conversion, adapter rewrite, tests) — that is `adapt-12x-line` on the `12.x` branch.
- Merging `develop` into `master`, publishing, rulesets, CI/CD, retirement machinery.

## Decisions

### D1 — Branch-local OpenSpec workflow

Rule, to be recorded in [branch-model-version-lines.md](../../../knowledge/decisions/branch-model-version-lines.md): (1) `openspec/specs/` on each version-line branch describes only that line's behavior; (2) a change lives and archives on the branch where its tasks execute; (3) cross-line contracts — today, only API parity — are mirrored verbatim into both branches' specs. **Alternative rejected — one combined change on the trunk covering both branches**: archiving it on `develop` would sync 12.x-only requirements (Angular 12 consumption, TS 4.2.3 dialect) into the 20.x spec, which that branch cannot even verify, and would leave a permanently in-progress change on the trunk while its tasks complete elsewhere.

### D2 — Ordering: commit → cut `12.x` → delete `build12/`

The `12.x` branch must inherit this change's committed artifacts (so the parity contract travels) and the `build12/` folder (toolchain reference for the conversion). Therefore: commit this change on `develop` first, cut `12.x` second, delete `build12/` on `develop` third. The `adapt-12x-line` artifacts remain untracked in the working tree until they are committed as that change's first task on `12.x` — git then removes them from the worktree automatically whenever `develop` is checked out, so they never pollute the trunk.

### D3 — The inherited copy of this change on `12.x`

Because `12.x` is cut after this change is committed but before it is archived, `12.x` inherits an in-progress copy of `openspec/changes/adopt-two-line-branch-model/`. Its authoritative home is `develop` (per D1); the stale copy is removed on `12.x` by `adapt-12x-line`'s first task group.

### D4 — Only the parity requirement lands in the trunk's spec

The delta spec here carries exactly one requirement: Two-Version-Line Template API Parity. It constrains the 20.x line (no renames/default changes without honoring the other line) and is mirrored by `adapt-12x-line` so both branches' specs state the identical contract. Line-specific requirements stay on their line's branch.

## Risks / Trade-offs

- **[Contract mirror drift]** the parity requirement lives in two branches' specs and could be edited on one side only → the requirement text is identical by construction (both changes copy the same block), and the knowledge-bundle rule instructs future edits to update both mirrors in the same effort.
- **[Premature trunk merge]** an agent or contributor merges `develop` → `master`, triggering the live Firebase docs deploy ([firebase-hosting-merge.yml](../../../.github/workflows/firebase-hosting-merge.yml) deploys on every `master` push) → guardrails already forbid autonomous merges to `master`; the knowledge bundle update records that the merge is a deliberate future release milestone.
- **[Unprotected `12.x` branch]** the planned `master` + `*.x` ruleset doesn't exist yet → out of scope; recorded as remaining work in the knowledge bundle.

## Migration Plan

Task order: (1) commit artifacts on `develop`; (2) cut and push `12.x`; (3) trunk cleanup (`build12/`, `AGENTS.md`, README, knowledge bundle); (4) verify `develop` still builds/lints/tests green; archive this change on `develop`. Rollback: before step 3 lands, everything is a branch pointer plus one docs commit; `12.x` can be deleted and re-cut from the same commit at any time. `master` is never touched.

## Open Questions

- Exact wording/placement of the README compatibility table (resolved with the maintainer at the confirmation-gated task).
- `origin/feat/signals` and the local `specify-marquee-behavior` branch remain untouched; their cleanup is not part of this change.
