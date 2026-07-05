import { Injectable, inject, DOCUMENT } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReducedMotionService {
  private readonly _document = inject(DOCUMENT);

  /**
   * Check if the system has reduced motion.
   * @returns True if the system has reduced motion, false otherwise.
   */
  hasSystemReducedMotion(): boolean {
    const { defaultView } = this._document;
    return defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
