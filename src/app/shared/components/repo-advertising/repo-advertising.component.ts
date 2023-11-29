import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutlineAnimatedBtnComponent } from '../outline-animated-btn/outline-animated-btn.component';

@Component({
  selector: 'app-repo-advertising',
  standalone: true,
  imports: [CommonModule, OutlineAnimatedBtnComponent],
  templateUrl: './repo-advertising.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepoAdvertisingComponent {}
