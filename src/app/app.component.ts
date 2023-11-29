import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WelcomePlaceholderComponent } from './core/components/welcome-placeholder/welcome-placeholder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WelcomePlaceholderComponent],
  template: `<div class="h-screen bg-zinc-900 text-slate-200">
    @defer (on timer(2000ms)) {
      <router-outlet></router-outlet>
    } @placeholder {
      <app-welcome-placeholder />
    }
  </div>`,
})
export class AppComponent {}
