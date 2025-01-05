import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NgxFastMarqueeComponent,
  NgxFastMarqueeLegacyComponent,
} from '@ngx-fast-marquee';

@NgModule({
  declarations: [NgxFastMarqueeLegacyComponent],
  imports: [CommonModule, NgxFastMarqueeComponent],
  exports: [NgxFastMarqueeComponent, NgxFastMarqueeLegacyComponent],
})
export class NgxFastMarqueeModule {}
