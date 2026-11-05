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
  // Language boundaries must restore the complete role, including nested switches back.
  const mixed = await browser.newPage();
  await mixed.setContent(`<style>${css}</style>
    <main lang="dv" dir="rtl">
      <p id="dv" class="type-body-lg-regular">ޚިދުމަތް</p>
      <section lang="en" dir="ltr">
        <p id="en" class="type-body-lg-regular">Attestation service (2026)</p>
        <p id="dv-nested" lang="dv-MV" dir="rtl" class="type-body-lg-regular">ޚިދުމަތް</p>
      </section>
      <p id="en-direct" lang="en-GB" dir="ltr" class="type-body-lg-regular">Attestation service (2026)</p>
      <p class="type-body-lg-regular"><span id="en-inline" lang="en" dir="ltr" class="type-body-lg-regular">2635 with new guideline</span></p>
      <p class="type-body-lg-regular"><span id="en-inherited" lang="en" dir="ltr">English without its own role</span></p>
    </main>`);
  for (const dark of [false, true]) {
    await mixed.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark);
    const styles = await mixed.evaluate(() => {
      const result = {};
      for (const id of ['dv', 'en', 'dv-nested', 'en-direct', 'en-inline', 'en-inherited']) {
        const style = getComputedStyle(document.getElementById(id));
        result[id] = Object.fromEntries(
          ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'direction'].map(
            (property) => [property, style[property]],
          ),
        );
      }
      return result;
    });
    assert.match(styles.en.fontFamily, /Inter/);
    assert.equal(styles.en.fontSize, '18px');
    assert.equal(styles.en.lineHeight, '28px');
    assert.equal(styles.en.direction, 'ltr');
    assert.match(styles.dv.fontFamily, /Faseyha/);
    assert.equal(styles.dv.fontSize, '19px');
    assert.equal(styles.dv.lineHeight, '36px');
    assert.equal(styles.dv.direction, 'rtl');
    assert.deepEqual(styles['en-direct'], styles.en);
    assert.deepEqual(styles['en-inline'], styles.en);
    assert.deepEqual(styles['dv-nested'], styles.dv);
    // Native lang changes do not retroactively restyle a parent's applied role.
    assert.equal(styles['en-inherited'].fontFamily, styles.dv.fontFamily);
    assert.equal(styles['en-inherited'].fontSize, styles.dv.fontSize);
  }
  await mixed.close();
  console.log(
    'PASS mixed-language boundaries in Light and Dark: complete English/Dhivehi roles, regional language tags, inline isolation and inherited-role pitfall.',
  );
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
