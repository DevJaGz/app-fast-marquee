import { Injectable } from '@angular/core';
import { Speed } from '../types';

@Injectable()
export class NfxFastMarqueeSpeedHelper {
  /**
   * Check if the provided speed for the marquee is quantitative.
   *
   * @param speed - Speed for the marquee.
   */
  isQuantitativeSpeed(speed: Speed): boolean {
    return typeof speed === 'number';
  }

  /**
   * Set the animation duration for the marquee inner element.
   *
   * @param params.CSSPropertyName - The name of the CSS property to set.
   * @param params.contentElement - The element that has the original content.
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

    requestAnimationFrame(() => {
      marqueeInnerElement.style.setProperty(
        CSSPropertyName,
        `${size / speed}s`,
      );
    });
  }
}
