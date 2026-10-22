import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { warnAccessibilityViolations } from './accessibility.mjs';

for (const language of ['en', 'dv'])
  test(`${language}: standalone footer retains content at every size and has one contentinfo`, async ({
    page,
  }, info) => {
    await page.goto(`/errors?view=footer&lang=${language}`);
    const footer = page.locator('.veli-page-navigation-footer');
    const content = await footer.innerText();
    for (const width of [320, 440, 768, 1512]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await footer.innerText()).toBe(content);
      await expect(footer.getByRole('navigation')).toHaveCount(2);
      const headings =
        language === 'dv'
          ? ['ބައިތަކަށް ދިއުން', 'ބޭނުންތެރި ލިންކުތައް']
          : ['Jump to', 'Useful links'];
      for (const name of headings)
        await expect(footer.getByRole('navigation', { name, exact: true })).toBeVisible();
      if (width >= 768) {
        const columns = await footer
          .locator('nav')
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        expect(Math.abs(columns[0] - columns[1])).toBeLessThan(1);
      }
      if (width === 440 && language === 'dv') {
        expect(
          await footer
            .locator('nav > p')
            .first()
            .evaluate((node) => getComputedStyle(node).fontSize),
        ).toBe('15px');
      }

      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      await expect(footer.locator('img')).toHaveAttribute(
        'src',
        '/blocks/example-organization-emblem.svg',
      );
      expect(
        await footer
          .locator('img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.naturalWidth > 0 &&
              image.width / image.height > 0.8 &&
              image.width / image.height < 0.9,
          ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: info.outputPath(`footer-${width}.png`), fullPage: true });
    }
    await warnAccessibilityViolations(new AxeBuilder({ page }).analyze());
  });

test('footer router links forward keyboard focus and preserve Next navigation', async ({
  page,
}) => {
  await page.goto('/errors?view=footer');
  const footer = page.locator('.veli-page-navigation-footer');
  const about = footer.getByRole('link', { name: 'About', exact: true });
  await footer.getByRole('link', { name: 'Website', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(about).toBeFocused();
  await expect(about).toHaveAttribute('data-focus-visible', 'true');
  await page.evaluate(() => {
    (window as Window & { footerMarker?: boolean }).footerMarker = true;
  });
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'About this service' })).toBeVisible();
  expect(
    await page.evaluate(() => (window as Window & { footerMarker?: boolean }).footerMarker),
  ).toBe(true);
});

test('no default logo, optional empty footer, external markers and named social links', async ({
  page,
}) => {
  await page.goto('/errors?view=footer&variant=no-logo');
  const footer = page.locator('.veli-page-navigation-footer');
  await expect(footer.locator('img')).toHaveCount(0);
  const external = footer.getByRole('link', { name: 'National Tender Board', exact: true });
  await expect(external).toHaveAttribute('href', 'https://www.finance.gov.mv/');
  await expect(external).not.toHaveAttribute('target', '_blank');
  await expect(external.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  await expect(footer.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute(
    'href',
    'mailto:hello@example.test',
  );
  await expect(footer.getByRole('list', { name: 'Social and contact links' })).toBeVisible();
  await page.goto('/errors?view=footer&variant=empty-footer');
  await expect(page.locator('.veli-page-navigation-footer')).toHaveCount(0);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
});

for (const language of ['en', 'dv'])
  for (const group of ['internal', 'external'])
    test(`${language} ${group}: single navigation group fills its available width`, async ({
      page,
    }) => {
      await page.goto(`/errors?view=footer&lang=${language}&variant=${group}-only`);
      const footer = page.locator('.veli-page-navigation-footer');
      const nav = footer.getByRole('navigation');
      await expect(nav).toHaveCount(1);
      for (const width of [320, 440, 768, 1280, 1512]) {
        await page.setViewportSize({ width, height: 900 });
        const dimensions = await nav.evaluate((node) => ({
          width: node.getBoundingClientRect().width,
          available: node.parentElement!.getBoundingClientRect().width,
        }));
        expect(Math.abs(dimensions.width - dimensions.available)).toBeLessThan(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    });

for (const language of ['en', 'dv']) {
  test(`Storybook footer ${language}: localized defaults and explicit controls`, async ({
    page,
  }) => {
    const url = `/storybook/iframe.html?id=blocks-page-navigation-footer--default&viewMode=story&veli-language=${language}`;
    await page.goto(url);
    const footer = page.locator('.veli-page-navigation-footer');
    await expect(footer).toHaveAttribute(
      'aria-label',
      language === 'dv' ? 'ސަފުޙާގެ ލިންކުތައް' : 'Page navigation',
    );
    await expect(footer.getByRole('navigation')).toHaveCount(2);
    await expect(footer.locator('img')).toHaveCount(1);
    // Controls update args through this channel; URL args cannot represent every complex prop.
    await page.evaluate(() => {
      const channel = (
        window as Window & {
          __STORYBOOK_ADDONS_CHANNEL__: { emit: (event: string, payload: unknown) => void };
        }
      ).__STORYBOOK_ADDONS_CHANNEL__;
      channel.emit('updateStoryArgs', {
        storyId: 'blocks-page-navigation-footer--default',
        updatedArgs: {
          label: 'Custom footer',
          identity: { name: 'Custom organization', description: 'Custom description' },
          internalLinks: [{ id: 'custom', label: 'Custom link', href: '/custom' }],
          externalLinks: [
            { id: 'resource', label: 'Custom resource', href: 'https://example.test/' },
          ],
          socialLinks: [],
        },
      });
    });
    await expect(footer).toHaveAttribute('aria-label', 'Custom footer');
    await expect(footer.getByText('Custom organization', { exact: true })).toBeVisible();
    await expect(footer.getByText('Custom description', { exact: true })).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Custom link', exact: true })).toHaveAttribute(
      'href',
      '/custom',
    );
    await expect(
      footer.getByRole('link', { name: 'Custom resource', exact: true }),
    ).toHaveAttribute('href', 'https://example.test/');
    await expect(footer.locator('img')).toHaveCount(0);
    await expect(footer.getByRole('navigation')).toHaveCount(2);
    await expect(footer.getByRole('link')).toHaveCount(2);
  });
}
