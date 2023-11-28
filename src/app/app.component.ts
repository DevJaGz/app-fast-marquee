import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<div
    class="grid place-items-center h-screen bg-zinc-900 text-slate-200"
  >
    Hi!
  </div>`,
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    console.log('AppComponent initialized');
  }
}
