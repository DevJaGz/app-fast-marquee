import { APP_INITIALIZER, ValueProvider } from '@angular/core';
import { provideFastMarquee } from './fast-marquee.providers';
import { ensureIdleCallbackFallback } from '../utils/idle-callback-compat.util';

describe('provideFastMarquee', () => {
  it('returns an APP_INITIALIZER multi-provider backed by ensureIdleCallbackFallback', () => {
    const providers = provideFastMarquee();

    expect(providers.length).toBe(1);
    const provider = providers[0] as ValueProvider;
    expect(provider.provide).toBe(APP_INITIALIZER);
    expect(provider.multi).toBeTrue();
    expect(provider.useValue).toBe(ensureIdleCallbackFallback);
  });
});
