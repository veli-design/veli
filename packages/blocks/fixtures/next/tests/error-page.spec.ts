import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { errorPageMessages } from '../error-page-messages';

const kinds = ['401', '403', '404', '500', '503', 'offline'] as const;
for (const width of [320, 768, 1512])
  for (const language of ['en', 'dv'] as const)
    for (const theme of ['light', 'dark']) {
      test(`${width}px ${language} ${theme}: all error states and navigation footer`, async ({
        page,
      }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const kind of kinds) {
          await page.goto(`/errors?kind=${kind}&lang=${language}&theme=${theme}&animation=static`);
          const copy = errorPageMessages[language].pages[kind];
          await expect(page.getByRole('heading', { name: copy.title, exact: true })).toBeVisible();
          const error = page.locator('.veli-error-page');
          await expect(error).toHaveAttribute('lang', language);
          await expect(error).toHaveAttribute('dir', language === 'dv' ? 'rtl' : 'ltr');
          await expect(error.getByText(copy.detail, { exact: true })).toBeVisible();
          await expect(error.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'true');
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          // Canvas must contain pixels rather than a blank, successfully mounted element.
          expect(
            await error.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
              const pixels = canvas
                .getContext('2d')!
                .getImageData(0, 0, canvas.width, canvas.height).data;
              return pixels.some((value, index) => index % 4 === 3 && value > 0);
            }),
          ).toBe(true);
          await expect(page.getByRole('contentinfo')).toHaveCount(1);
          if (kind === '404') {
            const axe = await new AxeBuilder({ page }).analyze();
            expect(axe.violations).toEqual([]);
          }
          await page.screenshot({ path: info.outputPath(`${kind}.png`), fullPage: true });
        }
        expect(errors).toEqual([]);
      });
    }

test('recovery callback, pending state, omitted actions and real Next navigation', async ({
  page,
}) => {
  await page.goto('/errors?kind=500&variant=pending&footer=none');
  const retry = page
    .locator('.veli-error-page')
    .getByRole('link', { name: 'Try again', exact: true });
  await expect(retry).toBeDisabled();
  await expect(retry).toHaveAttribute('aria-busy', 'true');
  await page.getByRole('button', { name: 'Fixture pending' }).click();
  await retry.click();
  await expect(page.getByTestId('retry-count')).toHaveText('1');
  await page.goto('/errors?kind=404&variant=no-actions&footer=none');
  await expect(page.locator('.veli-error-page').getByRole('link')).toHaveCount(0);
  await expect(page.locator('.veli-error-page').getByText('or', { exact: true })).toHaveCount(0);
  await page.goto('/errors?kind=404');
  await page.evaluate(() => {
    (window as Window & { navigationMarker?: string }).navigationMarker = 'retained';
  });
  const home = page
    .locator('.veli-error-page')
    .getByRole('link', { name: 'Return home', exact: true });
  await home.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'About this service' })).toBeVisible();
  expect(
    await page.evaluate(() => (window as Window & { navigationMarker?: string }).navigationMarker),
  ).toBe('retained');
});

test('keyboard artwork changes, reduced motion, theme and kind changes without playback controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/errors?kind=404&footer=none');
  const artwork = page.locator('.veli-error-artwork');
  await expect(artwork).toHaveAttribute('data-ready', 'true');
  const canvas = artwork.locator('canvas');
  const before = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  const change = artwork.getByRole('button', { name: /Activate to change/ });
  await change.focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(before);
  await expect(artwork.getByRole('button')).toHaveCount(1);
  await expect(artwork.getByRole('button', { name: /Pause animation|Play animation/ })).toHaveCount(
    0,
  );
  const reduced = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.getByRole('button', { name: 'Fixture theme' }).click();
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(reduced);
  const themed = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(themed);
  await expect(artwork.getByRole('button')).toHaveCount(1);
  await expect(artwork.getByRole('button', { name: /Pause animation|Play animation/ })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Fixture kind' }).click();
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
  await expect(artwork).toHaveAttribute('data-ready', 'true');
  await expect(artwork.locator('canvas')).toHaveCount(1);
});

test('static artwork has no controls; palette overrides resolve from the block', async ({
  page,
}) => {
  await page.goto('/errors?kind=404&animation=static&footer=none');
  const art = page.locator('.veli-error-artwork');
  await expect(art).toHaveAttribute('data-ready', 'true');
  await expect(art.getByRole('button')).toHaveCount(0);
  await page.addStyleTag({
    content:
      '.veli-error-page { --veli-error-ink:#ff00ff; --veli-error-lagoon:#ff00ff; --veli-error-patch:#ff00ff; --veli-error-accent:#ff00ff; }',
  });
  await page.getByRole('button', { name: 'Fixture theme' }).click();
  expect(
    await art.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < pixels.length; i += 4)
        if (pixels[i] === 255 && pixels[i + 1] === 0 && pixels[i + 2] === 255 && pixels[i + 3] > 0)
          return true;
      return false;
    }),
  ).toBe(true);
});

test('unavailable canvas keeps recovery usable and exposes no dead artwork controls', async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/errors?kind=404&footer=none');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'false');
  await expect(page.locator('.veli-error-artwork').getByRole('button')).toHaveCount(0);
  await page.locator('.veli-error-page').getByRole('link', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(/about#search/);
});

for (const language of ['en', 'dv'])
  test(`${language}: long copy and enlarged text reflow without hiding footer content`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/errors?variant=long&lang=${language}&animation=static`);
    await expect(page.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '32px';
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const selector of ['.veli-error-page', '.veli-page-navigation-footer']) {
      const box = await page.locator(selector).boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }
    await expect(page.locator('.veli-page-navigation-footer nav')).toHaveCount(2);
    await page.screenshot({ path: info.outputPath('large-text.png'), fullPage: true });
  });

test('failed lazy artwork keeps content and recovery links usable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/\/storybook\/assets\/404-[^/]+\.js$/, (route) => route.abort());
  await page.goto(
    '/storybook/iframe.html?id=blocks-error-page--default&viewMode=story&veli-language=en',
  );
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'false');
  await expect(page.locator('.veli-error-artwork').getByRole('button')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Search', exact: true })).toHaveAttribute(
    'href',
    '#api',
  );
  expect(errors).toEqual([]);
});

test('offline artwork needs no extra artwork chunk', async ({ page }) => {
  const requests: string[] = [];
  const artworkChunk = /\/storybook\/assets\/(?:401|403|404|500|503)-[^/]+\.js$/;
  page.on('request', (request) => {
    if (artworkChunk.test(request.url())) requests.push(request.url());
  });
  await page.route(artworkChunk, (route) => route.abort());
  await page.goto(
    '/storybook/iframe.html?id=blocks-error-page--offline&viewMode=story&veli-language=en',
  );
  await expect(page.getByRole('heading', { name: 'You’re offline', exact: true })).toBeVisible();
  await expect(page.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'true');
  expect(requests).toEqual([]);
});

test('system theme changes repaint artwork without remounting the page', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/errors?theme=system&animation=static&footer=none');
  await expect(page.locator('.veli-error-artwork')).toHaveAttribute('data-ready', 'true');
  const canvas = page.locator('.veli-error-artwork canvas');
  const before = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
  await page.evaluate(() => {
    (window as Window & { systemThemeMarker?: boolean }).systemThemeMarker = true;
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('[data-color-scheme="system"]').first()).toHaveAttribute(
    'data-theme',
    'dark',
  );
  await expect
    .poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL()))
    .not.toBe(before);
  expect(
    await page.evaluate(
      () => (window as Window & { systemThemeMarker?: boolean }).systemThemeMarker,
    ),
  ).toBe(true);
});
