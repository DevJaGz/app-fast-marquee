import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarqueeWordsComponent } from 'src/app/shared/components/marquee-words/marquee-words.component';

@Component({
  selector: 'app-home-feature',
  standalone: true,
  imports: [CommonModule, MarqueeWordsComponent],
  templateUrl: './home-feature.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFeatureComponent {}
