# Proposal: adopt-two-line-branch-model

## Why

The [branch-model and two-version-line decision](../../../knowledge/decisions/branch-model-version-lines.md) commits `ngx-fast-marquee` to two published lines — Active `20.x` and Patchable `12.x` — but none of its branch machinery exists yet. `develop` is the integration trunk (it stands in for `master` until both lines work; the final `develop` → `master` merge and deployments are out of scope). This change starts executing the model on the trunk: it cuts the `12.x` line branch, removes the stale `build12/` snapshot from the trunk, binds the 20.x line to the cross-line API-parity contract at spec level, and defines the branch-local OpenSpec workflow so each line's branch tells only its own story.

## What Changes

- **Branch-local OpenSpec workflow (new rule, recorded in the knowledge bundle)**: `openspec/specs/` on each version-line branch describes only that line's behavior; OpenSpec changes live and archive on the branch where their tasks execute; cross-line contracts (API parity) are mirrored into both branches' specs. Consequently, the Angular 12 adaptation work is **not** part of this change — it is the separate `adapt-12x-line` change, created and committed only on the `12.x` branch.
- **Branch operations**: `refactor/build-12` deleted (already done — verified fully merged into `develop`); the long-lived `12.x` branch is cut from `develop` *after* this change's artifacts are committed and *while `build12/` still exists* (it is the Angular 12 toolchain reference the `12.x` conversion consumes).
- **Trunk cleanup**: the `build12/` folder is deleted from `develop` after the `12.x` branch is cut; root `AGENTS.md` drops its row and documents each branch's role.
- **Spec-level parity contract**: the `library` spec on the trunk gains the Two-Version-Line Template API Parity requirement, so future 20.x work cannot rename inputs/outputs or change defaults without honoring the `12.x` line.
- **Documentation**: the library README on `develop` gains the Angular-compatibility guidance ("Angular >= 20 → latest; Angular 12–19 → `ngx-fast-marquee@12`") — guardrail-gated; the knowledge bundle (`branch-model-version-lines.md` current-state incl. `develop`'s interim-trunk role and the new OpenSpec rule, `log.md`) is updated in the same change.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `library`: adds the Two-Version-Line Template API Parity requirement (cross-line contract, mirrored on both line branches). The 12.x-specific requirements (Angular 12 consumption, TS 4.2.3 core dialect floor) belong to the `adapt-12x-line` change on the `12.x` branch, not here.

## Impact

- **Branches**: `develop` (this change's home; receives the cleanup and docs commits), new long-lived `12.x` branch cut from it. `master` untouched until the out-of-scope final merge.
- **Files on `develop`**: `build12/` (deleted), root `AGENTS.md`, library README (compat guidance — confirmation-gated per [guardrails](../../../knowledge/guardrails.md)), `openspec/specs/library/library.spec.md` (parity requirement at archive/sync), `knowledge/decisions/branch-model-version-lines.md`, `knowledge/log.md`.
- **Out of scope**: everything on the `12.x` branch (see `adapt-12x-line` there), merging `develop` into `master`, npm publishing, dist-tags, repository rulesets/branch protection, CI/CD workflows, retirement machinery.
