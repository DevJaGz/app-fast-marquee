import { EnvironmentProviders, provideAppInitializer } from '@angular/core';
import { ensureIdleCallbackFallback } from '../core';

/**
 * Registers the idle-callback compatibility guard as an application initializer, so it runs during
 * application bootstrap — before the first change detection pass, and therefore before any
 * `@defer (on idle)` block can construct Angular's `IdleScheduler` (see `angular/angular#53721`).
 *
 * Standalone-component consumers must add this to their `bootstrapApplication()` providers when
 * rendering `<ngx-fast-marquee>` inside a `@defer` block. `NgModule` consumers get it automatically
 * through `NgxFastMarqueeModule`.
 */
export function provideFastMarquee(): EnvironmentProviders {
  return provideAppInitializer(ensureIdleCallbackFallback);
}
