import { test, expect } from '@playwright/test';
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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toBeVisible();

  await expect(content).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-preview-banner-region]')).toHaveAttribute('aria-hidden', 'true');

  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('heading', { name: 'Browse government services and sites' }),
  ).toHaveCount(0);
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
    page.getByRole('heading', { name: 'Browse government services and sites' }),
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
