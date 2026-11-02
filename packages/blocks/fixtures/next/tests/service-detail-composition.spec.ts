import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const language of ['en', 'dv']) {
  for (const width of [1512, 390]) {
    test(`custom composition, independent disclosures and consumer actions: ${language}/${width}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 982 });
      await page.goto('/services/composition');
      if (language === 'dv')
        await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
      const first = page.locator('#first');
      const second = page.locator('#second');
      await expect(first.getByText('12', { exact: true })).toBeVisible();

      const triggers = first.locator('.veli-service-detail-breakdown-trigger');
      await triggers.first().focus();
      await page.keyboard.press('Enter');
      await expect(triggers.first()).toHaveAttribute('aria-expanded', 'true');
      await expect(triggers.last()).toHaveAttribute('aria-expanded', 'false');
      await triggers.last().focus();
      await page.keyboard.press('Space');
      await expect(triggers.last()).toHaveAttribute('aria-expanded', 'true');
      for (const trigger of await triggers.all()) {
        const id = await trigger.getAttribute('aria-controls');
        await expect(page.locator(`[id="${id}"]`)).toBeVisible();
      }
      await expect(
        second.locator('.veli-service-detail-breakdown-trigger[aria-expanded="true"]'),
      ).toHaveCount(0);
      const ids = await page.locator('[id]').evaluateAll((nodes) => nodes.map((node) => node.id));
      expect(new Set(ids).size).toBe(ids.length);

      const items = first.locator('.veli-service-detail-metadata > div');
      const boxes = await items.evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width };
        }),
      );
      if (width === 390) expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
      else {
        expect(boxes[0].y).toBe(boxes[1].y);
        expect(boxes[2].width).toBeGreaterThan(boxes[0].width);
        expect(language === 'dv' ? boxes[0].x > boxes[1].x : boxes[0].x < boxes[1].x).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const customAction = first.getByRole('button', {
        name: language === 'dv' ? 'އޮންލައިން ހުށަހަޅާ' : 'Apply online',
        exact: true,
      });
      await customAction.click();
      await expect(first.locator('header [role="status"]')).toContainText(
        language === 'dv' ? 'އެދުން ހުށަހެޅުން ހޮވިއްޖެ' : 'Application selected',
      );
      const audit = await new AxeBuilder({ page })
        .include('#first')
        .withRules([
          'definition-list',
          'dlitem',
          'button-name',
          'aria-valid-attr-value',
          'nested-interactive',
        ])
        .analyze();
      expect(audit.violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test('reusable dialogs preserve names, portal theme, dismissal and focus return', async ({
  page,
}) => {
  await page.goto('/services/composition');
  await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
  const first = page.locator('#first');
  const trigger = first.getByRole('button', { name: 'Continue with Island Services' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const information = page.getByRole('dialog', { name: 'How to apply' });
  await expect(information).toBeVisible();
  await expect(page.locator('.veli-service-detail-overlay')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Escape');
  await expect(information).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const guideline = first.locator('.veli-service-detail-guideline-trigger');
  await guideline.click();
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(guideline).toBeFocused();
});

test('wrapper still supports controlled and initially open guidelines', async ({ page }) => {
  await page.goto('/services/composition');
  await page.getByRole('button', { name: 'Open controlled guideline', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Controlled open' })).toHaveText('true');
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('status', { name: 'Controlled open' })).toHaveText('false');
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toHaveCount(0);
  await page.getByRole('button', { name: 'Mount default-open guideline', exact: true }).click();
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toHaveCount(0);
  await page.locator('#default-open .veli-service-detail-guideline-trigger').click();
  await expect(page.locator('.veli-service-detail-guideline-sheet')).toBeVisible();
});

test('composed content renders on the server without duplicate IDs', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3219/services/composition');
    await expect(
      page.locator('#first').getByText('Available places', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('#first').getByText('12', { exact: true })).toBeVisible();
    const ids = await page.locator('[id]').evaluateAll((nodes) => nodes.map((node) => node.id));
    expect(new Set(ids).size).toBe(ids.length);
  } finally {
    await context.close();
  }
});
