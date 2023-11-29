import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutlineAnimatedBtnDirective } from '../../directives/outline-animated-btn.directive';

@Component({
  selector: 'app-outline-animated-btn',
  standalone: true,
  imports: [CommonModule, OutlineAnimatedBtnDirective],
  templateUrl: './outline-animated-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineAnimatedBtnComponent {
  @Input()
  href = '#';

  @Input()
  target = '_blank';
}
