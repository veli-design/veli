import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const language of ['en', 'dv']) {
  test(`independent summary disclosures and information controls: ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto('/services');
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    await expect(page.locator('.veli-service-detail-time-trigger')).toHaveCount(0);
    await expect(page.locator('.veli-service-detail-info-trigger')).toHaveCount(0);
    await page.getByRole('button', { name: 'Summary breakdowns', exact: true }).click();
    const time = page.locator('.veli-service-detail-time-trigger');
    await expect(time).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(time.nth(i)).toHaveAttribute('aria-expanded', 'false');
      await time.nth(i).focus();
      await page.keyboard.press(i === 0 ? 'Enter' : 'Space');
      await expect(time.nth(i)).toHaveAttribute('aria-expanded', 'true');
      const target = await time.nth(i).getAttribute('aria-controls');
      expect(target).toBeTruthy();
      await expect(page.locator(`[id="${target}"]`)).toBeVisible();
    }
    await page
      .locator('.veli-service-detail-meta-value-row button:not(.veli-service-detail-time-trigger)')
      .click();
    await expect(page.locator('.veli-service-detail-summary').getByRole('group')).toHaveCount(3);
    await expect(time.first()).toHaveAttribute('aria-expanded', 'true');
    const accessibility = await new AxeBuilder({ page })
      .include('.veli-service-detail-summary')
      .withRules(['definition-list', 'dlitem', 'button-name'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await time.first().click();
    await expect(time.first()).toHaveAttribute('aria-expanded', 'false');
    const collapsedId = await time.first().getAttribute('aria-controls');
    const collapsed = page.locator(`[id="${collapsedId}"]`);
    await expect(collapsed).toHaveAttribute('aria-hidden', 'true');
    expect(await collapsed.evaluate((node) => node.getBoundingClientRect().height)).toBe(0);
    await expect(time.last()).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.veli-service-detail-summary').getByRole('group')).toHaveCount(2);
    await time.last().click();
    await page
      .locator('.veli-service-detail-meta-value-row button:not(.veli-service-detail-time-trigger)')
      .click();
    for (const index of [0, 1]) {
      const info = page.locator('.veli-service-detail-info-trigger').nth(index);
      await info.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await info.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(info).toHaveAttribute('aria-describedby', /.+/);
      const tooltipId = await info.getAttribute('aria-describedby');
      await expect(page.locator(`[id="${tooltipId}"]`)).toHaveRole('tooltip');
      await expect(page.locator(`[id="${tooltipId}"]`)).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await expect(info).toBeFocused();
      await page.keyboard.press(index === 0 ? 'Enter' : 'Space');
      const popover = page.getByRole('dialog', {
        name: (await info.getAttribute('aria-label')) ?? '',
      });
      await expect(popover).toBeVisible();
      await expect(popover).toBeFocused();
      await expect(info).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('tooltip')).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(popover).toHaveCount(0);
      await expect(info).toBeFocused();
    }
  });
}

test('partial metadata keeps existing callers usable', async ({ page }) => {
  await page.goto('/services');
  for (const variant of ['fees only', 'processing only', 'without fees']) {
    await page.getByRole('combobox', { name: 'Metadata', exact: true }).selectOption(variant);
    await expect(page.locator('.veli-service-detail-metadata')).toHaveCount(1);
    await expect(
      page.locator('.veli-service-detail-metadata > .veli-service-detail-meta-item'),
    ).toHaveCount(variant === 'without fees' ? 4 : 2);
    await expect(page.locator('.veli-service-detail-metadata:empty')).toHaveCount(0);
    if (variant === 'fees only') {
      await page.getByRole('button', { name: 'Show fees', exact: true }).click();
      await expect(page.locator('.veli-service-detail-breakdown')).toBeVisible();
    }
  }
});

test('mobile touch controls open details and dismiss information', async ({
  browser,
  browserName,
}) => {
  test.skip(browserName === 'firefox', 'Playwright Firefox does not emulate touch contexts.');
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3219/services');
    await page.getByRole('button', { name: 'Summary breakdowns', exact: true }).tap();
    await page.locator('.veli-service-detail-time-trigger').first().tap();
    await expect(page.locator('.veli-service-detail-time-trigger').first()).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await page.locator('.veli-service-detail-info-trigger').first().tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.touchscreen.tap(5, 5);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.veli-service-detail-info-trigger').first()).toBeFocused();
  } finally {
    await context.close();
  }
});
