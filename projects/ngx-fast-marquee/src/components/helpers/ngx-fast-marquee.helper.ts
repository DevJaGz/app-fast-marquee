import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxFastMarqueeDuplicationHelper } from './ngx-fast-marquee-duplication.helper';
import { NgxFastMarqueeLayoutHelper } from './ngx-fast-marquee-layout.helper';

@Injectable()
export class NgxFastMarqueeHelper {
  /**
   * Platform ID of the current application.
   */
  #platformId = inject(PLATFORM_ID);

  /**
   * Helper to manage duplication of items.
   */
  #duplicationHelper = inject(NgxFastMarqueeDuplicationHelper);

  /**
   * Helper to manage layout of the marquee.
   */
  #layoutHelper = inject(NgxFastMarqueeLayoutHelper);

  /**
   * True if the current application is running on the server, false otherwise.
   */
  get isPlatformServer(): boolean {
    return isPlatformServer(this.#platformId);
  }

  /**
   * Number of items inside the marquee inner element.
   * @see {@link NgxFastMarqueeDuplicationHelper.currentNumberOfItems}
   */
  readonly currentNumberOfItems = this.#duplicationHelper.currentNumberOfItems;

  /**
   * Validate if the direction of the marquee is a block type.
   * @see {@link NgxFastMarqueeLayoutHelper.isBlockDirection}
   */
  isBlockDirection = this.#layoutHelper.isBlockDirection.bind(
    this.#layoutHelper,
  );

  /**
   * Retrieves the marquee and content sizes.
   * @see {@link NgxFastMarqueeLayoutHelper.getSizes}
   */
  getSizes = this.#layoutHelper.getSizes.bind(this.#layoutHelper);

  /**
   * Validate if the content is overflowing the marquee.
   * @see {@link NgxFastMarqueeLayoutHelper.isContentOverflowing}
   */
  isContentOverflowing = this.#layoutHelper.isContentOverflowing.bind(
    this.#layoutHelper,
  );

  /**
   * Duplicate the content without filling the space.
   * @see {@link NgxFastMarqueeDuplicationHelper.duplicateWithoutFillingSpace}
   */
  duplicateWithoutFillingSpace =
    this.#duplicationHelper.duplicateWithoutFillingSpace.bind(
      this.#duplicationHelper,
    );

  /**
   * Duplicate the content filling the space.
   * @see {@link NgxFastMarqueeDuplicationHelper.duplicateFillingSpace}
   */
  duplicateFillingSpace(params: {
    contentElement: Element;
    marqueeElement: Element;
    hiddenElement: Element;
    isBlockDirection: boolean;
  }): void {
    const { marqueeSize, contentSize } = this.getSizes(params);
    this.#duplicationHelper.duplicateFillingSpace({
      ...params,
      marqueeSize,
      contentSize,
    });
  }

  /**
   * Set the animation duration for the marquee inner element.
   *
   * @param params.CSSPropertyName - The name of the CSS property to set.
   * @param params.marqueeInnerElement - The marquee inner element.
   * @param params.isBlockDirection - True if the direction is block, false otherwise.
   * @param params.speed - The speed of the marquee in pixels per second.
   *    */
  setInnerAnimationDuration(params: {
    marqueeInnerElement: HTMLElement;
    contentElement: Element;
    CSSPropertyName: string;
    isBlockDirection: boolean;
    speed: number;
  }): void {
    const CSSPropertyName = params.CSSPropertyName;
    const isBlockDirection = params.isBlockDirection;
    const marqueeInnerElement = params.marqueeInnerElement;
    const speed = params.speed;
    const contentElement = params.contentElement;

    // Due the animation moves the inner marquee only 50% of the
    // marquee size, the middle size is used for the calculation. That is the
    // reason why the content element size is used here for the calculation, it always
    // is the half of the marquee inner size.
    const size = isBlockDirection
      ? contentElement.clientHeight
      : contentElement.clientWidth;

    marqueeInnerElement.style.setProperty(CSSPropertyName, `${size / speed}s`);
  }
}
