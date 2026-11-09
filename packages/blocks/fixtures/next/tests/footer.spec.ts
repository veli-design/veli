import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { warnAccessibilityViolations } from './accessibility.mjs';
import { waitForMotion } from './wait-for-motion';

test('copied footer renders, hydrates, preserves keyboard focus and Next navigation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toHaveCount(1);
  // Scope to the footer — site-header also exposes an About nav link.
  const about = footer.getByRole('link', { name: 'About', exact: true });
  await page.getByRole('button', { name: 'Long labels' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Host notes' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(about).toBeFocused();
  await expect(about).toHaveAttribute('data-focus-visible', 'true');
  await page.evaluate(() => {
    (window as Window & { navigationMarker?: string }).navigationMarker = 'retained';
  });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'About this service' })).toBeVisible();
  expect(
    await page.evaluate(() => (window as Window & { navigationMarker?: string }).navigationMarker),
  ).toBe('retained');
  expect(errors).toEqual([]);
});

for (const width of [320, 1280])
  for (const language of ['en', 'dv'])
    for (const theme of ['light', 'dark']) {
      test(`${width}px ${language} ${theme}: reflow and accessibility`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/');
        // Root fixture uses Fixture* labels so they do not collide with site-header controls.
        if (language === 'dv') await page.getByRole('button', { name: 'Fixture language' }).click();
        if (theme === 'dark') await page.getByRole('button', { name: 'Fixture theme' }).click();
        await waitForMotion(page);
        const results = await new AxeBuilder({ page }).analyze();
        await warnAccessibilityViolations(results);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('footer.png'), fullPage: true });
        await page.getByRole('button', { name: 'Long labels' }).click();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '32px';
        });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({
          path: testInfo.outputPath('long-labels-large-text.png'),
          fullPage: true,
        });
      });
    }
