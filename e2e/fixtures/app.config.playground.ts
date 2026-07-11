import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFastMarquee } from '@ngx-fast-marquee';

import { PlaygroundComponent } from './playground/playground.component';

/**
 * fileReplacements stand-in for `src/app/app.config.ts`, used exclusively by the `playground`
 * scenario (`ng run app-fast-marquee:e2e:playground`). Routes every path to `PlaygroundComponent`,
 * a fixture that renders one `<ngx-fast-marquee>` bound from URL query params over fixed content —
 * see `e2e/AGENTS.md`. Omits `provideClientHydration()` on purpose: the query-param-driven content
 * differs from the query-param-less server render, so hydrating would fight a mismatch on every
 * load; without it the client performs a plain (non-hydrated) bootstrap instead. Keep the zoneless
 * + `provideFastMarquee()` providers in step with `src/app/app.config.ts`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter([{ path: '', component: PlaygroundComponent }]),
    provideFastMarquee(),
  ],
};
