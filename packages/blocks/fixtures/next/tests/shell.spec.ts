import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForMotion } from './wait-for-motion';

test('app switcher fades main and hides preview banner; Escape restores them', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/shell');

  const content = page.locator('[data-shell-chrome="content"]');
  const banner = page.locator('[data-preview-banner="draft-mode"]');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(banner).toBeVisible();

  const trigger = page.getByRole('button', { name: 'Open app switcher' });
  await trigger.click();
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();

  await expect(content).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-preview-banner-region]')).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Browse government apps and sites' })).toHaveCount(
    0,
  );
  // Main chrome clears with switcherOpen; the banner waits for switcherRendered
  // (collapse animation / transitionend).
  await expect(content).not.toHaveAttribute('aria-hidden', 'true');
  await waitForMotion(page);
  await expect(page.locator('[data-preview-banner-region]')).not.toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(banner).toBeVisible();
  expect(errors).toEqual([]);
});

test('reduced motion still fades chrome when the app switcher opens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/shell');

  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await expect(
    page.getByRole('heading', { name: 'Browse government apps and sites' }),
  ).toBeVisible();
  await expect(page.locator('[data-shell-chrome="content"]')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('RTL shell does not overflow and passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/shell');
  await page.getByRole('button', { name: 'Fixture language' }).click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
  await waitForMotion(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

const SKIP_LINK = 'a[href="#main-content"]';

/** Put the sequential focus starting point before the first element so the next Tab is the first tab stop. */
async function focusDocumentStart(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const anchor = document.createElement('div');
    anchor.tabIndex = -1;
    document.body.prepend(anchor);
    anchor.focus();
  });
}

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 800 },
]) {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`skip link is the first tab stop and moves focus to main (${viewport.name}, ${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/shell');
      if (dir === 'rtl') {
        await page.getByRole('button', { name: 'Fixture language' }).click();
        await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
        await waitForMotion(page);
      }
      await focusDocumentStart(page);

      await page.keyboard.press('Tab');
      const skipLink = page.getByRole('link', { name: 'Skip to main content' });
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();

      const box = await skipLink.boundingBox();
      expect(box).not.toBeNull();
      const { x, y, width } = box!;
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(36);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + width).toBeLessThanOrEqual(viewport.width);
      if (dir === 'ltr') expect(x + width / 2).toBeLessThan(viewport.width / 2);
      else expect(x + width / 2).toBeGreaterThan(viewport.width / 2);

      await page.keyboard.press('Enter');
      await expect(page.locator('main#main-content')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Fixture language' })).toBeFocused();
    });
  }
}

test('skip link moves focus to main when the hash is already #main-content', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/shell#main-content');
  const skipLink = page.locator(SKIP_LINK);
  await skipLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
  await page.keyboard.press('Tab');
  await skipLink.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
});

test('skip link is inert while the app switcher is open', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/shell');
  const skipLink = page.locator(SKIP_LINK);
  await expect(skipLink).not.toHaveAttribute('inert', /.*/);

  await page.getByRole('button', { name: 'Open app switcher' }).click();
  await expect(skipLink).toHaveAttribute('aria-hidden', 'true');
  await expect(skipLink).toHaveAttribute('inert', /.*/);
  await expect(skipLink).toHaveAttribute('tabindex', '-1');

  await page.keyboard.press('Escape');
  await waitForMotion(page);
  await expect(skipLink).not.toHaveAttribute('aria-hidden', 'true');
  await expect(skipLink).not.toHaveAttribute('inert', /.*/);
});

test('skip link is inert while the mobile menu is open', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/shell');
  const skipLink = page.locator(SKIP_LINK);

  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
  await expect(skipLink).toHaveAttribute('aria-hidden', 'true');
  await expect(skipLink).toHaveAttribute('inert', /.*/);
});

for (const theme of ['light', 'dark'] as const) {
  test(`focused skip link passes axe (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/shell');
    if (theme === 'dark') await page.getByRole('button', { name: 'Fixture theme' }).click();
    await waitForMotion(page);
    await page.locator(SKIP_LINK).focus();
    await expect(page.locator(SKIP_LINK)).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
