import { NUMBER_OF_ITEMS_CSS_PROPERTY } from './animation';
import { appendClones, pruneClones, resolveDuplicateCount } from './duplication';
import { axisOf, measureSizeAlongAxis } from './measurement';
import { EngineConfig } from './types';

export interface MarqueeEngineOptions {
  /** Marquee host element (the container whose extent must be covered). */
  host: HTMLElement;
  /** Inner track element holding the projected content and its clones. */
  inner: HTMLElement;
  /** Reads the current input snapshot at the start of each cycle (batched read phase). */
  getConfig(): EngineConfig;
  /** Receives the track size along the scroll axis (px) measured at the end of each cycle. */
  onMeasured(sizeInPx: number): void;
  /** Fires once per committed cycle whose layout signature differs from the previous cycle. */
  onUpdated(): void;
}

const DEFAULT_RESIZE_DEBOUNCE_MS = 50;

function defaultScheduleFlush(flush: () => void): () => void {
  if (typeof requestAnimationFrame === 'function') {
    const handle = requestAnimationFrame(() => flush());
    return () => cancelAnimationFrame(handle);
  }
  const handle = setTimeout(flush, 0);
  return () => clearTimeout(handle);
}

/**
 * Orchestrates the marquee's imperative work: `requestReplan()` coalesces triggers into a single
 * scheduled cycle of batched reads (input snapshot, rect measurements) followed by writes
 * (prune-then-duplicate clones, item-count custom property). Content changes are observed with a
 * MutationObserver (suspended during the engine's own writes so they never self-trigger) and host
 * resizes with a debounced ResizeObserver. The initial cycle prunes any pre-existing clones first,
 * making it idempotent for hydration and `@defer` re-entry.
 */
export class MarqueeEngine {
  private _cancelScheduledFlush: (() => void) | null = null;
  private _contentObserver: MutationObserver | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _resizeSettleHandle: ReturnType<typeof setTimeout> | null = null;
  private _lastCommittedSignature: string | null = null;
  private _forceUpdatedOnNextCycle = false;
  private _destroyed = false;

  constructor(private readonly _options: MarqueeEngineOptions) {}

  /** Starts the observers and schedules the initial prune-then-duplicate cycle. */
  start(): void {
    this._observeContent();
    this._observeResize();
    this.requestReplan();
  }

  /** Marks the engine dirty; at most one cycle is scheduled at a time. */
  requestReplan(options?: { forceUpdated?: boolean }): void {
    if (this._destroyed) return;
    if (options?.forceUpdated) this._forceUpdatedOnNextCycle = true;
    if (this._cancelScheduledFlush !== null) return;
    this._cancelScheduledFlush = defaultScheduleFlush(() => {
      this._cancelScheduledFlush = null;
      this._runCycle();
    });
  }

  /** Disconnects the observers and cancels any pending work. */
  destroy(): void {
    this._destroyed = true;
    this._cancelScheduledFlush?.();
    this._cancelScheduledFlush = null;
    if (this._resizeSettleHandle !== null) clearTimeout(this._resizeSettleHandle);
    this._resizeSettleHandle = null;
    this._contentObserver?.disconnect();
    this._contentObserver = null;
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _runCycle(): void {
    if (this._destroyed) return;
    const { host, inner, getConfig, onMeasured, onUpdated } = this._options;
    const config = getConfig();
    const axis = axisOf(config.direction);
    const containerSize = measureSizeAlongAxis(host, axis);
    const shouldFill = config.animated && config.autoFill;
    // The engine's own DOM writes must not re-trigger the content observer.
    this._contentObserver?.disconnect();
    try {
      pruneClones(inner);
      if (shouldFill) {
        const contentSize = measureSizeAlongAxis(inner, axis);
        appendClones(inner, resolveDuplicateCount(containerSize, contentSize));
      }
      const measuredSize = measureSizeAlongAxis(inner, axis);
      inner.style.setProperty(NUMBER_OF_ITEMS_CSS_PROPERTY, String(shouldFill ? inner.children.length : 0));
      onMeasured(measuredSize);
      const signature = [
        config.direction,
        config.autoFill,
        config.animated,
        Math.round(containerSize),
        Math.round(measuredSize),
        inner.children.length,
      ].join('|');
      if (signature !== this._lastCommittedSignature || this._forceUpdatedOnNextCycle) {
        this._lastCommittedSignature = signature;
        onUpdated();
      }
      this._forceUpdatedOnNextCycle = false;
    } finally {
      this._observeContent();
    }
  }

  private _observeContent(): void {
    if (this._destroyed || typeof MutationObserver !== 'function') return;
    this._contentObserver ??= new MutationObserver(() => this.requestReplan());
    this._contentObserver.observe(this._options.inner, { childList: true, subtree: true, characterData: true });
  }

  private _observeResize(): void {
    // Absent ResizeObserver simply means no resize reaction; an adapter may drive requestReplan() itself.
    if (typeof ResizeObserver !== 'function') return;
    this._resizeObserver = new ResizeObserver(() => this._scheduleSettledReplan());
    this._resizeObserver.observe(this._options.host);
  }

  private _scheduleSettledReplan(): void {
    if (this._resizeSettleHandle !== null) clearTimeout(this._resizeSettleHandle);
    this._resizeSettleHandle = setTimeout(() => {
      this._resizeSettleHandle = null;
      this.requestReplan();
    }, DEFAULT_RESIZE_DEBOUNCE_MS);
  }
}
