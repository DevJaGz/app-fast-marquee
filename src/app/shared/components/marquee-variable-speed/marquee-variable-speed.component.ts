import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgxFastMarqueeModule } from '@ngx-fast-marquee';

@Component({
  selector: 'app-marquee-variable-speed',
  standalone: true,
  imports: [CommonModule, NgxFastMarqueeModule],
  templateUrl: './marquee-variable-speed.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarqueeVariableSpeedComponent implements AfterViewInit {
  speedIndex: WritableSignal<number> = signal(0);
  speed = computed(() => this._SPEEDS[this.speedIndex()]);

  private readonly _ngZone = inject(NgZone);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this._initializeInterval();
  }
  private _SPEEDS: number[] = [450, 250, 150, 100, 150, 250];

  private _initializeInterval(): void {
    this._ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this._updateMarqueeSpeed();
        this._changeDetectorRef.detectChanges();
      }, 8_000);
    });
  }

  private _updateMarqueeSpeed(): void {
    this.speedIndex.update((index) => {
      if (index === this._SPEEDS.length - 1) {
        return 0;
      }
      return index + 1;
    });
  }
}
