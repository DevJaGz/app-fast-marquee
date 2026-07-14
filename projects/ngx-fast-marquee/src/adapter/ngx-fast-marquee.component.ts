import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  Direction,
  MarqueeEngine,
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
  standalone: true,
  templateUrl: './ngx-fast-marquee.component.html',
  styleUrl: './ngx-fast-marquee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-direction]': 'direction()',
    '[attr.data-animated]': 'animated()',
    '[attr.data-auto-fill]': 'autoFill()',
    '[attr.data-use-system-reduced-motion]': 'useSystemReducedMotion()',
    '[attr.data-masked]': 'maskEnabled()',
    '[style.--_mask-start-percentage]': 'maskStartCss()',
    '[style.--_mask-end-percentage]': 'maskEndCss()',
  },
})
export class NgxFastMarqueeComponent {
  private readonly _hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _platformId = inject(PLATFORM_ID);

  private readonly _marqueeInnerRef = viewChild.required<ElementRef<HTMLElement>>('marqueeInner');

  /**
   * Direction of the marquee.
   * @default 'left'
   */
  readonly direction = input<Direction>('left');

  /**
   * Speed of the marquee.
   * Can be qualitative as 'slow', 'medium' or 'fast' or quantitative as a number in pixels per second.
   * The quantitative speed is calculated based on the number of the marquee items.
   * @default 'medium'
   */
  readonly speed = input<Speed>('medium');

  /**
   * Whether to have into account the system reduced motion.
   * If true, the marquee will not be animated when the system has reduced motion.
   * @default false
   */
  readonly useSystemReducedMotion = input(false);

  /**
   * Whether to fill the marquee with duplicated items.
   * If true, the marquee will be filled with duplicated items.
   * @default true
   */
  readonly autoFill = input(true);

  /**
   * Start percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the left side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the top side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  readonly maskStartPercentage = input(0);

  /**
   * End percentage of the mask.
   * Suitable Range: 0 - 100, where:
   * If direction is horizontal (left or right):
   *  - 0 is the right side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the bottom side of the marquee and 100 is the center of the marquee.
   * @default 0
   */
  readonly maskEndPercentage = input(0);

  /**
   * Percentage of the mask.
   * Suitable Range: 0 - 100, where 0 is no mask and 100 is full mask from
   * start to center and end to the center.
   * @default 0
   */
  readonly maskPercentage = input(0);

  /**
   * Whether to play the marquee.
   * True to play the marquee animation, false to pause the marquee animation.
   * @default true
   */
  readonly play = input(true);

  /**
   * Whether to pause the marquee when the mouse is over the marquee.
   * @default false
   */
  readonly pauseOnHover = input(false);

  /**
   * Whether to pause the marquee when the mouse is clicked over the marquee.
   */
  readonly pauseOnClick = input(false);

  /**
   * Event emitted when the marquee is mounted in the view.
   * Emitted once.
   */
  readonly mounted = output<void>();

  /**
   * Event emitted when the marquee is mounted updated.
   * Emitted each time the marquee is updated.
   */
  readonly updated = output<void>();

  /** Live system reduced-motion preference, fed by the core matchMedia source once the engine boots. */
  private readonly _prefersReducedMotion = signal(false);

  /** Track size along the scroll axis, set by the engine after each committed cycle (design D3). */
  private readonly _measuredSize = signal(0);

  private _engine: MarqueeEngine | null = null;

  protected readonly animated = computed(() =>
    resolveAnimated(this.useSystemReducedMotion(), this._prefersReducedMotion())
  );
  protected readonly qualitativeSpeed = computed(() => resolveQualitativeSpeed(this.speed()));
  protected readonly animationDurationCss = computed(() => {
    const seconds = resolveNumericDurationSeconds(this.speed(), this._measuredSize());
    return seconds === null ? null : `${seconds}s`;
  });
  protected readonly animationPlayState = computed(() => resolvePlayState(this.play(), this.speed()));
  private readonly _resolvedMask = computed(() =>
    resolveMask(this.maskPercentage(), this.maskStartPercentage(), this.maskEndPercentage())
  );
  protected readonly maskStartCss = computed(() => `${this._resolvedMask().startPercentage}%`);
  protected readonly maskEndCss = computed(() => `${this._resolvedMask().endPercentage}%`);
  protected readonly maskEnabled = computed(() => isMaskEnabled(this._resolvedMask()));

  constructor() {
    // Defensive guard for non-`@defer` instantiation paths only; `@defer (on idle)` crashes
    // before this constructor can run, so that case requires `provideFastMarquee()` at bootstrap.
    // Documented A5 exemption: touches only globals (never the DOM), idempotent, no-op on the server.
    ensureIdleCallbackFallback();

    // The single sanctioned bridge effect (design D-effect): duplication-affecting inputs mark the
    // engine dirty. It sets no signal and reads no DOM — the engine measures after render commits.
    effect(() => {
      this.autoFill();
      this.direction();
      this.animated();
      this._engine?.requestReplan();
    });

    afterNextRender(() => {
      if (!isPlatformBrowser(this._platformId)) return;
      this._bootEngine();
      this.mounted.emit();
    });
  }

  private _bootEngine(): void {
    const reducedMotionSource = createReducedMotionSource(matches => this._prefersReducedMotion.set(matches));
    this._prefersReducedMotion.set(reducedMotionSource.matches());
    const engine = new MarqueeEngine({
      host: this._hostRef.nativeElement,
      inner: this._marqueeInnerRef().nativeElement,
      getConfig: () => ({ direction: this.direction(), autoFill: this.autoFill(), animated: this.animated() }),
      onMeasured: sizeInPx => this._measuredSize.set(sizeInPx),
      onUpdated: () => this.updated.emit(),
    });
    this._engine = engine;

    this._destroyRef.onDestroy(() => {
      engine.destroy();
      reducedMotionSource.dispose();
    });
    engine.start();
  }
}
