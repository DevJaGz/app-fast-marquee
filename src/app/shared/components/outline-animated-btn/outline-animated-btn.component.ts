import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutlineAnimatedBtnDirective } from '../../directives/outline-animated-btn.directive';

@Component({
  selector: 'app-outline-animated-btn',
  imports: [CommonModule, OutlineAnimatedBtnDirective],
  templateUrl: './outline-animated-btn.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineAnimatedBtnComponent {
  readonly href = input('#');

  readonly target = input('_blank');
}
