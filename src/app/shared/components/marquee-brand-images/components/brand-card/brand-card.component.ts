import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandCardComponent {
  @Input()
  brandImage = '';

  @Input()
  brandName = '';
}
