import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';
import { ProfileCardComponent } from '../profile-card/profile-card.component';

@Component({
  selector: 'app-marquee-cards',
  standalone: true,
  imports: [CommonModule, NgxFastMarqueeModule, ProfileCardComponent],
  templateUrl: './marquee-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeCardsComponent {}
