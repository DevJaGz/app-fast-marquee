# src/assets — Static Assets

Static assets served with the application.

## Navigation

| Node | Path |
|------|------|
| Source of truth | [`AGENTS.md`](../../AGENTS.md) |
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow [`AGENTS.md`](../../AGENTS.md) — it is the mandatory single source of truth.

- All static assets (fonts, images, icons) live here and are referenced via the `assets` array in [`angular.json`](../../angular.json).
- Fonts are under `src/assets/fonts/` and loaded via SCSS in [`src/styles/fonts.scss`](../styles/fonts.scss).
- Do not add binaries or generated files here without updating [`angular.json`](../../angular.json) assets config.
