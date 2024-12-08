import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgxFastMarqueeDuplicationHelper {
  removeDuplicatedContent(hiddenElement: Element): void {
    hiddenElement.innerHTML = '';
  }

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
