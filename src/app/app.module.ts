import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
