import { DestroyRef, inject, Injectable, DOCUMENT, signal, Signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReducedMotionService {
  private readonly _document = inject(DOCUMENT);
  private readonly _destroyRef = inject(DestroyRef);

  /**
   * Live signal for the system `prefers-reduced-motion` preference. Backed by a `matchMedia`
   * `change` listener so OS-level toggles are reflected without re-creating the component.
   */
  private readonly _reducedMotion = signal(this._readSystemReducedMotion());
  readonly reducedMotion: Signal<boolean> = this._reducedMotion.asReadonly();

  constructor() {
    const mediaQueryList = this._matchReducedMotionMedia();
    if (!mediaQueryList) return;

    const onChange = (event: MediaQueryListEvent): void => this._reducedMotion.set(event.matches);
    mediaQueryList.addEventListener('change', onChange);
    this._destroyRef.onDestroy(() => mediaQueryList.removeEventListener('change', onChange));
  }

  /**
   * Check if the system has reduced motion.
   * @returns True if the system has reduced motion, false otherwise.
   */
  hasSystemReducedMotion(): boolean {
    return this._reducedMotion();
  }

  private _readSystemReducedMotion(): boolean {
    return this._matchReducedMotionMedia()?.matches ?? false;
  }

  /**
   * `matchMedia` is absent in some test/SSR-adjacent DOM implementations (e.g. jsdom); guard so
   * the service degrades to "no reduced motion" instead of throwing.
   */
  private _matchReducedMotionMedia(): MediaQueryList | undefined {
    const { defaultView } = this._document;
    if (typeof defaultView?.matchMedia !== 'function') return undefined;
    return defaultView.matchMedia('(prefers-reduced-motion: reduce)');
  }
}
