import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('preview banner is fixed, reserves spacer space, and can hide', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/preview-banner');

  const banner = page.locator('[data-preview-banner="draft-mode"]');
  const region = page.locator('[data-preview-banner-region]');
  const spacer = page.locator('[data-preview-banner-spacer]');
  await expect(banner).toBeVisible();
  await expect(region).toHaveCSS('position', 'fixed');
  await expect(spacer).toBeVisible();
  const spacerHeight = await spacer.evaluate((el) => (el as HTMLElement).offsetHeight);
  expect(spacerHeight).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Hide banner' }).click();
  await expect(region).toHaveAttribute('aria-hidden', 'true');
  await expect(banner).not.toBeVisible();

  await page.getByRole('button', { name: 'Show banner' }).click();
  await expect(region).not.toHaveAttribute('aria-hidden', 'true');
  await expect(banner).toBeVisible();
  expect(errors).toEqual([]);
});

test('RTL preview banner does not overflow and passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/preview-banner');
  await page.getByRole('button', { name: 'Fixture language' }).click();
  await expect(page.locator('.min-h-screen')).toHaveAttribute('dir', 'rtl');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
