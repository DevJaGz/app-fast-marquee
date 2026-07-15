/**
 * fileReplacements stand-in for `src/app/app.module.ts`, used exclusively by the `playground`
 * scenario (`ng run app-fast-marquee:e2e:playground`). Bootstraps `PlaygroundComponent`
 * directly as the root component (selector `app-root`, matching `src/index.html`).
 */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

import { PlaygroundComponent } from './playground/playground.component';

@NgModule({
  declarations: [PlaygroundComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  bootstrap: [PlaygroundComponent],
})
export class AppModule {}
