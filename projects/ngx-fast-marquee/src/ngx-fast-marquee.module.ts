import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeComponent } from './components/ngx-fast-marquee/ngx-fast-marquee.component';
import { FastMarqueeComponent } from '@ngx-fast-marquee';

@NgModule({
  declarations: [NgxFastMarqueeComponent],
  imports: [CommonModule, FastMarqueeComponent],
  exports: [NgxFastMarqueeComponent, FastMarqueeComponent],
})
export class NgxFastMarqueeModule {}
