import { test, expect } from '@playwright/test';

const root = '.veli-service-detail-root';
const sheet = '.veli-service-detail-guideline-sheet';
const scroll = '.veli-service-detail-guideline-scroll';

test('service details retain EN/DV, themes, four application modes and responsive portals', async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  await page.goto('/services');
  const outsideFont = await page
    .getByTestId('outside-control')
    .evaluate((node) => getComputedStyle(node).fontSize);
  for (const language of ['en', 'dv']) {
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    for (const dark of [false, true]) {
      if (dark) await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
      for (const width of [440, 1512]) {
        await page.setViewportSize({ width, height: 982 });
        for (const mode of ['online', 'mixed', 'external', 'manual']) {
          await page.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode);
          await expect(page.locator(root)).toBeVisible();
          expect(
            await page.locator(root).evaluate((node) => getComputedStyle(node).direction),
          ).toBe(language === 'dv' ? 'rtl' : 'ltr');
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          expect(
            await page
              .getByTestId('outside-control')
              .evaluate((node) => getComputedStyle(node).fontSize),
          ).toBe(outsideFont);
          if (mode !== 'manual') {
            if (mode === 'external') {
              const icon = page
                .getByRole('button', { name: 'Fixture start', exact: true })
                .locator('svg');
              await expect(icon).toHaveCount(1);
              expect(await icon.evaluate((node) => node.getBoundingClientRect().width)).toBe(20);
              // Approved Phosphor ArrowUpRight Bold outline; regular has a different path.
              await expect(icon.locator('path')).toHaveAttribute(
                'd',
                'M204,64V168a12,12,0,0,1-24,0V93L72.49,200.49a12,12,0,0,1-17-17L163,76H88a12,12,0,0,1,0-24H192A12,12,0,0,1,204,64Z',
              );
            }
            await page.getByRole('button', { name: 'Fixture start', exact: true }).click();
          } else
            await expect(
              page
                .locator(root)
                .getByRole('button', { name: /Download.*Form|ފޯމު ޑައުންލޯޑް/ })
                .first(),
            ).toBeDisabled();
          await page.screenshot({
            path: info.outputPath(`${language}-${dark ? 'dark' : 'light'}-${width}-${mode}.png`),
            fullPage: true,
          });
        }
        await page.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('online');
        const teaser = page.locator(root).locator('.veli-service-detail-guideline-trigger');
        await teaser.click();
        await expect(page.locator(sheet)).toBeVisible();
        const surface = page.locator(sheet);
        const overlay = page.locator('.veli-service-detail-guideline-overlay');
        await expect(overlay).toHaveAttribute('lang', language);
        await expect(overlay).toHaveAttribute('dir', language === 'dv' ? 'rtl' : 'ltr');
        await expect(overlay).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
        expect(
          await page.locator(scroll).evaluate((node) => getComputedStyle(node).direction),
        ).toBe('ltr');
        const geometry = await surface.evaluate((node) => {
          const rail = node.querySelector('.veli-service-detail-guideline-scroll')!;
          return {
            sheetRight: node.getBoundingClientRect().right,
            railRight: rail.getBoundingClientRect().right,
          };
        });
        expect(Math.abs(geometry.sheetRight - geometry.railRight)).toBeLessThan(2);
        const toc = surface.locator('.veli-service-detail-toc-link');
        if (width < 768) {
          await page.locator('.veli-service-detail-mobile-toc-button').click();
          await page
            .locator('.veli-service-detail-mobile-toc-panel .veli-service-detail-toc-link')
            .last()
            .click();
        } else await toc.last().click();
        await expect(toc.last()).toHaveAttribute('aria-current', 'location');
        await page.waitForTimeout(500);
        await expect(toc.last()).toHaveAttribute('aria-current', 'location');
        await page.locator(scroll).hover();
        await page.mouse.wheel(0, -2500);
        await expect(toc.first()).toHaveAttribute('aria-current', 'location');
        await page.screenshot({
          path: info.outputPath(`${language}-${dark ? 'dark' : 'light'}-${width}-sheet.png`),
        });
        await page.keyboard.press('Tab');
        expect(await surface.evaluate((node) => node.contains(document.activeElement))).toBe(true);
        await page.keyboard.press('Escape');
        await expect(surface).toHaveCount(0);
        await expect(teaser).toBeFocused();
        await teaser.click();
        await expect(
          page.locator(sheet).locator('.veli-service-detail-toc-link').first(),
        ).toHaveAttribute('aria-current', 'location');
        await page.keyboard.press('Escape');
        await expect(page.locator(sheet)).toHaveCount(0);
      }
      if (dark) await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
    }
  }
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('fees, expansion, dialogs, copy errors, supplied/requested summaries and missing content', async ({
  page,
}) => {
  await page.goto('/services');
  const fees = page.getByRole('button', { name: 'Show fees', exact: true });
  await fees.click();
  await expect(page.getByRole('button', { name: 'Hide fees', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.getByRole('button', { name: '+6 more', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show less', exact: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  const applying = page.getByRole('button', { name: 'Apply on Public Services', exact: true });
  await applying.hover();
  expect(await applying.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  );
  await applying.click();
  await expect(page.getByRole('dialog', { name: 'How to apply', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(applying).toBeFocused();
  const open = async () => {
    await page.locator(root).locator('.veli-service-detail-guideline-trigger').click();
    await expect(page.locator(sheet)).toBeVisible();
  };
  const close = async () => {
    await page.keyboard.press('Escape');
    await expect(page.locator(sheet)).toHaveCount(0);
  };
  await open();
  await page.getByRole('button', { name: 'Copy guideline link', exact: true }).click();
  await expect(page.locator(sheet).getByRole('status')).toHaveText('Guideline link copied');
  await page.getByRole('button', { name: 'Show guideline summary', exact: true }).click();
  await expect(page.locator(sheet)).toContainText('Prepare your registration reference');
  await close();
  await page.getByRole('button', { name: 'Copy failure', exact: true }).click();
  await open();
  await page.getByRole('button', { name: 'Copy guideline link', exact: true }).click();
  await expect(page.locator(sheet).getByRole('status')).toHaveText('Could not copy link');
  await close();
  for (const state of ['pending', 'error', 'request']) {
    await page.getByRole('combobox', { name: 'Summary', exact: true }).selectOption(state);
    await open();
    await page.getByRole('button', { name: 'Show guideline summary', exact: true }).click();
    if (state === 'pending') await expect(page.locator(sheet)).toContainText('Loading summary');
    if (state === 'error')
      await expect(page.locator(sheet).getByRole('alert')).toHaveText('Fixture summary error');
    await close();
  }
  await expect(page.getByTestId('outside-control')).toContainText('Requests: 1');
  await page.getByRole('button', { name: 'Missing data', exact: true }).click();
  await expect(page.locator(root)).toContainText('Service guideline is not available yet.');
  await expect(page.locator(root).locator('.veli-service-detail-meta-item')).toHaveCount(0);
  await expect(page.locator(root).locator('.veli-service-detail-summary')).toHaveCount(0);
});

test('reduced motion fades without travel and dialogs lock scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/services');
  await page.locator(root).locator('.veli-service-detail-guideline-trigger').click();
  await expect(page.locator(sheet)).toBeVisible();
  const motion = await page.locator(sheet).evaluate((node) => ({
    name: getComputedStyle(node).animationName,
    duration: getComputedStyle(node).animationDuration,
  }));
  expect(motion.name).toBe('veli-service-detail-fade-in');
  expect(motion.duration).toBe('0.45s');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
    'hidden',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator(sheet)).toHaveCount(0);
});
