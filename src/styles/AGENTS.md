# src/styles — Global SCSS Partials

Global SCSS partials shared across the application.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../AGENTS.md) |
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../AGENTS.md) — it is the mandatory single source of truth.

- This directory contains global SCSS partials: [`animations.scss`](animations.scss), [`buttons.scss`](buttons.scss), [`fonts.scss`](fonts.scss), [`loader.scss`](loader.scss), [`marquees.scss`](marquees.scss).
- These partials are available without path prefix anywhere in the app (`includePaths` in [`angular.json`](../../angular.json)).
- Global styles entry point is [`src/styles.scss`](../styles.scss). Import new partials there.
- Component-level styles should be inline (see [`src/AGENTS.md`](../AGENTS.md)); only truly global/shared rules belong here.
