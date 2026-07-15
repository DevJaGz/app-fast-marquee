# Tasks: adopt-two-line-branch-model

Tasks marked **(confirm)** are confirmation-gated per [guardrails](../../../knowledge/guardrails.md) — stop and get explicit maintainer approval before executing. Tasks marked **(user/remote)** perform git-remote or GitHub write actions and run only on explicit request. This change's home is `develop`; the Angular 12 work is the separate `adapt-12x-line` change on the `12.x` branch.

## 1. Anchor the change on `develop`

- [x] 1.1 Verify `refactor/build-12` is fully contained in `develop` and delete it (done — safe `git branch -d` succeeded; no remote counterpart existed)
- [ ] 1.2 Commit this change's artifacts (`openspec/changes/adopt-two-line-branch-model/` only — the `adapt-12x-line` directory stays uncommitted; it belongs to the `12.x` branch) on `develop`

## 2. Cut the `12.x` line branch

- [ ] 2.1 Create branch `12.x` from `develop` (after 1.2 so the parity contract travels; `build12/` must still exist at the branch point as the Angular 12 toolchain reference)
- [ ] 2.2 **(user/remote)** Push `12.x` to the remote so the line branch exists upstream

## 3. Trunk cleanup on `develop`

- [ ] 3.1 Delete the `build12/` folder
- [ ] 3.2 Remove the `build12/` row from root `AGENTS.md` and add the branch-role note (`develop` = interim trunk for the 20.x Active line, `12.x` = Patchable line, `master` = frozen until the final out-of-scope merge)
- [ ] 3.3 **(confirm)** Add the Angular-compatibility guidance to the library README ("Angular >= 20 → latest; Angular 12–19 → `ngx-fast-marquee@12`") — README compat table is guardrail-gated
- [ ] 3.4 Update `knowledge/decisions/branch-model-version-lines.md`: current-state section (`develop`'s interim-trunk role, `refactor/build-12` removal, `12.x` creation) and the new branch-local OpenSpec workflow rule (branch-local specs; changes archive where their tasks execute; cross-line contracts mirrored); append to `knowledge/log.md`

## 4. Verification and closure

- [ ] 4.1 On `develop`: build, lint, unit tests, and the e2e suite pass after the cleanup; no orphaned dev-server processes/ports left (convention 6)
- [ ] 4.2 Validate with `openspec validate adopt-two-line-branch-model`, sync the parity requirement into `openspec/specs/library/library.spec.md`, and archive this change on `develop` via `/opsx:archive`
