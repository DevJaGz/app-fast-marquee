import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { Direction, Speed } from '../../types';
import { NgxFastMarqueeHelper } from '../helpers';
import { NgxFastMarqueeInnerComponent } from '../ngx-fast-marquee-inner/ngx-fast-marquee-inner.component';

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
    '[attr.data-content-overflowing]': 'isContentOverflowing()',
  },
})
export class FastMarqueeComponent implements AfterContentInit {
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
   * True if the content of the marquee is overflowing, false otherwise.
   */
  readonly isContentOverflowing = signal<boolean>(false);

  /**
   * Reference to the marquee element.
   */
  #marqueeRef = inject(ElementRef<HTMLElement>);

  #marqueeElement = computed<HTMLElement>(() => {
    return this.#marqueeRef.nativeElement;
  });

  /**
   * Inner Element of the marquee that contains the items.
   */
  #marqueeInnerElement = computed<HTMLElement>(() => {
    return this.#marqueeRef.nativeElement.children[0];
  });

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  ngAfterContentInit(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
  }

  #verifyContentOverflowing() {
    const isContentOverflowing = this.#helper.isContentOverflowing({
      direction: this.direction(),
      innerElement: this.#marqueeInnerElement(),
      marqueeElement: this.#marqueeElement(),
    });
    this.isContentOverflowing.set(isContentOverflowing);
    console.log('--direction:', this.direction(), isContentOverflowing);
  }

  #updateDuplications(): void {
    this.#helper.duplicateItems({
      innerElement: this.#marqueeInnerElement(),
      marqueeElement: this.#marqueeElement(),
      isAutoFill: this.autoFill(),
      isOverflowing: this.isContentOverflowing(),
    });
  }
}
