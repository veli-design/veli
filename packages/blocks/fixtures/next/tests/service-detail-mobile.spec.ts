import { test, expect } from '@playwright/test';

test('mobile guideline matches Figma and manual scroll reaches terminal TOC without spacers', async ({
  page,
}, info) => {
  for (const language of ['en', 'dv']) {
    for (const width of [440, 1512]) {
      await page.setViewportSize({ width, height: 956 });
      await page.goto('/services');
      await page.addStyleTag({
        content:
          '@font-face { font-family: Inter; src: url("/fonts/inter-latin.woff2"); font-weight: 100 900; }',
      });
      await page.evaluate(async () => {
        await document.fonts.load('600 24px Inter');
      });
      if (language === 'dv')
        await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
      const summary = page.locator('.veli-service-detail-service-summary');
      await summary.getByRole('button').click();
      await expect(summary.getByRole('button')).toHaveCSS('display', 'inline-block');
      await expect(summary.getByRole('button')).toHaveCSS('padding', '0px');
      if (language === 'dv') {
        await expect(page.locator('.veli-service-detail-meta-value-row')).toContainText('ރުފިޔާ');
        await expect(page.locator('.veli-service-detail-meta-value-row')).not.toContainText('MVR');
        await expect(
          page.locator('.veli-service-detail-meta-value-row bdi').first(),
        ).toHaveAttribute('dir', 'ltr');
      }
      await page
        .locator('.veli-service-detail-root .veli-service-detail-guideline-trigger')
        .click();
      const sheet = page.locator('.veli-service-detail-guideline-sheet');
      const scroll = page.locator('.veli-service-detail-guideline-scroll');
      const links = page.locator(
        '.veli-service-detail-guideline-sidebar .veli-service-detail-toc-link',
      );
      const fab = page.locator('.veli-service-detail-mobile-toc-button');
      await expect(sheet).toBeVisible();
      await sheet.evaluate(async (node) => {
        await Promise.all(node.getAnimations().map((animation) => animation.finished));
      });
      const originalHeight = await scroll.evaluate((node) => node.scrollHeight);
      if (width < 768)
        await page.screenshot({
          path: info.outputPath(language + '-mobile-sheet.png'),
          animations: 'disabled',
        });
      if (width < 768) {
        await expect(page.locator('.veli-service-detail-fee-table')).toHaveCSS(
          'border-radius',
          '16px',
        );
        expect(await sheet.evaluate((node) => node.getBoundingClientRect().top)).toBe(48);
        await expect(page.locator('.veli-service-detail-guideline-sheet-header')).toHaveCSS(
          'padding',
          '20px 24px 16px',
        );
        await expect(page.locator('.veli-service-detail-guideline-sidebar')).not.toBeVisible();
        const box = await fab.boundingBox();
        expect(box?.width).toBe(52);
        expect(box?.height).toBe(52);
        expect(language === 'dv' ? box!.x : width - box!.x - box!.width).toBe(20);
        expect(956 - box!.y - box!.height).toBe(32);
        await fab.click();
        const panel = page.locator('.veli-service-detail-mobile-toc-panel');
        await expect(panel).toBeVisible();
        expect((await panel.boundingBox())!.width).toBe(320);
        await panel.locator('a').nth(6).click();
        await expect(panel).toHaveCount(0);
      } else {
        await expect(fab).not.toBeVisible();
        await links.nth(6).click();
      }
      await expect(links.nth(6)).toHaveAttribute('aria-current', 'location');
      await scroll.press('End');
      await expect(links.last()).toHaveAttribute('aria-current', 'location');
      expect(await scroll.evaluate((node) => node.scrollHeight)).toBe(originalHeight);
      expect(
        await scroll.evaluate((node) => node.scrollHeight - node.scrollTop - node.clientHeight),
      ).toBeLessThanOrEqual(1);
      if (width < 768) {
        await fab.click();
        const panel = page.locator('.veli-service-detail-mobile-toc-panel');
        await expect(panel.locator('a').last()).toHaveAttribute('aria-current', 'location');
        await page.screenshot({
          path: info.outputPath(language + '-mobile-toc.png'),
          animations: 'disabled',
        });
        await page.keyboard.press('Escape');
        await expect(panel).toHaveCount(0);
        await expect(sheet).toBeVisible();
        await expect(fab).toBeFocused();
        await fab.click();
        await panel.locator('a').first().click();
        await expect(panel).toHaveCount(0);
        await expect(fab).toBeFocused();
        await expect(links.first()).toHaveAttribute('aria-current', 'location');
      }
      await page.keyboard.press('Escape');
      await expect(sheet).toHaveCount(0);
    }
  }
});

test('manual forms have spacing and readable titles and empty metadata does not make a blank summary', async ({
  page,
}) => {
  await page.goto('/services');
  await page.getByRole('combobox', { name: 'Mode', exact: true }).selectOption('manual');
  const rows = page.locator('.veli-service-detail-download-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toHaveCSS('row-gap', '12px');
  await expect(page.locator('.veli-service-detail-download-list')).toHaveCSS('row-gap', '24px');
  await expect(rows.first().getByRole('heading')).toContainText('Business registration');
  const second = await rows.nth(1).boundingBox();
  const first = await rows.first().boundingBox();
  expect(second!.y - first!.y - first!.height).toBeGreaterThanOrEqual(24);
  await page.getByRole('button', { name: 'Simple manual forms', exact: true }).click();
  await expect(page.locator('.veli-service-detail-download-list')).toHaveCSS('row-gap', '8px');
  await expect(rows.first()).toHaveAttribute('aria-label', 'Business registration application');
  await expect(rows.first().locator('h3')).toHaveClass('veli-service-detail-sr-only');
  await expect(rows.nth(1)).toHaveCSS('padding-block-start', '0px');
  await page.getByRole('button', { name: 'Missing data', exact: true }).click();
  await expect(page.locator('.veli-service-detail-summary')).toHaveCount(0);
  await expect(page.locator('.veli-service-detail-root')).toContainText(
    'Service guideline is not available yet.',
  );
});
