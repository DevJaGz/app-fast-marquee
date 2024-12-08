import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NgxFastMarqueeDuplicationHelper } from './ngx-fast-marquee-duplication.helper';
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
   * True if the current application is running on the server, false otherwise.
   */
  get isPlatformServer(): boolean {
    return isPlatformServer(this.#platformId);
  }
}
