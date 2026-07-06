# services — Library Services

Angular services for the `ngx-fast-marquee` library.

## Navigation

| Node | Path |
|------|------|
| Library Source | [`src/AGENTS.md`](../AGENTS.md) |

## Conventions

Before proceeding, read and follow the repository conventions in [`knowledge/conventions.md`](../../../../knowledge/conventions.md) — they are the mandatory single source of truth.

- Services: [`marquee.service.ts`](marquee.service.ts), [`marquee-duplication.service.ts`](marquee-duplication.service.ts), [`reduced-motion.service.ts`](reduced-motion.service.ts).
- Use `inject()` for dependency injection (no constructor injection).
- Use `providedIn: 'root'` unless the service must be scoped; document the reason if scoped.
- Avoid importing `@angular/forms` or other app-only modules.
