import { expect, test } from '@playwright/test';

import { gotoPlayground, marqueeTarget, sampleDisplacement } from '../support/playground';

/**
 * F1 (Scroll Direction) + F6 (Play State): a numeric `speed` keeps motion deterministic regardless
 * of item count. The content/container are sized generously relative to the speed so a full loop
 * takes much longer than the sampling window — otherwise a sample could straddle the looping
 * animation's wrap-around point and report a misleading net displacement sign.
 */
const SPEED = 80;
const GEOMETRY = { itemCount: 4, itemWidth: 500, itemHeight: 500, containerWidth: 300, containerHeight: 300 };

test.describe('marquee direction and play state (F1, F6)', () => {
  test('default direction scrolls left', async ({ page }) => {
    await gotoPlayground(page, { speed: SPEED, ...GEOMETRY });
    const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
    expect(dx).toBeLessThan(-5);
    expect(Math.abs(dy)).toBeLessThan(2);
  });

  for (const { direction, expectAxis, expectSign } of [
    { direction: 'left', expectAxis: 'x', expectSign: -1 },
    { direction: 'right', expectAxis: 'x', expectSign: 1 },
    { direction: 'up', expectAxis: 'y', expectSign: -1 },
    { direction: 'down', expectAxis: 'y', expectSign: 1 },
  ] as const) {
    test(`direction "${direction}" scrolls along the ${expectAxis} axis with the correct sign`, async ({ page }) => {
      await gotoPlayground(page, { direction, speed: SPEED, ...GEOMETRY });
      const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
      const [moved, fixed] = expectAxis === 'x' ? [dx, dy] : [dy, dx];
      expect(Math.sign(moved)).toBe(expectSign);
      expect(Math.abs(moved)).toBeGreaterThan(5);
      expect(Math.abs(fixed)).toBeLessThan(2);
    });
  }

  test('direction change after initialization applies live', async ({ page }) => {
    await gotoPlayground(page, { direction: 'left', speed: SPEED, ...GEOMETRY });

    const before = await sampleDisplacement(marqueeTarget(page));
    expect(before.dx).toBeLessThan(-5);

    await page.locator('[data-testid="control-direction"]').selectOption('up');
    await page.waitForTimeout(500);

    const after = await sampleDisplacement(marqueeTarget(page));
    expect(after.dy).toBeLessThan(-5);
    expect(Math.abs(after.dx)).toBeLessThan(2);
  });

  test('play=false freezes motion and toggling play resumes it', async ({ page }) => {
    await gotoPlayground(page, { play: false, speed: SPEED, ...GEOMETRY });

    const frozen = await sampleDisplacement(marqueeTarget(page));
    expect(frozen.dx).toBe(0);
    expect(frozen.dy).toBe(0);

    await page.locator('[data-testid="control-play"]').check();
    await page.waitForTimeout(200);

    const resumed = await sampleDisplacement(marqueeTarget(page));
    expect(resumed.dx).toBeLessThan(-5);
  });
});
