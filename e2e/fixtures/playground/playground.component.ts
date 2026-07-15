import { Component } from '@angular/core';
import { Direction, Speed } from '@ngx-fast-marquee';

/**
 * The `playground` e2e scenario fixture: a single `<ngx-fast-marquee>` with every input bound
 * from URL query params over fixed, known content, plus `(mounted)`/`(updated)` DOM counters and
 * runtime controls for exercising post-init input changes. Lives outside `src/` so the demo app
 * and the library ship no test hooks — see `e2e/AGENTS.md`. Selector is `app-root` since this
 * component is bootstrapped directly by `app.module.playground.ts`, matching `src/index.html`.
 *
 * Query params (all optional, matching each input's own default): `direction`, `speed`,
 * `useSystemReducedMotion`, `autoFill`, `maskStartPercentage`, `maskEndPercentage`,
 * `maskPercentage`, `play`, `pauseOnHover`, `pauseOnClick`, plus fixture-only `itemCount`,
 * `itemWidth`, `itemHeight`, `containerWidth`, `containerHeight`.
 *
 * Deliberately `Default` change detection, not `OnPush`: `(mounted)`/`(updated)` fire from
 * `NgxFastMarqueeComponent`'s own lifecycle/async engine callbacks, and an `OnPush` *root*
 * fixture doesn't reliably re-render from those child-output-driven state changes in this
 * Angular 12 zone.js setup (confirmed empirically — the library's own behavior is unaffected:
 * `_engine` boots, measures, and emits correctly regardless). This is a test-fixture-only choice;
 * `NgxFastMarqueeComponent` itself stays `OnPush`.
 */
@Component({
  selector: 'app-root',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent {
  private readonly _params = new URLSearchParams(window.location.search);

  direction: Direction = this._readDirectionParam();
  speed: Speed = this._readSpeedParam();
  useSystemReducedMotion = this._readBoolParam('useSystemReducedMotion', false);
  autoFill = this._readBoolParam('autoFill', true);
  maskStartPercentage = this._readNumberParam('maskStartPercentage', 0);
  maskEndPercentage = this._readNumberParam('maskEndPercentage', 0);
  maskPercentage = this._readNumberParam('maskPercentage', 0);
  play = this._readBoolParam('play', true);
  pauseOnHover = this._readBoolParam('pauseOnHover', false);
  pauseOnClick = this._readBoolParam('pauseOnClick', false);

  containerWidth = this._readNumberParam('containerWidth', 400);
  containerHeight = this._readNumberParam('containerHeight', 200);
  itemWidth = this._readNumberParam('itemWidth', 120);
  itemHeight = this._readNumberParam('itemHeight', 60);
  items: number[] = Array.from({ length: this._readNumberParam('itemCount', 5) }, (_unused, index) => index);

  mountedCount = 0;
  updatedCount = 0;

  onMounted(): void {
    this.mountedCount++;
  }

  onUpdated(): void {
    this.updatedCount++;
  }

  setDirection(value: string): void {
    if (value === 'left' || value === 'right' || value === 'up' || value === 'down') {
      this.direction = value;
    }
  }

  setSpeed(value: string): void {
    const trimmed = value.trim();
    if (trimmed === 'slow' || trimmed === 'medium' || trimmed === 'fast') {
      this.speed = trimmed;
      return;
    }
    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      this.speed = numeric;
    }
  }

  setMaskPercentage(value: string): void {
    this.maskPercentage = this._parseNumberOrZero(value);
  }

  setMaskStartPercentage(value: string): void {
    this.maskStartPercentage = this._parseNumberOrZero(value);
  }

  setMaskEndPercentage(value: string): void {
    this.maskEndPercentage = this._parseNumberOrZero(value);
  }

  addItem(): void {
    this.items = [...this.items, this.items.length ? Math.max(...this.items) + 1 : 0];
  }

  removeItem(): void {
    this.items = this.items.slice(0, -1);
  }

  private _readDirectionParam(): Direction {
    const value = this._params.get('direction');
    return value === 'left' || value === 'right' || value === 'up' || value === 'down' ? value : 'left';
  }

  private _readSpeedParam(): Speed {
    const value = this._params.get('speed');
    if (value === 'slow' || value === 'medium' || value === 'fast') return value;
    if (value == null) return 'medium';
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 'medium' : numeric;
  }

  private _readBoolParam(name: string, fallback: boolean): boolean {
    const value = this._params.get(name);
    return value == null ? fallback : value === 'true';
  }

  private _readNumberParam(name: string, fallback: number): number {
    const value = this._params.get(name);
    if (value == null) return fallback;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? fallback : numeric;
  }

  private _parseNumberOrZero(value: string): number {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
}
