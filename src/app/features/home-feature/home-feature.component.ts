import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarqueeWordsComponent } from 'src/app/shared/components/marquee-words/marquee-words.component';
import { RepoAdvertisingComponent } from 'src/app/shared/components/repo-advertising/repo-advertising.component';
import { MarqueeBrandImagesComponent } from 'src/app/shared/components/marquee-brand-images/marquee-brand-images.component';
import { MarqueeCardsComponent } from 'src/app/shared/components/marquee-cards/marquee-cards.component';
import { MarqueeEmojisComponent } from 'src/app/shared/components/marquee-emojis/marquee-emojis.component';
import { MarqueeLineRotationComponent } from 'src/app/shared/components/marquee-line-rotation/marquee-line-rotation.component';
import { MarqueeVariableSpeedComponent } from 'src/app/shared/components/marquee-variable-speed/marquee-variable-speed.component';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

@Component({
  selector: 'app-home-feature',
  standalone: true,
  imports: [
    CommonModule,
    MarqueeWordsComponent,
    MarqueeBrandImagesComponent,
    RepoAdvertisingComponent,
    MarqueeCardsComponent,
    MarqueeEmojisComponent,
    MarqueeLineRotationComponent,
    MarqueeVariableSpeedComponent,
    NgxFastMarqueeModule,
  ],
  templateUrl: './home-feature.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .overflow-decoration {
      position: relative;
    }

    .overflow-decoration::before {
      position: absolute;
      content: '';
      top: -50%;
      left: 0;
      width: 100%;
      height: 100%;
      background: green;
      animation: marquee-decoration 10s linear infinite;
      z-index: 1;
    }

    .--vertical::before {
      top: 0;
      left: -50%;
    }
  `,
})
export class HomeFeatureComponent {
  play = signal(false);
  speed = signal(50);
  constructor() {
    setTimeout(() => {
      this.play.set(true);
    }, 2000);

    setTimeout(() => {
      this.speed.set(150);
    }, 6000);
  }
}
