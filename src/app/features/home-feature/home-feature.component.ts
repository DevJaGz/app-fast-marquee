import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-feature',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-feature.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFeatureComponent {}
