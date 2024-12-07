import { Injectable } from '@angular/core';
import { Direction } from '../../types';

@Injectable({
  providedIn: 'root',
})
export class NgxFastMarqueeLayoutHelper {
  isContentOverflowing(params: {
    marqueeElement: HTMLElement;
    innerElement: HTMLElement;
    direction: Direction;
  }): boolean {
    const isDirectionHorizontal =
      params.direction === 'left' || params.direction === 'right';
    if (isDirectionHorizontal) {
      return this.#isContentOverflowingHorizontally(
        params.marqueeElement,
        params.innerElement,
      );
    }

    return this.#isContentOverflowingVertically(
      params.marqueeElement,
      params.innerElement,
    );
  }

  #isContentOverflowingHorizontally(
    marqueeElement: HTMLElement,
    innerElement: HTMLElement,
  ): boolean {
    const [contentElement] = innerElement.children;
    // return contentElement.clientWidth > marqueeElement.clientWidth;
    const contentWidth = contentElement.scrollWidth;
    const marqueeWidth = marqueeElement.getBoundingClientRect().width;

    console.log('cW:', contentWidth, 'mW:', marqueeWidth);
    return contentWidth > marqueeWidth;
  }

  #isContentOverflowingVertically(
    marqueeElement: HTMLElement,
    innerElement: HTMLElement,
  ): boolean {
    const [contentElement] = innerElement.children;
    // return contentElement.clientWidth > marqueeElement.clientHeight;
    return (
      contentElement.scrollHeight >
      marqueeElement.getBoundingClientRect().height
    );
  }
}
