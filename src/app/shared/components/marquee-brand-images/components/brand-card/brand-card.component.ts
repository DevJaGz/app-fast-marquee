import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-card',
  imports: [CommonModule],
  templateUrl: './brand-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandCardComponent {
  readonly brandImage = input('');

  readonly brandName = input('');
}
