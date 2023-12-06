import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxFastMarqueeModule } from 'projects/ngx-fast-marquee/src/ngx-fast-marquee.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
