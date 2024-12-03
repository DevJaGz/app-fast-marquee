import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgxFastMarqueeDuplicationHelper {
  /**
   * Duplicates the provided items to the marquee only once, wrapping both the
   * original and the duplicated items in separate `<div>` elements. A aria-hidden
   * attribute will be set to the duplicated items to hide it from screen readers.
   *
   * @example
   * The following example demonstrates how the duplication feature works:
   *
   * **Input:**
   * ```html
   * <div id="element">
   *    <div>Hello</div>
   *    <div>World!</div>
   * </div>
   * <script>
   *   const element = document.getElementById('element');
   *   ngxFastMarqueeDuplicationHelper.duplicationFillingSpace(element);
   * </script>
   * ```
   * **Output after duplication:**
   * ```html
   * <div id="element">
   *    <div>
   *      <div>Hello</div>
   *      <div>World!</div>
   *    </div>
   *    <div aria-hidden="true">
   *      <div>Hello</div>
   *      <div>World!</div>
   *    </div>
   * </div>
   * ```
   *
   * @param itemsContainer - The element that has the items to be duplicated.
   */
  duplicateWithoutAutoFill(itemsContainer: HTMLElement): void {
    const div = document.createElement('div');
    while (itemsContainer.firstChild) {
      div.appendChild(itemsContainer.firstChild);
    }
    itemsContainer.appendChild(div);
    const clone = div.cloneNode(true) as HTMLElement;
    clone.setAttribute('aria-hidden', 'true');
    itemsContainer.appendChild(clone);
  }

  /**
   *
   * @param marquee - The host element that represents the marquee.
   * @param itemsContainer - The element that has the items to be duplicated.
   */
  duplicateUsingAutoFill(
    marquee: HTMLElement,
    itemsContainer: HTMLElement,
  ): void {
    const marqueRect = marquee.getBoundingClientRect();
    const itemsContainerRect = itemsContainer.getBoundingClientRect();
    console.log(`[marqueRect] w:${marqueRect.width}, h:${marqueRect.height}`);
    console.log(
      `[itemsContainer] w:${itemsContainerRect.width}, h:${itemsContainerRect.height}`,
    );
  }
}
