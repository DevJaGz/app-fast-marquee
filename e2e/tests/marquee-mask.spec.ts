import { expect, test } from '@playwright/test';

import {
  extractMaskAngleDeg,
  extractMaskStopPercentages,
  getMaskImage,
  gotoPlayground,
  marqueeHost,
} from '../support/playground';

const GEOMETRY = { itemCount: 3, itemWidth: 100, itemHeight: 60, containerWidth: 300 };
const TOLERANCE = 0;

test.describe('marquee mask (F5)', () => {
  test('no mask input resolves to fully-opaque edges (no fade)', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    const [start, end] = extractMaskStopPercentages(maskImage);
    expect(start).toBeCloseTo(0, 1);
    expect(end).toBeCloseTo(100, 1);
  });

  test('resolved mask is transparent at the faded edges and opaque at the center', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', maskPercentage: 40, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    expect(maskImage).toContain('rgba(0, 0, 0, 0)');
    expect(maskImage).toContain('rgb(255, 255, 255)');
  });

  test('maskPercentage is a symmetric shorthand fading both edges equally', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', maskPercentage: 40, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    const [start, end] = extractMaskStopPercentages(maskImage);
    expect(start).toBeCloseTo(20, TOLERANCE);
    expect(end).toBeCloseTo(80, TOLERANCE);
  });

  test('maskStartPercentage/maskEndPercentage fade each edge independently', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', maskStartPercentage: 20, maskEndPercentage: 60, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    const [start, end] = extractMaskStopPercentages(maskImage);
    expect(start).toBeCloseTo(10, TOLERANCE);
    expect(end).toBeCloseTo(70, TOLERANCE);
  });

  test('an explicit edge percentage overrides the shorthand for that edge only', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', maskPercentage: 40, maskStartPercentage: 10, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    const [start, end] = extractMaskStopPercentages(maskImage);
    // Start overridden to 10 (→ 5%); end falls back to the 40 shorthand (→ 80%).
    expect(start).toBeCloseTo(5, TOLERANCE);
    expect(end).toBeCloseTo(80, TOLERANCE);
  });

  test('the fade follows the scroll axis: horizontal direction fades along x', async ({ page }) => {
    await gotoPlayground(page, { direction: 'right', maskPercentage: 30, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    expect(extractMaskAngleDeg(maskImage)).toBe(90);
  });

  test('the fade follows the scroll axis: vertical direction fades along y', async ({ page }) => {
    await gotoPlayground(page, { direction: 'up', maskPercentage: 30, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    // A vertical (top-to-bottom) gradient is CSS's implicit default direction, so no angle is serialized.
    expect(extractMaskAngleDeg(maskImage)).toBeUndefined();
    const [start, end] = extractMaskStopPercentages(maskImage);
    expect(start).toBeCloseTo(15, TOLERANCE);
    expect(end).toBeCloseTo(85, TOLERANCE);
  });

  test('the mask still applies while the marquee is paused', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', maskPercentage: 30, play: false, ...GEOMETRY });
    const maskImage = await getMaskImage(marqueeHost(page));

    const [start, end] = extractMaskStopPercentages(maskImage);
    expect(start).toBeCloseTo(15, TOLERANCE);
    expect(end).toBeCloseTo(85, TOLERANCE);
  });
});
