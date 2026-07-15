import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxFastMarqueeComponent } from './ngx-fast-marquee.component';
import { provideFastMarquee } from './fast-marquee.providers';

/**
 * `NgModule`-based integration point for this line's decorator/component-model consumers
 * (design D3): declares and exports `NgxFastMarqueeComponent` and registers the idle-callback
 * guard at application initialization automatically. Consumers who need the component without the
 * bundled guard (e.g. to reproduce `angular/angular#53721`) declare `NgxFastMarqueeComponent`
 * directly in their own module instead of importing this one.
 */
@NgModule({
  declarations: [NgxFastMarqueeComponent],
  imports: [CommonModule],
  exports: [NgxFastMarqueeComponent],
  providers: [provideFastMarquee()],
})
export class NgxFastMarqueeModule {}
