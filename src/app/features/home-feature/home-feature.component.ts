import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';
import { MarqueeWordsComponent } from 'src/app/shared/components/marquee-words/marquee-words.component';
import { RepoAdvertisingComponent } from 'src/app/shared/components/repo-advertising/repo-advertising.component';
import { MarqueeBrandImagesComponent } from 'src/app/shared/components/marquee-brand-images/marquee-brand-images.component';
import { MarqueeCardsComponent } from 'src/app/shared/components/marquee-cards/marquee-cards.component';
import { MarqueeEmojisComponent } from 'src/app/shared/components/marquee-emojis/marquee-emojis.component';
import { MarqueeVariableSpeedComponent } from 'src/app/shared/components/marquee-variable-speed/marquee-variable-speed.component';

@Component({
  selector: 'app-home-feature',
  imports: [
    CommonModule,
    NgxFastMarqueeModule,
    MarqueeWordsComponent,
    MarqueeBrandImagesComponent,
    RepoAdvertisingComponent,
    MarqueeCardsComponent,
    MarqueeEmojisComponent,
    MarqueeVariableSpeedComponent,
  ],
  templateUrl: './home-feature.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFeatureComponent {
  readonly deferredWords = [
    '@defer (on idle) 🦥',
    'Safari friendly 🧭',
    'ngx-fast-marquee ⚡',
    'idle-callback safe 🦺',
  ];
}
