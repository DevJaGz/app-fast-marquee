import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeMessageComponent } from '../welcome-message/welcome-message.component';

@Component({
  selector: 'app-welcome-placeholder',
  standalone: true,
  imports: [CommonModule, WelcomeMessageComponent],
  templateUrl: './welcome-placeholder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePlaceholderComponent {}
