import { expect, test } from '@playwright/test';

import { gotoPlayground, marqueeTarget, sampleDisplacement } from '../support/playground';

const GEOMETRY = { itemCount: 3, itemWidth: 150, itemHeight: 60, containerWidth: 300 };
const SAMPLE_MS = 300;

test.describe('marquee speed (F2, F3)', () => {
  test('qualitative speed orders fast > medium > slow', async ({ page }) => {
    const displacementFor = async (speed: 'slow' | 'medium' | 'fast'): Promise<number> => {
      await gotoPlayground(page, { speed, ...GEOMETRY });
      const { dx } = await sampleDisplacement(marqueeTarget(page), SAMPLE_MS);
      return Math.abs(dx);
    };

    const slow = await displacementFor('slow');
    const medium = await displacementFor('medium');
    const fast = await displacementFor('fast');

    expect(fast).toBeGreaterThan(medium);
    expect(medium).toBeGreaterThan(slow);
  });

  test('a positive numeric speed sets the pixel-per-second rate', async ({ page }) => {
    const pixelsPerSecond = 200;
    await gotoPlayground(page, { speed: pixelsPerSecond, ...GEOMETRY });

    // A longer sampling window averages out one-off scheduling/paint jitter (most noticeable
    // under parallel test-worker load), keeping the measured rate a reliable proxy for the
    // animation's actual px/s regardless of engine/host timing variance.
    const { dx, elapsedMs } = await sampleDisplacement(marqueeTarget(page), 1000);
    const expectedDistance = pixelsPerSecond * (elapsedMs / 1000);

    expect(Math.abs(dx)).toBeGreaterThan(expectedDistance * 0.5);
    expect(Math.abs(dx)).toBeLessThan(expectedDistance * 1.5);
  });

  for (const speed of [0, -50]) {
    test(`numeric speed ${speed} produces no motion`, async ({ page }) => {
      await gotoPlayground(page, { speed, ...GEOMETRY });
      const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
      expect(dx).toBe(0);
      expect(dy).toBe(0);
    });
  }

  test('a numeric speed change after initialization re-rates motion', async ({ page }) => {
    // Content is sized generously relative to the post-change speed so a full loop still takes
    // much longer than the sampling window even at 600px/s — otherwise a sample could straddle
    // the looping animation's wrap-around point and report a misleadingly small displacement.
    const LARGE_GEOMETRY = { itemCount: 4, itemWidth: 800, itemHeight: 60, containerWidth: 300 };
    await gotoPlayground(page, { speed: 30, ...LARGE_GEOMETRY });

    const before = await sampleDisplacement(marqueeTarget(page), 500);

    await page.locator('[data-testid="control-speed"]').fill('600');
    await page.locator('[data-testid="control-speed"]').dispatchEvent('change');
    await page.waitForTimeout(200);

    const after = await sampleDisplacement(marqueeTarget(page), 500);

    expect(Math.abs(after.dx)).toBeGreaterThan(Math.abs(before.dx) * 2);
  });
});
