import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgxFastMarqueeHelper } from '../helpers';
import { withDebounceTime } from '../decorators';
import { FastMarqueeComponent } from '../fast-marquee/fast-marquee.component';

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
    '[attr.data-duplication-ready]': 'isDuplicationReady()',
    '[attr.data-content-overflowing]': 'isContentOverflowing()',
  },
})
export class NgxFastMarqueeInnerComponent implements AfterContentInit {
  /**
   * True if the content of the marquee is overflowing, false otherwise.
   */
  isContentOverflowing = signal<boolean>(false);

  /**
   * True if the duplication of the content is ready, false otherwise.
   * TODO: Change to isContentDuplicationReady
   */
  isDuplicationReady = signal<boolean>(false);

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
   *  Ngx Fast Marquee Component (Parent host component)
   */
  ngxFastMarqueeComponent = inject(FastMarqueeComponent);

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  ngAfterContentInit(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.ngxFastMarqueeComponent.observeResizing(
      this.onMarqueeResized.bind(this),
    );
  }

  #update(): void {
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
    const isContentOverflowing = contentSize > marqueeSize;
    this.isContentOverflowing.set(isContentOverflowing);
  }

  #duplicateItems(): void {
    const innerElement = this.#marqueeInnerElement();
    const marqueeElement = innerElement.parentElement as HTMLElement;
    const isAutoFill = marqueeElement.getAttribute('data-autofill') === 'true';
    if (isAutoFill) {
      this.#duplicateFillingSpace(innerElement);
      return;
    }
    this.#duplicateWithoutFillingSpace(innerElement);
  }

  #duplicateFillingSpace(innerElement: HTMLElement): void {
    const [contentElement, hiddenElement] = innerElement.children;

    const marqueeElement = innerElement.parentElement as HTMLElement;
    const direction = marqueeElement.getAttribute('data-direction');
    const isBlockDirection = direction === 'up' || direction === 'down';

    let marqueeSize = marqueeElement.clientWidth;
    let contentSize = contentElement.clientWidth;

    if (isBlockDirection) {
      marqueeSize = marqueeElement.clientHeight;
      contentSize = contentElement.clientHeight;
    }

    const duplications = 2 * Math.ceil(marqueeSize / contentSize) - 1;
    // Create a clone of the original content
    const originalContentList = Array.from(contentElement.children);

    // Removes child nodes of the hidden element
    hiddenElement.innerHTML = '';
    requestAnimationFrame(() => {
      // Create a single fragment containing all duplications
      const fragmentDuplicatedContent = document.createDocumentFragment();
      for (let i = 0; i < duplications; i++) {
        for (const originalContentItem of originalContentList) {
          const clone = originalContentItem.cloneNode(true);
          fragmentDuplicatedContent.appendChild(clone);
        }
      }
      hiddenElement.appendChild(fragmentDuplicatedContent.cloneNode(true));
      this.isDuplicationReady.set(true);
    });
  }

  #duplicateWithoutFillingSpace(innerElement: HTMLElement): void {
    const [contentElement, hiddenElement] = innerElement.children;
    const isAlreadyDuplicated = hiddenElement.children.length > 0;
    if (isAlreadyDuplicated) {
      return;
    }
    const duplications = contentElement.children.length;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < duplications; i++) {
      const item = contentElement.children[i];
      const copy = item.cloneNode(true);
      fragment.appendChild(copy);
    }
    hiddenElement.appendChild(fragment);
    this.isDuplicationReady.set(true);
  }

  @withDebounceTime(200)
  onMarqueeResized(): void {
    this.#update();
  }
}
