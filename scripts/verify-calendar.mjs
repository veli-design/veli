/* global document, innerWidth, getComputedStyle */
/** Run against a built Storybook: node scripts/verify-calendar.mjs RUNTIME_DIR URL EVIDENCE_DIR. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const runtime = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium, webkit, expect } = runtime('@playwright/test');
const { default: AxeBuilder } = runtime('@axe-core/playwright');
const base = process.argv[3] ?? 'http://127.0.0.1:6027';
const evidence = resolve(process.argv[4] ?? '.cache/calendar-audit');
await mkdir(evidence, { recursive: true });
const results = [];
const errors = [];
const accessibilityFindings = [];
const localeData = {};
const url = (story, language, theme) =>
  `${base}/iframe.html?id=components-calendar--${story}&viewMode=story&veli-language=${language}&veli-theme=${theme}`;

async function checkAccessibility(page, violations, label) {
  for (const violation of violations) {
    assert.equal(
      violation.id,
      'color-contrast',
      `Unexpected accessibility failure: ${label}/${violation.id}`,
    );
    for (const node of violation.nodes) {
      const state = await page.locator(node.target[0]).evaluate((e) => ({
        disabled: Boolean(e.closest('[data-disabled], [aria-disabled="true"]')),
        outsideMonth: Boolean(e.closest('[data-outside-month]')),
      }));
      if (state.disabled || state.outsideMonth) continue;
      assert.fail(`Unexpected active date contrast failure: ${label}/${node.target}`);
    }
  }
}

async function layout(page) {
  return page.evaluate(() => {
    const rect = (e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right };
    };
    return {
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      grids: [...document.querySelectorAll('[role=grid]')].map((grid) => ({
        ...rect(grid),
        headers: grid.querySelectorAll('th').length,
        cells: [...grid.querySelectorAll('[role=button]')].map(rect),
      })),
    };
  });
}
async function open(page, story = 'responsive', language = 'en', theme = 'light') {
  await page.goto(url(story, language, theme));
  await page.locator('[role=grid]').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.querySelector('[data-theme]'));
}
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  localeData[engine] = await page.evaluate(() => {
    const locale = new Intl.Locale('dv-MV').maximize();
    return {
      maximized: locale.toString(),
      textInfo: locale.getTextInfo?.() ?? locale.textInfo,
      month: new Intl.DateTimeFormat('dv-MV', { month: 'long', year: 'numeric' }).format(
        new Date(2026, 9, 18),
      ),
    };
  });
  console.log(`${engine} native Dhivehi locale: ${JSON.stringify(localeData[engine])}`);
  page.on('pageerror', (e) => errors.push(`${engine}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${engine}: ${m.text()}`);
  });
  try {
    for (const language of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        console.log(`${engine}: ${language}/${theme}`);
        await open(page, 'responsive', language, theme);
        for (const width of [320, 360, 375, 390, 414, 768, 1280, 844]) {
          await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
          const measured = await layout(page);
          assert.ok(
            measured.scrollWidth <= width,
            `${engine}/${language}/${theme}/${width}: page overflow`,
          );
          assert.equal(measured.grids.length, 2);
          for (const grid of measured.grids) {
            assert.equal(grid.headers, 7);
            assert.ok(grid.x >= 0 && grid.right <= width, 'grid stays within viewport');
            for (const cell of grid.cells) {
              assert.ok(
                cell.width >= 24 && cell.height >= 44,
                `day target ${cell.width}×${cell.height}`,
              );
              if (width >= 360)
                assert.ok(cell.width >= 43.9, 'full-size day target where space permits');
            }
          }
          results.push({ engine, language, theme, width, ...measured });
          if ([320, 390, 844, 1280].includes(width))
            await page.screenshot({
              path: `${evidence}/${engine}-${language}-${theme}-${width}.png`,
              fullPage: true,
            });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        const single = page.getByRole('application', { name: /^Mobile single date/ });
        const range = page.getByRole('application', { name: /^Mobile date range/ });
        const day = (root, n) =>
          root
            .locator('[role=grid] [role=button]:not([data-outside-month])')
            .filter({ hasText: new RegExp(`^${n}$`) });
        await day(single, 18).tap();
        await expect(page.getByTestId('single-value')).toHaveText('2026-10-18');
        await day(range, 14).tap();
        await day(range, 22).tap();
        await expect(page.getByTestId('range-value')).toHaveText('2026-10-14 – 2026-10-22');
        const selected = single.locator('[role=button][data-selected]');
        await selected.focus();
        await page.keyboard.press(language === 'dv' ? 'ArrowLeft' : 'ArrowRight');
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('single-value')).toHaveText('2026-10-19');
        const next = single.getByRole('button', {
          name: language === 'en' ? 'Next month' : 'ދެން އޮތް މަސް',
          exact: true,
        });
        await next.tap();
        await expect(single.locator('header h2')).toHaveText(
          language === 'en' ? 'November' : 'ނޮވެމްބަރު',
        );
        const year = single.getByRole('button', {
          name: language === 'en' ? 'Year' : 'އަހަރު',
          exact: true,
        });
        await year.tap();
        await page.getByRole('listbox').waitFor();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await expect(page.getByRole('listbox')).toHaveCount(0);
        await expect(year).toBeFocused();
        await year.tap();
        await page.getByRole('listbox').evaluate((e) => (e.scrollTop = e.scrollHeight));
        assert.ok(
          (await page.getByRole('listbox').evaluate((e) => e.scrollTop)) > 0,
          'year list scrolls',
        );
        await page.keyboard.press('Escape');
        await expect(year).toBeFocused();
        for (const index of [0, 1]) {
          await page
            .getByRole('button', {
              name: language === 'en' ? /^Open calendar/ : /^ކަލަންޑަރު ހުޅުވާ/,
              exact: true,
            })
            .nth(index)
            .tap();
          const dialog = page.getByRole('dialog');
          await dialog.waitFor();
          const box = await dialog.boundingBox();
          assert.ok(box.x >= 0 && box.x + box.width <= 391, 'picker stays in viewport');
          await page.touchscreen.tap(2, 2);
          await expect(dialog).toHaveCount(0);
          await page
            .getByRole('button', {
              name: language === 'en' ? /^Open calendar/ : /^ކަލަންޑަރު ހުޅުވާ/,
            })
            .nth(index)
            .tap();
          await dialog
            .locator('[role=grid] [role=button]:not([data-outside-month])')
            .filter({ hasText: /^18$/ })
            .tap();
          await expect(dialog).toHaveCount(0);
          const segments = await page
            .getByRole('group', {
              name: index === 0 ? 'Start-edge picker' : 'End-edge picker',
              exact: true,
            })
            .getByRole('spinbutton')
            .allTextContents();
          assert.ok(segments.includes('18'), 'DatePicker selects the tapped date');
        }
        const axe = await new AxeBuilder({ page })
          .include('[data-testid="responsive-calendars"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        await writeFile(
          `${evidence}/${engine}-${language}-${theme}-axe.json`,
          JSON.stringify(axe.violations, null, 2),
        );
        await checkAccessibility(page, axe.violations, `${engine}/${language}/${theme}`);
      }
    for (const story of [
      'six-week-month',
      'range-states',
      'validation-states',
      'disabled-and-read-only',
      'constraints-and-unavailable-dates',
      'weekday-and-week-start',
      'customization',
      'today-outside-allowed-window',
    ]) {
      await open(page, story);
      assert.ok((await layout(page)).scrollWidth <= 390, `${story}: mobile overflow`);
      await page.screenshot({ path: `${evidence}/${engine}-${story}.png`, fullPage: true });
      if (story === 'six-week-month')
        await expect(page.getByRole('grid').first().getByRole('gridcell')).toHaveCount(42);
      if (story === 'range-states') {
        const disabled = page.getByRole('application', { name: /^Disabled range/ });
        await expect(disabled.getByRole('button', { name: 'Year', exact: true })).toBeDisabled();
      }
      if (story === 'today-outside-allowed-window')
        await expect(page.getByRole('button', { name: 'Today', exact: true })).toBeDisabled();
    }
    for (const language of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        for (const story of ['six-week-month', 'range-states', 'validation-states']) {
          await page.setViewportSize({ width: 320, height: 844 });
          await open(page, story, language, theme);
          assert.ok(
            (await layout(page)).scrollWidth <= 320,
            `${story}/${language}/${theme}: overflow`,
          );
          const messages = page.locator('[slot="errorMessage"]');
          for (const message of await messages.all()) {
            const id = await message.getAttribute('id');
            assert.ok(
              await page.locator(`[aria-describedby~="${id}"]`).count(),
              'selected date references error',
            );
            assert.ok(
              await message.evaluate((e) => e.scrollWidth <= e.clientWidth),
              'error message wraps',
            );
          }
          if (story !== 'six-week-month') {
            const axe = await new AxeBuilder({ page })
              .include('[role="application"]')
              // Inactive control labels are exempt from WCAG 1.4.3.
              .exclude('[role="application"][data-disabled] header h2')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze();
            await writeFile(
              `${evidence}/${engine}-${language}-${theme}-${story}-axe.json`,
              JSON.stringify(axe.violations, null, 2),
            );
            await checkAccessibility(
              page,
              axe.violations,
              `${engine}/${story}/${language}/${theme}`,
            );
          }
          await page.screenshot({
            path: `${evidence}/${engine}-${language}-${theme}-${story}-320.png`,
            fullPage: true,
          });
        }
      }
    await open(page, 'with-today-button');
    const currentDate = await page.evaluate(() =>
      new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date()),
    );
    for (const calendar of await page.getByRole('application').all()) {
      await calendar.getByRole('button', { name: 'Today', exact: true }).tap();
      const selected = calendar.locator('[role=button][data-selected]');
      assert.equal(await selected.count(), 1, 'Today selects a single date or a one-day range');
      assert.ok(
        (await selected.getAttribute('data-today')) !== null,
        `Today selects ${currentDate}`,
      );
    }
    await open(page, 'range-states');
    const readOnly = page.getByRole('application', { name: /^Read only range/ });
    const before = await readOnly.locator('[role=button][data-selected]').allTextContents();
    await readOnly
      .locator('[role=button]:not([data-outside-month])')
      .filter({ hasText: /^25$/ })
      .tap();
    await readOnly.getByRole('button', { name: 'Today', exact: true }).tap();
    assert.deepEqual(
      await readOnly.locator('[role=button][data-selected]').allTextContents(),
      before,
      'read-only cannot change selection',
    );
    await open(page, 'responsive', 'en', 'system');
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page
      .getByRole('application', { name: /^Mobile single date/ })
      .getByRole('button', { name: 'Year', exact: true })
      .tap();
    assert.equal(
      await page
        .getByRole('option')
        .first()
        .evaluate((e) => getComputedStyle(e).transitionProperty),
      'none',
    );
    await page.keyboard.press('Escape');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    // Reproduce WebKit/ICU builds whose native Dhivehi direction data is LTR.
    await page.addInitScript(() => {
      const native = Intl.Locale.prototype.getTextInfo;
      Object.defineProperty(Intl.Locale.prototype, 'getTextInfo', {
        configurable: true,
        value() {
          return this.language === 'dv' ? { direction: 'ltr' } : native.call(this);
        },
      });
    });
    await open(page, 'responsive', 'dv');
    for (const [name, output] of [
      ['Mobile single date', 'single-value'],
      ['Mobile date range', 'range-value'],
    ]) {
      const calendar = page.getByRole('application', { name: new RegExp(`^${name}`) });
      const eighteenth = calendar
        .locator('[role=grid] [role=button]:not([data-outside-month])')
        .filter({ hasText: /^18$/ });
      await eighteenth.tap();
      await eighteenth.focus();
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Enter');
      await expect(page.getByTestId(output)).toHaveText(
        output === 'single-value' ? '2026-10-19' : '2026-10-18 – 2026-10-19',
      );
      await page.keyboard.press('ArrowRight');
      await expect(eighteenth).toBeFocused();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  `${evidence}/results.json`,
  JSON.stringify({ results, errors, accessibilityFindings, localeData }, null, 2),
);
assert.deepEqual(errors, [], 'no browser console errors or uncaught exceptions');
console.log(
  `Passed ${results.length} layout cases plus touch, keyboard, year menu, DatePicker, themes, reduced motion, and axe checks in Chromium and WebKit. Evidence: ${evidence}`,
);
