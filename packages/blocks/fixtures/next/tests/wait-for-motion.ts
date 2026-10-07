import type { Page } from '@playwright/test';

/** Sample final colors/geometry after finite transitions, without waiting on skeleton pulses. */
export async function waitForMotion(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
}
