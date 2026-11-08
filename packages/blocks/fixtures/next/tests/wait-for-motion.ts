import { expect, type Page } from '@playwright/test';

/** Sample final colors/geometry after finite transitions, without waiting on skeleton pulses. */
export async function waitForMotion(page: Page) {
  const backdrop = page.locator('.veli-sheet-backdrop');
  if (await backdrop.count()) await expect(backdrop).not.toHaveAttribute('data-entering');
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.timeline === document.timeline &&
            animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}

/** Real Chromium touch input exercises Sheet's browser-owned scroll/swipe behavior. */
export async function swipeSheet(page: Page, selector: string, distance: number, cancel = false) {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error('Missing Sheet grabber');
  const client = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  try {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y + (distance * step) / 10 }],
      });
      await page.waitForTimeout(20);
    }
    await client.send('Input.dispatchTouchEvent', {
      type: cancel ? 'touchCancel' : 'touchEnd',
      touchPoints: [],
    });
  } finally {
    await client.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await client.detach();
  }
}
