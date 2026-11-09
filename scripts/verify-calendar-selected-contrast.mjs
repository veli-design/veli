/* global getComputedStyle, document */
/** Verify selected current-month date text, endpoint fills, and Today indicators. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium, webkit, expect } = require('@playwright/test');
const base = process.argv[3] ?? 'http://127.0.0.1:6034';
const evidence = resolve(process.argv[4] ?? '.cache/calendar-contrast');
await mkdir(evidence, { recursive: true });
const results = [];
const errors = [];
const luminance = (rgb) =>
  rgb
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const values = [a, b]
    .map((c) =>
      luminance(
        c
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number),
      ),
    )
    .sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  try {
    for (const language of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({
          viewport: { width: 1000, height: 850 },
          timezoneId: 'UTC',
        });
        page.on('pageerror', (e) => errors.push(`${engine}/${language}/${theme}: ${e.message}`));
        await page.clock.setFixedTime(new Date('2026-10-22T12:00:00Z'));
        const open = async (story) => {
          await page.goto(
            `${base}/iframe.html?id=components-calendar--${story}&viewMode=story&veli-language=${language}&veli-theme=${theme}`,
          );
          await page.getByRole('grid').first().waitFor();
          await page.evaluate(() => document.fonts.ready);
          await expect(page.locator('[data-theme]').first()).toHaveAttribute('data-theme', theme);
        };
        const check = async (label) => {
          const cells = await page
            .locator('[role=button][data-selected]:not([data-disabled]):not([data-outside-month])')
            .evaluateAll((nodes) =>
              nodes
                .filter((e) =>
                  !e.hasAttribute('data-selection-start') && !e.hasAttribute('data-selection-end')
                    ? !e.closest('[role=application]')?.querySelector('[data-selection-start]')
                    : true,
                )
                .map((e) => {
                  const label = e.querySelector('span[lang=en]');
                  const rgb = (color) => {
                    const ctx = document.createElement('canvas').getContext('2d');
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, 1, 1);
                    return `rgb(${[...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).join(', ')})`;
                  };
                  let fill = label.parentElement;
                  while (getComputedStyle(fill).backgroundColor === 'rgba(0, 0, 0, 0)')
                    fill = fill.parentElement;
                  const dot = label.querySelector('[aria-hidden=true]');
                  const rect = fill.getBoundingClientRect();
                  const d = dot?.getBoundingClientRect();
                  return {
                    date: label.textContent,
                    color: rgb(getComputedStyle(label).color),
                    background: rgb(getComputedStyle(fill).backgroundColor),
                    radius: getComputedStyle(fill).borderRadius,
                    width: rect.width,
                    height: rect.height,
                    dot: dot
                      ? {
                          color: rgb(getComputedStyle(dot).backgroundColor),
                          width: d.width,
                          height: d.height,
                          top: d.top - rect.top,
                        }
                      : null,
                  };
                }),
            );
          assert.equal(
            cells.length,
            {
              'selected-today': 2,
              'range-start-today': 3,
              'range-end-today': 3,
              'invalid-selected': 2,
              'invalid-range-start-today': 5,
              'invalid-range-end-today': 5,
            }[label],
            `${label}: all selected cells and endpoints present`,
          );
          assert.ok(
            cells.some((c) => c.dot),
            `${label}: selected Today indicator present`,
          );
          for (const c of cells) {
            assert.equal(c.color, 'rgb(255, 255, 255)', `${label}: approved white foreground`);
            assert.ok(contrast(c.color, c.background) >= 4.5, `${label}: AA text contrast`);
            assert.equal(c.height, 44);
            assert.equal(c.width, 44);
            if (c.dot) {
              assert.equal(c.dot.color, 'rgb(255, 255, 255)');
              assert.deepEqual([c.dot.width, c.dot.height, c.dot.top], [4, 4, 34]);
            }
            c.contrast = contrast(c.color, c.background);
          }
          results.push({ engine, language, theme, label, cells });
          await page.screenshot({
            path: resolve(evidence, `${engine}-${language}-${theme}-${label}.png`),
            fullPage: true,
          });
        };
        await open('today-indicator-states');
        await check('selected-today');
        await page.clock.setFixedTime(new Date('2026-10-10T12:00:00Z'));
        await open('with-today-button');
        await check('range-start-today');
        await page.clock.setFixedTime(new Date('2026-10-18T12:00:00Z'));
        await open('with-today-button');
        await check('range-end-today');
        // Guard the existing Dhivehi direction behavior while touching selection styling.
        const single = page.getByRole('application', { name: /^Single date calendar(?:,|$)/ });
        const selected = single
          .locator('[role=button]:not([data-outside-month])')
          .filter({ hasText: /^18$/ });
        await selected.click();
        await selected.focus();
        await page.keyboard.press(language === 'dv' ? 'ArrowLeft' : 'ArrowRight');
        await page.keyboard.press('Enter');
        await expect(single.locator('[role=button][data-selected]')).toHaveText('19');
        await page.clock.setFixedTime(new Date('2026-10-01T12:00:00Z'));
        await open('validation-states');
        await check('invalid-selected');
        await page.clock.setFixedTime(new Date('2026-10-13T12:00:00Z'));
        await open('range-states');
        await check('invalid-range-start-today');
        await page.clock.setFixedTime(new Date('2026-10-20T12:00:00Z'));
        await open('range-states');
        await check('invalid-range-end-today');
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
assert.deepEqual(errors, []);
await writeFile(
  resolve(evidence, 'measurements.json'),
  JSON.stringify({ results, errors }, null, 2) + '\n',
);
console.log(
  `Passed ${results.length} scoped selection cases in Chromium/WebKit, EN/DV, light/dark.`,
);
