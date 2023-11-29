import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-message.component.html',
})
export class WelcomeMessageComponent {}
