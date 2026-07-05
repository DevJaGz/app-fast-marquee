import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFastMarquee } from '@ngx-fast-marquee';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideRouter(routes), provideClientHydration(), provideFastMarquee()],
};
