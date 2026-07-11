import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxFastMarqueeModule, Direction, Speed } from '@ngx-fast-marquee';

/**
 * The `playground` e2e scenario fixture: a single `<ngx-fast-marquee>` with every input bound
 * from URL query params over fixed, known content, plus `(mounted)`/`(updated)` DOM counters and
 * runtime controls for exercising post-init input changes. Lives outside `src/` so the demo app
 * and the library ship no test hooks — see `e2e/AGENTS.md`.
 *
 * Query params (all optional, matching each input's own default): `direction`, `speed`,
 * `useSystemReducedMotion`, `autoFill`, `maskStartPercentage`, `maskEndPercentage`,
 * `maskPercentage`, `play`, `pauseOnHover`, `pauseOnClick`, plus fixture-only `itemCount`,
 * `itemWidth`, `itemHeight`, `containerWidth`, `containerHeight`.
 */
@Component({
  selector: 'app-playground',
  imports: [NgxFastMarqueeModule],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundComponent {
  private readonly _queryParamMap = inject(ActivatedRoute).snapshot.queryParamMap;

  readonly direction: WritableSignal<Direction> = signal(this._readDirectionParam());
  readonly speed: WritableSignal<Speed> = signal(this._readSpeedParam());
  readonly useSystemReducedMotion = signal(this._readBoolParam('useSystemReducedMotion', false));
  readonly autoFill = signal(this._readBoolParam('autoFill', true));
  readonly maskStartPercentage = signal(this._readNumberParam('maskStartPercentage', 0));
  readonly maskEndPercentage = signal(this._readNumberParam('maskEndPercentage', 0));
  readonly maskPercentage = signal(this._readNumberParam('maskPercentage', 0));
  readonly play = signal(this._readBoolParam('play', true));
  readonly pauseOnHover = signal(this._readBoolParam('pauseOnHover', false));
  readonly pauseOnClick = signal(this._readBoolParam('pauseOnClick', false));

  readonly containerWidth = signal(this._readNumberParam('containerWidth', 400));
  readonly containerHeight = signal(this._readNumberParam('containerHeight', 200));
  readonly itemWidth = signal(this._readNumberParam('itemWidth', 120));
  readonly itemHeight = signal(this._readNumberParam('itemHeight', 60));
  readonly items: WritableSignal<number[]> = signal(
    Array.from({ length: this._readNumberParam('itemCount', 5) }, (_unused, index) => index)
  );

  readonly mountedCount = signal(0);
  readonly updatedCount = signal(0);

  onMounted(): void {
    this.mountedCount.update(count => count + 1);
  }

  onUpdated(): void {
    this.updatedCount.update(count => count + 1);
  }

  setDirection(value: string): void {
    if (value === 'left' || value === 'right' || value === 'up' || value === 'down') {
      this.direction.set(value);
    }
  }

  setSpeed(value: string): void {
    const trimmed = value.trim();
    if (trimmed === 'slow' || trimmed === 'medium' || trimmed === 'fast') {
      this.speed.set(trimmed);
      return;
    }
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      this.speed.set(numeric);
    }
  }

  setMaskPercentage(value: string): void {
    this.maskPercentage.set(this._parseNumberOrZero(value));
  }

  setMaskStartPercentage(value: string): void {
    this.maskStartPercentage.set(this._parseNumberOrZero(value));
  }

  setMaskEndPercentage(value: string): void {
    this.maskEndPercentage.set(this._parseNumberOrZero(value));
  }

  addItem(): void {
    this.items.update(current => [...current, current.length ? Math.max(...current) + 1 : 0]);
  }

  removeItem(): void {
    this.items.update(current => current.slice(0, -1));
  }

  private _readDirectionParam(): Direction {
    const value = this._queryParamMap.get('direction');
    return value === 'left' || value === 'right' || value === 'up' || value === 'down' ? value : 'left';
  }

  private _readSpeedParam(): Speed {
    const value = this._queryParamMap.get('speed');
    if (value === 'slow' || value === 'medium' || value === 'fast') return value;
    if (value == null) return 'medium';
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 'medium' : numeric;
  }

  private _readBoolParam(name: string, fallback: boolean): boolean {
    const value = this._queryParamMap.get(name);
    return value == null ? fallback : value === 'true';
  }

  private _readNumberParam(name: string, fallback: number): number {
    const value = this._queryParamMap.get(name);
    if (value == null) return fallback;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? fallback : numeric;
  }

  private _parseNumberOrZero(value: string): number {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
}
