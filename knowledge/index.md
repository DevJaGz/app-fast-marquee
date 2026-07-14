---
okf_version: '0.1'
---

# Orientation

- [app-fast-marquee](project.md) - Monorepo hosting the publishable ngx-fast-marquee Angular library and its demo application, with a Playwright e2e suite.
- [Project Glossary](glossary.md) - Terminology used across decisions, specs, and release planning for app-fast-marquee.

# Policies

- [Project Conventions](conventions.md) - Mandatory repository conventions - lint gate, commits, Angular idioms, tooling floors, self-contained clarity, single-source documentation, reusable code, and the same-change rule for keeping this knowledge bundle current.
- [Operational Guardrails](guardrails.md) - Which actions AI agents may perform autonomously, which need human confirmation, and which are forbidden — read before acting.
- [Knowledge Base Maintenance](meta.md) - How to structure, link, and maintain this OKF bundle — OKF frontmatter, type vocabulary, reserved files, linking, ownership boundaries, and the lint checklist. Read this only when creating or restructuring a concept, not for ordinary code changes.

# Decisions

- [Decisions](decisions/index.md) - Architectural and process decisions with rationale: the planned branch model and two-version-line publishing strategy, the Angular 20 full-idiom-adoption upgrade, the idle-callback guard, the corrected marquee behavior contract, and the core/adapter library architecture.

# Lessons

- [Lessons](lessons/index.md) - Pitfalls and non-obvious findings from past work, grouped by the area they affect.

# History

- [Update Log](log.md) - Chronological history of changes to this bundle, newest first.

# Related knowledge outside this bundle

- [AGENTS.md](../AGENTS.md) - Operational entry point: commands, directory map, hard conventions. Authoritative for how to work in the repo.
- [OpenSpec specs](../openspec/specs/) - Behavioral requirements: what the software must do.
- [OpenSpec change archive](../openspec/changes/archive/) - Immutable per-change history (proposal, design, tasks). Deep source material; decision concepts here link into it.
