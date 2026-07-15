import { NUMBER_OF_ITEMS_CSS_PROPERTY } from './animation';
import { CLONE_MARKER_ATTRIBUTE } from './duplication';
import { MarqueeEngine } from './marquee-engine';
import { Direction } from './types';

function createHarness(options?: { direction?: Direction; autoFill?: boolean; animated?: boolean }) {
  const host = document.createElement('div');
  const inner = document.createElement('div');
  host.appendChild(inner);
  document.body.appendChild(host);
  host.getBoundingClientRect = () =>
    ({
      width: 400,
      height: 60,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 60,
      toJSON: () => ({}),
    } as DOMRect);
  inner.getBoundingClientRect = () =>
    ({
      width: 100,
      height: 60,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 100,
      bottom: 60,
      toJSON: () => ({}),
    } as DOMRect);
  const config = {
    direction: options?.direction ?? 'left',
    autoFill: options?.autoFill ?? true,
    animated: options?.animated ?? true,
  };
  const onMeasured = jasmine.createSpy('onMeasured');
  const onUpdated = jasmine.createSpy('onUpdated');
  const engine = new MarqueeEngine({
    host,
    inner,
    getConfig: () => ({ ...config }),
    onMeasured,
    onUpdated,
  });
  return { host, inner, config, engine, onMeasured, onUpdated };
}

/**
 * Waits for the engine's post-render flush, scheduled via `requestAnimationFrame`. Karma runs
 * this suite in a real Chrome instance (karma-chrome-launcher) rather than an emulated DOM, so
 * `requestAnimationFrame` is native and cannot be fake-timer-advanced — wait for a real frame,
 * then a macrotask, so the engine's own rAF callback has already committed.
 */
function flushScheduledCycle(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

/** Lets MutationObserver microtasks and any zero-delay timers settle. */
function settleObservers(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('MarqueeEngine', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('schedules one initial flush that fills clones, measures, and updates once', async () => {
    const { host, inner, engine, onMeasured, onUpdated } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();

    expect(onMeasured).not.toHaveBeenCalled();
    await flushScheduledCycle();

    expect(inner.children.length).toBeGreaterThan(2);
    for (let index = 2; index < inner.children.length; index++) {
      expect(inner.children[index].getAttribute(CLONE_MARKER_ATTRIBUTE)).toBe('true');
    }
    expect(onMeasured).toHaveBeenCalledWith(100);
    expect(onUpdated).toHaveBeenCalledTimes(1);

    engine.destroy();
    host.remove();
  });

  it('runs exactly one cycle per content mutation without self-triggering clone writes', async () => {
    const { host, inner, engine, onUpdated } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();
    await settleObservers();
    expect(onUpdated).toHaveBeenCalledTimes(1);

    inner.appendChild(document.createElement('div'));
    await settleObservers();

    expect(onUpdated).toHaveBeenCalledTimes(1);
    await flushScheduledCycle();
    expect(onUpdated).toHaveBeenCalledTimes(2);

    engine.destroy();
    host.remove();
  });

  it('does no work when idle after the initial cycle settles', async () => {
    const { host, inner, engine, onUpdated } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();
    await settleObservers();
    await settleObservers();
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(onUpdated).toHaveBeenCalledTimes(1);

    engine.destroy();
    host.remove();
  });

  it('coalesces duplicate requestReplan calls into a single pending flush', async () => {
    const { host, inner, engine, onMeasured } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();
    onMeasured.calls.reset();

    engine.requestReplan();
    engine.requestReplan();

    expect(onMeasured).not.toHaveBeenCalled();
    await flushScheduledCycle();
    expect(onMeasured).toHaveBeenCalledTimes(1);

    engine.destroy();
    host.remove();
  });

  it('deduplicates onUpdated when the committed layout signature is unchanged', async () => {
    const { host, inner, engine, onMeasured, onUpdated } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();
    engine.requestReplan();
    await flushScheduledCycle();

    expect(onMeasured).toHaveBeenCalledTimes(2);
    expect(onUpdated).toHaveBeenCalledTimes(1);

    engine.destroy();
    host.remove();
  });

  it('prunes and does not fill when animated is false', async () => {
    const { host, inner, engine } = createHarness({ animated: false });
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();

    expect(inner.children.length).toBe(2);
    expect(inner.children[0].getAttribute(CLONE_MARKER_ATTRIBUTE)).toBeNull();
    expect(inner.children[1].getAttribute(CLONE_MARKER_ATTRIBUTE)).toBeNull();
    expect(inner.style.getPropertyValue(NUMBER_OF_ITEMS_CSS_PROPERTY)).toBe('0');

    engine.destroy();
    host.remove();
  });

  it('does not fill when autoFill is false', async () => {
    const { host, inner, engine } = createHarness({ autoFill: false });
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();

    expect(inner.children.length).toBe(2);
    expect(inner.style.getPropertyValue(NUMBER_OF_ITEMS_CSS_PROPERTY)).toBe('0');

    engine.destroy();
    host.remove();
  });

  it('cancels pending work on destroy and ignores later mutations', async () => {
    const { host, inner, engine, onMeasured } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    expect(onMeasured).not.toHaveBeenCalled();
    engine.destroy();
    await flushScheduledCycle();
    expect(onMeasured).not.toHaveBeenCalled();

    inner.appendChild(document.createElement('div'));
    await settleObservers();
    await flushScheduledCycle();
    expect(onMeasured).not.toHaveBeenCalled();

    host.remove();
  });

  it('writes --_number-of-marquee-items equal to children length after a fill cycle', async () => {
    const { host, inner, engine } = createHarness();
    inner.appendChild(document.createElement('div'));
    inner.appendChild(document.createElement('div'));

    engine.start();
    await flushScheduledCycle();

    expect(inner.style.getPropertyValue(NUMBER_OF_ITEMS_CSS_PROPERTY)).toBe(String(inner.children.length));

    engine.destroy();
    host.remove();
  });
});
