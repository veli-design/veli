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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toBeVisible();

  const search = page.getByRole('searchbox', { name: 'Search apps and sites' }).first();
  await search.fill('Locker');
  await expect(page.getByRole('option', { name: 'Locker' })).toBeVisible();
  await search.fill('Applications');
  await expect(page.getByRole('option', { name: 'My Applications' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toHaveCount(0);
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

  const languageSwitch = page.getByRole('button', { name: 'Change language' });
  await expect(languageSwitch).toHaveText('ދިވެހި');
  await languageSwitch.click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
  await expect(languageSwitch).toHaveText('English');

  await languageSwitch.click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'ltr');
  await expect(languageSwitch).toHaveText('ދިވެހި');
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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
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
  await expect(
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toHaveCount(0);

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
    return {
      direction: getComputedStyle(option).flexDirection,
      clamp: name ? getComputedStyle(name).webkitLineClamp : '',
    };
  });
  expect(tile.direction).toBe('column');
  expect(tile.clamp === 'none' || tile.clamp === '').toBe(true);
});

test('app switcher shows a scroll hint and keeps filtered results in the grid', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open app switcher' }).click();

  await expect(page.getByRole('button', { name: 'View more' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'View less' })).toHaveCount(0);

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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toBeVisible();
});
