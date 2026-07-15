import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Direction,
  MarqueeEngine,
  QualitativeSpeed,
  ReducedMotionSource,
  Speed,
  createReducedMotionSource,
  ensureIdleCallbackFallback,
  isMaskEnabled,
  resolveAnimated,
  resolveMask,
  resolveNumericDurationSeconds,
  resolvePlayState,
  resolveQualitativeSpeed,
} from '../core';

@Component({
  selector: 'ngx-fast-marquee',
  templateUrl: './ngx-fast-marquee.component.html',
  styleUrls: ['./ngx-fast-marquee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFastMarqueeComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('marqueeInner', { static: true })
  private readonly _marqueeInnerRef!: ElementRef<HTMLElement>;

  /**
   * Direction of the marquee.
   * @default 'left'
   */
  @Input() direction: Direction = 'left';

  /**
   * Speed of the marquee.
   * Can be qualitative as 'slow', 'medium' or 'fast' or quantitative as a number in pixels per second.
   * The quantitative speed is calculated based on the number of the marquee items.
   * @default 'medium'
   */
  @Input() speed: Speed = 'medium';

  /**
   * Whether to have into account the system reduced motion.
   * If true, the marquee will not be animated when the system has reduced motion.
   * @default false
   */
  @Input() useSystemReducedMotion = false;

  /**
   * Whether to fill the marquee with duplicated items.
   * If true, the marquee will be filled with duplicated items.
   * @default true
   */
  @Input() autoFill = true;

  /**
   * Start percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the left side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the top side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  @Input() maskStartPercentage = 0;

  /**
   * End percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the right side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the bottom side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  @Input() maskEndPercentage = 0;

  /**
   * Percentage of the mask.
   * Suitable Range: 0 - 100, where 0 is no mask and 100 is full mask from
   * start to center and end to the center.
   * @default 0
   */
  @Input() maskPercentage = 0;

  /**
   * Whether to play the marquee.
   * True to play the marquee animation, false to pause the marquee animation.
   * @default true
   */
  @Input() play = true;

  /**
   * Whether to pause the marquee when the mouse is over the marquee.
   * @default false
   */
  @Input() pauseOnHover = false;

  /**
   * Whether to pause the marquee when the mouse is clicked over the marquee.
   */
  @Input() pauseOnClick = false;

  /**
   * Event emitted when the marquee is mounted in the view.
   * Emitted once.
   */
  @Output() readonly mounted = new EventEmitter<void>();

  /**
   * Event emitted when the marquee is mounted updated.
   * Emitted each time the marquee is updated.
   */
  @Output() readonly updated = new EventEmitter<void>();

  /** Live system reduced-motion preference, fed by the core matchMedia source once the engine boots. */
  private _prefersReducedMotion = false;

  /** Track size along the scroll axis, set by the engine after each committed cycle (design D3). */
  private _measuredSize = 0;

  private _engine: MarqueeEngine | null = null;
  private _reducedMotionSource: ReducedMotionSource | null = null;

  constructor(
    private readonly _hostRef: ElementRef<HTMLElement>,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _ngZone: NgZone,
    // eslint-disable-next-line @typescript-eslint/ban-types -- PLATFORM_ID's declared Angular type is exactly `Object`
    @Inject(PLATFORM_ID) private readonly _platformId: Object
  ) {
    // Defensive guard for non-eager instantiation paths only; consumers rendering this component
    // behind their own idle-deferred trigger require `provideFastMarquee()`/`NgxFastMarqueeModule`
    // registered at bootstrap — see `fast-marquee.providers.ts`.
    ensureIdleCallbackFallback();
  }

  @HostBinding('attr.data-direction') protected get _dataDirection(): Direction {
    return this.direction;
  }

  @HostBinding('attr.data-animated') protected get _dataAnimated(): boolean {
    return this.animated;
  }

  @HostBinding('attr.data-auto-fill') protected get _dataAutoFill(): boolean {
    return this.autoFill;
  }

  @HostBinding('attr.data-use-system-reduced-motion') protected get _dataUseSystemReducedMotion(): boolean {
    return this.useSystemReducedMotion;
  }

  @HostBinding('attr.data-masked') protected get _dataMasked(): boolean {
    return this.maskEnabled;
  }

  @HostBinding('style.--_mask-start-percentage') protected get _maskStartCssProperty(): string {
    return this.maskStartCss;
  }

  @HostBinding('style.--_mask-end-percentage') protected get _maskEndCssProperty(): string {
    return this.maskEndCss;
  }

  get animated(): boolean {
    return resolveAnimated(this.useSystemReducedMotion, this._prefersReducedMotion);
  }

  get qualitativeSpeed(): QualitativeSpeed | null {
    return resolveQualitativeSpeed(this.speed);
  }

  get animationDurationCss(): string | null {
    const seconds = resolveNumericDurationSeconds(this.speed, this._measuredSize);
    return seconds === null ? null : `${seconds}s`;
  }

  get animationPlayState(): 'running' | 'paused' {
    return resolvePlayState(this.play, this.speed);
  }

  private get _resolvedMask() {
    return resolveMask(this.maskPercentage, this.maskStartPercentage, this.maskEndPercentage);
  }

  get maskStartCss(): string {
    return `${this._resolvedMask.startPercentage}%`;
  }

  get maskEndCss(): string {
    return `${this._resolvedMask.endPercentage}%`;
  }

  get maskEnabled(): boolean {
    return isMaskEnabled(this._resolvedMask);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Mirrors the 20.x adapter's single bridge effect: only duplication-affecting inputs mark the
    // engine dirty. Masks/speed/play are read fresh by the getters above on every CD pass.
    if (changes['autoFill'] || changes['direction'] || changes['useSystemReducedMotion']) {
      this._engine?.requestReplan();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    this._bootEngine();
    this.mounted.emit();
  }

  ngOnDestroy(): void {
    this._engine?.destroy();
    this._reducedMotionSource?.dispose();
  }

  private _bootEngine(): void {
    // core/'s engine drives these callbacks from requestAnimationFrame/MutationObserver/
    // ResizeObserver — zone.js (0.11.4) doesn't reliably patch all of these, so a callback can run
    // outside the Angular zone: markForCheck() alone then marks the view dirty without anything
    // triggering the next tick to actually flush it. NgZone.run() guarantees a tick regardless of
    // which zone invoked the callback.
    const reducedMotionSource = createReducedMotionSource(matches => {
      this._ngZone.run(() => {
        this._prefersReducedMotion = matches;
        this._engine?.requestReplan();
        this._cdr.markForCheck();
      });
    });
    this._reducedMotionSource = reducedMotionSource;
    this._prefersReducedMotion = reducedMotionSource.matches();

    const engine = new MarqueeEngine({
      host: this._hostRef.nativeElement,
      inner: this._marqueeInnerRef.nativeElement,
      getConfig: () => ({ direction: this.direction, autoFill: this.autoFill, animated: this.animated }),
      onMeasured: sizeInPx => {
        this._ngZone.run(() => {
          this._measuredSize = sizeInPx;
          this._cdr.markForCheck();
        });
      },
      onUpdated: () => {
        this._ngZone.run(() => {
          this.updated.emit();
          this._cdr.markForCheck();
        });
      },
    });
    this._engine = engine;
    engine.start();
  }
}
