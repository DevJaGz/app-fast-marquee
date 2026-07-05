import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-message',
  imports: [CommonModule],
  templateUrl: './welcome-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeMessageComponent {}
