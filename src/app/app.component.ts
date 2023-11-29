import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomeMessageComponent } from './core/components/welcome-message/welcome-message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WelcomeMessageComponent],
  template: ` <div class="h-screen bg-zinc-900 text-slate-200">
    @defer (on timer(1000ms); prefetch on idle) {
      <router-outlet></router-outlet>
      Hi this is a test
    } @placeholder {
      <div class="h-full grid place-items-center">
        <app-welcome-message />
      </div>
    }
  </div>`,
})
export class AppComponent {}
