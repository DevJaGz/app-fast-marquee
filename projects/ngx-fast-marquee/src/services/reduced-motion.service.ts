import { DOCUMENT } from '@angular/common';
import { Injectable, Inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReducedMotionService {
  constructor(@Inject(DOCUMENT) private _document: Document) {}

  /**
   * Check if the system has reduced motion.
   * @returns True if the system has reduced motion, false otherwise.
   */
  hasSystemReducedMotion(): boolean {
    const { defaultView } = this._document;
    return (
      defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ??
      false
    );
  }
}
