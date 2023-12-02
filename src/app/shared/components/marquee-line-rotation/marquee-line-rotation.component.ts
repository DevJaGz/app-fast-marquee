import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marquee-line-rotation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marquee-line-rotation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeLineRotationComponent {}
