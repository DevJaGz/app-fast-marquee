import { createReducedMotionSource, REDUCED_MOTION_MEDIA_QUERY } from './reduced-motion';

describe('createReducedMotionSource', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  afterEach(() => {
    if (originalMatchMedia !== undefined) {
      window.matchMedia = originalMatchMedia;
    } else {
      delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;
    }
  });

  it('degrades to no reduced motion when matchMedia is absent', () => {
    originalMatchMedia = window.matchMedia;
    delete (window as { matchMedia?: typeof window.matchMedia }).matchMedia;

    const onChange = jasmine.createSpy('onChange');
    const source = createReducedMotionSource(onChange);

    expect(source.matches()).toBe(false);
    expect(() => source.dispose()).not.toThrow();
  });

  it('reflects the stubbed media query, notifies on change, and disposes cleanly', () => {
    originalMatchMedia = window.matchMedia;

    let capturedListener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQueryList = {
      matches: false,
      addEventListener: jasmine
        .createSpy('addEventListener')
        .and.callFake((type: string, listener: (event: MediaQueryListEvent) => void) => {
          if (type === 'change') capturedListener = listener;
        }),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    };
    window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue(mediaQueryList);

    const onChange = jasmine.createSpy('onChange');
    const source = createReducedMotionSource(onChange);

    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_MEDIA_QUERY);
    expect(source.matches()).toBe(false);

    capturedListener?.({ matches: true } as MediaQueryListEvent);
    expect(onChange).toHaveBeenCalledWith(true);

    source.dispose();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', capturedListener);
  });
});
