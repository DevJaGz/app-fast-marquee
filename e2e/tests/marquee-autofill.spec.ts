import { expect, test } from '@playwright/test';

import { getItemIntervals, gotoPlayground, hasFullCoverage } from '../support/playground';

const SPEED = 300;

test.describe('marquee auto-fill (F4)', () => {
  test('fills the container with no leading-edge gap, and keeps covering it across a cycle', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 2,
      itemWidth: 80,
      itemHeight: 60,
      containerWidth: 400,
    });

    const container = await page.locator('[data-testid="playground-container"]').boundingBox();
    if (!container) throw new Error('Container bounding box unavailable.');

    // Auto-fill must duplicate the 2 authored items enough times to cover the 400px container.
    expect(await page.locator('[data-testid="marquee-item"]').count()).toBeGreaterThan(2);

    for (let sample = 0; sample < 5; sample++) {
      const intervals = await getItemIntervals(page, 'x');
      expect(hasFullCoverage(intervals, container.x, container.x + container.width)).toBe(true);
      await page.waitForTimeout(150);
    }
  });

  test('autoFill=false renders content at its intrinsic size (no duplicates)', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: false,
      speed: SPEED,
      itemCount: 3,
      itemWidth: 80,
      itemHeight: 60,
      containerWidth: 400,
    });

    expect(await page.locator('[data-testid="marquee-item"]').count()).toBe(3);
  });

  test('content wider than the container still loops seamlessly', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 1,
      itemWidth: 600,
      itemHeight: 60,
      containerWidth: 200,
    });

    const container = await page.locator('[data-testid="playground-container"]').boundingBox();
    if (!container) throw new Error('Container bounding box unavailable.');

    for (let sample = 0; sample < 5; sample++) {
      const intervals = await getItemIntervals(page, 'x');
      expect(hasFullCoverage(intervals, container.x, container.x + container.width)).toBe(true);
      await page.waitForTimeout(150);
    }
  });

  test('a single item does not error and still renders', async ({ page }) => {
    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 1,
      itemWidth: 80,
      itemHeight: 60,
      containerWidth: 400,
    });

    await expect(page.locator('[data-testid="playground-container"]')).toBeVisible();
    expect(await page.locator('[data-testid="marquee-item"]').count()).toBeGreaterThan(0);
  });

  test('empty content does not error', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await gotoPlayground(page, {
      autoFill: true,
      speed: SPEED,
      itemCount: 0,
      containerWidth: 400,
    });

    await expect(page.locator('[data-testid="playground-container"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
