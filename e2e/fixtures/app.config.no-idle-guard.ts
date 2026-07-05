import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from '../../src/app/app.routes';

/**
 * fileReplacements stand-in for `src/app/app.config.ts`, used exclusively by the
 * `no-idle-guard` scenario (`ng run app-fast-marquee:e2e:no-idle-guard`). It mirrors
 * the real config but omits `provideFastMarquee()`, so the upstream
 * angular/angular#53721 `cancelIdleCallback` crash can be reproduced by the e2e
 * suite. Keep its exports in sync with `src/app/app.config.ts`.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(routes), provideClientHydration()],
};
