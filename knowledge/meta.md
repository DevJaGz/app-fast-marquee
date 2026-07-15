---
type: Policy
title: Knowledge Base Maintenance
description: How to structure, link, and maintain this OKF bundle — OKF frontmatter, type vocabulary, reserved files, linking, ownership boundaries, and the lint checklist. Read this only when creating or restructuring a concept, not for ordinary code changes.
tags:
  - meta
  - okf
timestamp: 2026-07-15T12:00:00Z
---

# Knowledge Base Maintenance

This bundle conforms to the [Open Knowledge Format v0.1 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) — the source of truth for structure, frontmatter, reserved files, linking, and conformance — and follows the maintenance model from [Karpathy's LLM-wiki notes](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): the wiki is a persistent, compounding artifact that agents read instead of re-deriving project knowledge, and update as part of the same change that alters that knowledge.

The bundle root is [knowledge/](.). The bundle declares `okf_version: "0.1"` in the frontmatter of the root [index.md](index.md) — per OKF §11, the only place an `index.md` may carry frontmatter. A concept's ID is its bundle path without `.md` (e.g. `decisions/idle-callback-guard`).

This concept is the OKF maintenance manual, not a repository convention — a code-only change never needs to read it. [conventions.md](conventions.md) convention 10 is the only thing every change must follow.

## Concept documents (OKF §4)

Every non-reserved `.md` file is a concept document: YAML frontmatter followed by a markdown body. `type` is the only required field; the recommended fields are used in this bundle as follows:

```yaml
---
type: Decision # REQUIRED - see vocabulary below
title: Human-readable display name
description: One sentence; reused verbatim as this concept's index entry.
tags: [library, release] # optional, cross-cutting
timestamp: 2026-07-06T00:00:00Z # ISO 8601 datetime of last meaningful change
status: planned # extension key, Decision concepts only - see lifecycle below
---
```

Bodies favor structural markdown (headings, tables, lists, fenced code) over prose, and follow the spec's own example style (§4.3, §4.4, Appendix A): sections start at `#` level, and the frontmatter `title` is **not** repeated as a heading. Sources backing claims go under a `# Citations` heading at the bottom (OKF §8): one `[n] [link text](url) — note` entry per source, separated by blank lines; a citation with no linkable artifact (e.g. a verbal maintainer brief) stays as prose rather than getting a fabricated link.

### Type vocabulary

OKF does not register types centrally; this bundle deliberately uses a small fixed set. Do not invent new types without updating this concept.

| Type       | Holds                                                | Example                                                              |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| `Project`  | Top-level overview and current state                 | [project.md](project.md)                                             |
| `Policy`   | Rules governing agent/contributor behavior           | [guardrails.md](guardrails.md)                                       |
| `Decision` | What was decided, why, alternatives, what it affects | [decisions/idle-callback-guard.md](decisions/idle-callback-guard.md) |
| `Lesson`   | Pitfalls and non-obvious findings from past work     | [lessons/angular-20-upgrade.md](lessons/angular-20-upgrade.md)       |
| `Glossary` | Project terminology                                  | [glossary.md](glossary.md)                                           |

`Decision` concepts carry an extension key `status: planned | implemented | superseded` (OKF §4.1 permits producer-defined keys). A superseded decision is never deleted; it gains `status: superseded` plus a link to its successor, preserving historical context.

## Reserved files (OKF §6, §7)

- **`index.md`** — may appear in any directory; enumerates that directory's contents for progressive disclosure. No frontmatter (except the bundle root's `okf_version` block). Body is one or more `#` sections, each a list of `[Title](url) - description` entries, where title and description are taken **verbatim** from the linked concept's frontmatter — never append extra text (in particular, `status` is read from the concept's frontmatter, not restated in the index). A subdirectory `index.md` may open with one short producer-written prose sentence introducing the group before its link list — this is a codified exception, not a deviation to fix.
- **`log.md`** — bundle-root update history, date-grouped under `## YYYY-MM-DD` headings, newest first. Entries start with a bold category word: `**Initialization**`, `**Creation**`, `**Update**`, `**Deprecation**`. When this file grows unwieldy, rotate by year (`log-2026.md`, etc.) with `log.md` kept as the current year and older years linked from it — not yet needed, but plan for it before it becomes a problem.
- List markers: the OKF examples use `*`; this bundle uses `-` because the repository Prettier config normalizes markdown lists to `-`. The two are equivalent markdown — this is not a deviation from the format's structure.

## Linking (OKF §5)

- All links are standard markdown links; link semantics come from the surrounding prose.
- **This bundle uses relative links (§5.2), not the §5.1-recommended bundle-absolute `/…` form.** Documented deviation: the bundle root is `knowledge/`, not the repo root, so `/`-prefixed links would resolve against the repository root and render broken on GitHub and in an Obsidian vault opened at the repo root. §5.1 is a recommendation; relative links are fully conformant.
- Do not use `[[wikilinks]]` — not OKF, and broken outside Obsidian. Relative links also satisfy the repo-wide Markdown-link rule ([conventions.md](conventions.md) convention 3).
- Broken links are tolerated by consumers (§5.3) but are lint findings here — fix or remove them.
- Never link into `node_modules/` — it is gitignored and absent before `pnpm install`, so the link is broken on GitHub and in any fresh clone. Link to the upstream package's own documentation instead.

## Ownership boundaries — what lives where

This bundle must not duplicate knowledge the repository already records. Link to the authoritative home instead.

| Knowledge                                                               | Authoritative home                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Commands, directory maps, node-local specifics                          | [AGENTS.md](../AGENTS.md) tree                                                       |
| Behavioral requirements of app/library                                  | [openspec/specs/](../openspec/specs/)                                                |
| Per-change proposal/design/tasks detail                                 | [openspec/changes/archive/](../openspec/changes/archive/)                            |
| Conventions, decisions + rationale, policies, lessons, glossary, status | this bundle ([knowledge/](.))                                                        |
| How the code works                                                      | the code itself                                                                      |
| Exact current version numbers (Angular, ESLint, engines, etc.)          | [package.json](../package.json), snapshotted with a date in [project.md](project.md) |

A `Decision` concept summarizes and links to an archived OpenSpec change when one exists; it does not restate the design document.

## Navigation

Agents read the root [index.md](index.md) first, open only the concepts whose description matches the task, and follow links deeper only when needed. When delegating to worker agents, pass the specific concept paths they need instead of the whole bundle.

## Update workflow (same-change rule)

Whenever a change to the repo makes, alters, or invalidates a decision, policy, convention, or hard-won lesson, that same change must:

1. Update or create the affected concept (bump its `timestamp`).
2. Update the concept's entry in the parent [index.md](index.md) if title or description changed.
3. Append an entry under today's date in [log.md](log.md).

All bundle markdown is covered by the repository Prettier gate (`pnpm format` and lint-staged include `knowledge/**/*.md`).

## Lint checklist (periodic)

Run occasionally (or when asked) and fix what surfaces:

- Broken links within the bundle or into the repo, including into gitignored paths such as `node_modules/`.
- Contradictions with [AGENTS.md](../AGENTS.md), [openspec/specs/](../openspec/specs/), or the actual code — the repo wins; update the concept.
- OKF conformance (§9): every non-reserved concept has parseable frontmatter with a non-empty `type`; reserved files follow §6/§7.
- `Decision` concepts whose `status` no longer matches reality.
- Orphan concepts not reachable from [index.md](index.md).
- Index entries whose description drifted from the concept's frontmatter `description`.
- `# Citations` sections not using the `[n]` entry format (§8).
- Changes to concepts that never landed in [log.md](log.md).
- Version numbers hard-coded in a concept where a relative reference to [package.json](../package.json)/[project.md](project.md) would do instead.
