export const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

export interface ReducedMotionSource {
  matches(): boolean;
  dispose(): void;
}

/**
 * Live `prefers-reduced-motion` source: exposes the current match and reports changes through
 * `onChange` until disposed. matchMedia is absent in some test/SSR-adjacent DOM implementations
 * (e.g. jsdom), in which case the source degrades to "no reduced motion" instead of throwing.
 */
export function createReducedMotionSource(onChange: (matches: boolean) => void): ReducedMotionSource {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { matches: () => false, dispose: () => undefined };
  }
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
  const handleChange = (event: MediaQueryListEvent): void => onChange(event.matches);
  mediaQueryList.addEventListener('change', handleChange);
  return {
    matches: () => mediaQueryList.matches,
    dispose: () => mediaQueryList.removeEventListener('change', handleChange),
  };
}
