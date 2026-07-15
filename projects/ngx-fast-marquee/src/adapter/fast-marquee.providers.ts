import { APP_INITIALIZER, Provider } from '@angular/core';
import { ensureIdleCallbackFallback } from '../core';

/**
 * Registers the idle-callback compatibility guard as an `APP_INITIALIZER`, so it runs during
 * application bootstrap — before the first change detection pass, and therefore before any
 * consumer-driven idle-deferred rendering can hit `angular/angular#53721`'s asymmetry.
 *
 * `NgModule` consumers get this automatically through `NgxFastMarqueeModule`'s own `providers`;
 * consumers who declare `NgxFastMarqueeComponent` directly (bypassing the module) must add this
 * to their root module's `providers` themselves.
 */
export function provideFastMarquee(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useValue: ensureIdleCallbackFallback,
      multi: true,
    },
  ];
}
