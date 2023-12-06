import { Inject, Injectable } from '@angular/core';
import { MarqueeModel } from '../models/marquee.model';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class MarqueeDuplicationService {
  /**
   * Set the marquee component instance.
   * @param marqueeComponent - NGX Fast Marquee component instance.
   */
  setMarqueeComponent(marqueeComponent: MarqueeModel): void {
    this._marqueeComponent = marqueeComponent;
  }

  /**
   * Duplicate the items of the marquee.
   */
  duplicateItems(): void {
    this._removeDuplicateItems();
    this._createDuplicateItems();
  }

  constructor(@Inject(DOCUMENT) private _document: Document) {}

  /**
   * Private reference to the marquee component instance.
   */
  private _marqueeComponent!: MarqueeModel;

  /**
   * Remove the duplicated items from the marquee.
   */
  private _removeDuplicateItems(): void {
    const { marqueeInnerElement } = this._marqueeComponent;
    marqueeInnerElement
      .querySelectorAll('[aria-hidden="true"]')
      .forEach(function (element) {
        element.remove();
      });
  }

  /**
   * Create the duplicated items for the marquee based on the marquee width,
   * the marquee inner width and the number of current items.
   */
  private _createDuplicateItems(): void {
    const { marqueeInnerElement, renderer } = this._marqueeComponent;
    const numberOfDuplicates = this._getNumberOfDuplicates();
    const marqueeItems = Array.from(marqueeInnerElement.children);
    const marqueeItemsToBeDuplicated = Array.from(
      { length: numberOfDuplicates },
      () => marqueeItems,
    ).reduce(
      (accumulator, currentValue) => accumulator.concat(currentValue),
      [],
    );
    const fragment = this._document.createDocumentFragment();
    for (const marqueeItem of marqueeItemsToBeDuplicated) {
      const marqueeItemClone = marqueeItem.cloneNode(true) as HTMLElement;
      renderer.setAttribute(marqueeItemClone, 'aria-hidden', 'true');
      fragment.appendChild(marqueeItemClone);
    }
    renderer.appendChild(marqueeInnerElement, fragment);
  }

  /**
   * Return the number of duplicates based on the marquee size and the marquee inner size and the
   * direction input value.
   * - If the the number of duplicates is odd, it will be adjusted to be even (adding 1) because of
   * the animation repetition is translated 50%.
   * - If the marquee inner size is less than the marquee size, need to be adjusted multiplying by 2
   * in order to fill the marquee.
   * @returns The number of duplicates
   */
  private _getNumberOfDuplicates(): number {
    const { direction } = this._marqueeComponent;
    const [marqueeDOMRect, marqueeInnerDOMRect] = this._getBoundedClientRects();
    const marqueeSize =
      direction === 'left' || direction === 'right'
        ? marqueeDOMRect.width
        : marqueeDOMRect.height;
    const marqueeInnerSize =
      direction === 'left' || direction === 'right'
        ? marqueeInnerDOMRect.width
        : marqueeInnerDOMRect.height;
    const numberOfDuplicates = Math.ceil(marqueeSize / marqueeInnerSize);
    if (marqueeSize > marqueeInnerSize) {
      const numberOfDuplicatesAdjustedByScreen = 2 * numberOfDuplicates;
      const isNumberOfDuplicatesAdjustedByScreenOdd =
        numberOfDuplicatesAdjustedByScreen % 2 !== 0;
      return isNumberOfDuplicatesAdjustedByScreenOdd
        ? numberOfDuplicatesAdjustedByScreen
        : numberOfDuplicatesAdjustedByScreen + 1;
    }
    const isNumberOfDuplicatesOdd = numberOfDuplicates % 2 !== 0;
    return isNumberOfDuplicatesOdd
      ? numberOfDuplicates
      : numberOfDuplicates + 1;
  }

  /**
   * Get the marquee and marquee inner DOMRects.
   * @returns The marquee and marquee inner DOMRects
   */
  private _getBoundedClientRects(): [DOMRect, DOMRect] {
    const { marqueeElement, marqueeInnerElement } = this._marqueeComponent;
    return [
      marqueeElement.getBoundingClientRect(),
      marqueeInnerElement.getBoundingClientRect(),
    ];
  }
}
