import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

@Component({
  selector: 'app-marquee-line-rotation',
  standalone: true,
  imports: [CommonModule, NgxFastMarqueeModule],
  templateUrl: './marquee-line-rotation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeLineRotationComponent {}
