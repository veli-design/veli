/* global document, innerWidth, getComputedStyle */
/** DatePicker Changelog and combined Today-state regression, using the isolated browser runtime. */
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium, webkit, expect } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const base = process.argv[3] ?? 'http://127.0.0.1:6029';
const evidence = resolve(process.argv[4] ?? '.cache/calendar-audit');
await mkdir(evidence, { recursive: true });
const results = [],
  errors = [],
  contrast = [];
const widths = [320, 360, 375, 390, 414, 768, 1280, 844];
const url = (component, story, language, theme) =>
  `${base}/iframe.html?id=components-${component}--${story}&viewMode=story&veli-language=${language}&veli-theme=${theme}`;
async function open(page, component, story, language, theme) {
  await page.goto(url(component, story, language, theme));
  await page.getByRole('spinbutton').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function matchesToken(locator, token, property = 'color') {
  const colors = await locator.evaluate(
    (e, { token, property }) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      probe.style.display = 'none';
      e.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return { actual: getComputedStyle(e)[property], expected };
    },
    { token, property },
  );
  await expect(locator).toHaveCSS(
    property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`),
    colors.expected,
  );
}
for (const [engine, type] of Object.entries({ chromium, webkit })) {
  const browser = await type.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    timezoneId: 'UTC',
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date('2026-10-22T12:00:00Z'));
  page.on('pageerror', (e) => errors.push(`${engine}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${engine}: ${m.text()}`);
  });
  try {
    for (const language of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        console.log(`${engine}: DatePicker ${language}/${theme}`);
        const triggerName = language === 'dv' ? /^ކަލަންޑަރު ހުޅުވާ/ : /^Open calendar/;
        await open(page, 'datepicker', 'state-matrix', language, theme);
        await expect(page.locator('[data-testid^="picker-"]')).toHaveCount(30);
        for (const width of widths) {
          await page.setViewportSize({ width, height: width === 844 ? 390 : 844 });
          const measurements = await page.evaluate(() => ({
            width: innerWidth,
            scroll: document.documentElement.scrollWidth,
            fields: [...document.querySelectorAll('[data-testid^="picker-"]')].map((tile) => {
              const group = tile.querySelector('[role=group]');
              const rect = group.getBoundingClientRect();
              return {
                id: tile.dataset.testid,
                x: rect.x,
                right: rect.right,
                height: rect.height,
                radius: getComputedStyle(group).borderRadius,
              };
            }),
          }));
          assert.ok(
            measurements.scroll <= width,
            `DatePicker overflow: ${engine}/${language}/${theme}/${width}`,
          );
          for (const field of measurements.fields) {
            assert.ok(field.x >= 0 && field.right <= width, `${field.id}: field stays in viewport`);
            const size = field.id.split('-')[2];
            assert.equal(
              field.height,
              { sm: 36, md: 44, lg: 52 }[size],
              `${field.id}: fixed field height`,
            );
            assert.equal(field.radius, '10px', `${field.id}: Figma field radius`);
          }
          results.push({ engine, language, theme, ...measurements });
          if ([320, 390].includes(width))
            await page.screenshot({
              path: `${evidence}/datepicker-${engine}-${language}-${theme}-${width}.png`,
              fullPage: true,
            });
          if ([320, 844].includes(width)) {
            const trigger = page
              .getByTestId('picker-default-md-filled')
              .getByRole('button', { name: triggerName, exact: true });
            await trigger.tap();
            const dialog = page.getByRole('dialog');
            await dialog.waitFor();
            const box = await dialog.locator('..').boundingBox();
            assert.ok(
              box.x >= 0 && box.x + box.width <= width,
              'popover stays in viewport at narrow/landscape sizes',
            );
            await expect(dialog.locator('th')).toHaveCount(7);
            await page.keyboard.press('Escape');
            await expect(trigger).toBeFocused();
          }
        }
        await page.setViewportSize({ width: 390, height: 844 });
        const disabled = page.getByTestId('picker-default-md-disabled');
        await expect(
          disabled.getByRole('button', { name: triggerName, exact: true }),
        ).toBeDisabled();
        await matchesToken(
          disabled.getByText(language === 'dv' ? 'އެޕޮއިންޓްމަންޓް ތާރީޚު' : 'Appointment date', {
            exact: true,
          }),
          '--veli-color-text-base-muted',
        );
        await matchesToken(disabled.locator('[slot=description]'), '--veli-color-text-disabled');
        await matchesToken(
          disabled.getByText('*', { exact: true }),
          '--veli-color-text-danger-muted',
        );
        const readOnly = page.getByTestId('picker-default-md-read-only');
        await expect(
          readOnly.getByRole('button', { name: triggerName, exact: true }),
        ).toBeDisabled();
        const filled = page.getByTestId('picker-default-md-filled');
        assert.deepEqual(
          await filled
            .getByRole('spinbutton')
            .evaluateAll((es) => es.map((e) => ({ type: e.dataset.type, text: e.textContent }))),
          [
            { type: 'day', text: '15' },
            { type: 'month', text: '10' },
            { type: 'year', text: '2026' },
          ],
          'English/Dhivehi fields keep Latin day/month/year segments across engines',
        );
        const helperId = await filled.locator('[slot=description]').getAttribute('id');
        assert.ok(
          (await filled.getByRole('group').getAttribute('aria-describedby'))
            .split(' ')
            .includes(helperId),
          'helper stays associated with date field',
        );

        await matchesToken(filled.locator('[slot=description]'), '--veli-color-text-base-muted');
        const svg = filled.getByRole('button', { name: triggerName, exact: true }).locator('svg');
        assert.equal((await svg.boundingBox()).width, 20, 'calendar icon is 20 px');
        for (const appearance of ['default', 'outline']) {
          const tile = page.getByTestId(`picker-${appearance}-md-filled`);
          const segment = tile.getByRole('spinbutton').first();
          await segment.scrollIntoViewIfNeeded();
          await segment.hover();
          await page.keyboard.press('Tab');
          await segment.focus();
          await expect(segment).toHaveAttribute('data-focus-visible', 'true');
          const trigger = tile.getByRole('button', { name: triggerName, exact: true });
          await trigger.tap();
          const dialog = page.getByRole('dialog');
          await dialog.waitFor();
          const box = await dialog.locator('..').boundingBox();
          assert.equal(box.width, 316, 'DatePicker uses the Figma 316 px calendar');
          assert.equal(
            box.height,
            language === 'dv' ? 352 : 336,
            'Figma header/weekday/footer geometry',
          );
          const day = dialog
            .locator('[role=grid] [role=button]:not([data-outside-month])')
            .filter({ hasText: /^18$/ });
          assert.equal((await day.boundingBox()).width, 44, 'full-size embedded day target');
          await page.screenshot({
            path: `${evidence}/datepicker-popover-${engine}-${language}-${theme}-${appearance}.png`,
          });
          await day.tap();
          await expect(dialog).toHaveCount(0);
          await expect(trigger).toBeFocused();
        }
        const axe = await new AxeBuilder({ page })
          .include('[data-testid="date-picker-changelog"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        await writeFile(
          `${evidence}/datepicker-${engine}-${language}-${theme}-axe.json`,
          JSON.stringify(axe.violations, null, 2),
        );
        for (const violation of axe.violations) {
          assert.equal(
            violation.id,
            'color-contrast',
            `unexpected DatePicker accessibility violation: ${violation.id}`,
          );
          for (const node of violation.nodes) {
            const state = await page.locator(node.target[0]).evaluate((e) => ({
              disabled: Boolean(e.closest('[data-disabled], [aria-disabled=true]')),
              placeholder: Boolean(e.closest('[data-placeholder]')),
              optional: ['Optional', 'އިޚްތިޔާރީ'].includes(e.textContent.trim()),
            }));
            if (state.disabled) continue;
            assert.ok(
              state.placeholder || state.optional,
              `Unexpected active DatePicker contrast finding: ${node.target}`,
            );
            contrast.push({
              engine,
              language,
              theme,
              target: node.target,
              summary: node.failureSummary,
            });
          }
        }
        await open(page, 'datepicker', 'constraints-and-today', language, theme);
        const trigger = page.getByRole('button', { name: triggerName, exact: true });
        await trigger.tap();
        const dialog = page.getByRole('dialog');
        const day = (n) =>
          dialog
            .locator('[role=grid] [role=button]:not([data-outside-month])')
            .filter({ hasText: new RegExp(`^${n}$`) });
        await expect(day(11)).toHaveAttribute('aria-disabled', 'true');
        await expect(day(16)).toHaveAttribute('aria-disabled', 'true');
        await day(18).tap();
        await expect(dialog).toBeVisible();
        await expect(page.locator('input[name=appointment][type=text]')).toHaveValue('2026-10-18');
        await dialog
          .getByRole('button', { name: language === 'dv' ? 'މިއަދު' : 'Today', exact: true })
          .tap();
        await expect(page.locator('input[name=appointment][type=text]')).toHaveValue('2026-10-22');
        const dot = day(22).locator('[aria-hidden=true]');
        await matchesToken(dot, '--veli-color-text-primary-inverted', 'backgroundColor');
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await page.goto(url('calendar', 'today-indicator-states', language, theme));
        await page.getByRole('grid').first().waitFor();
        for (const [name, token] of [
          ['Today unselected', '--veli-color-calendar-day-selected'],
          ['Today selected', '--veli-color-text-primary-inverted'],
          ['Today selected in range', '--veli-color-text-primary-inverted'],
        ]) {
          const root = page.getByRole('application', { name: new RegExp(`^${name}(?:,|$)`) });
          const today = root.locator('[role=button][data-today]');
          const indicator = today.locator('[aria-hidden=true]');
          await matchesToken(indicator, token, 'backgroundColor');
          const position = await indicator.evaluate((e) => {
            const cell = e.closest('[role=button]').getBoundingClientRect();
            const dot = e.getBoundingClientRect();
            return { top: dot.top - cell.top, width: dot.width, height: dot.height };
          });
          assert.equal(position.top, 34, 'Today indicator sits 34 px from top');
          assert.equal(position.width, 4);
          assert.equal(position.height, 4);
        }
        await page.screenshot({
          path: `${evidence}/today-indicators-${engine}-${language}-${theme}.png`,
          fullPage: true,
        });
      }
    const desktop = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      timezoneId: 'UTC',
    });
    const desktopPage = await desktop.newPage();
    desktopPage.on('pageerror', (e) => errors.push(`${engine}/desktop: ${e.message}`));
    for (const language of ['en', 'dv'])
      for (const theme of ['light', 'dark']) {
        await open(desktopPage, 'datepicker', 'state-matrix', language, theme);
        for (const appearance of ['default', 'outline'])
          for (const size of ['sm', 'md', 'lg']) {
            const tile = desktopPage.getByTestId(`picker-${appearance}-${size}-filled`);
            const field = tile.getByRole('group');
            const segment = tile.getByRole('spinbutton').first();
            await segment.scrollIntoViewIfNeeded();
            await matchesToken(segment, '--veli-color-text-base-strong');
            const invalidSegment = desktopPage
              .getByTestId(`picker-${appearance}-${size}-invalid`)
              .getByRole('spinbutton')
              .first();
            await matchesToken(invalidSegment, '--veli-color-text-base-strong');
            await matchesToken(
              field,
              appearance === 'outline'
                ? '--veli-color-text-input-bg-hover'
                : '--veli-color-text-input-bg-default',
              'backgroundColor',
            );
            await segment.hover();
            await matchesToken(field, '--veli-color-text-input-bg-hover', 'backgroundColor');
            await desktopPage.keyboard.press('Tab');
            await segment.focus();
            await expect(segment).toHaveAttribute('data-focus-visible', 'true');
            await matchesToken(field, '--veli-color-text-input-bg-pressed', 'backgroundColor');
            const trigger = tile.getByRole('button', {
              name: language === 'dv' ? /^ކަލަންޑަރު ހުޅުވާ/ : /^Open calendar/,
            });
            await trigger.click();
            await matchesToken(field, '--veli-color-text-input-bg-pressed', 'backgroundColor');
            const popup = desktopPage.getByRole('dialog').locator('..');
            assert.equal(
              (await popup.boundingBox()).width,
              316,
              'same Figma popover at every field size',
            );
            await desktopPage.keyboard.press('Escape');
            await expect(trigger).toBeFocused();
            // Remove keyboard focus before measuring the next resting/hovered field.
            await desktopPage.locator('body').click({ position: { x: 1, y: 1 } });
          }
      }
    await desktop.close();
  } finally {
    await browser.close();
  }
}
await writeFile(
  `${evidence}/datepicker-results.json`,
  JSON.stringify({ results, errors, contrast }, null, 2),
);
assert.deepEqual(errors, [], 'no browser console or hydration errors');
console.log(
  `Passed ${results.length} DatePicker viewport cases, 30 fields each, plus Figma tokens, interactions, and Today states in both engines.`,
);
