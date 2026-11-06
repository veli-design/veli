import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForMotion } from './wait-for-motion';

async function openStory(page: Page, story = 'default', language = 'en') {
  // Exercise variations through the public story controls rather than sidebar permutations.
  const variants: Record<string, { story: string; args: string }> = {
    'disabled-options': { story: 'default', args: 'scenario:disabled-options' },
    'many-filters': { story: 'default', args: 'scenario:many-filters' },
    'date-selected': { story: 'default', args: 'scenario:date-selected' },
    'without-select-all': { story: 'default', args: 'showSelectAll:!false' },
    'without-disclosure': { story: 'default', args: 'showDisclosure:!false' },
    'plain-sections': { story: 'default', args: 'showSelectAll:!false;showDisclosure:!false' },
    'chip-threshold': { story: 'advanced', args: 'maxVisibleValues:2' },
    'chip-count-only': { story: 'advanced', args: 'maxVisibleValues:0;summaryFormat:chosen' },
    'custom-chip-summary': { story: 'advanced', args: 'summaryFormat:first-plus-more' },
  };
  const target = variants[story] ?? { story, args: '' };
  await page.goto(
    `/storybook/iframe.html?id=blocks-filter-bar--${target.story}&viewMode=story&veli-language=${language}&args=${encodeURIComponent(target.args)}`,
  );
  await expect(
    page.getByRole('button', { name: language === 'dv' ? 'ހުރިހާ' : 'All', exact: true }),
  ).toBeVisible();
}

test('copied block drives real results; clearing labels retains browse scope and search', async ({
  page,
}) => {
  await page.goto('/filters');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page.getByText('Showing 2 of 5')).toBeVisible();
  const caret = page.getByRole('button', { name: 'Choose labels for Reports', exact: true });
  await caret.click();
  await page.getByRole('menuitemcheckbox', { name: 'Annual Reports', exact: true }).click();
  await expect(page.getByText('1 filter applied, Showing 1 of 5')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(caret).toBeFocused();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Search', exact: true });
  await search.fill('Annual');
  await page.getByRole('button', { name: 'Clear labels', exact: true }).click();
  await expect(search).toHaveValue('Annual');
  await expect(page.getByText('Showing 1 of 5')).toBeVisible();
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(page.getByText('Showing 2 of 5')).toBeVisible();
  await search.press('Escape');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
});

test('quick menu contains only category labels and shares individual selections', async ({
  page,
}) => {
  await openStory(page);
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await page.getByRole('button', { name: 'Choose labels for Reports', exact: true }).click();
  await expect(page.getByRole('menuitemcheckbox')).toHaveCount(3);
  await expect(page.getByRole('menuitemcheckbox', { name: /Select all/ })).toHaveCount(0);
  const annual = page.getByRole('menuitemcheckbox', { name: 'Annual Reports', exact: true });
  const financial = page.getByRole('menuitemcheckbox', { name: 'Financial Reports', exact: true });
  await annual.click();
  await financial.click();
  await expect(page.getByText('2 filters applied, Showing 9 of 209')).toBeVisible();
  await annual.click();
  await financial.click();
  await expect(page.getByText('Showing 9 of 209', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('advanced filtering retains its last category until every filter is removed', async ({
  page,
}) => {
  await openStory(page, 'advanced');
  await expect(page.getByText('4 filters applied, Showing 9 of 55')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Market Prices | Fuel', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Guidelines', exact: true }).click();
  await expect(page.getByText('2 filters applied, Showing 9 of 55')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Choose labels for Announcements', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('[data-filter-category="announcements"]')).toHaveAttribute(
    'data-filter-tag-mode',
    'advanced',
  );
  await expect(page.getByRole('button', { name: /^Announcements/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
});

for (const width of [1280, 390]) {
  test(`${width}px panel applies immediately, closes with focus return and has no serious accessibility violations`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page);
    const trigger = page.getByRole('button', { name: 'Filters', exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Filters', exact: true });
    const annual = dialog.getByRole('checkbox', { name: 'Annual Reports', exact: true });
    await annual.focus();
    await annual.press('Space');
    await expect(annual).toBeChecked();
    await dialog.getByText('Fuel', { exact: true }).click();
    await expect(dialog.getByText('1 selected', { exact: true })).toHaveCount(2);
    const axe = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
    expect(
      axe.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact ?? ''),
      ),
    ).toEqual([]);
    await waitForMotion(page);
    await page.screenshot({ path: `/tmp/veli-filter-panel-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByText('2 filters applied, Showing 9 of 209')).toBeVisible();
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`mobile category sheet ${reducedMotion} shares selection and reports expanded state`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion });
    await openStory(page);
    await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Reports', exact: true }).click();
    await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
    const caret = page.locator('[data-filter-category="reports"] button').first();
    await expect(caret).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('dialog', { name: 'Reports', exact: true });
    await expect(menu).toBeVisible();
    await waitForMotion(page);
    await expect(menu.getByRole('checkbox')).toHaveCount(3);
    await expect(menu.getByRole('checkbox', { name: /Select all/ })).toHaveCount(0);
    await menu.getByText('Annual Reports', { exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(caret).toBeFocused();
    await expect(caret).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('[data-filter-active-dot]')).toBeVisible();
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    await expect(
      page
        .getByRole('dialog', { name: 'Filters', exact: true })
        .getByRole('checkbox', { name: 'Annual Reports', exact: true }),
    ).toBeChecked();
  });
}

test('disabled options cannot be changed and narrow RTL remains within the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openStory(page, 'disabled-options', 'dv');
  await page.getByRole('button', { name: 'ފިލްޓަރުތައް', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'ފިލްޓަރުތައް', exact: true });
  await expect(
    dialog.getByRole('checkbox', { name: 'ހައްދުކުރެވިފައިވާ ރިޕޯޓުތައް', exact: true }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole('checkbox', { name: 'އާކައިވްކުރެވިފައި', exact: true }),
  ).toBeDisabled();
  expect(await dialog.evaluate((element) => element.closest('[dir]')?.getAttribute('dir'))).toBe(
    'rtl',
  );
  await page.screenshot({ path: '/tmp/veli-filter-rtl.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const language of ['en', 'dv']) {
  test(`rail arrows and fades track their independent ends in ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 780, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'default', language);
    const rail = page.locator('div.overflow-x-auto');
    const previous = page.getByRole('button', {
      name: language === 'dv' ? 'ކުރީގެ ބައިތައް' : 'Previous categories',
      exact: true,
    });
    const next = page.getByRole('button', {
      name: language === 'dv' ? 'ދެން އޮތް ބައިތައް' : 'Next categories',
      exact: true,
    });
    await expect(previous).toHaveCount(0);
    await expect(next).toBeVisible();
    await expect(page.locator('[data-filter-fade="end"]')).toHaveCSS('opacity', '1');
    await rail.evaluate((el) => {
      el.scrollLeft =
        el.dir === 'rtl' || getComputedStyle(el).direction === 'rtl' ? -100000 : 100000;
    });
    await expect(next).toHaveCount(0);
    await expect(previous).toBeVisible();
    await expect(page.locator('[data-filter-fade="start"]')).toHaveCSS('opacity', '1');
    await rail.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await expect(previous).toHaveCount(0);
    await expect(next).toBeVisible();
    await expect(page.locator('[data-filter-fade="start"]')).toHaveCSS('opacity', '0');
  });
}

test('date chip shares count and removal; consumer query and category survive date removal', async ({
  page,
}) => {
  await openStory(page, 'date-selected');
  await expect(page.getByText('1 filter applied, Showing 9 of 209')).toBeVisible();
  await expect(page.locator('[data-filter-active-dot]')).toBeVisible();
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('searchbox').fill('annual');
  await page.getByRole('button', { name: 'Remove 2026-11-01', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('annual');
  await expect(page.getByRole('button', { name: 'Reports', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
});

for (const width of [1280, 390]) {
  test(`${width}px single Veli date input creates a date chip and Clear all resets it`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page);
    const filter = page.getByRole('button', { name: 'Filters', exact: true });
    await filter.click();
    await waitForMotion(page);
    const panel = page.getByRole('dialog', { name: 'Filters', exact: true });
    await panel
      .getByRole('button', { name: /^Choose publication date/ })
      .nth(0)
      .click();
    await page.getByRole('button', { name: 'Sunday, 1 November 2026', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Sunday, 1 November 2026', exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Done', exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    const chip = page.getByRole('button', { name: 'Remove 2026-11-01', exact: true });
    await expect(chip).toBeVisible();
    await expect(page.getByText('1 filter applied, Showing 9 of 209')).toBeVisible();
    await filter.click();
    await waitForMotion(page);
    await panel.getByRole('button', { name: 'Clear all', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(chip).toHaveCount(0);
    await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('custom panel sections highlight selected rows and groups and remain collapsible', async ({
  page,
}) => {
  await openStory(page);
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const panel = page.getByRole('dialog', { name: 'Filters', exact: true });
  const group = panel.locator('[data-filter-section="market-prices"]');
  await group.getByText('Fuel', { exact: true }).click();
  await expect(group.locator('[data-filter-selected]')).toHaveClass(/bg-primary-alpha-200/);
  await group.getByText('Financials', { exact: true }).click();
  await expect(group.locator(':scope > div')).toHaveClass(/bg-primary-alpha-200/);
  await group.getByRole('button', { name: 'Market Prices', exact: true }).click();
  await expect(group.getByRole('checkbox', { name: 'Fuel', exact: true })).not.toBeVisible();
  const disclosure = group.getByRole('button', { name: 'Market Prices', exact: true });
  await disclosure.focus();
  await disclosure.press('Enter');
  await expect(group.getByRole('checkbox', { name: 'Fuel', exact: true })).toBeVisible();
  await panel.getByText('Guidelines', { exact: true }).click();
  const standalone = panel.getByRole('checkbox', { name: 'Guidelines', exact: true });
  await expect(standalone).toBeChecked();
  await expect(panel.locator('[data-filter-standalone="guidelines"] > div')).toHaveClass(
    /bg-primary-alpha-200/,
  );
  await standalone.focus();
  await standalone.press('Space');
  await expect(standalone).not.toBeChecked();
});

test('Clear all resets both date and category filters while retaining search', async ({ page }) => {
  await openStory(page, 'date-selected');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('searchbox').fill('budget');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const panel = page.getByRole('dialog', { name: 'Filters', exact: true });
  await panel.getByText('A2 Sheets', { exact: true }).click();
  await panel.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('searchbox')).toHaveValue('budget');
  await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Active filters', exact: true })).toHaveCount(0);
});

for (const selected of [false, true]) {
  test(`standalone panel row has visible hover feedback when selected=${selected}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const row = page.locator('[data-filter-standalone="resources"] > div');
    const checkbox = row.getByRole('checkbox', { name: 'Resources', exact: true });
    await row.scrollIntoViewIfNeeded();
    if (selected) await row.getByText('Resources', { exact: true }).click();
    await page.mouse.move(0, 0);
    const resting = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    await row.hover();
    if (selected) await expect(row).toHaveCSS('background-color', resting);
    else
      await expect
        .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
        .not.toBe(resting);
    await expect(checkbox).toBeChecked({ checked: selected });
    await page.mouse.move(0, 0);
    await expect(row).toHaveCSS('background-color', resting);
  });
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`search expansion and collapse use Veli motion with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await openStory(page);
    const shell = page.locator('[data-filter-search]');
    const trigger = page.getByRole('button', { name: 'Search', exact: true });
    const width = () => shell.evaluate((el) => el.getBoundingClientRect().width);
    const closedWidth = await width();
    const duration = await shell.evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(await shell.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe(
      reducedMotion === 'reduce' ? 'none' : 'width',
    );
    if (reducedMotion === 'no-preference') {
      expect(parseFloat(duration)).toBe(
        await shell.evaluate((el) => {
          const value = getComputedStyle(el).getPropertyValue('--veli-duration-normal').trim();
          return parseFloat(value) / (value.endsWith('ms') ? 1000 : 1);
        }),
      );
    }
    await trigger.click();
    const search = page.getByRole('searchbox', { name: 'Search', exact: true });
    await expect(search).toBeFocused();
    await expect.poll(width).toBe(256);
    await search.fill('annual');
    await search.press('Escape');
    await expect(search).toHaveValue('');
    await expect(shell).toHaveAttribute('data-expanded', 'true');
    await search.press('Escape');
    await expect(trigger).toBeFocused();
    await expect.poll(width).toBe(closedWidth);
    await expect(search).toHaveCount(0);
    await trigger.click();
    await expect(page.getByRole('searchbox', { name: 'Search', exact: true })).toBeFocused();
  });
}

for (const language of ['en', 'dv']) {
  for (const story of ['default', 'advanced', 'custom-composition', 'figma-reference']) {
    test(`${story}: mobile search stays open below tags in ${language}`, async ({ page }) => {
      const dv = language === 'dv';
      await page.setViewportSize({ width: dv ? 390 : 320, height: 844 });
      await openStory(page, story, language);
      const search = page.getByRole('searchbox', { name: dv ? 'ހޯދާ' : 'Search', exact: true });
      await expect(search).toBeVisible();
      await expect(search).not.toBeFocused();
      await expect(
        page.getByRole('button', { name: dv ? 'ހޯދުން ބަންދުކުރޭ' : 'Close search', exact: true }),
      ).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      const filter = page.getByRole('button', {
        name:
          story === 'custom-composition'
            ? dv
              ? 'ލިޔުންތައް ފިލްޓަރުކުރޭ'
              : 'Refine publications'
            : dv
              ? 'ފިލްޓަރުތައް'
              : 'Filters',
        exact: true,
      });
      const all = await page
        .getByRole('button', { name: dv ? 'ހުރިހާ' : 'All', exact: true })
        .boundingBox();
      const input = await search.boundingBox();
      const action = await filter.boundingBox();
      expect(input?.y).toBeGreaterThan((all?.y ?? 0) + (all?.height ?? 0));
      expect(
        Math.abs(
          (input?.y ?? 0) + (input?.height ?? 0) / 2 - (action?.y ?? 0) - (action?.height ?? 0) / 2,
        ),
      ).toBeLessThan(2);
      await search.fill('annual');
      await search.press('Escape');
      await expect(search).toHaveValue('');
      await search.press('Escape');
      await expect(search).toBeVisible();
      await expect(search).toBeFocused();
      await filter.click();
      await expect(page.locator('.veli-sheet')).toBeVisible();
      await waitForMotion(page);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(search).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}

for (const selected of [false, true]) {
  test(`checkbox row highlights on hover when selected=${selected}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const row = page.locator('[data-filter-option="fuel"]');
    const checkbox = row.getByRole('checkbox', { name: 'Fuel', exact: true });
    await row.scrollIntoViewIfNeeded();
    if (selected) {
      await checkbox.focus();
      await checkbox.press('Space');
    }
    await page.mouse.move(0, 0);
    const resting = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    await row.hover({ position: { x: 4, y: 4 } });
    if (selected) await expect(row).toHaveCSS('background-color', resting);
    else
      await expect
        .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
        .not.toBe(resting);
    await expect(checkbox).toBeChecked({ checked: selected });
    await page.mouse.move(0, 0);
    await expect(row).toHaveCSS('background-color', resting);
  });
}

test('disabled checkbox rows do not highlight on hover', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openStory(page, 'disabled-options');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const row = page.locator('[data-filter-option="restricted"]');
  const resting = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
  await row.hover();
  await expect(row).toHaveCSS('background-color', resting);
  await expect(row.getByRole('checkbox')).toBeDisabled();
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`category mode changes animate wrapper geometry with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await openStory(page);
    await page.evaluate(() => {
      const target = document.querySelector('[data-filter-category="market-prices"]')!;
      const samples: { mode: string | null; durations: (number | string)[] }[] = [];
      Object.assign(window, { categoryMotionSamples: samples });
      new MutationObserver(() => {
        samples.push({
          mode: target.getAttribute('data-filter-tag-mode'),
          durations: target
            .getAnimations()
            .map((animation) => animation.effect!.getTiming().duration),
        });
      }).observe(target, { attributes: true, attributeFilter: ['data-filter-tag-mode'] });
    });
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const panel = page.getByRole('dialog', { name: 'Filters', exact: true });
    await panel.getByText('Fuel', { exact: true }).click();
    await panel.getByText('Guidelines', { exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-filter-category="market-prices"]')).toHaveAttribute(
      'data-filter-tag-mode',
      'advanced',
    );
    await waitForMotion(page);
    await page.getByRole('button', { name: 'Remove Guidelines', exact: true }).click();
    await expect(page.locator('[data-filter-category="market-prices"]')).toHaveAttribute(
      'data-filter-tag-mode',
      'advanced',
    );
    await page.getByRole('button', { name: 'Remove Market Prices | Fuel', exact: true }).click();
    await expect(page.locator('[data-filter-category="market-prices"]')).toHaveAttribute(
      'data-filter-tag-mode',
      'browse',
    );
    const samples = await page.evaluate(
      () =>
        (window as unknown as { categoryMotionSamples: { mode: string; durations: number[] }[] })
          .categoryMotionSamples,
    );
    expect(samples.map((sample) => sample.mode)).toEqual(['advanced', 'browse']);
    for (const sample of samples)
      expect(sample.durations).toEqual(reducedMotion === 'reduce' ? [] : [200]);
    await waitForMotion(page);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
}

test('Dhivehi example supplies localized search placeholder and filter/date labels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(
    '/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&veli-language=dv',
  );
  await expect(page.getByRole('button', { name: 'ހުރިހާ', exact: true })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'ހޯދާ', exact: true });
  await search.click();
  await expect(search).toHaveAttribute('placeholder', 'ހޯދާ');
  await expect(search).toBeFocused();
  await search.press('Escape');
  await page.getByRole('button', { name: 'ފިލްޓަރުތައް', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'ފިލްޓަރުތައް', exact: true });
  await expect(panel.getByRole('heading', { name: 'ފިލްޓަރުތައް', exact: true })).toBeVisible();
  await expect(panel.getByRole('group', { name: 'ޝާއިޢުކުރި ތާރީޚު', exact: true })).toBeVisible();
  await expect(panel.getByRole('button', { name: /^ތާރީޚެއް އިޚްތިޔާރުކުރޭ/ })).toBeVisible();
  await waitForMotion(page);
  await page.screenshot({ path: '/tmp/veli-filter-dhivehi-panel.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const width of [1280, 390]) {
  test(`${width}px section checkbox selects all and reflects partial selection without collapsing`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openStory(page);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const section = page.locator('[data-filter-section="market-prices"]');
    const selectAll = section.getByRole('checkbox', { name: 'Market Prices', exact: true });
    const disclosure = section.getByRole('button', { name: 'Market Prices', exact: true });
    const fuel = section.getByRole('checkbox', { name: 'Fuel', exact: true });
    await expect(selectAll).not.toBeChecked();
    await section.getByText('Fuel', { exact: true }).click();
    await expect(selectAll).toHaveJSProperty('indeterminate', true);
    await selectAll.focus();
    await selectAll.press('Space');
    await expect(selectAll).toBeChecked();
    await expect(selectAll).toHaveJSProperty('indeterminate', false);
    await expect(section.getByRole('checkbox', { name: 'Financials', exact: true })).toBeChecked();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    await expect(fuel).toBeVisible();
    await disclosure.click();
    await expect(fuel).not.toBeVisible();
    await selectAll.focus();
    await selectAll.press('Space');
    await expect(selectAll).not.toBeChecked();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await disclosure.click();
    await expect(fuel).not.toBeChecked();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
  });
}

test('section select-all preserves selected disabled options', async ({ page }) => {
  await openStory(page, 'disabled-options');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const section = page.locator('[data-filter-section="reports"]');
  const header = section.getByRole('checkbox', { name: 'Reports', exact: true });
  const restricted = section.getByRole('checkbox', { name: 'Restricted reports', exact: true });
  await expect(restricted).toBeDisabled();
  await expect(restricted).toBeChecked();
  await expect(header).toHaveJSProperty('indeterminate', true);
  await header.focus();
  await header.press('Space');
  await expect(header).toBeChecked();
  await expect(
    section.getByRole('checkbox', { name: 'Annual Reports', exact: true }),
  ).toBeChecked();
  await header.press('Space');
  await expect(
    section.getByRole('checkbox', { name: 'Annual Reports', exact: true }),
  ).not.toBeChecked();
  await expect(restricted).toBeChecked();
  await expect(header).toHaveJSProperty('indeterminate', true);
});

test('composed layout connects a replacement date control to chips, counts and clear without restoring old selections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await openStory(page, 'custom-composition');
  await page.getByRole('button', { name: 'Refine publications', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Refine publications', exact: true });
  await expect(
    panel.getByRole('heading', { name: 'Refine publications', exact: true }),
  ).toBeVisible();
  expect((await panel.boundingBox())?.width).toBe(512);
  await panel.getByRole('button', { name: 'Last 7 days', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Show results (1)', exact: true })).toBeVisible();
  await panel.getByText('Reports', { exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Show results (4)', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Show results (4)', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Remove Publication date | Last 7 days', exact: true })
    .click();
  await expect(page.getByText(/^3 filters applied,/)).toBeVisible();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const search = page.getByRole('searchbox', { name: 'Search', exact: true });
  await search.fill('annual');
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(search).toHaveValue('annual');
  await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Refine publications', exact: true }).click();
  await panel.getByRole('button', { name: 'This month', exact: true }).click();
  await panel.getByText('Guidelines', { exact: true }).click();
  await panel.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'This month', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(panel.getByRole('checkbox', { name: 'Guidelines', exact: true })).not.toBeChecked();
  await expect(page.locator('[data-filter-active-dot]')).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Active filters', exact: true })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Close filters', exact: true }).click();
  await expect(search).toHaveValue('annual');
});

test('checkbox selection section works independently without a filter root', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(
    '/storybook/iframe.html?id=blocks-filter-bar--standalone-selection&viewMode=story',
  );
  const selectAll = page.getByRole('checkbox', { name: 'Topics', exact: true });
  await page.getByText('News', { exact: true }).click();
  await expect(selectAll).toHaveJSProperty('indeterminate', true);
  await selectAll.focus();
  await selectAll.press('Space');
  await expect(page.getByRole('checkbox', { name: 'Publications', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Archived', exact: true })).toBeDisabled();
  await expect(page.getByRole('checkbox', { name: 'Archived', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Topics', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'News', exact: true })).toHaveCount(0);
  await selectAll.focus();
  await selectAll.press('Space');
  await expect(page.getByLabel('Selected topics', { exact: true })).toHaveText('None');
  expect(errors).toEqual([]);
});

test('Figma reference uses measured bar and chip geometry with standard Veli controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openStory(page, 'figma-reference');
  const root = page.getByRole('region', { name: 'Publication filters', exact: true });
  const frame = await root.boundingBox();
  expect(frame?.width).toBe(1208);
  expect(frame?.height).toBe(176);
  const all = await root.getByRole('button', { name: 'All', exact: true }).boundingBox();
  expect((all?.x ?? 0) - (frame?.x ?? 0)).toBe(0);
  expect((all?.y ?? 0) - (frame?.y ?? 0)).toBe(56);
  expect((await root.getByRole('button', { name: 'All', exact: true }).boundingBox())?.height).toBe(
    44,
  );
  const chips = root.getByRole('list', { name: 'Active filters', exact: true }).getByRole('button');
  await expect(chips).toHaveCount(3);
  expect((await chips.first().boundingBox())?.height).toBe(24);
  await expect(root.getByText('4 filters applied, Showing 9 of 55', { exact: true })).toBeVisible();
  await waitForMotion(page);
  await root.screenshot({ path: '/tmp/veli-filter-figma-reference.png' });
  await root.getByRole('button', { name: 'Filters', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Filters', exact: true });
  await expect(panel.getByRole('checkbox', { name: 'Announcements', exact: true })).toBeChecked();
});

for (const width of [1280, 893, 390]) {
  test(`${width}px checkbox rows toggle once from padding, label, indicator and keyboard`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 959 });
    await openStory(page, 'figma-reference');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const row = page.locator('[data-filter-option="fuel"]');
    const checkbox = row.getByRole('checkbox', { name: 'Fuel', exact: true });
    await row.scrollIntoViewIfNeeded();
    await expect(row).toHaveCSS('cursor', 'pointer');
    let checked = await checkbox.isChecked();
    const rect = await row.boundingBox();
    if (!rect) throw new Error('Fuel row is not visible');
    for (const position of [
      { x: 4, y: 4 },
      { x: 4, y: rect.height / 2 },
      { x: rect.width - 4, y: 4 },
      { x: rect.width - 4, y: rect.height - 4 },
    ]) {
      await row.click({ position });
      checked = !checked;
      await expect(checkbox).toBeChecked({ checked });
      await expect(checkbox).toBeFocused();
    }
    await row.getByText('Fuel', { exact: true }).click();
    checked = !checked;
    await expect(checkbox).toBeChecked({ checked });
    await row.locator('label').click({ position: { x: 8, y: 10 } });
    checked = !checked;
    await expect(checkbox).toBeChecked({ checked });
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked({ checked: !checked });
  });
}

test('disabled row padding stays inert and group disclosure never selects the group', async ({
  page,
}) => {
  await openStory(page, 'disabled-options');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const row = page.locator('[data-filter-option="restricted"]');
  const checkbox = row.getByRole('checkbox', { name: 'Restricted reports', exact: true });
  await expect(row).toHaveCSS('cursor', 'not-allowed');
  await row.click({ position: { x: 4, y: 4 } });
  await expect(checkbox).toBeChecked();
  await expect(checkbox).toBeDisabled();
  const section = page.locator('[data-filter-section="reports"]');
  const header = section.getByRole('checkbox', { name: 'Reports', exact: true });
  const disclosure = section.getByRole('button', { name: 'Reports', exact: true });
  await expect(header).toHaveJSProperty('indeterminate', true);
  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(header).toHaveJSProperty('indeterminate', true);
  const headerRow = section.locator(':scope > div > div').first();
  await headerRow.click({ position: { x: 4, y: 4 } });
  await expect(header).toBeChecked();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await disclosure.click();
  await expect(
    section.getByRole('checkbox', { name: 'Annual Reports', exact: true }),
  ).toBeChecked();
  await expect(checkbox).toBeChecked();
});

for (const language of ['en', 'dv']) {
  test(`rail edges keep a fixed viewport and return focus to All in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 893, height: 959 });
    await openStory(page, 'default', language);
    const rail = page.locator('div.overflow-x-auto');
    const all = page.getByRole('button', {
      name: language === 'dv' ? 'ހުރިހާ' : 'All',
      exact: true,
    });
    const before = await rail.boundingBox();
    const allBefore = await all.boundingBox();
    await page
      .getByRole('button', {
        name: language === 'dv' ? 'ދެން އޮތް ބައިތައް' : 'Next categories',
        exact: true,
      })
      .click();
    const previous = page.getByRole('button', {
      name: language === 'dv' ? 'ކުރީގެ ބައިތައް' : 'Previous categories',
      exact: true,
    });
    await expect(previous).toBeVisible();
    expect((await rail.boundingBox())?.width).toBe(before?.width);
    expect((await rail.boundingBox())?.x).toBe(before?.x);
    await previous.click();
    await expect(previous).toHaveCount(0);
    // Match the rail's one-pixel edge tolerance for fractional browser scrolling.
    await expect.poll(() => rail.evaluate((el) => Math.abs(el.scrollLeft))).toBeLessThanOrEqual(1);
    await expect(all).toBeFocused();
    expect((await rail.boundingBox())?.width).toBe(before?.width);
    expect(Math.abs(((await all.boundingBox())?.x ?? 0) - (allBefore?.x ?? 0))).toBeLessThanOrEqual(
      1,
    );
  });
}

for (const viewport of [
  { width: 1280, height: 480 },
  { width: 893, height: 959 },
  { width: 390, height: 640 },
]) {
  test(`${viewport.width}x${viewport.height} reference panel scrolls its body while preserving the footer`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await openStory(page, 'figma-reference');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const dialog = page.getByRole('dialog', { name: 'Filters', exact: true });
    const body = dialog.locator('[data-filter-panel-body]');
    const footer = dialog.locator('[data-filter-panel-footer]');
    await waitForMotion(page);
    const b = await body.boundingBox();
    const f = await footer.boundingBox();
    const d = await dialog.boundingBox();
    if (!b || !f || !d) throw new Error('Panel regions are missing');
    expect(b.y + b.height).toBeLessThanOrEqual(f.y + 1);
    expect(f.height).toBeGreaterThanOrEqual(60);
    expect(d.y + d.height).toBeLessThanOrEqual(viewport.height);
    expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(dialog.getByText('Guidelines', { exact: true })).toBeInViewport({ ratio: 1 });
    expect((await footer.boundingBox())?.y).toBeCloseTo(f.y, 1);
    await expect(footer.getByRole('button', { name: 'Clear all', exact: true })).toBeInViewport({
      ratio: 1,
    });
    await dialog.screenshot({
      path: `/tmp/veli-filter-panel-layout-${viewport.width}-${viewport.height}.png`,
    });
  });
}

for (const width of [893, 390]) {
  test(`${width}px clear action remains available with wrapped chips`, async ({ page }) => {
    await page.setViewportSize({ width, height: 959 });
    await openStory(page, 'figma-reference');
    const group = page.locator('[data-filter-applied-group]');
    const list = group.getByRole('list', { name: 'Active filters', exact: true });
    const first = await list.getByRole('button').first().boundingBox();
    const action = await group
      .getByRole('button', { name: 'Clear labels', exact: true })
      .boundingBox();
    if (!first || !action) throw new Error('Summary controls are missing');
    if (width > 600)
      expect(action.y + action.height / 2).toBeCloseTo(first.y + first.height / 2, 1);
    else expect(action.y).toBeGreaterThan(first.y + first.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 390) {
      const last = await list.getByRole('button').last().boundingBox();
      expect(last?.y).toBeGreaterThan(first.y);
    }
    await group.screenshot({ path: `/tmp/veli-filter-wrapped-summary-${width}.png` });
    await group.getByRole('button', { name: 'Clear labels', exact: true }).click();
    await expect(group).toHaveCount(0);
  });
}

for (const [story, selectAll, disclosure] of [
  ['default', true, true],
  ['without-select-all', false, true],
  ['without-disclosure', true, false],
  ['plain-sections', false, false],
] as const) {
  test(`${story}: optional section controls preserve individual selection`, async ({ page }) => {
    await openStory(page, story);
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await waitForMotion(page);
    const section = page.locator('[data-filter-section="announcements"]');
    await expect(section.getByRole('checkbox', { name: 'Announcements', exact: true })).toHaveCount(
      selectAll ? 1 : 0,
    );
    const toggle = section.getByRole('button', { name: 'Announcements', exact: true });
    await expect(toggle).toHaveCount(disclosure ? 1 : 0);
    const option = section.getByRole('checkbox', { name: 'A2 Sheets', exact: true });
    await expect(option).toBeVisible();
    await option.focus();
    await option.press('Space');
    await expect(option).toBeChecked();
    if (disclosure) {
      await toggle.click();
      await expect(option).toBeHidden();
      await toggle.click();
      await expect(option).toBeChecked();
    }
  });
}

for (const [story, summary] of [
  ['advanced', '2 selected'],
  ['chip-threshold', 'A2 Sheets, Job Announcements'],
  ['chip-count-only', '2 chosen'],
  ['custom-chip-summary', 'A2 Sheets +1'],
] as const) {
  test(`${story}: chip summary preserves full removal name and count`, async ({ page }) => {
    await openStory(page, story);
    const remove = page.getByRole('button', {
      name: 'Remove Announcements | A2 Sheets, Job Announcements',
      exact: true,
    });
    const chip = remove.locator('..');
    await expect(chip.getByText(summary, { exact: true })).toBeVisible();
    await expect(page.getByText('4 filters applied, Showing 9 of 55')).toBeVisible();
    await remove.click();
    await expect(remove).toHaveCount(0);
    await expect(page.getByText('2 filters applied, Showing 9 of 55')).toBeVisible();
  });
}

test('hidden disclosure keeps a default-collapsed standalone section accessible', async ({
  page,
}) => {
  await page.goto(
    '/storybook/iframe.html?id=blocks-filter-bar--standalone-selection&viewMode=story&args=showDisclosure:!false;defaultExpanded:!false',
  );
  await expect(page.getByRole('button', { name: 'Topics', exact: true })).toHaveCount(0);
  const news = page.getByRole('checkbox', { name: 'News', exact: true });
  await expect(news).toBeVisible();
  await news.focus();
  await news.press('Space');
  await expect(page.getByRole('status', { name: 'Selected topics' })).toHaveText('News');
  await expect(page.getByRole('checkbox', { name: 'Archived', exact: true })).toBeDisabled();
});

test('chip threshold switches from names to count and back as selection changes', async ({
  page,
}) => {
  await openStory(page, 'chip-threshold');
  const list = page.getByRole('list', { name: 'Active filters', exact: true });
  await expect(list.getByText('A2 Sheets, Job Announcements', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const option = page.getByRole('checkbox', { name: 'Tenders', exact: true });
  await option.focus();
  await option.press('Space');
  await page.keyboard.press('Escape');
  await expect(list.getByText('3 selected', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  await option.focus();
  await option.press('Space');
  await page.keyboard.press('Escape');
  await expect(list.getByText('A2 Sheets, Job Announcements', { exact: true })).toBeVisible();
});

test('without select-all the whole header toggles disclosure without changing selection', async ({
  page,
}) => {
  await openStory(page, 'without-select-all');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  const section = page.locator('[data-filter-section="announcements"]');
  const header = section.getByRole('button', { name: 'Announcements', exact: true });
  const option = section.getByRole('checkbox', { name: 'A2 Sheets', exact: true });
  await option.focus();
  await option.press('Space');
  await expect(header.getByText('1 selected', { exact: true })).toBeVisible();
  await expect(header.locator('button, input')).toHaveCount(0);
  await header.click({ position: { x: 4, y: 4 } });
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(option).toBeHidden();
  await header.press('Enter');
  await expect(option).toBeChecked();
  await header.getByText('Announcements', { exact: true }).click();
  await expect(option).toBeHidden();
  await header.press('Space');
  await expect(option).toBeChecked();
  await header.getByText('1 selected', { exact: true }).click();
  await expect(option).toBeHidden();
});

for (const story of [
  'default',
  'advanced',
  'custom-composition',
  'figma-reference',
  'standalone-selection',
]) {
  test(`${story}: Dhivehi content follows the toolbar language`, async ({ page }) => {
    await page.goto(
      `/storybook/iframe.html?id=blocks-filter-bar--${story}&viewMode=story&veli-language=dv`,
    );
    if (story === 'standalone-selection') {
      await expect(page.getByRole('checkbox', { name: 'ޚަބަރު', exact: true })).toBeVisible();
      await expect(page.getByRole('checkbox', { name: 'News', exact: true })).toHaveCount(0);
      return;
    }
    await expect(page.getByRole('button', { name: 'ހުރިހާ', exact: true })).toBeVisible();
    const panelName = story === 'custom-composition' ? 'ލިޔުންތައް ފިލްޓަރުކުރޭ' : 'ފިލްޓަރުތައް';
    await page.getByRole('button', { name: panelName, exact: true }).click();
    const panel = page.getByRole('dialog', { name: panelName, exact: true });
    await expect(panel.getByRole('checkbox', { name: 'އިޢުލާނުތައް', exact: true })).toBeVisible();
    await expect(panel.getByRole('checkbox', { name: 'Announcements', exact: true })).toHaveCount(
      0,
    );
    if (story === 'custom-composition')
      await expect(
        panel.getByRole('button', { name: 'ފާއިތުވި 7 ދުވަސް', exact: true }),
      ).toBeVisible();
  });
}

for (const language of ['en', 'dv']) {
  const dv = language === 'dv';
  test(`mobile sheets share selections, dismiss and restore focus in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, 'default', language);
    const filters = page.getByRole('button', {
      name: dv ? 'ފިލްޓަރުތައް' : 'Filters',
      exact: true,
    });
    const categoryName = dv ? 'އިޢުލާނުތައް' : 'Announcements';
    const optionName = dv ? 'އޭ ޓޫ ޝީޓުތައް' : 'A2 Sheets';
    await page.getByRole('button', { name: categoryName, exact: true }).click();
    await expect(page.locator('.veli-sheet')).toBeVisible();
    await waitForMotion(page);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('dir', dv ? 'rtl' : 'ltr');
    await expect(dialog.getByRole('checkbox')).toHaveCount(5);
    const option = dialog.getByRole('checkbox', { name: optionName, exact: true });
    await option.focus();
    await option.press('Space');
    await expect(option).toBeChecked();
    await dialog
      .getByRole('button', { name: dv ? 'ނިމުނީ' : 'Done', exact: true })
      .last()
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: new RegExp(categoryName) }).first(),
    ).toBeFocused();
    await filters.click();
    await waitForMotion(page);
    await expect(page.locator('.veli-sheet')).toBeVisible();
    await waitForMotion(page);
    await expect(dialog.getByRole('checkbox', { name: optionName, exact: true })).toBeChecked();
    const body = page.locator('.veli-sheet-body');
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const footer = page.locator('[data-filter-panel-footer]');
    await expect(footer).toBeInViewport();
    const bounds = await footer.boundingBox();
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(844);
    await dialog
      .getByRole('button', { name: dv ? 'ނަތީޖާ ދައްކާ' : 'Show results', exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await expect(filters).toBeFocused();
    await filters.click();
    await waitForMotion(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(filters).toBeFocused();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
  });

  test(`mobile filter sheet adapts to a short viewport and desktop in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 480 });
    await openStory(page, 'advanced', language);
    await page.getByRole('button', { name: dv ? 'ފިލްޓަރުތައް' : 'Filters', exact: true }).click();
    await expect(page.locator('.veli-sheet')).toBeVisible();
    await waitForMotion(page);
    await expect(
      page.getByRole('button', { name: dv ? 'ނަތީޖާ ދައްކާ' : 'Show results', exact: true }),
    ).toBeInViewport();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.veli-sheet')).toHaveCount(0);
    await expect(page.locator('[data-filter-panel]')).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: dv ? 'އޭ ޓޫ ޝީޓުތައް' : 'A2 Sheets', exact: true }),
    ).toBeChecked();
  });
}

test('copied block mobile sheets filter real consumer results', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/filters');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: 'Reports', exact: true })).toHaveAttribute(
    'aria-haspopup',
    'dialog',
  );
  await page.getByRole('button', { name: 'Reports', exact: true }).click();
  await expect(page.locator('.veli-sheet')).toBeVisible();
  await waitForMotion(page);
  await page.getByRole('checkbox', { name: 'Annual Reports', exact: true }).focus();
  await page.getByRole('checkbox', { name: 'Annual Reports', exact: true }).press('Space');
  await page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true }).last().click();
  await expect(page.getByText('Showing 1 of 5', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await waitForMotion(page);
  await expect(page.getByRole('checkbox', { name: 'Annual Reports', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.getByRole('button', { name: 'Show results', exact: true }).click();
  await expect(page.getByText('Showing 2 of 5', { exact: false })).toBeVisible();
});

for (const language of ['en', 'dv']) {
  for (const width of [320, 390]) {
    test(`${width}px mobile category trigger keeps its value and caret inside the rail in ${language}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(
        `/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&veli-language=${language}&args=scenario:long-labels`,
      );
      const trigger = page.locator('[data-filter-category="announcements"] button').first();
      await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await waitForMotion(page);
      await dialog.getByRole('checkbox').first().focus();
      await page.keyboard.press('Space');
      await dialog
        .getByRole('button', { name: language === 'dv' ? 'ނިމުނީ' : 'Done', exact: true })
        .last()
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      const rail = page.locator('div.overflow-x-auto');
      const bounds = await rail.boundingBox();
      const tag = await trigger.boundingBox();
      if (!bounds || !tag) throw new Error('Missing mobile rail or trigger');
      expect(tag.x).toBeGreaterThanOrEqual(bounds.x - 1);
      expect(tag.x + tag.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1);
      const caret = await trigger.locator('svg').last().boundingBox();
      expect(caret?.width).toBe(16);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await trigger.click();
      await expect(dialog.getByRole('checkbox').first()).toBeChecked();
    });
  }
}

for (const language of ['en', 'dv']) {
  for (const width of [390, 893]) {
    for (const override of [undefined, true, false]) {
      test(`${width}px scroll arrow override ${String(override)} in ${language}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        const args = override === undefined ? '' : `&args=showScrollArrows:!${override}`;
        await page.goto(
          `/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&veli-language=${language}${args}`,
        );
        await expect(page.getByRole('searchbox')).toHaveCount(width <= 600 ? 1 : 0);
        const enabled = override ?? true;
        const next = page.getByRole('button', {
          name: language === 'dv' ? 'ދެން އޮތް ބައިތައް' : 'Next categories',
          exact: true,
        });
        const previous = page.getByRole('button', {
          name: language === 'dv' ? 'ކުރީގެ ބައިތައް' : 'Previous categories',
          exact: true,
        });
        await expect(next).toHaveCount(enabled ? 1 : 0);
        await expect(previous).toHaveCount(0);
        const rail = page.locator('div.overflow-x-auto');
        if (enabled) {
          await next.click();
          await expect(previous).toBeVisible();
        } else {
          await rail.evaluate((el, rtl) => {
            el.scrollLeft = (rtl ? -1 : 1) * 100;
          }, language === 'dv');
          await expect
            .poll(() => rail.evaluate((el) => Math.abs(el.scrollLeft)))
            .toBeGreaterThan(0);
          await expect(previous).toHaveCount(0);
          await expect(page.locator('[data-filter-fade="start"]')).toHaveCSS('opacity', '1');
          await expect(page.locator('[data-filter-fade="end"]')).toHaveCSS('opacity', '1');
        }
      });
    }
  }
}

test('forcing scroll arrows still hides them when categories do not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    '/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&args=scenario:empty;showScrollArrows:!true',
  );
  await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Previous|Next) categories$/ })).toHaveCount(0);
});

for (const language of ['en', 'dv']) {
  for (const story of ['default', 'custom-composition', 'figma-reference']) {
    test(`${story}: mobile rail reaches page edges with independent fades in ${language}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openStory(page, story, language);
      await expect(page.getByRole('searchbox')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const rail = page.locator('div.overflow-x-auto');
      const bounds = await rail.boundingBox();
      expect(bounds?.x).toBe(0);
      expect(bounds?.width).toBe(390);
      const all = await page
        .getByRole('button', { name: language === 'dv' ? 'ހުރިހާ' : 'All', exact: true })
        .boundingBox();
      expect(language === 'dv' ? 390 - (all!.x + all!.width) : all!.x).toBe(16);
      const start = page.locator('[data-filter-fade="start"]');
      const end = page.locator('[data-filter-fade="end"]');
      await expect(start).toHaveCSS('opacity', '0');
      await expect(end).toHaveCSS('opacity', '1');
      await expect(end).toHaveCSS('width', '112px');
      await expect(end).toHaveCSS('pointer-events', 'none');
      await expect(
        page.getByRole('button', {
          name: language === 'dv' ? 'ދެން އޮތް ބައިތައް' : 'Next categories',
          exact: true,
        }),
      ).toHaveCount(1);
      await rail.evaluate((el, rtl) => {
        el.scrollLeft = (rtl ? -1 : 1) * el.scrollWidth;
      }, language === 'dv');
      await expect(start).toHaveCSS('opacity', '1');
      await expect(end).toHaveCSS('opacity', '0');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}

for (const language of ['en', 'dv']) {
  for (const width of [320, 390, 1024]) {
    test(`${language} ${width}px many filters disclosure and clear`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openStory(page, 'many-filters', language);
      await page.evaluate(() => document.fonts.ready);
      const group = page.locator('[data-filter-applied-group]');
      const list = group.locator('[data-filter-chip-list]');
      const toggle = group.locator('button[aria-expanded]');
      await expect(list.locator('li')).toHaveCount(7);
      if (width <= 600) {
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toContainText('(7)');
        const visible = list.locator('li:not([aria-hidden="true"])');
        expect(await visible.count()).toBeLessThan(7);
        expect(
          await visible.evaluateAll(
            (nodes) => new Set(nodes.map((node) => (node as HTMLElement).offsetTop)).size,
          ),
        ).toBeLessThanOrEqual(2);
        await expect(list.locator('li[aria-hidden="true"]').first()).toHaveAttribute('inert', '');
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(list.getByRole('button')).toHaveCount(7);
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await list.getByRole('button').first().click();
        await expect(list.locator('li')).toHaveCount(6);
        await expect(toggle).toContainText('(6)');
        await expect
          .poll(() =>
            page.evaluate(() => document.activeElement?.closest('li')?.getAttribute('aria-hidden')),
          )
          .not.toBe('true');
      } else {
        await expect(toggle).toHaveCount(0);
        await expect(list.getByRole('button')).toHaveCount(7);
      }
      await group.screenshot({ path: `/tmp/filter-chip-overview-${language}-${width}.png` });
      const clear = group.getByRole('button', {
        name: language === 'en' ? 'Clear all' : 'ހުރިހާ ފިލްޓަރެއް ފޮހެލާ',
        exact: true,
      });
      // The clear action is the final button in the footer in either locale.
      const clearAction =
        language === 'en' ? clear : group.locator('[data-filter-clear-action] button').last();
      await expect(clearAction).toBeVisible();
      await clearAction.click();
      await expect(group).toHaveCount(0);
    });
  }
}

for (const language of ['en', 'dv']) {
  test(`${language} mobileMaxRows configures the collapsed overview`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    for (const rows of [1, 3]) {
      await page.goto(
        `/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&veli-language=${language}&args=scenario:many-filters;mobileMaxRows:${rows}`,
      );
      const list = page.locator('[data-filter-chip-list]');
      await expect(list.locator('li')).toHaveCount(7);
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() =>
          list
            .locator('li:not([aria-hidden="true"])')
            .evaluateAll(
              (nodes) => new Set(nodes.map((node) => (node as HTMLElement).offsetTop)).size,
            ),
        )
        .toBe(rows);
      await page.locator('[data-filter-applied-group] button[aria-expanded]').click();
      await expect(list.getByRole('button')).toHaveCount(7);
    }
  });
}

for (const language of ['en', 'dv']) {
  test(`${language} zero mobileMaxRows hides chips without clearing selections`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(
      `/storybook/iframe.html?id=blocks-filter-bar--default&viewMode=story&veli-language=${language}&args=scenario:many-filters;mobileMaxRows:0`,
    );
    const group = page.locator('[data-filter-applied-group]');
    const list = group.locator('[data-filter-chip-list]');
    await expect(list).toBeAttached();
    await expect(list).toBeHidden();
    await expect(group.locator('button[aria-expanded]')).toHaveCount(0);
    await expect(group.getByRole('list')).toHaveCount(0);
    const clear = group.locator('[data-filter-clear-action] button').last();
    await expect(clear).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(list).toBeVisible();
    await expect(list.getByRole('button')).toHaveCount(7);
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(list).toBeHidden();
    await clear.click();
    await expect(group).toHaveCount(0);
  });
}

for (const language of ['en', 'dv']) {
  test(`${language} clearing mobile search after desktop resize preserves keyboard focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await openStory(page, 'default', language);
    const label = language === 'en' ? 'Search' : 'ހޯދާ';
    const search = page.getByRole('searchbox', { name: label, exact: true });
    await search.fill('report');
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(search).toHaveValue('report');
    await search.press('Escape');
    await expect(search).toHaveValue('');
    await expect(search).toBeFocused();
    await expect(search).toBeVisible();
    await expect(search).not.toHaveJSProperty('inert', true);
    await search.press('Escape');
    await expect(page.getByRole('button', { name: label, exact: true })).toBeFocused();
  });
}

for (const width of [1280, 390]) {
  test(`${width}px panel clearing retains focus, remembered browse scope and query`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/filters');
    await page.waitForLoadState('networkidle');
    if (width > 600) await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('Report');
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Filters', exact: true });
    await waitForMotion(page);
    const annual = dialog.getByRole('checkbox', { name: 'Annual Reports', exact: true });
    await annual.focus();
    await annual.press('Space');
    await expect(annual).toBeChecked();
    const clear = dialog.getByRole('button', { name: 'Clear all', exact: true });
    await clear.focus();
    await clear.press('Enter');
    await expect(clear).toBeDisabled();
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('searchbox', { name: 'Search', exact: true })).toHaveValue(
      'Report',
    );
    await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('');
    await expect(page.getByText('Showing 5 of 5')).toBeVisible();
    await page.screenshot({ path: `/tmp/filter-review-clear-${width}.png` });
  });
}

test('first panel selection enters advanced mode and adding another category preserves it', async ({
  page,
}) => {
  await openStory(page);
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const annual = page
    .getByRole('dialog', { name: 'Filters', exact: true })
    .getByRole('checkbox', { name: 'Annual Reports', exact: true });
  await annual.focus();
  await annual.press('Space');
  await expect(annual).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-filter-category="reports"]')).toHaveAttribute(
    'data-filter-tag-mode',
    'advanced',
  );
  await page.getByRole('button', { name: 'Guidelines', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Remove Reports | Annual Reports', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Guidelines', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Guidelines', exact: true }).click();
  await expect(page.locator('[data-filter-category="reports"]')).toHaveAttribute(
    'data-filter-tag-mode',
    'advanced',
  );
  await page.getByRole('button', { name: 'Remove Reports | Annual Reports', exact: true }).click();
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('panel filtering restores an explicit remembered category when cleared', async ({ page }) => {
  await openStory(page);
  await page.getByRole('button', { name: 'Resources', exact: true }).click();
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Filters', exact: true });
  const annual = dialog.getByRole('checkbox', { name: 'Annual Reports', exact: true });
  await annual.focus();
  await annual.press('Space');
  await expect(annual).toBeChecked();
  await dialog.getByRole('button', { name: 'Clear all', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Resources', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});
