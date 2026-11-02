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
  await page.keyboard.press('ArrowDown');
  await expect(foreign).toHaveAttribute('data-highlighted', 'true');
  await expect(defence).not.toHaveAttribute('data-highlighted', 'true');
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
