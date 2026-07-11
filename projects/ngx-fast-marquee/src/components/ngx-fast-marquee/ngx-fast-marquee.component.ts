import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  NgZone,
  HostListener,
  AfterContentChecked,
  inject,
  input,
  output,
  viewChild,
  effect,
  untracked,
} from '@angular/core';
import { Direction, Speed } from '../../types';
import { MarqueeService } from '../../services/marquee.service';
import { MarqueeModel } from '../../models/marquee.model';
import { MarqueeDuplicationService } from '../../services/marquee-duplication.service';
import { ReducedMotionService } from '../../services/reduced-motion.service';
import { ensureIdleCallbackFallback } from '../../utils/idle-callback-compat.util';

@Component({
  selector: 'ngx-fast-marquee',
  templateUrl: './ngx-fast-marquee.component.html',
  styleUrls: ['./ngx-fast-marquee.component.scss'],
  providers: [MarqueeService, MarqueeDuplicationService],
  host: {
    // Pure-CSS `@media (prefers-reduced-motion: reduce)` fallback (see the component stylesheet):
    // a template-level host binding renders in the initial (including SSR) markup, unlike the
    // renderer-driven attributes the service sets later in the update cycle.
    '[attr.data-use-system-reduced-motion]': 'useSystemReducedMotion()',
  },
  // eslint-disable-next-line @angular-eslint/prefer-standalone -- declared in NgxFastMarqueeModule for NgModule-based consumers
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFastMarqueeComponent implements AfterContentInit, AfterContentChecked, MarqueeModel {
  private readonly _hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly renderer = inject(Renderer2);
  private readonly _marqueeService = inject(MarqueeService);
  private readonly _reducedMotionService = inject(ReducedMotionService);
  private readonly _ngZone = inject(NgZone);

  /**
   * Reference to the marquee inner element.
   */
  readonly marqueeInnerRef = viewChild.required<ElementRef<HTMLElement>>('marqueeInner');

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

  /**
   * HTML Marquee Element.
   */
  get marqueeElement(): HTMLElement {
    return this._hostRef.nativeElement;
  }

  /**
   * HTML Marquee Inner Element.
   */
  get marqueeInnerElement(): HTMLElement {
    return this.marqueeInnerRef().nativeElement;
  }

  /**
   * Number of children inside the marquee inner element.
   */
  get numberOfMarqueeItems(): number {
    return this.marqueeInnerElement.children.length;
  }

  /**
   * Children inside the marquee inner element.
   */
  get marqueeItems(): HTMLCollection {
    return this.marqueeInnerElement.children;
  }

  constructor() {
    // Defensive guard for non-`@defer` instantiation paths only; `@defer (on idle)` crashes
    // before this constructor can run, so that case requires `provideFastMarquee()` at bootstrap.
    ensureIdleCallbackFallback();
    this._bridgePostInitInputChanges();
  }

  /**
   * Bridge the signal inputs to the existing renderer-driven update path for changes applied
   * after initialization. Each `effect` skips its own first (subscription) run so only genuine
   * post-init changes reach the marquee service; direct DOM writes stay `OnPush`/zoneless-safe.
   * "Layout-affecting" changes (direction, autoFill/useSystemReducedMotion, a numeric speed
   * value, and a live system reduced-motion toggle while opted in) go through `_updateMarqueee`
   * so `updated` emits once per change; purely-visual changes (play, mask*, pauseOnHover,
   * pauseOnClick, a qualitative speed) update the DOM directly without emitting.
   */
  private _bridgePostInitInputChanges(): void {
    let isFirstDirectionRun = true;
    effect(() => {
      this.direction();
      if (isFirstDirectionRun) {
        isFirstDirectionRun = false;
        return;
      }
      this._updateMarqueee();
    });

    let isFirstSpeedRun = true;
    effect(() => {
      const speedValue = this.speed();
      if (isFirstSpeedRun) {
        isFirstSpeedRun = false;
        return;
      }
      if (typeof speedValue === 'number') {
        this._updateMarqueee();
      } else {
        this._marqueeService.updateSpeed();
      }
    });

    let isFirstPlayRun = true;
    effect(() => {
      this.play();
      if (isFirstPlayRun) {
        isFirstPlayRun = false;
        return;
      }
      this._marqueeService.updatePlayState();
    });

    let isFirstMaskRun = true;
    effect(() => {
      this.maskPercentage();
      this.maskStartPercentage();
      this.maskEndPercentage();
      if (isFirstMaskRun) {
        isFirstMaskRun = false;
        return;
      }
      this._marqueeService.updateMask();
    });

    let isFirstFillRun = true;
    effect(() => {
      this.autoFill();
      this.useSystemReducedMotion();
      if (isFirstFillRun) {
        isFirstFillRun = false;
        return;
      }
      this._updateMarqueee();
    });

    let isFirstPauseOnHoverRun = true;
    effect(() => {
      this.pauseOnHover();
      if (isFirstPauseOnHoverRun) {
        isFirstPauseOnHoverRun = false;
        return;
      }
      this._marqueeService.updatePauseOnHover();
    });

    let isFirstPauseOnClickRun = true;
    effect(() => {
      this.pauseOnClick();
      if (isFirstPauseOnClickRun) {
        isFirstPauseOnClickRun = false;
        return;
      }
      this._marqueeService.updatePauseOnClick();
    });

    let isFirstReducedMotionRun = true;
    effect(() => {
      this._reducedMotionService.hasSystemReducedMotion();
      if (isFirstReducedMotionRun) {
        isFirstReducedMotionRun = false;
        return;
      }
      if (!untracked(this.useSystemReducedMotion)) return;
      this._updateMarqueee();
    });
  }

  ngAfterContentInit(): void {
    this._marqueeService.setMarqueeComponent(this);
    this.mounted.emit();
  }

  ngAfterContentChecked(): void {
    if (this._marqueeService.isMarqueeDirty()) {
      this._startMarqueeUpdeting();
    }
  }

  /**
   * Timeout to prevent the update of the marquee when the window is being resized.
   */
  private _preventUpdateOnResizingTimeout!: ReturnType<typeof setTimeout>;

  /**
   * Flag to check if the window is being resized. True if the window is being resized, false otherwise.
   */
  private _isOnResizing = false;

  /**
   * Update the marquee when the window is resized.
   */
  @HostListener('window:resize')
  private _onResize(): void {
    this._isOnResizing = true;
    this._ngZone.runOutsideAngular(() => {
      if (this._preventUpdateOnResizingTimeout) {
        clearTimeout(this._preventUpdateOnResizingTimeout);
      }
      this._preventUpdateOnResizingTimeout = setTimeout(() => {
        this._isOnResizing = false;
        this._startMarqueeUpdeting();
      }, 50);
    });
  }

  /**
   * Start the update of the marquee.
   */
  private _startMarqueeUpdeting(): void {
    if (this._isOnResizing) return;
    // TODO: Check why is needed to use a timeout here. Otherwise, the marquee is not updated at the first time.
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this._updateMarqueee();
      }, 0);
    });
  }

  private _updateMarqueee(): void {
    this._marqueeService.update();
    this.updated.emit();
  }
}
