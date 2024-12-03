import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxFastMarqueeDuplicationHelper } from './ngx-fast-marquee-duplication.helper';

@Injectable({ providedIn: 'root' })
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
   * True if the current application is running on the server, false otherwise.
   */
  get isPlatformServer(): boolean {
    return isPlatformServer(this.#platformId);
  }

  /**
   * Duplicate the items of the inner element.
   * @param innerElement - Element that contains the items.
   * @param isAutoFill - Whether to fill the marquee with duplicated items.
   */
  duplicateItems(
    marqueeElement: HTMLElement,
    innerElement: HTMLElement,
    isAutoFill: boolean,
  ): void {
    if (isAutoFill) {
      this.#duplicationHelper.duplicateUsingAutoFill(
        marqueeElement,
        innerElement,
      );
      return;
    }

    // Handle the case where the marquee should not fill
    // the avilable space with duplicated items, but it must animate the content.
    this.#duplicationHelper.duplicateWithoutAutoFill(innerElement);
  }
}
