import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MutationObserverHelper, NgxFastMarqueeHelper } from '../../helpers';
import { withDebounceTime } from '../../decorators';
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
    '[style.--nfm-number-of-items]': 'numberOfItems()',
  },
})
export class NgxFastMarqueeInnerComponent
  implements AfterContentInit, OnDestroy
{
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
   * Reference to the content element.
   */
  #contentElement = computed<Element>(() => {
    return this.#marqueeInnerElement().children[0];
  });

  /**
   * Reference to the hidden element. (Where the content is duplicated)
   */
  #hiddenElement = computed<Element>(() => {
    return this.#marqueeInnerElement().children[1];
  });

  /**
   *  Ngx Fast Marquee Component (Parent host component)
   */
  #ngxFastMarqueeComponent = inject(FastMarqueeComponent);

  /**
   * Helper to request operations and statuses
   */
  #helper = inject(NgxFastMarqueeHelper);

  /**
   * Helper to observe mutations
   */
  #mutationObserverHelper = inject(MutationObserverHelper);

  /**
   * Flag to check if the component is initialized.
   */
  #isFirstUpdate = false;

  /**
   * True if the content of the marquee is overflowing, false otherwise.
   */
  isContentOverflowing = signal<boolean>(false);

  /**
   * True if the duplication of the content is ready, false otherwise.
   */
  isDuplicationReady = signal<boolean>(false);

  /**
   * Number of items inside the marquee inner element.
   */
  numberOfItems = this.#helper.currentNumberOfItems;

  constructor() {
    if (this.#helper.isPlatformServer) {
      return;
    }
    effect(() => {
      this.#ngxFastMarqueeComponent.speed();
      if (!this.#isFirstUpdate) {
        return;
      }
      this.onSpeedChanged();
    });
  }

  ngAfterContentInit(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    this.#observeHiddenElementMutations();
    this.#ngxFastMarqueeComponent.observeResizing(
      // This is exectued at the initialization of the component
      // and when the marquee is resized.
      this.onMarqueeResized.bind(this),
    );
  }

  ngOnDestroy(): void {
    if (this.#helper.isPlatformServer) {
      return;
    }
    const hiddenElement = this.#hiddenElement();
    this.#mutationObserverHelper.unobserve(hiddenElement);
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
   * Invoked when the speed is changed using a
   * debounce time of 200ms.
   */
  @withDebounceTime(200)
  onSpeedChanged(): void {
    this.#setQuantitativeSpeed();
  }

  /**
   * Update the inner element animation configuration.
   */
  #update(): void {
    this.#duplicateContent();
    this.#setContentOverflowingAttribute();
    this.#setQuantitativeSpeed();
    this.#isFirstUpdate = true;
  }

  /**
   * Observe the hidden element to detect when it is mutated.
   */
  #observeHiddenElementMutations(): void {
    const hiddenElement = this.#hiddenElement();
    this.#mutationObserverHelper.observe(
      hiddenElement,
      this.#onHiddenElementMutation.bind(this),
      {
        childList: true,
      },
    );
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
    const hiddenElement = this.#hiddenElement();
    this.isDuplicationReady.set(hiddenElement.children.length > 0);
  }

  /**
   * Set the content overflowing attribute.
   */
  #setContentOverflowingAttribute(): void {
    const isContentOverflowing = this.#helper.isContentOverflowing({
      contentElement: this.#contentElement(),
      marqueeElement: this.#ngxFastMarqueeComponent.marqueeElement(),
      isBlockDirection: this.#ngxFastMarqueeComponent.isBlockDirection(),
    });
    this.isContentOverflowing.set(isContentOverflowing);
  }

  /**
   * Duplicates the content of the inner element.
   */
  #duplicateContent(): void {
    const hasAutoFill = this.#ngxFastMarqueeComponent.autoFill();
    if (hasAutoFill) {
      this.#helper.duplicateFillingSpace({
        contentElement: this.#contentElement(),
        marqueeElement: this.#ngxFastMarqueeComponent.marqueeElement(),
        hiddenElement: this.#hiddenElement(),
        isBlockDirection: this.#ngxFastMarqueeComponent.isBlockDirection(),
      });
      return;
    }
    this.#helper.duplicateWithoutFillingSpace({
      contentElement: this.#contentElement(),
      hiddenElement: this.#hiddenElement(),
    });
  }

  /**
   * Set the quantitative speed of the marquee animation.
   */
  #setQuantitativeSpeed(): void {
    const isQuantitativeSpeed =
      this.#ngxFastMarqueeComponent.isQuantitativeSpeed();

    if (!isQuantitativeSpeed) {
      return;
    }

    this.#helper.setInnerAnimationDuration({
      marqueeInnerElement: this.#marqueeInnerElement(),
      contentElement: this.#contentElement(),
      isBlockDirection: this.#ngxFastMarqueeComponent.isBlockDirection(),
      CSSPropertyName: '--nfm-inner-animation-duration',
      speed: this.#ngxFastMarqueeComponent.speed() as number,
    });
  }
}
