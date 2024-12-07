import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxFastMarqueeDuplicationHelper } from './ngx-fast-marquee-duplication.helper';
import { Direction } from '../../types';
import { NgxFastMarqueeLayoutHelper } from './ngx-fast-marquee-layout.helper';

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
   * Helper to manage layout of the marquee.
   */
  #layoutHelper = inject(NgxFastMarqueeLayoutHelper);

  /**
   * Debounce timer to avoid multiple resize events.
   */
  #onResizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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
  duplicateItems(params: {
    marqueeElement: HTMLElement;
    innerElement: HTMLElement;
    isAutoFill: boolean;
    isOverflowing: boolean;
  }): void {
    if (params.isAutoFill) {
      this.#duplicationHelper.duplicateFillingSpace(
        params.marqueeElement,
        params.innerElement,
      );
      return;
    }
    this.#duplicationHelper.duplicateWithoutFillingSpace(params.innerElement);
  }

  isContentOverflowing(params: {
    marqueeElement: HTMLElement;
    innerElement: HTMLElement;
    direction: Direction;
  }): boolean {
    return this.#layoutHelper.isContentOverflowing(params);
  }
}
