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
import { NgxFastMarqueeHelper } from '../helpers';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fast-marquee',
  standalone: true,
  imports: [NgxFastMarqueeInnerComponent],
  templateUrl: './fast-marquee.component.html',
  styleUrl: './fast-marquee.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ngx-fast-marquee]': 'true',
    '[attr.data-animate]': 'animate()',
    '[attr.data-direction]': 'direction()',
    '[attr.data-autofill]': 'autoFill()',
    '[attr.data-pause-on-hover]': 'pauseOnHover()',
  },
})
export class FastMarqueeComponent implements OnDestroy {
  /**
   * Direction of the marquee.
   * Posible values: `left`, `right`, `up`, `down`.
   * @default 'left'
   */
  direction = input<Direction>('right');

  /**
   * Speed of the marquee.
   * Can be qualitative as 'slow', 'medium' or 'fast' or quantitative as a number in pixels per second.
   * The quantitative speed is calculated based on the number of the marquee items.
   * @default 'medium'
   */
  speed = input<Speed>('medium');

  /**
   * Whether to have into account the system reduced motion.
   * If true, the marquee will not be animated when the system has reduced motion.
   * @default false
   */
  useSystemReducedMotion = input<boolean>(false);

  /**
   * Whether to fill the marquee with duplicated items.
   * If true, the marquee will be filled with duplicated items.
   * @default true
   */
  autoFill = input<boolean>(false);

  /**
   * Whether to pause the marquee when the mouse is over the marquee.
   * @default false
   */
  pauseOnHover = input<boolean>(false);

  /**
   * True if the marquee can animate, false otherwise.
   */
  readonly animate = computed(() => {
    return !this.useSystemReducedMotion();
  });

  /**
   * True if the direction is block, false otherwise.
   */
  readonly isBlockDirection = computed(() => {
    return this.direction() === 'up' || this.direction() === 'down';
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
   * Resize Observer reference.
   */
  #resizeObserver!: ResizeObserver;

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  /**
   * Observe the parent element resizing and invoke the callback when it happens.
   * This method is used from the inner component to observe the parent element resizing.
   * @param callback - Callback to invoke when the parent element is resized
   */
  observeResizing(callback: () => void): void {
    if (this.#resizeObserver) {
      // Just in case is invoked many times, but it should not happen
      return;
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach(() => callback());
    });
    this.#resizeObserver = observer;
    observer.observe(this.marqueeElement());
  }

  ngOnDestroy(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.#resizeObserver.unobserve(this.marqueeElement());
  }
}
