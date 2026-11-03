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
      const more = first.locator('.veli-service-detail-service-summary').getByRole('button');
      await expect(more).toHaveText(/^\+7 /);
      await more.focus();
      await page.keyboard.press('Enter');
      await expect(more).toHaveAttribute('aria-expanded', 'true');
      const names = first.locator('.veli-service-detail-service-summary > span > span');
      await expect(names).toHaveCount(9);
      await page.keyboard.press('Space');
      await expect(more).toHaveAttribute('aria-expanded', 'false');
      await expect(names).toHaveCount(2);

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

for (const [language, width] of [
  ['en', 1512],
  ['dv', 390],
] as const) {
  test(`supplementary guideline composition and multiline checklist: ${language}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 982 });
    await page.goto('/services/composition');
    if (language === 'dv') {
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
      await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
    }
    const multiline = page.locator('#controlled .veli-service-detail-prerequisites > li').last();
    await expect(multiline).toContainText('\n');
    expect(
      await multiline.evaluate((node) => {
        const text = node.firstChild!;
        const next = text.textContent!.indexOf('\n') + 1;
        const line = document.createRange();
        line.setStart(text, 0);
        line.setEnd(text, 1);
        const first = line.getBoundingClientRect().top;
        line.setStart(text, next);
        line.setEnd(text, next + 1);
        return line.getBoundingClientRect().top > first;
      }),
    ).toBe(true);

    const trigger = page.locator('#first .veli-service-detail-guideline-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('.veli-service-detail-guideline-sheet');
    const sections = sheet.locator('.veli-service-detail-guideline-section');
    const headings = await sections.locator(':scope > h2').allTextContents();
    expect(headings.slice(0, 2)).toEqual(
      language === 'en' ? ['Before you start', 'Fees'] : ['ފެށުމުގެ ކުރިން', 'ފީ'],
    );
    const table = sheet.getByRole('table');
    await expect(table).toHaveAccessibleName(language === 'en' ? 'Fees by application type' : /.+/);
    await expect(table.getByRole('rowheader')).toHaveCount(2);
    await expect(table).toHaveCSS('border-radius', '16px');
    await expect(table.getByRole('cell').first()).toHaveCSS('padding', '14px 20px');
    await expect(table.getByRole('cell').last()).toHaveCSS('border-bottom-width', '0px');
    expect(await table.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    const supplementary = sections.filter({ has: page.locator('[data-variant="compact"]') });
    await expect(supplementary).toHaveCount(3);
    const lastSections = await sections.all();
    const cards = sheet.locator('[data-variant="compact"]');
    await expect(cards).toHaveCount(3);
    for (const [index, count] of [2, 1, 1, 0].entries()) {
      const section = lastSections[lastSections.length - 4 + index];
      await expect(section.locator('[data-variant="compact"] dt')).toHaveCount(count);
      await expect(section.locator(':scope > h2')).toHaveCount(1);
    }
    await expect(sheet.locator('.veli-service-detail-prerequisites > li').last()).toHaveCSS(
      'white-space',
      'pre-line',
    );
    await cards.first().scrollIntoViewIfNeeded();
    await expect(cards.first()).toHaveCSS('padding', '16px 24px');
    await expect(cards.first()).toHaveCSS('border-radius', '16px');
    const geometry = await cards
      .first()
      .locator('.veli-service-detail-meta-item')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { x: r.x, y: r.y };
        }),
      );
    if (width === 1512) expect(geometry[0].y).toBe(geometry[1].y);
    else expect(geometry[1].y).toBeGreaterThan(geometry[0].y);
    expect(await cards.first().evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    const audit = await new AxeBuilder({ page })
      .include('.veli-service-detail-guideline-sheet')
      .withRules(['definition-list', 'dlitem', 'region', 'aria-dialog-name'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await cards.first().screenshot({ path: info.outputPath('compact-card.png') });

    if (width < 768) await page.locator('.veli-service-detail-mobile-toc-button').click();
    const toc = page.locator(
      width < 768
        ? '.veli-service-detail-mobile-toc-panel .veli-service-detail-toc-link'
        : '.veli-service-detail-guideline-sidebar .veli-service-detail-toc-link',
    );
    await expect(toc).toHaveText(headings);
    await toc.last().focus();
    await page.keyboard.press('Enter');
    if (width < 768) {
      await expect(page.locator('.veli-service-detail-mobile-toc-panel')).toHaveCount(0);
      await expect(page.locator('.veli-service-detail-mobile-toc-button')).toBeFocused();
    } else await expect(toc.last()).toHaveAttribute('aria-current', 'location');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

test('Figma reference guideline retains the original registration instructions', async ({
  page,
}) => {
  await page.goto(
    '/storybook/iframe.html?id=blocks-service-detail--service-changes&viewMode=story',
  );
  await page.getByRole('button', { name: /^Read the guideline/ }).click();
  const registration = page.locator('.veli-service-detail-guideline-section').filter({
    has: page.getByRole('heading', { name: 'Register a New Company', exact: true }),
  });
  await expect(registration).toHaveCount(1);
  await expect(registration).toContainText(
    'Enter the proposed business name, contact address and principal activities.',
  );
  await expect(registration).not.toContainText('Identify the registration record');
  await expect(registration.locator('[data-variant="compact"]')).toHaveCount(1);
});
