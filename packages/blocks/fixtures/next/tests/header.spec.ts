import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { warnAccessibilityViolations } from './accessibility.mjs';

test('app switcher opens, filters, closes with Escape, and returns focus', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const trigger = page.getByRole('button', { name: 'Open app switcher' });
  await trigger.click();
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await search.fill('Locker');
  await expect(page.getByRole('option', { name: 'Locker' })).toBeVisible();
  await search.fill('Applications');
  await expect(page.getByRole('option', { name: 'My Applications' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Browse government apps and sites' })).toHaveCount(
    0,
  );
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});

test('mobile menu opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
  await page.getByRole('button', { name: 'Close menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toHaveCount(0);
});

test('floating header hides on scroll down and returns on scroll up', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const surface = page.locator('[data-header-surface]');
  await expect(surface).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(200);
  await expect(surface).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(200);
  await expect(surface).not.toHaveAttribute('aria-hidden', 'true');
});

test('banner language switch toggles to the target language', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  const enSwitch = page.getByRole('button', { name: 'Change language' });
  await expect(enSwitch).toHaveText('ދިވެހި');
  await enSwitch.click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');

  const dvSwitch = page.getByRole('button', { name: 'ބަސް ބަދަލުކުރައްވާ' });
  await expect(dvSwitch).toHaveText('English');
  await dvSwitch.click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('button', { name: 'Change language' })).toHaveText('ދިވެހި');
});

test('RTL layout does not overflow and passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Fixture language' }).click();
  // Fixture shell + VeliProvider both set dir; assert the page shell is RTL.
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const results = await new AxeBuilder({ page }).analyze();
  await warnAccessibilityViolations(results);
});

test('app switcher filters to a site list and moves the highlight with arrows', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  await expect(page.getByRole('listbox', { name: 'Apps' })).toBeVisible();
  const govmv = page.getByRole('option', { name: /Gov\.mv/ });
  const applications = page.getByRole('option', { name: 'My Applications' });
  await expect(govmv).toHaveAttribute('data-highlighted', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(applications).toHaveAttribute('data-highlighted', 'true');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/about$/);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('menuitemradio', { name: 'Sites only' }).click();
  const summary = page.locator('p', { hasText: 'Showing all Sites:' });
  await expect(summary).toContainText('15 results');

  const defence = page.getByRole('option', { name: 'Minister of Defence and National Service' });
  const foreign = page.getByRole('option', { name: 'Minister of Foreign Affairs' });
  await expect(defence).toHaveAttribute('data-highlighted', 'true');
  // Selecting a filter returns focus to its trigger, whose arrows open the menu.
  await defence.focus();
  await page.keyboard.press('ArrowRight');
  await expect(foreign).toHaveAttribute('data-highlighted', 'true');
  await expect(defence).not.toHaveAttribute('data-highlighted', 'true');
});

test('app switcher leaves host textarea and header actions keys alone while open', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();

  const govmv = page.getByRole('option', { name: /Gov\.mv/ });
  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await expect(govmv).toHaveAttribute('data-highlighted', 'true');

  // Sibling editable outside the switcher panel (Faz's reproduction). Dispatch from the
  // host control so aria-modal focus traps cannot mask the regression.
  const notes = page.getByRole('textbox', { name: 'Host notes' });
  await notes.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
  });
  await expect(govmv).toHaveAttribute('data-highlighted', 'true');

  await notes.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    for (const key of 'hello') {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
  });
  await expect(search).toHaveValue('');

  await notes.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
  });
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();

  // Faded host actions stay inert; keys must not redirect into Search.
  await page
    .getByRole('button', { name: 'Sign In', includeHidden: true })
    .evaluate((el: HTMLButtonElement) => {
      el.focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true }));
    });
  await expect(search).toHaveValue('');
});

test('app switcher Filter arrow opens the menu and type-to-search reaches Search', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  // Dialog surface holds focus on open — type-to-search must still reach Search.
  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await page.keyboard.type('L');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('L');

  // From Search, arrows move the highlight (not the text caret).
  const applications = page.getByRole('option', { name: 'My Applications' });
  const locker = page.getByRole('option', { name: 'Locker' });
  await expect(applications).toHaveAttribute('data-highlighted', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(locker).toHaveAttribute('data-highlighted', 'true');
  await expect(locker).toBeFocused();

  // Typing / Backspace from an option returns focus to Search and edits the query.
  await page.keyboard.press('Backspace');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await page.keyboard.type('Loc');
  await expect(search).toHaveValue('Loc');
  await page.keyboard.press('ArrowRight');
  await expect(locker).toBeFocused();
  await page.keyboard.type('k');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('Lock');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Browse government apps and sites' })).toHaveCount(
    0,
  );

  await page.getByRole('button', { name: 'Open app switcher' }).click();
  const filter = page.getByRole('button', { name: 'Filter' });
  await expect(filter).toHaveAttribute('aria-haspopup', /^(true|menu)$/);
  await filter.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Show all' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menuitemradio', { name: 'Show all' })).toHaveCount(0);

  await filter.click();
  await page.getByRole('menuitemradio', { name: 'Sites only' }).click();
  const defence = page.getByRole('option', { name: 'Minister of Defence and National Service' });
  await expect(defence).toHaveAttribute('data-highlighted', 'true');
  await defence.focus();

  await page.keyboard.type('m');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('m');
});

test('app switcher keeps You are here on the current grid tile', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('menuitemradio', { name: 'Apps only' }).click();

  const current = page.getByRole('option', { name: /Gov\.mv/ });
  await expect(current.getByText('You are here')).toBeVisible();
  const tile = await current.evaluate((option) => {
    const name = Array.from(option.querySelectorAll('p')).find((el) =>
      el.textContent?.includes('Gov.mv'),
    );
    const pill = Array.from(option.querySelectorAll('span')).find((el) =>
      el.textContent?.includes('You are here'),
    );
    const icon = option.querySelector('div');
    const tileBox = option.getBoundingClientRect();
    const pillBox = pill?.getBoundingClientRect();
    return {
      direction: getComputedStyle(option).flexDirection,
      clamp: name ? getComputedStyle(name).webkitLineClamp : '',
      labelMax: name ? getComputedStyle(name).maxWidth : '',
      pillWidth: pillBox ? Math.round(pillBox.width) : 0,
      tileWidth: Math.round(tileBox.width),
      iconWidth: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
    };
  });
  expect(tile.direction).toBe('column');
  expect(tile.clamp === 'none' || tile.clamp === '').toBe(true);
  expect(tile.labelMax).toBe('141px');
  expect(tile.iconWidth).toBe(56);
  expect(tile.pillWidth).toBeGreaterThan(70);
  expect(tile.pillWidth).toBeLessThan(tile.tileWidth - 24);

  const infoPanel = page.getByRole('complementary');
  await expect(infoPanel).toBeVisible();
  const infoWidth = await infoPanel.evaluate((aside) => {
    const match = Array.from(aside.querySelectorAll('div')).find((el) => {
      const box = el.getBoundingClientRect();
      return box.width >= 80 && box.width <= 100 && Math.abs(box.width - box.height) < 2;
    });
    return match ? Math.round(match.getBoundingClientRect().width) : 0;
  });
  expect(infoWidth).toBe(88);
});

test('app switcher shows the search empty state when nothing matches', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await search.fill('aasandha');

  await expect(page.getByText('No apps or sites match “aasandha”', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Check the spelling, or clear the search to see all GOVMV apps and sites.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(0);
});

test('app switcher shows a scroll hint and keeps filtered results in the grid', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  await expect(page.getByRole('button', { name: 'View more', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View less', exact: true })).toHaveCount(0);

  const hint = page.locator('button', { hasText: 'Scroll to view more' });
  await expect(hint).toBeVisible();
  await expect(hint).toHaveAttribute('tabindex', '0');

  const scroller = page.locator('[data-switcher-scroll]');
  await hint.click();
  await expect
    .poll(() => scroller.evaluate((el) => (el as HTMLElement).scrollTop))
    .toBeGreaterThan(4);

  await page.getByRole('button', { name: 'Filter' }).click();
  await page.getByRole('menuitemradio', { name: 'Sites only' }).click();
  const defence = page.getByRole('option', { name: 'Minister of Defence and National Service' });
  await expect(defence).toBeVisible();
  const box = await defence.evaluate((el) => {
    const grid = el.closest('[role="listbox"], [role="grid"]');
    return {
      direction: getComputedStyle(el).flexDirection,
      width: Math.round(el.getBoundingClientRect().width),
      columns: grid ? getComputedStyle(grid).gridTemplateColumns : '',
    };
  });
  expect(box.direction).toBe('column');
  expect(box.width).toBe(165);
  expect(box.columns).toContain('165px');

  await page.setViewportSize({ width: 1600, height: 966 });
  const gutter = await defence.evaluate((el) => {
    const next = el.nextElementSibling;
    if (!(next instanceof HTMLElement)) return null;
    const a = el.getBoundingClientRect();
    const b = next.getBoundingClientRect();
    return {
      gap: Math.round(b.left - a.right),
      sameRow: Math.abs(a.top - b.top) < 2,
    };
  });
  expect(gutter?.sameRow).toBe(true);
  expect(gutter?.gap).toBeGreaterThanOrEqual(18);
  expect(gutter?.gap).toBeLessThanOrEqual(24);

  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await search.fill('Locker');
  await expect(hint).toHaveAttribute('aria-hidden', 'true');
  await expect(hint).toHaveAttribute('tabindex', '-1');
});

test('entity name wraps and the mobile menu starts at 1120px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Long entity' }).click();

  const title = page.getByText(
    'Ministry of Fisheries, Agriculture and Ocean Resources, Longer Affairs, National Planning, Coastal Administration, and Maritime Safety',
  );
  await expect(title).toBeVisible();
  const metrics = await title.evaluate((el) => {
    const style = getComputedStyle(el);
    const header = el.closest('[data-header-surface]');
    return {
      width: Math.round(el.getBoundingClientRect().width),
      clamp: style.webkitLineClamp,
      headerHeight: header ? Math.round(header.getBoundingClientRect().height) : 0,
    };
  });
  expect(metrics.width).toBeLessThanOrEqual(320);
  expect(metrics.clamp === 'none' || metrics.clamp === '').toBe(true);
  expect(metrics.headerHeight).toBeGreaterThan(72);

  await page.setViewportSize({ width: 1120, height: 800 });
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible();

  await page.setViewportSize({ width: 1121, height: 800 });
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
});

test('reduced motion still opens the app switcher', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();
});

async function pasteSearchQuery(
  page: import('@playwright/test').Page,
  search: import('@playwright/test').Locator,
  text: string,
) {
  await search.focus();
  await search.evaluate((el: HTMLInputElement) => {
    el.select();
  });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(async (value) => {
    await navigator.clipboard.writeText(value);
  }, text);
  await page.keyboard.press('ControlOrMeta+v');
}

test('Dhivehi mode forces Thaana search and never falls back to English names', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Fixture language' }).click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');

  await page.getByRole('button', { name: 'އެޕް މެނޫ ހުޅުއްވާ' }).click();
  await expect(
    page.getByRole('heading', { name: 'ސަރުކާރުގެ ޚިދުމަތްތަކާއި ސައިޓްތައް ބައްލަވާލައްވާ' }),
  ).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'އެޕް އަދި ސައިޓްތައް ހޯއްދަވާ' }).first();

  await page.keyboard.type('lokar');
  await expect(search).toHaveValue('ލޮކަރ');
  await expect(page.getByRole('option', { name: 'ލޮކަރ' })).toBeVisible();
  await expect(page.getByRole('option', { name: 'ހުށަހެޅުންތައް' })).toHaveCount(0);

  // Replacing a selected character with the identical mapped character keeps the value,
  // moves the caret after it, and leaves the next keystroke in native undo history. Select
  // the trailing standalone ރ: Thaana vowel marks join the preceding letter into one
  // grapheme, so selecting the first letter would natively replace "ލޮ" as a unit.
  await search.evaluate((el: HTMLInputElement) => el.setSelectionRange(4, 5));
  await page.keyboard.type('r');
  await expect(search).toHaveValue('ލޮކަރ');
  await page.keyboard.type('r');
  await expect(search).toHaveValue('ލޮކަރރ');
  await page.keyboard.press('ControlOrMeta+z');
  await expect(search).toHaveValue('ލޮކަރ');
  // Dhivehi counts put digits before the noun: "1 ނަތީޖާ", not "ނަތީޖާ 1".
  await expect(page.getByText(/^1 ނަތީޖާ/).first()).toBeVisible();
  await expect(page.getByText(/1 އެޕް/).first()).toBeVisible();

  await search.fill('ލޮ');
  await expect(page.getByRole('option', { name: 'ލޮކަރ' })).toBeVisible();

  await pasteSearchQuery(page, search, 'Locker');
  await expect(search).toHaveValue('Locker');
  await expect(page.getByRole('option')).toHaveCount(0);
  await expect(
    page.getByText('“Locker” އާ ގުޅޭ އެޕެއް ނުވަތަ ސައިޓެއް ނުފެނުނު', { exact: true }),
  ).toBeVisible();

  await pasteSearchQuery(page, search, 'Wallet');
  await expect(search).toHaveValue('Wallet');
  await expect(page.getByRole('option')).toHaveCount(0);

  await pasteSearchQuery(page, search, 'Gov.mv');
  await expect(search).toHaveValue('Gov.mv');
  await expect(page.getByRole('option', { name: /Gov\.mv/ })).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/$/);
});

test('language switch while open changes matching and Thaana translation immediately', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  const searchEn = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await searchEn.fill('Locker');
  await expect(page.getByRole('option', { name: 'Locker' })).toBeVisible();

  // Native click is intercepted by the modal overlay, so dispatch it from the page.
  await page.getByRole('button', { name: 'Fixture language' }).evaluate((el: HTMLButtonElement) => {
    el.click();
  });
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
  await expect(
    page.getByRole('heading', { name: 'ސަރުކާރުގެ ޚިދުމަތްތަކާއި ސައިޓްތައް ބައްލަވާލައްވާ' }),
  ).toBeVisible();

  await expect(page.getByRole('option', { name: 'Locker' })).toHaveCount(0);
  await expect(page.getByRole('option', { name: 'ލޮކަރ' })).toHaveCount(0);

  const searchDv = page.getByRole('searchbox', { name: 'އެޕް އަދި ސައިޓްތައް ހޯއްދަވާ' }).first();
  await searchDv.fill('');
  await searchDv.focus();
  await page.keyboard.type('lok');
  await expect(searchDv).toHaveValue('ލޮކ');
  await expect(page.getByRole('option', { name: 'ލޮކަރ' })).toBeVisible();

  await page.getByRole('button', { name: 'Fixture language' }).evaluate((el: HTMLButtonElement) => {
    el.click();
  });
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'ltr');
  const searchBack = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await searchBack.fill('');
  await searchBack.focus();
  await page.keyboard.type('Lock');
  await expect(searchBack).toHaveValue('Lock');
  await expect(page.getByRole('option', { name: 'Locker' })).toBeVisible();
});

test('Dhivehi type-to-search from the dialog surface remaps to Thaana', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Fixture language' }).click();
  await page.getByRole('button', { name: 'އެޕް މެނޫ ހުޅުއްވާ' }).click();

  const search = page.getByRole('searchbox', { name: 'އެޕް އަދި ސައިޓްތައް ހޯއްދަވާ' }).first();
  await page.keyboard.type('lokar');
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('ލޮކަރ');
  await expect(page.getByRole('option', { name: 'ލޮކަރ' })).toBeVisible();
});
