/* global process, URL, document, innerWidth, console, getComputedStyle, MutationObserver, setTimeout, clearTimeout */

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
      isMobile: width < 761,
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
        await portrait.scrollIntoViewIfNeeded();
        if (width === 430) await checkAmbientCycle(portrait);
        const letter = portrait.locator('[data-letter][data-center="199.5 351"]');
        await letter.tap();
        assert.equal(await letter.getAttribute('aria-pressed'), 'true');
        assert.equal(
          await letter.evaluate((el) => getComputedStyle(el).outlineStyle),
          'none',
          'no magnified pointer focus ring',
        );
        assert.equal(await portrait.locator('[data-paint][transform]').count(), 0);
        await letter.focus();
        await page.keyboard.press('Space');
        assert.equal(await letter.getAttribute('aria-pressed'), 'false');
        await page.keyboard.press('ArrowLeft');
        assert.equal(await portrait.locator('[data-letter]:focus').count(), 1);
        const ring = portrait.locator('.design-thaana-focus');
        assert.equal(await ring.isVisible(), true);
        assert.deepEqual(
          await ring.evaluate((el) => [
            getComputedStyle(el).strokeWidth,
            getComputedStyle(el).vectorEffect,
            el.getAttribute('transform'),
          ]),
          ['2px', 'non-scaling-stroke', null],
        );
      } else {
        const desktop = page.locator('[data-design-svg="thaana"]');
        await desktop.scrollIntoViewIfNeeded();
        const idle = await desktop.evaluate(async (el) => {
          const records = [];
          const obs = new MutationObserver((batch) => records.push(...batch));
          obs.observe(el, { subtree: true, attributes: true, attributeFilter: ['transform'] });
          await new Promise((done) => setTimeout(done, 1600));
          obs.disconnect();
          return records.length;
        });
        assert.equal(idle, 0, 'desktop only blooms in response to interaction');
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log('Passed ' + width + 'px / ' + motion);
  }
} finally {
  await browser.close();
}

// Observe completed animation frames, not wall-clock timestamps. At a lower
// device frame rate the same sequence can take longer, without failing parity.
async function checkAmbientCycle(portrait) {
  const result = await portrait.evaluate(
    (el) =>
      new Promise((resolve, reject) => {
        const letters = [...el.querySelectorAll('[data-letter]')];
        const paint = [...el.querySelectorAll('[data-paint]')];
        let first,
          rested = false,
          finished = false;
        const observe = new MutationObserver(() => {
          const active = letters.filter((glyph) => glyph.hasAttribute('transform'));
          const movedPaint = paint.some((glyph) => glyph.hasAttribute('transform'));
          if (active.length > 1 || movedPaint) return finish(false);
          if (!active.length) {
            if (first) rested = true;
          } else if (!first) first = active[0];
          else if (rested) finish(active[0] !== first);
        });
        const timeout = setTimeout(() => finish(false), 15000);
        function finish(ok) {
          if (finished) return;
          finished = true;
          observe.disconnect();
          clearTimeout(timeout);
          if (ok) resolve(true);
          else
            reject(
              new Error(
                'Expected one small letter, full rest, then a different small letter; painted letters must stay still.',
              ),
            );
        }
        observe.observe(el, { subtree: true, attributes: true, attributeFilter: ['transform'] });
      }),
  );
  assert.equal(result, true);
}
