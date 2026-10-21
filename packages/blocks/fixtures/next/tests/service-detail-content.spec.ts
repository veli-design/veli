import { test, expect } from '@playwright/test';

test('long service names remain readable and expansion stays reachable in EN/DV', async ({
  page,
}, info) => {
  for (const language of ['en', 'dv']) {
    for (const width of [320, 440, 1280, 1512]) {
      await page.setViewportSize({ width, height: 956 });
      await page.goto('/services');
      if (language === 'dv')
        await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
      for (const count of ['1', '3', '4', 'unbroken']) {
        await page
          .getByRole('combobox', { name: 'Service count', exact: true })
          .selectOption(count);
        const summary = page.locator('.veli-service-detail-service-summary');
        const names = summary.locator(':scope > span');
        const button = summary.getByRole('button');
        if (count === '4') {
          await expect(button).toHaveAttribute('aria-expanded', 'false');
          const inside = await button.evaluate((node) => {
            const button = node.getBoundingClientRect();
            const card = node.closest('.veli-service-detail-card')!.getBoundingClientRect();
            return button.left >= card.left && button.right <= card.right;
          });
          expect(inside).toBe(true);
          await button.click();
          await expect(button).toHaveAttribute('aria-expanded', 'true');
        } else await expect(button).toHaveCount(0);
        await expect(names).toHaveCSS('white-space', 'normal');
        const geometry = await names.evaluate((node) => {
          const card = node.closest('.veli-service-detail-card')!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(node);
          return {
            clipped: Array.from(range.getClientRects()).some(
              (rect) => rect.left < card.left - 1 || rect.right > card.right + 1,
            ),
            overflow: node.scrollWidth > node.clientWidth + 1,
            pageOverflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry).toEqual({ clipped: false, overflow: false, pageOverflow: false });
        if (count === '3' && width === 1280)
          await page.screenshot({
            path: info.outputPath(`${language}-long-services.png`),
            fullPage: true,
          });
        if (count === '4') await button.click();
      }
    }
  }
});

test('empty guidelines use the existing unavailable state and empty summaries have no action', async ({
  page,
}) => {
  for (const language of ['en', 'dv']) {
    await page.goto('/services');
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    for (const value of [
      'empty sections',
      'empty section bodies',
      'null body',
      'blank body',
      'empty array',
      'empty fragment',
    ]) {
      await page
        .getByRole('combobox', { name: 'Guideline content', exact: true })
        .selectOption(value);
      await expect(
        page.locator('.veli-service-detail-root .veli-service-detail-guideline-trigger'),
      ).toHaveCount(0);
      await expect(page.locator('.veli-service-detail-root')).toContainText(
        language === 'en'
          ? 'Service guideline is not available yet.'
          : 'ޚިދުމަތުގެ ގައިޑްލައިން އަދި ލިބެން ނެތް.',
      );
    }
    await page
      .getByRole('combobox', { name: 'Guideline content', exact: true })
      .selectOption('supplied');
    const sheet = page.locator('.veli-service-detail-guideline-sheet');
    for (const value of ['empty', 'blank']) {
      await page.getByRole('combobox', { name: 'Summary', exact: true }).selectOption(value);
      await page
        .locator('.veli-service-detail-root .veli-service-detail-guideline-trigger')
        .click();
      await expect(sheet).toBeVisible();
      await expect(sheet.locator('.veli-service-detail-guideline-actions button')).toHaveCount(1);
      await expect(sheet.locator('.veli-service-detail-guideline-section')).not.toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(sheet).toHaveCount(0);
    }
    await page
      .getByRole('combobox', { name: 'Guideline content', exact: true })
      .selectOption('zero body');
    await page.getByRole('combobox', { name: 'Summary', exact: true }).selectOption('zero');
    await page.locator('.veli-service-detail-root .veli-service-detail-guideline-trigger').click();
    await expect(sheet.locator('.veli-service-detail-rich-text')).toHaveText('0');
    await sheet.locator('button[aria-pressed]').click();
    await expect(sheet.locator('.veli-service-detail-rich-text')).toHaveText('0');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
  }
});

test('Dhivehi fee numbers use the Figma Waheed glyphs and keep the currency word separated', async ({
  page,
}, info) => {
  await page.goto('/services');
  await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
  await page.evaluate(async () => {
    await document.fonts.load('700 19px "MV A Waheed"');
  });
  const number = page.locator('.veli-service-detail-meta-value-row bdi').first();
  await expect(number).toHaveText('100 – 2,000');
  await expect(number).toHaveCSS('font-size', '19px');
  await expect(number).toHaveCSS('font-weight', '700');
  expect(
    await number.evaluate((node) => ({
      lang: node.lang,
      separator: node.nextSibling?.textContent,
      text: node.textContent,
    })),
  ).toEqual({ lang: '', separator: ' ރުފިޔާ', text: '100 – 2,000' });
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  const { root } = await client.send('DOM.getDocument');
  const { nodeId } = await client.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: '.veli-service-detail-meta-value-row bdi',
  });
  const { fonts } = await client.send('CSS.getPlatformFontsForNode', { nodeId });
  expect(fonts.some((font) => /waheed/i.test(font.familyName) && font.glyphCount > 0)).toBe(true);
  await page.screenshot({ path: info.outputPath('dhivehi-fee-spacing-and-font.png') });
  await client.detach();
});

test('requestable summary announces loading until the host supplies content', async ({ page }) => {
  await page.goto('/services');
  await page.getByRole('combobox', { name: 'Summary', exact: true }).selectOption('request');
  await page.locator('.veli-service-detail-root .veli-service-detail-guideline-trigger').click();
  await page.getByRole('button', { name: 'Show guideline summary', exact: true }).click();
  await expect(page.locator('.veli-service-detail-rich-text [role="status"]')).toHaveText(
    'Loading summary',
  );
  // Simulate host data arriving while the modal remains open.
  const summarySelect = page.getByRole('combobox', {
    name: 'Summary',
    exact: true,
    includeHidden: true,
  });
  await summarySelect.evaluate((node) => {
    (node as HTMLSelectElement).value = 'supplied';
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('.veli-service-detail-rich-text')).toContainText(
    'Prepare your registration reference',
  );
  await summarySelect.evaluate((node) => {
    (node as HTMLSelectElement).value = 'empty';
    node.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('.veli-service-detail-guideline-section')).not.toHaveCount(0);
  await expect(page.locator('.veli-service-detail-guideline-actions button')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('outside-control')).toContainText('Requests: 1');
});
