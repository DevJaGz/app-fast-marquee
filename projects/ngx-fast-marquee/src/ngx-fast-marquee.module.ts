import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeComponent } from './components/ngx-fast-marquee/ngx-fast-marquee.component';
import { provideFastMarquee } from './providers/fast-marquee.providers';

@NgModule({
  declarations: [NgxFastMarqueeComponent],
  imports: [CommonModule],
  exports: [NgxFastMarqueeComponent],
  providers: [provideFastMarquee()],
})
export class NgxFastMarqueeModule {}
