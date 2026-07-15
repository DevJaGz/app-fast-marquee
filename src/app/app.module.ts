import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [BrowserModule, NgxFastMarqueeModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
