import { expect, test } from '@playwright/test';

import { getItemIntervals, gotoPlayground, hasFullCoverage } from '../support/playground';

const SPEED = 300;

async function expectContainerFullyCovered(page: import('@playwright/test').Page): Promise<void> {
  const container = await page.locator('[data-testid="playground-container"]').boundingBox();
  if (!container) throw new Error('Container bounding box unavailable.');
  const intervals = await getItemIntervals(page, 'x');
  expect(hasFullCoverage(intervals, container.x, container.x + container.width)).toBe(true);
}

test.describe('marquee responsive re-measure (F12)', () => {
  test('adding content after init re-fills the container seamlessly', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 1,
      itemWidth: 60,
      itemHeight: 60,
      containerWidth: 400,
    });
    await expectContainerFullyCovered(page);

    await page.locator('[data-testid="add-item-btn"]').click();
    await page.waitForTimeout(300);
    await expectContainerFullyCovered(page);
  });

  test('removing content after init re-fills the container seamlessly', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 4,
      itemWidth: 60,
      itemHeight: 60,
      containerWidth: 400,
    });
    await expectContainerFullyCovered(page);

    await page.locator('[data-testid="remove-item-btn"]').click();
    await page.waitForTimeout(300);
    await expectContainerFullyCovered(page);
  });

  test('a viewport resize re-fills to cover the new size after settling', async ({ page }) => {
    // `containerWidth` exceeds the viewport, so the fixture's `max-width: 100%` clamps the
    // rendered container to the viewport itself — shrinking the viewport genuinely resizes it.
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 2,
      itemWidth: 80,
      itemHeight: 60,
      containerWidth: 3000,
    });
    await expectContainerFullyCovered(page);

    const before = await page.locator('[data-testid="playground-container"]').boundingBox();
    if (!before) throw new Error('Container bounding box unavailable.');

    await page.setViewportSize({ width: 600, height: 720 });
    await page.waitForTimeout(500);

    const after = await page.locator('[data-testid="playground-container"]').boundingBox();
    if (!after) throw new Error('Container bounding box unavailable.');
    expect(after.width).toBeLessThan(before.width);

    await expectContainerFullyCovered(page);
  });
});
