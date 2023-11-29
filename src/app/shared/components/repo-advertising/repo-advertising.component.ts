import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-repo-advertising',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repo-advertising.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepoAdvertisingComponent {}
