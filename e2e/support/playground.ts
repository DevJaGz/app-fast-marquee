import { Locator, Page } from '@playwright/test';

import { PLAYGROUND_APP_URL } from './servers';

/**
 * Query params accepted by the `playground` fixture (`e2e/fixtures/playground/`). All marquee
 * inputs mirror `NgxFastMarqueeComponent`'s own names/defaults; the rest configure the fixture's
 * fixed content and container geometry.
 */
export interface PlaygroundParams {
  direction?: 'left' | 'right' | 'up' | 'down';
  speed?: number | 'slow' | 'medium' | 'fast';
  useSystemReducedMotion?: boolean;
  autoFill?: boolean;
  maskStartPercentage?: number;
  maskEndPercentage?: number;
  maskPercentage?: number;
  play?: boolean;
  pauseOnHover?: boolean;
  pauseOnClick?: boolean;
  itemCount?: number;
  itemWidth?: number;
  itemHeight?: number;
  containerWidth?: number;
  containerHeight?: number;
}

export function playgroundUrl(params: PlaygroundParams = {}): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return `${PLAYGROUND_APP_URL}/${query ? `?${query}` : ''}`;
}

/**
 * Navigates to the playground with the given params and waits for the fixture (past the root
 * app's own `@defer (on timer(2000ms))` shell) to render, then gives the marquee's own
 * asynchronous initial measure/fill cycle a moment to settle so displacement sampling doesn't
 * straddle the one-time initial layout jump.
 */
export async function gotoPlayground(page: Page, params: PlaygroundParams = {}): Promise<void> {
  await page.goto(playgroundUrl(params));
  await page.locator('[data-testid="playground-container"]').waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(500);
}

/** The first (non-duplicated) projected item — the stable target for bounding-box assertions. */
export function marqueeTarget(page: Page): Locator {
  return page.locator('[data-testid="marquee-item"]').first();
}

/** The `<ngx-fast-marquee>` host element — the mask (`mask-image`) is resolved on this element. */
export function marqueeHost(page: Page): Locator {
  return page.locator('.playground-marquee');
}

/** Reads the `(mounted)` output's DOM counter. */
export async function getMountedCount(page: Page): Promise<number> {
  return Number(await page.locator('[data-testid="mounted-count"]').textContent());
}

/** Reads the `(updated)` output's DOM counter. */
export async function getUpdatedCount(page: Page): Promise<number> {
  return Number(await page.locator('[data-testid="updated-count"]').textContent());
}

export interface Displacement {
  dx: number;
  dy: number;
  /** The actual wall-clock time (ms) elapsed between the two samples — see `sampleDisplacement`. */
  elapsedMs: number;
}

/**
 * Samples a locator's bounding-box displacement over `sampleMs`. `elapsedMs` reflects the actual
 * measured time between samples (rather than the requested `sampleMs`) so callers deriving a rate
 * aren't thrown off by `waitForTimeout`/round-trip overhead, which can vary across browser engines.
 */
export async function sampleDisplacement(target: Locator, sampleMs = 400): Promise<Displacement> {
  const start = await target.boundingBox();
  const startTime = Date.now();
  await target.page().waitForTimeout(sampleMs);
  const end = await target.boundingBox();
  const elapsedMs = Date.now() - startTime;
  if (!start || !end) {
    throw new Error('Bounding box unavailable for displacement sampling.');
  }
  return { dx: end.x - start.x, dy: end.y - start.y, elapsedMs };
}

/** Reads the resolved `mask-image` (falling back to the WebKit-prefixed property). */
export async function getMaskImage(target: Locator): Promise<string> {
  return target.evaluate(element => {
    const style = getComputedStyle(element);
    const maskImage = style.maskImage;
    return maskImage && maskImage !== 'none'
      ? maskImage
      : (style as unknown as { webkitMaskImage: string }).webkitMaskImage;
  });
}

/** Extracts the percentage color-stop offsets from a `mask-image` linear-gradient. */
export function extractMaskStopPercentages(maskImage: string): number[] {
  return (maskImage.match(/-?[\d.]+%/g) ?? []).map(value => parseFloat(value));
}

/** Extracts the gradient angle (in degrees) from a `mask-image` linear-gradient. */
export function extractMaskAngleDeg(maskImage: string): number | undefined {
  const match = maskImage.match(/(-?[\d.]+)deg/);
  return match ? parseFloat(match[1]) : undefined;
}

export type Axis = 'x' | 'y';

/** The `[start, end]` extent (in the given axis) of every rendered projected item, including auto-fill duplicates. */
export async function getItemIntervals(page: Page, axis: Axis): Promise<Array<[number, number]>> {
  const boxes = await page.locator('[data-testid="marquee-item"]').evaluateAll(
    (elements, evaluateAxis) =>
      elements.map(element => {
        const rect = element.getBoundingClientRect();
        return { start: evaluateAxis === 'x' ? rect.x : rect.y, size: evaluateAxis === 'x' ? rect.width : rect.height };
      }),
    axis
  );
  return boxes.map(({ start, size }) => [start, start + size]);
}

/** True when the (possibly overlapping/unordered) intervals cover `[rangeStart, rangeEnd]` with no gap. */
export function hasFullCoverage(
  intervals: Array<[number, number]>,
  rangeStart: number,
  rangeEnd: number,
  epsilon = 1.5
): boolean {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  let covered = rangeStart;
  for (const [start, end] of sorted) {
    if (start > covered + epsilon) break;
    covered = Math.max(covered, end);
    if (covered >= rangeEnd - epsilon) return true;
  }
  return covered >= rangeEnd - epsilon;
}
