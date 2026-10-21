/* global document, innerWidth, getComputedStyle */
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const r = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium, webkit, expect } = r('@playwright/test');
const results = [];
const evidence = resolve(process.argv[4] ?? '.cache/calendar-docs');
await mkdir(evidence, { recursive: true });
for (const [name, type] of Object.entries({ chromium, webkit })) {
  const b = await type.launch();
  const p = await b.newPage({ viewport: { width: 320, height: 844 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(process.argv[3] ?? 'http://127.0.0.1:4327/docs/calendar/');
  await p.getByRole('tab', { name: 'Code', exact: true }).click();
  await p
    .locator('astro-island[component-export="CalendarUsageDemo"] [role=application]')
    .waitFor();
  await p.evaluate(() => document.fonts.ready);
  for (const width of [320, 360, 375, 390, 414, 768, 1280]) {
    await p.setViewportSize({ width, height: 844 });
    const data = await p.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      roots: [...document.querySelectorAll('[role=application]')].map((e) => ({
        width: e.getBoundingClientRect().width,
        header: e.querySelector('header h2').clientWidth,
        headerScroll: e.querySelector('header h2').scrollWidth,
        headerFont: getComputedStyle(e.querySelector('header h2')).fontSize,
      })),
      hydrated: [
        ...document.querySelectorAll('astro-island[component-url*=CalendarExamples]'),
      ].every((e) => !e.hasAttribute('ssr')),
    }));
    console.log(`${name}: docs ${width}px`);
    assert.ok(data.scroll <= width, `docs overflow ${name}/${width}`);
    assert.ok(data.hydrated, 'all examples hydrate');
    for (const root of data.roots) {
      assert.ok(root.width <= 318.1, 'Calendar retains Figma width');
      assert.ok(
        root.headerScroll <= root.header + 1,
        'Month label wraps without overlapping controls',
      );
      assert.ok(
        parseFloat(root.headerFont) <= 17,
        'Prose does not override Calendar heading typography',
      );
    }
    results.push({ engine: name, ...data });
    if ([320, 390, 1280].includes(width)) {
      await p
        .locator('astro-island[component-export="CalendarUsageDemo"]')
        .scrollIntoViewIfNeeded();
      await p.screenshot({ path: `${evidence}/docs-${name}-${width}.png` });
    }
  }
  await p.setViewportSize({ width: 390, height: 844 });
  const state = p.getByRole('button', { name: 'State: Constrained', exact: true });
  await state.scrollIntoViewIfNeeded();
  await state.click();
  await p.getByRole('menuitem', { name: 'Disabled', exact: true }).click();
  await expect(p.locator('div[data-docs-preview-code="calendar-state-disabled"]')).toBeVisible();
  const code = await p
    .locator('div[data-docs-preview-code="calendar-state-disabled"]')
    .evaluate(
      (e) => e.closest('.docs-example')?.querySelector('.docs-code-block pre')?.textContent,
    );
  assert.ok(code?.includes('isDisabled'), 'Displayed code follows the selected state');
  const lang = p.getByRole('button', { name: 'Language: Dhivehi', exact: true });
  await lang.click();
  await p.getByRole('menuitem', { name: 'English', exact: true }).click();
  await expect(p.locator('div[data-docs-preview-code="calendar-language-en"]')).toBeVisible();
  assert.deepEqual(errors, []);
  await b.close();
}
await writeFile(`${evidence}/docs-results.json`, JSON.stringify(results, null, 2));
