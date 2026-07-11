import { expect, test } from '@playwright/test';

import { getMountedCount, getUpdatedCount, gotoPlayground } from '../support/playground';

const GEOMETRY = { itemCount: 3, itemWidth: 100, itemHeight: 60, containerWidth: 300 };

test.describe('marquee lifecycle outputs (F9, F10)', () => {
  test('mounted emits exactly once after init', async ({ page }) => {
    await gotoPlayground(page, { speed: 100, ...GEOMETRY });
    expect(await getMountedCount(page)).toBe(1);

    await page.waitForTimeout(1000);
    expect(await getMountedCount(page)).toBe(1);
  });

  test('updated does not increment while idle', async ({ page }) => {
    await gotoPlayground(page, { speed: 100, ...GEOMETRY });
    const baseline = await getUpdatedCount(page);

    await page.waitForTimeout(1000);
    expect(await getUpdatedCount(page)).toBe(baseline);
  });

  test('updated does not increment on pure-visual input changes', async ({ page }) => {
    await gotoPlayground(page, { speed: 100, ...GEOMETRY });
    const baseline = await getUpdatedCount(page);

    await page.locator('[data-testid="control-play"]').click();
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBe(baseline);

    await page.locator('[data-testid="control-mask-percentage"]').fill('30');
    await page.locator('[data-testid="control-mask-percentage"]').dispatchEvent('change');
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBe(baseline);

    await page.locator('[data-testid="control-pause-on-hover"]').click();
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBe(baseline);

    await page.locator('[data-testid="control-pause-on-click"]').click();
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBe(baseline);

    await page.locator('[data-testid="control-speed"]').fill('fast');
    await page.locator('[data-testid="control-speed"]').dispatchEvent('change');
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBe(baseline);
  });

  test('updated increments when content is added or removed', async ({ page }) => {
    await gotoPlayground(page, { speed: 100, ...GEOMETRY });
    const baseline = await getUpdatedCount(page);

    await page.locator('[data-testid="add-item-btn"]').click();
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBeGreaterThan(baseline);

    const afterAdd = await getUpdatedCount(page);
    await page.locator('[data-testid="remove-item-btn"]').click();
    await page.waitForTimeout(200);
    expect(await getUpdatedCount(page)).toBeGreaterThan(afterAdd);
  });

  test('updated increments after a settled viewport resize', async ({ page }) => {
    await gotoPlayground(page, { speed: 100, ...GEOMETRY });
    const baseline = await getUpdatedCount(page);

    const viewport = page.viewportSize();
    await page.setViewportSize({ width: (viewport?.width ?? 1280) - 200, height: viewport?.height ?? 720 });
    await page.waitForTimeout(500);

    expect(await getUpdatedCount(page)).toBeGreaterThan(baseline);
  });
});
