import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';
import { EMOJIS } from '@core';

@Component({
  selector: 'app-marquee-emojis',
  standalone: true,
  imports: [CommonModule, NgxFastMarqueeModule],
  templateUrl: './marquee-emojis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeEmojisComponent {
  emojis: WritableSignal<string[]> = signal(EMOJIS);
}
