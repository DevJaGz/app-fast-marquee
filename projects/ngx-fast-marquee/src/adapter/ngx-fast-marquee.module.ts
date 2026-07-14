import { NgModule } from '@angular/core';
import { NgxFastMarqueeComponent } from './ngx-fast-marquee.component';
import { provideFastMarquee } from './fast-marquee.providers';

/**
 * Thin wrapper for `NgModule`-based consumers (design D4): imports and re-exports the standalone
 * `NgxFastMarqueeComponent` and registers the idle-callback guard at application initialization.
 * Standalone consumers import the component directly instead.
 */
@NgModule({
  imports: [NgxFastMarqueeComponent],
  exports: [NgxFastMarqueeComponent],
  providers: [provideFastMarquee()],
})
export class NgxFastMarqueeModule {}
