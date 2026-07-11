import { expect, test } from '@playwright/test';

import { gotoPlayground, marqueeHost, marqueeTarget, sampleDisplacement } from '../support/playground';

const SPEED = 150;
const GEOMETRY = { itemCount: 3, itemWidth: 100, itemHeight: 60, containerWidth: 300 };

test.describe('marquee interaction pause (F7)', () => {
  test('pauseOnHover freezes motion while hovering and resumes after', async ({ page }) => {
    await gotoPlayground(page, { pauseOnHover: true, speed: SPEED, ...GEOMETRY });

    await marqueeHost(page).hover();
    await page.waitForTimeout(100);
    const whileHovering = await sampleDisplacement(marqueeTarget(page));
    expect(whileHovering.dx).toBe(0);
    expect(whileHovering.dy).toBe(0);

    await page.mouse.move(0, 0);
    await page.waitForTimeout(100);
    const afterHover = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(afterHover.dx) + Math.abs(afterHover.dy)).toBeGreaterThan(0);
  });

  test('hover has no effect when pauseOnHover is disabled', async ({ page }) => {
    await gotoPlayground(page, { pauseOnHover: false, speed: SPEED, ...GEOMETRY });

    await marqueeHost(page).hover();
    const whileHovering = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(whileHovering.dx) + Math.abs(whileHovering.dy)).toBeGreaterThan(0);
  });

  test('pauseOnClick freezes motion while pressed and resumes on release', async ({ page }) => {
    await gotoPlayground(page, { pauseOnClick: true, speed: SPEED, ...GEOMETRY });

    const box = await marqueeHost(page).boundingBox();
    if (!box) throw new Error('Marquee host bounding box unavailable.');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);

    const whilePressed = await sampleDisplacement(marqueeTarget(page));
    expect(whilePressed.dx).toBe(0);
    expect(whilePressed.dy).toBe(0);

    await page.mouse.up();
    await page.waitForTimeout(100);
    const afterRelease = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(afterRelease.dx) + Math.abs(afterRelease.dy)).toBeGreaterThan(0);
  });

  test('press has no effect when pauseOnClick is disabled', async ({ page }) => {
    await gotoPlayground(page, { pauseOnClick: false, speed: SPEED, ...GEOMETRY });

    const box = await marqueeHost(page).boundingBox();
    if (!box) throw new Error('Marquee host bounding box unavailable.');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    const whilePressed = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(whilePressed.dx) + Math.abs(whilePressed.dy)).toBeGreaterThan(0);

    await page.mouse.up();
  });
});
