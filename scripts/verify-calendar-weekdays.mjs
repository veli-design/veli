/* global document, getComputedStyle */
/** Check only Calendar weekday visibility at and below its design width. */
import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium, webkit } = require('@playwright/test');
const results = [];
const base = process.argv[3] ?? 'http://127.0.0.1:6034';
const evidence = resolve(process.argv[4] ?? '.cache/calendar-weekdays');
await mkdir(evidence, { recursive: true });
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const language of ['dv', 'en'])
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
        await page.goto(
          `${base}/iframe.html?id=components-calendar--responsive&viewMode=story&veli-language=${language}&veli-theme=${theme}`,
        );
        await page.getByRole('grid').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        for (const width of [390, 350, 349, 320, 280]) {
          await page.setViewportSize({ width, height: 844 });
          const measured = await page.locator('thead:has(abbr)').evaluateAll((rows) =>
            rows.map((row) => ({
              headers: [...row.querySelectorAll('th:has(abbr)')].map((th) => {
                const a = th.querySelector('abbr');
                const r = a.getBoundingClientRect();
                const range = document.createRange();
                range.selectNodeContents(a);
                const t = range.getBoundingClientRect();
                return {
                  text: a.textContent,
                  cellWidth: th.getBoundingClientRect().width,
                  labelWidth: r.width,
                  textWidth: t.width,
                  overflow: getComputedStyle(a).overflowX,
                  cellOverflow: getComputedStyle(th).overflowX,
                  textOverflow: getComputedStyle(a).textOverflow,
                  ariaLabel: a.getAttribute('aria-label'),
                  title: a.title,
                };
              }),
            })),
          );
          for (const row of measured) {
            assert.equal(row.headers.length, 7);
            for (const h of row.headers) {
              assert.equal(h.overflow, h.cellWidth >= 43.99 ? 'visible' : 'hidden');
              assert.equal(h.textOverflow, h.cellWidth >= 43.99 ? 'clip' : 'ellipsis');
              if (language === 'dv') {
                assert.ok(h.ariaLabel);
                assert.equal(h.title, h.ariaLabel);
              }
            }
          }
          results.push({ engine, language, theme, width, measured });
          if (language === 'dv' && theme === 'light')
            await page.screenshot({
              path: resolve(evidence, `${engine}-${width}.png`),
              fullPage: true,
            });
        }
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
await writeFile(resolve(evidence, 'measurements.json'), JSON.stringify(results, null, 2));
console.log(
  `Passed ${results.length} focused weekday cases in Chromium/WebKit, EN/DV, light/dark.`,
);
