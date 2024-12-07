import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgxFastMarqueeDuplicationHelper {
  duplicateWithoutFillingSpace(innerElement: HTMLElement): void {
    if (!innerElement.children.length) {
      return;
    }
    const [contentElement, hiddenElement] = innerElement.children;
    if (hiddenElement.children.length) {
      // Already duplicated.
      return;
    }
    const numberOfItems = contentElement.children.length;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < numberOfItems; i++) {
      const item = contentElement.children[i];
      const copy = item.cloneNode(true);
      fragment.appendChild(copy);
    }
    hiddenElement.appendChild(fragment);
  }

  /**
   *
   * @param marquee - The host element that represents the marquee.
   * @param itemsContainer - The element that has the items to be duplicated.
   */
  duplicateFillingSpace(
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
