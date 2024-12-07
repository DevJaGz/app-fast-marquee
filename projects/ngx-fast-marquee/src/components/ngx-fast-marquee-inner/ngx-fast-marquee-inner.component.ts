import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { NgxFastMarqueeHelper } from '../helpers';
import { withDebounceTime } from '../decorators';

@Component({
  selector: 'ngx-fast-marquee-inner',
  standalone: true,
  imports: [],
  templateUrl: './ngx-fast-marquee-inner.component.html',
  styleUrl: './ngx-fast-marquee-inner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.ngx-fast-marquee-inner]': 'true',
    '(window:resize)': 'onResize()',
  },
})
export class NgxFastMarqueeInnerComponent implements AfterContentInit {
  /**
   * Event emitted when the content of the marquee is overflowing.
   */
  contentOverflowing = output<boolean>();

  /**
   * Reference to the marquee inner element.
   */
  #marqueeInnerRef = inject(ElementRef<HTMLElement>);

  /**
   * HTML Marquee Inner Element.
   */
  #marqueeInnerElement = computed<HTMLElement>(() => {
    return this.#marqueeInnerRef.nativeElement;
  });

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  ngAfterContentInit(): void {
    this.#update();
  }

  #update(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    requestAnimationFrame(() => {
      this.#duplicateItems();
      this.#notifyContentOverflowing();
    });
  }

  #notifyContentOverflowing(): void {
    const innerElement = this.#marqueeInnerElement();
    const [contentElement] = innerElement.children;
    const marqueeElement = innerElement.parentElement as HTMLElement;
    const direction = marqueeElement.getAttribute('data-direction');
    const isBlockDirection = direction === 'up' || direction === 'down';
    let contentSize = contentElement.clientWidth;
    let marqueeSize = marqueeElement.clientWidth;
    if (isBlockDirection) {
      contentSize = contentElement.clientHeight;
      marqueeSize = marqueeElement.clientHeight;
    }
    console.log(
      '--direction:',
      direction,
      'contentSize:',
      contentSize,
      'marqueeSize:',
      marqueeSize,
    );
    const isContentOverflowing = contentSize > marqueeSize;
    this.contentOverflowing.emit(isContentOverflowing);
  }

  #duplicateItems(): void {
    const innerElement = this.#marqueeInnerElement();
    const [contentElement, hiddenElement] = innerElement.children;
    const isAlreadyDuplicated = hiddenElement.children.length > 0;
    if (isAlreadyDuplicated) {
      return;
    }
    const numberOfItems = contentElement.children.length;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < numberOfItems; i++) {
      const item = contentElement.children[i];
      const copy = item.cloneNode(true);
      fragment.appendChild(copy);
    }
    hiddenElement.appendChild(fragment);
  }

  @withDebounceTime(200)
  onResize(): void {
    this.#update();
  }
}
