import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxFastMarqueeDuplicationHelper } from './ngx-fast-marquee-duplication.helper';
import { NgxFastMarqueeLayoutHelper } from './ngx-fast-marquee-layout.helper';
import { NfxFastMarqueeSpeedHelper } from './nfx-fast-marquee-speed.helper';

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
   * Helper to manage speed of the marquee.
   */
  #speedHelper = inject(NfxFastMarqueeSpeedHelper);

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
  readonly isBlockDirection = this.#layoutHelper.isBlockDirection.bind(
    this.#layoutHelper,
  );

  /**
   * Retrieves the marquee and content sizes.
   * @see {@link NgxFastMarqueeLayoutHelper.getSizes}
   */
  readonly getSizes = this.#layoutHelper.getSizes.bind(this.#layoutHelper);

  /**
   * Validate if the content is overflowing the marquee.
   * @see {@link NgxFastMarqueeLayoutHelper.isContentOverflowing}
   */
  readonly isContentOverflowing = this.#layoutHelper.isContentOverflowing.bind(
    this.#layoutHelper,
  );

  /**
   * Validate if the speed is quantitative.
   * @see {@link NfxFastMarqueeSpeedHelper.isQuantitativeSpeed}
   */
  readonly isQuantitativeSpeed = this.#speedHelper.isQuantitativeSpeed.bind(
    this.#speedHelper,
  );

  /**
   * Duplicate the content without filling the space.
   * @see {@link NgxFastMarqueeDuplicationHelper.duplicateWithoutFillingSpace}
   */
  readonly duplicateWithoutFillingSpace =
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
   * @see {@link NfxFastMarqueeSpeedHelper.setInnerAnimationDuration}
   * */
  readonly setInnerAnimationDuration =
    this.#speedHelper.setInnerAnimationDuration.bind(this.#speedHelper);
}
