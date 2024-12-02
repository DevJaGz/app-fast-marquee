import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<div class="h-screen bg-zinc-900 text-slate-200">
    <router-outlet></router-outlet>
  </div>`,
})
export class AppComponent {}
