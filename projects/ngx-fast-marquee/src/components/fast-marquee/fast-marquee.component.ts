import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { Direction, Speed } from '../../types';
import { NgxFastMarqueeInnerComponent } from '../ngx-fast-marquee-inner/ngx-fast-marquee-inner.component';
import {
  NgxFastMarqueeHelper,
  ResizeObserverHelper,
  NgxFastMarqueeDuplicationHelper,
  NfxFastMarqueeSpeedHelper,
  NgxFastMarqueeLayoutHelper,
} from '../helpers';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fast-marquee',
  standalone: true,
  imports: [NgxFastMarqueeInnerComponent],
  templateUrl: './fast-marquee.component.html',
  styleUrl: './fast-marquee.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    NgxFastMarqueeHelper,
    NgxFastMarqueeDuplicationHelper,
    NgxFastMarqueeLayoutHelper,
    NfxFastMarqueeSpeedHelper,
  ],
  host: {
    '[class.ngx-fast-marquee]': 'true',
    '[attr.data-animate]': 'animate()',
    '[attr.data-direction]': 'direction()',
    '[attr.data-autofill]': 'autoFill()',
    '[attr.data-pause-on-hover]': 'pauseOnHover()',
    '[attr.data-pause-on-click]': 'pauseOnClick()',
    '[attr.data-use-mask]': 'useMask()',
    '[attr.data-mask-start-percentage]': 'maskStartPercentage()',
    '[attr.data-mask-end-percentage]': 'maskEndPercentage()',
    '[attr.data-mask-percentage]': 'maskPercentage()',
    '[attr.data-speed]': 'speed()',
    '[style.--nfm-gradient-start-size.px]':
      'gradientStartSize()? gradientStartSize(): gradientSize()',
    '[style.--nfm-gradient-end-size.px]':
      'gradientEndSize()? gradientEndSize():  gradientSize()',
    '[style.--nfm-gradient-color]': 'gradientColor()',
    '[style.--nfm-mask-start-percentage.%]':
      'maskStartPercentage() ? maskStartPercentage() : maskPercentage()',
    '[style.--nfm-mask-end-percentage.%]':
      'maskEndPercentage() ? maskEndPercentage() : maskPercentage()',
  },
})
export class FastMarqueeComponent implements OnDestroy {
  /**
   * Direction of the marquee.
   * Posible values: `left`, `right`, `up`, `down`.
   *
   * @default 'left'
   */
  direction = input<Direction>('right');

  /**
   * Speed of the marquee.
   * Can be qualitative as 'slow', 'medium' or 'fast' or quantitative as a number in pixels per second.
   * The quantitative speed is calculated based on the number of the marquee items.
   *
   * @default 'medium'
   */
  speed = input<Speed>('medium');

  /**
   * Whether to have into account the system reduced motion.
   * If true, the marquee will not be animated when the system has reduced motion.
   *
   * @default false
   */
  useSystemReducedMotion = input<boolean>(false);

  /**
   * Whether to fill the marquee with duplicated items.
   * If true, the marquee will be filled with duplicated items.
   *
   * @default true
   */
  autoFill = input<boolean>(false);

  /**
   * Whether to play the marquee animation.
   * True to play the marquee animation, false to pause the marquee animation.
   *
   * @default true
   */
  play = input<boolean>(true);

  /**
   * Whether to pause the marquee when the mouse is over the marquee.
   *
   * @default false
   */
  pauseOnHover = input<boolean>(false);

  /**
   * Whether to pause the marquee when the mouse is clicked over the marquee.
   *
   * @default false
   */
  pauseOnClick = input<boolean>(false);

  /**
   * Whether to use the masks on the start and end sides of the marquee.
   * You can configure the mask percentages using the `maskStartPercentage`, `maskEndPercentage` and `maskPercentage` inputs.
   *
   * **Important**: If the mask is used, the marquee content (items) cannot overflow the marquee.
   *
   * @see [Issue](https://stackoverflow.com/questions/9194923/using-a-css-mask-without-element-acting-like-it-has-overflow-hidden)
   * @default false
   */
  useMask = input<boolean>(false);

  /**
   * Start percentage of the mask.
   * If direction is horizontal (left or right):
   *  - 0 is the left side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the top side of the marquee and 100 is the center of the marquee.
   * **important**: This value will override the `maskPercentage` value.
   *
   * @default 0
   */
  maskStartPercentage = input<number>(0);

  /**
   * End percentage of the mask.
   * If direction is horizontal (left or right):
   *  - 0 is the right side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the bottom side of the marquee and 100 is the center of the marquee.
   * **important**: This value will override the `maskPercentage` value.
   *
   * @default 0
   */
  maskEndPercentage = input<number>(0);

  /**
   * Percentage of the mask.
   * Suitable Range: 0 - 100, where 0 is no mask and 100 is full mask from
   * start to center and end to the center.
   *
   * @default 0
   */
  maskPercentage = input<number>(0);

  /**
   * Start size of the gradient in pixels.
   * If direction is horizontal (left or right):
   *  - 0 is the left side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the top side of the marquee and 100 is the center of the marquee.
   *
   * **important**:
   *  - This value will be ignored if `useMask` is true.
   *  - This value will override the `gradientSize` value.
   *
   * @default 0
   */
  gradientStartSize = input<number>(0);

  /**
   * End size of the gradient in pixels.
   * If direction is horizontal (left or right):
   *  - 0 is the right side of the marquee and 100 is the center of the marquee.
   * If direction is vertical (up or down):
   * - 0 is the bottom side of the marquee and 100 is the center of the marquee.
   *
   * **important**:
   * - This value will be ignored if `useMask` is true.
   * - This value will override the `gradientSize` value.
   *
   * @default 0
   */
  gradientEndSize = input<number>(0);

  /**
   * Size of the gradient in pixels.
   * The size will start at the edges of the marquee and end at the center of the marquee.
   *
   * **important**:
   * - This value will be ignored if `useMask` is true.
   *
   * @default 0
   */
  gradientSize = input<number>(0);

  /**
   * Color of the gradient.
   *
   * **important**:
   * - This value will be ignored if `useMask` is true.
   *
   * @default 'transparent'
   */
  gradientColor = input<string>('transparent');

  /**
   * True if the marquee can animate, false otherwise.
   */
  readonly animate = computed(() => {
    return this.play() && !this.useSystemReducedMotion();
  });

  /**
   * True if the direction is block, false otherwise.
   */
  readonly isBlockDirection = computed(() => {
    return this.#helper.isBlockDirection(this.direction());
  });

  /**
   * True if the speed is quantitative, false otherwise.
   */
  readonly isQuantitativeSpeed = computed(() => {
    return this.#helper.isQuantitativeSpeed(this.speed());
  });

  /**
   * Reference to the Ngx Fast Marquee host element.
   */
  marqueeRef = inject(ElementRef<HTMLElement>);

  /**
   * HTML Marquee Element.
   */
  marqueeElement = computed<HTMLElement>(() => {
    return this.marqueeRef.nativeElement;
  });

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  /**
   * Helper to observe resize changes
   */
  #resizeObserverHelper = inject(ResizeObserverHelper);

  /**
   * Observe the parent element resizing and invoke the callback when it happens.
   * This method is used from the inner component to observe the parent element resizing.
   * @param callback - Callback to invoke when the parent element is resized
   */
  observeResizing(callback: () => void): void {
    this.#resizeObserverHelper.observe(this.marqueeElement(), callback);
  }

  ngOnDestroy(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.#resizeObserverHelper.unobserve(this.marqueeElement());
  }
}
