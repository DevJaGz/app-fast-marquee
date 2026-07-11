import { expect, test } from '@playwright/test';

import { gotoPlayground, marqueeTarget, sampleDisplacement } from '../support/playground';

const SPEED = 150;
const GEOMETRY = { itemCount: 3, itemWidth: 100, itemHeight: 60, containerWidth: 300 };

test.describe('marquee reduced motion (F8)', () => {
  test('is opt-in: system reduced motion has no effect when useSystemReducedMotion is false', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoPlayground(page, { useSystemReducedMotion: false, speed: SPEED, ...GEOMETRY });

    const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(dx) + Math.abs(dy)).toBeGreaterThan(0);
  });

  test('freezes motion when useSystemReducedMotion is true and the system prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoPlayground(page, { useSystemReducedMotion: true, speed: SPEED, ...GEOMETRY });

    const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  test('moves normally when useSystemReducedMotion is true but the system has no preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await gotoPlayground(page, { useSystemReducedMotion: true, speed: SPEED, ...GEOMETRY });

    const { dx, dy } = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(dx) + Math.abs(dy)).toBeGreaterThan(0);
  });

  test('honors a live OS-level toggle without re-creating the component', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await gotoPlayground(page, { useSystemReducedMotion: true, speed: SPEED, ...GEOMETRY });

    const moving = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(moving.dx) + Math.abs(moving.dy)).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    const frozen = await sampleDisplacement(marqueeTarget(page));
    expect(frozen.dx).toBe(0);
    expect(frozen.dy).toBe(0);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const resumed = await sampleDisplacement(marqueeTarget(page));
    expect(Math.abs(resumed.dx) + Math.abs(resumed.dy)).toBeGreaterThan(0);
  });
});
