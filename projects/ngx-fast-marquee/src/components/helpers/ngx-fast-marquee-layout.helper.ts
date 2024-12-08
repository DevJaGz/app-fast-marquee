import { Injectable } from '@angular/core';
import { Direction } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class NgxFastMarqueeLayoutHelper {
  /**
   * Retrieves the marquee and content sizes.
   * The sizes can be the width or height depending on the direction of the marquee.
   * @returns Object with the marquee and content sizes.
   */
  getSizes(params: {
    contentElement: Element;
    marqueeElement: Element;
    isBlockDirection: boolean;
  }): {
    marqueeSize: number;
    contentSize: number;
  } {
    let contentSize = params.contentElement.clientWidth;
    let marqueeSize = params.marqueeElement.clientWidth;

    if (params.isBlockDirection) {
      contentSize = params.contentElement.clientHeight;
      marqueeSize = params.marqueeElement.clientHeight;
    }

    return {
      marqueeSize,
      contentSize,
    };
  }

  /**
   * Validate if the direction of the marquee is a block type.
   * @param direction - Direction of the marquee.
   * @returns  True if the direction is block, false otherwise.
   */
  isBlockDirection(direction: Direction): boolean {
    return direction === 'up' || direction === 'down';
  }

  /**
   * Validate if the content is overflowing the marquee.
   * @return True if the content is overflowing, false otherwise.
   */
  isContentOverflowing(params: {
    contentElement: Element;
    marqueeElement: Element;
    isBlockDirection: boolean;
  }): boolean {
    const { marqueeSize, contentSize } = this.getSizes({
      contentElement: params.contentElement,
      marqueeElement: params.marqueeElement,
      isBlockDirection: params.isBlockDirection,
    });
    const isContentOverflowing = contentSize > marqueeSize;
    return isContentOverflowing;
  }
}
