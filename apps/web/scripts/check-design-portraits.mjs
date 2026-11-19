/* global process, URL, document, innerWidth, console */

// Compare the real production /design page with the four PD-1417 portrait frames.
// node apps/web/scripts/check-design-portraits.mjs <base URL> <Playwright fixture directory>
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const [origin, fixture] = process.argv.slice(2);
if (!origin || !fixture)
  throw new Error('Supply a local site URL and Playwright fixture directory');
const { chromium } = createRequire(resolve(fixture, 'package.json'))('playwright');
const browser = await chromium.launch();
const plates = ['.design-atoll', '.design-crystalline', '.design-motion-demo', '.design-thaana'];
try {
  for (const [width, motion] of [
    [430, 'reduce'],
    [430, 'no-preference'],
    [320, 'no-preference'],
    [1512, 'no-preference'],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      reducedMotion: motion,
      hasTouch: width < 761,
    });
    const errors = [],
      requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (req) => {
      if (req.url().includes('/animations/design/')) requests.push(req.url());
    });
    await page.goto(new URL('/design/', origin).href);
    await page.evaluate(() => document.fonts.ready);
    const sizes = [];
    for (const selector of plates) {
      const plate = page.locator(selector);
      await plate.scrollIntoViewIfNeeded();
      sizes.push(await plate.boundingBox());
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      'page overflow',
    );
    if (width === 430)
      assert.deepEqual(
        sizes.map((b) => [Math.round(b.width), Math.round(b.height)]),
        [
          [390, 1100],
          [390, 1399],
          [390, 680],
          [390, 886],
        ],
      );
    if (width === 1512)
      assert.deepEqual(
        sizes.map((b) => [Math.round(b.width), Math.round(b.height)]),
        [
          [1349, 720],
          [1349, 846],
          [1352, 672],
          [1349, 720],
        ],
      );
    const portrait = page.locator('.design-thaana-portrait');
    assert.equal(await portrait.isVisible(), width < 761);
    if (motion === 'reduce') {
      assert.equal(requests.length, 0, 'stills should not fetch preview data');
      assert.equal(await portrait.locator('[tabindex="0"]').count(), 0);
    } else {
      await page.waitForSelector('[data-design-preview-ready="true"]', { state: 'attached' });
      const pill = page.locator('[data-a="move:p3"]');
      await page.locator('.design-motion-demo').scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        document.querySelector('[data-a="move:p3"]')?.hasAttribute('transform'),
      );
      const previous = await pill.getAttribute('transform');
      await page.waitForFunction(
        (prev) => document.querySelector('[data-a="move:p3"]')?.getAttribute('transform') !== prev,
        previous,
      );
      if (width < 761) {
        const letter = portrait.locator('[data-letter]').first();
        await letter.tap();
        assert.equal(await letter.getAttribute('aria-pressed'), 'true');
        await letter.focus();
        await page.keyboard.press('Space');
        assert.equal(await letter.getAttribute('aria-pressed'), 'false');
        await page.keyboard.press('ArrowLeft');
        assert.equal(await portrait.locator('[data-letter]:focus').count(), 1);
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log('Passed ' + width + 'px / ' + motion);
  }
} finally {
  await browser.close();
}
