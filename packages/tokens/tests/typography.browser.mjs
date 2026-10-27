/* global document, getComputedStyle */
// Run after the token build: node tests/typography.browser.mjs /path/to/playwright/runtime
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { entries } from '../lib/normalize.mjs';
import { readJSON, root } from '../lib/pipeline.mjs';

const { chromium } = createRequire(resolve(process.argv[2], 'package.json'))('@playwright/test');
const { compile } = createRequire(new URL('../../../apps/storybook/package.json', import.meta.url))(
  'tailwindcss',
);
const raw = new Map(entries(await readJSON('src/figma.tokens.json')));
const canonical = await readJSON('dist/tokens.json');
const sourceValue = (value) =>
  typeof value === 'string' && value.startsWith('{')
    ? sourceValue(raw.get(value.slice(1, -1)).$value)
    : value;
const cases = entries(canonical.typography).map(([id, token]) => {
  const source = raw.get(token.$extensions['org.veli'].source).$value;
  return {
    utility: id.startsWith('dv.')
      ? `type-dv-${id.slice(3).replaceAll('.', '-')}`
      : token.$extensions['org.veli'].utility,
    size: sourceValue(source.fontSize).value,
    height: sourceValue(source.lineHeight).value,
  };
});
for (const [size, token] of Object.entries(canonical.text))
  cases.push({
    utility: `text-${size}`,
    size: sourceValue(token['font-size'].$value).value,
    height: sourceValue(token['line-height'].$value).value,
  });
// Exercise the automatic English-to-Dhivehi utility branch as well as explicit DV utilities.
cases.push({ utility: 'type-body-lg-regular', lang: 'dv', size: 19, height: 36 });
const tokensCSS = await readFile(new URL('dist/tokens.css', root), 'utf8');
const theme = await readFile(new URL('dist/tailwind-theme.css', root), 'utf8');
const compiler = await compile(
  theme.replace("@import './tokens.css';", '') + '\n@tailwind utilities;',
);
const css = tokensCSS + '\n' + compiler.build(cases.map(({ utility }) => utility));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(
    `<style>${css}</style>` +
      cases
        .map(
          ({ utility, lang }, i) =>
            `<div id="case-${i}" class="${utility}" lang="${lang ?? 'en'}">Text<span style="font-size:9px">Child</span></div>`,
        )
        .join(''),
  );
  for (const dark of [false, true]) {
    await page.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark);
    const measurements = await page.evaluate(() =>
      [...document.querySelectorAll('[id^="case-"]')].map((element) => ({
        size: getComputedStyle(element).fontSize,
        line: getComputedStyle(element).lineHeight,
        childSize: getComputedStyle(element.firstElementChild).fontSize,
        childLine: getComputedStyle(element.firstElementChild).lineHeight,
      })),
    );
    for (const [i, expected] of cases.entries()) {
      assert.deepEqual(
        measurements[i],
        {
          size: `${expected.size}px`,
          line: `${expected.height}px`,
          childSize: '9px',
          childLine: `${expected.height}px`,
        },
        `${expected.utility} dark=${dark}`,
      );
    }
  }
  // A consumer font-size override must also leave the Figma pixel line-height unchanged.
  const overridden = await page.evaluate(() => {
    const element = document.querySelector('.type-body-lg-regular');
    element.style.fontSize = '40px';
    return { size: getComputedStyle(element).fontSize, line: getComputedStyle(element).lineHeight };
  });
  assert.deepEqual(overridden, { size: '40px', line: '28px' });
  console.log(
    `PASS ${cases.length} typography/text routes in Light and Dark: Figma pixel measurements, fixed child inheritance, and font-size override.`,
  );
} finally {
  await browser.close();
}
