# src/app — Application Module

Angular application module root.

## Navigation

| Node | Path |
|------|------|
| Application Source Root | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../knowledge/conventions.md) — they are the mandatory single source of truth.

- **12.x branch**: minimal, scoped to the e2e behavior-contract surface only (not the `20.x` line's showcase homepage — see [`src/AGENTS.md`](../AGENTS.md)). Structure: [`app.module.ts`](app.module.ts) (root `NgModule`, declares `AppComponent` + `HomeComponent`, imports `NgxFastMarqueeModule`), [`app.component.ts`](app.component.ts) (shell, renders `<app-home>`), [`home/home.component.ts`](home/home.component.ts) (idle-deferred marquee).
- All components are **decorator/`NgModule`-based**, not standalone (Angular 12 has no standalone components). Use the [`angular-developer`](../../.agents/skills/angular-developer/SKILL.md) skill for general Angular guidance, but note it targets modern Angular idioms not applicable here — write plain `@Component`/`@NgModule`/`@Input`/`@Output` instead.
- No routing on this branch — a single page per app composition (default vs. `playground`, swapped via `fileReplacements`; see [`e2e/AGENTS.md`](../../e2e/AGENTS.md)), so `RouterModule` isn't needed.
- [`home/home.component.ts`](home/home.component.ts) renders `<ngx-fast-marquee>` only after a `requestIdleCallback` fires, mirroring the `20.x` line's `@defer (on idle)` usage (Angular 12 has no `@defer`) — it reproduces the same scheduling shape as Angular's own `IdleScheduler` (cancel any prior handle, then request a new one) so `angular/angular#53721`'s crash surfaces identically without `provideFastMarquee()`/`NgxFastMarqueeModule`. [`app.module.ts`](app.module.ts) must keep importing `NgxFastMarqueeModule` (which always bundles the guard on this line, see [`projects/ngx-fast-marquee/src/adapter/AGENTS.md`](../../projects/ngx-fast-marquee/src/adapter/AGENTS.md)) or this crashes on some Safari/iOS builds. Its idle-callback body wraps state changes in `NgZone.run(...)` — zone.js doesn't reliably patch `requestIdleCallback`, so without it the callback fires but the DOM never reflects `showMarquee` (see [`adapter/AGENTS.md`](../../projects/ngx-fast-marquee/src/adapter/AGENTS.md)'s zone.js note).
- The app is **zone-based** (`zone.js` polyfill in [`src/polyfills.ts`](../polyfills.ts); no zoneless config on this branch — that convention is `20.x`-branch-scoped).
- Follow convention **#14** in [`knowledge/conventions.md`](../../knowledge/conventions.md) for production-first testing — the `playground`/idle-defer test surface lives here in `src/app/` and `e2e/fixtures/`, not as hooks added for tests.
