import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
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
export class NgxFastMarqueeInnerComponent
  implements AfterContentInit, OnDestroy
{
  /**
   * True if the content of the marquee is overflowing, false otherwise.
   */
  isContentOverflowing = signal<boolean>(false);

  /**
   * True if the duplication of the content is ready, false otherwise.
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
   * Mutation Observer to observe the hidden element.
   */
  #hiddenElementObserver!: MutationObserver;

  /**
   *  Ngx Fast Marquee Component (Parent host component)
   */
  #ngxFastMarqueeComponent = inject(FastMarqueeComponent);

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  ngAfterContentInit(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.#observeHiddenElementMutations();
    this.#ngxFastMarqueeComponent.observeResizing(
      this.onMarqueeResized.bind(this),
    );
  }

  ngOnDestroy(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.#hiddenElementObserver.disconnect();
  }

  /**
   * Invoked when the marquee is resized using a
   * debounce time of 200ms.
   */
  @withDebounceTime(200)
  onMarqueeResized(): void {
    this.#update();
  }

  /**
   * Observe the hidden element to detect when it is mutated.
   */
  #observeHiddenElementMutations(): void {
    const innerElement = this.#marqueeInnerElement();
    const [, hiddenElement] = innerElement.children;
    const hiddenElementMutationObserver = new MutationObserver(
      this.#onHiddenElementMutation.bind(this),
    );
    this.#hiddenElementObserver = hiddenElementMutationObserver;
    hiddenElementMutationObserver.observe(hiddenElement, { childList: true });
  }

  /**
   * Invoked each time the hidden element is mutated.
   * @param mutations - List of mutations that occurred.
   */
  #onHiddenElementMutation(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        this.#setDuplicationReadyAttribute();
      }
    }
  }

  /**
   * Set the duplication ready attribute.
   */
  #setDuplicationReadyAttribute(): void {
    const innerElement = this.#marqueeInnerElement();
    const [, hiddenElement] = innerElement.children;
    this.isDuplicationReady.set(hiddenElement.children.length > 0);
  }

  /**
   * Set the content overflowing attribute.
   */
  #setContentOverflowingAttribute(): void {
    const isContentOverflowing = this.#isContentOverflowing();
    this.isContentOverflowing.set(isContentOverflowing);
  }

  /**
   * Update the inner element animation configuration.
   */
  #update(): void {
    requestAnimationFrame(() => {
      this.#duplicateContent();
      this.#setContentOverflowingAttribute();
    });
  }

  /**
   * Validate if the content is overflowing the marquee.
   * @return True if the content is overflowing, false otherwise.
   */
  #isContentOverflowing(): boolean {
    const { marqueeSize, contentSize } = this.#getSizes();
    const isContentOverflowing = contentSize > marqueeSize;
    return isContentOverflowing;
  }

  /**
   * Duplicates the content of the inner element.
   */
  #duplicateContent(): void {
    const isAutoFill = this.#ngxFastMarqueeComponent.autoFill();
    if (isAutoFill) {
      this.#duplicateFillingSpace();
      return;
    }
    this.#duplicateWithoutFillingSpace();
  }

  /**
   * Duplicates the content filling the available space.
   */
  #duplicateFillingSpace(): void {
    const innerElement = this.#marqueeInnerElement();
    const [contentElement, hiddenElement] = innerElement.children;
    const { marqueeSize, contentSize } = this.#getSizes();
    const duplications = 2 * Math.ceil(marqueeSize / contentSize) - 1;
    const originalContentList = Array.from(contentElement.children);

    // Removes child nodes of the hidden element
    hiddenElement.innerHTML = '';

    // After hidden element is empty, create the new duplications
    requestAnimationFrame(() => {
      const fragmentDuplicatedContent = document.createDocumentFragment();
      for (let i = 0; i < duplications; i++) {
        for (const originalContentItem of originalContentList) {
          const clone = originalContentItem.cloneNode(true);
          fragmentDuplicatedContent.appendChild(clone);
        }
      }
      hiddenElement.appendChild(fragmentDuplicatedContent.cloneNode(true));
    });
  }

  /**
   * Duplicates the content without filling the space.
   */
  #duplicateWithoutFillingSpace(): void {
    const innerElement = this.#marqueeInnerElement();
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
  }

  /**
   * Retrieves the marquee and content sizes.
   * The sizes can be the width or height depending on the direction of the marquee.
   * @returns Object with the marquee and content sizes.
   */
  #getSizes(): {
    marqueeSize: number;
    contentSize: number;
  } {
    const innerElement = this.#marqueeInnerElement();
    const [contentElement] = innerElement.children;
    const marqueeElement = this.#ngxFastMarqueeComponent.marqueeElement();
    let contentSize = contentElement.clientWidth;
    let marqueeSize = marqueeElement.clientWidth;

    if (this.#ngxFastMarqueeComponent.isBlockDirection()) {
      contentSize = contentElement.clientHeight;
      marqueeSize = marqueeElement.clientHeight;
    }

    return {
      marqueeSize,
      contentSize,
    };
  }
}
