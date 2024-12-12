import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgxFastMarqueeDuplicationHelper {
  /**
   * Remove Duplicated Content from the provided hidden element.
   * @param hiddenElement - The hidden element to remove the duplicated content.
   */
  removeDuplicatedContent(hiddenElement: Element): void {
    hiddenElement.innerHTML = '';
  }

  /**
   * Duplicate the content filling the space.
   * @param params.marqueeSize - The size of the marquee.
   * @param params.contentSize - The size of the content.
   * @param params.hiddenElement - The hidden element to duplicate the content.
   * @param params.contentElement - The element that has the content to duplicate.
   */
  duplicateFillingSpace(params: {
    marqueeSize: number;
    contentSize: number;
    hiddenElement: Element;
    contentElement: Element;
  }): void {
    const marqueeSize = params.marqueeSize;
    const contentSize = params.contentSize;
    const hiddenElement = params.hiddenElement;
    const duplications = 2 * Math.ceil(marqueeSize / contentSize) - 1;
    this.removeDuplicatedContent(hiddenElement);
    this.createDuplicationsInHiddenElement({
      ...params,
      fillingSpace: true,
      duplications,
    });
  }

  /**
   * Duplicate the content without filling the space.
   * @param params.hiddenElement - The hidden element to duplicate the content.
   * @param params.contentElement - The element that has the content to duplicate.
   */
  duplicateWithoutFillingSpace(params: {
    hiddenElement: Element;
    contentElement: Element;
  }): void {
    this.removeDuplicatedContent(params.hiddenElement);
    this.createDuplicationsInHiddenElement({
      ...params,
      fillingSpace: false,
    });
  }

  /**
   * Duplicate the content in the hidden element.
   * @param params.hiddenElement - The hidden element to duplicate the content.
   * @param params.contentElement - The element that has the content to duplicate.
   * @param params.fillingSpace - True if the content is filling the space, false otherwise.
   * @param params.duplications - The number of duplications to create.
   */
  createDuplicationsInHiddenElement(params: {
    hiddenElement: Element;
    contentElement: Element;
    fillingSpace: boolean;
    duplications?: number;
  }): void {
    const hiddenElement = params.hiddenElement;
    const contentElement = params.contentElement;
    let fragmentDuplicatedContent = this.cloneContent({
      contentElement,
    });

    if (params.fillingSpace) {
      fragmentDuplicatedContent = document.createDocumentFragment();
      for (let i = 0; i < (params.duplications || 0); i++) {
        fragmentDuplicatedContent = this.cloneContent({
          contentElement,
          documentFragment: fragmentDuplicatedContent,
        });
      }
    }
    requestAnimationFrame(() => {
      hiddenElement.appendChild(fragmentDuplicatedContent);
    });
  }

  /**
   * Clone the content of the provided element and retrieve it as a document fragment.
   * @param params.contentElement - The content element to clone.
   * @param @optional params.documentFragment - The document fragment to clone the content.
   * @returns A document fragment with the cloned content. If a document fragment is provided,
   * it will be retrieved with the corresponding clones.
   */
  cloneContent(params: {
    contentElement: Element;
    documentFragment?: DocumentFragment;
  }): DocumentFragment {
    const documentFragment = params.documentFragment;
    const fragmentDuplicatedContent =
      documentFragment || document.createDocumentFragment();

    const originalContentList = Array.from(params.contentElement.children);
    for (const originalContentItem of originalContentList) {
      const clone = originalContentItem.cloneNode(true);
      fragmentDuplicatedContent.appendChild(clone);
    }

    return fragmentDuplicatedContent;
  }
}
