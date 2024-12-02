import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { Direction, Speed } from '../../types';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'fast-marquee',
  standalone: true,
  imports: [],
  templateUrl: './fast-marquee.component.html',
  styleUrl: './fast-marquee.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ngx-fast-marquee]': 'true',
    '[attr.data-animate]': 'animate()',
    '[attr.data-direction]': 'direction()',
    '[attr.data-autofill]': 'autoFill()',
  },
})
export class FastMarqueeComponent implements AfterViewInit {
  /**
   * Reference to the marquee element.
   */
  #marqueeRef = inject(ElementRef<HTMLElement>);

  /**
   * Inner Element of the marquee that contains the items.
   */
  #marqueeInnerElement = computed<HTMLElement>(() => {
    return this.#marqueeRef.nativeElement.children[0];
  });
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
   * True if the marquee can animate, false otherwise.
   */
  readonly animate = computed(() => {
    return !this.useSystemReducedMotion();
  });

  ngAfterViewInit(): void {
    this.#handleDuplication();
  }

  #handleDuplication(): void {
    if (this.autoFill()) {
      this.#duplicateItems();
      return;
    }
    this.#duplicateByBlockItems();
  }

  #duplicateByBlockItems(): void {
    const innerElement = this.#marqueeInnerElement();
    const div = document.createElement('div');
    while (innerElement.firstChild) {
      div.appendChild(innerElement.firstChild);
    }
    innerElement.appendChild(div);
    const clone = div.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    innerElement.appendChild(clone);
  }

  #duplicateItems(): void {
    const innerElement = this.#marqueeInnerElement();
    const items = innerElement.children;
    const numberOfItems = items.length;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < numberOfItems; i++) {
      const item = items[i];
      const clone = item.cloneNode(true) as HTMLElement;
      fragment.appendChild(clone);
    }
    innerElement.appendChild(fragment);
  }
}
