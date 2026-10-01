import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openTray(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /^Notifications/ }).click();
  return page.getByRole('dialog', { name: 'Notifications', exact: true });
}

test('desktop width stays 389px across viewport sizes and notification states', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/notifications');
  for (const width of [1025, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const state of ['ready', 'empty', 'loading', 'error', 'long']) {
      await page.getByLabel('State').selectOption(state);
      const tray = await openTray(page);
      await expect(tray).toHaveCSS('width', '389px');
      await page.keyboard.press('Escape');
      await expect(tray).toBeHidden();
    }
  }
});

test('menu keyboard behavior, controlled filtering, pending mutation and live updates', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/notifications');
  const tray = await openTray(page);
  await expect(tray.getByRole('listitem')).toHaveCount(3);
  const options = tray.getByRole('button', { name: 'Notification options' });
  await options.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(options).toBeFocused();
  await expect(tray).toBeVisible();
  await options.click();
  await page.getByRole('menuitem', { name: 'Show unread', exact: true }).click();
  await expect(tray.getByRole('listitem')).toHaveCount(2);
  await options.click();
  await page.getByRole('menuitem', { name: 'Mark all as read', exact: true }).click();
  await expect(tray.getByRole('status')).toHaveText('Marking all as read…');
  await expect(tray.getByRole('listitem')).toHaveCount(2);
  await options.click();
  await expect(page.getByRole('menuitem', { name: 'Marking all as read…' })).toBeDisabled();
  await page.keyboard.press('Escape');
  // Simulates the app receiving a completed mutation while the overlay is open.
  await page.locator('#complete-mark').evaluate((button: HTMLButtonElement) => button.click());
  await expect(tray.getByText('You have no unread notifications.')).toBeVisible();
  await options.click();
  await expect(
    page.getByRole('menuitem', { name: 'Mark all as read', exact: true }),
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(options).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(tray).toBeHidden();
  await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeFocused();
  await expect(page.getByText('Mark calls: 1; load calls: 0; action calls: 0')).toBeVisible();
  await openTray(page);
  await page
    .locator('#receive-notification')
    .evaluate((button: HTMLButtonElement) => button.click());
  await expect(tray.getByRole('listitem')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Notifications, 1 Unread' })).toBeFocused();
  expect(errors).toEqual([]);
});

test('paging retains rows and app-owned actions do not activate the row link', async ({ page }) => {
  await page.goto('/notifications');
  const tray = await openTray(page);
  await tray.getByRole('button', { name: 'Remind me later' }).click();
  await expect(page).toHaveURL(/\/notifications$/);
  await tray.getByRole('button', { name: 'View more' }).click();
  await expect(tray.getByRole('button', { name: 'View more' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  await expect(tray.getByRole('listitem')).toHaveCount(3);
  await page.locator('#complete-load').evaluate((button: HTMLButtonElement) => button.click());
  await expect(tray.getByRole('listitem')).toHaveCount(4);
  await expect(tray.getByRole('button', { name: 'View more' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByText('Mark calls: 0; load calls: 1; action calls: 1')).toBeVisible();
});

test('initial loading, empty, error, retry and stale rows remain distinct', async ({ page }) => {
  await page.goto('/notifications');
  for (const state of ['loading', 'empty', 'error', 'refresh-error']) {
    await page.getByLabel('State').selectOption(state);
    const tray = await openTray(page);
    if (state === 'loading') {
      await expect(tray.getByRole('status')).toHaveText('Loading notifications…');
      await expect(tray.getByText('You do not have any notifications, yet.')).toHaveCount(0);
    } else if (state === 'empty') {
      await expect(tray.getByText('You do not have any notifications, yet.')).toBeVisible();
    } else {
      await expect(tray.getByRole('alert')).toHaveText('Notifications could not be loaded.');
      await expect(tray.getByRole('listitem')).toHaveCount(state === 'error' ? 0 : 3);
      await tray.getByRole('button', { name: 'Try again' }).click();
      await expect(tray.getByRole('listitem')).toHaveCount(3);
      await expect(tray.getByRole('alert')).toHaveCount(0);
      // Retry removes its focused button; wait for React Aria to restore focus inside the dialog.
      await expect(tray.getByRole('button', { name: 'Notification options' })).toBeFocused();
    }
    await page.keyboard.press('Escape');
    await expect(tray).toBeHidden();
    await expect(page.getByRole('button', { name: /^Notifications/ })).toBeFocused();
  }
});

for (const routing of ['next-link', 'provider'])
  test(`${routing}: row links preserve client routing and keyboard activation`, async ({
    page,
  }) => {
    await page.goto('/notifications');
    await page.getByRole('combobox', { name: 'Routing', exact: true }).selectOption(routing);
    const tray = await openTray(page);
    await page.evaluate(() => {
      (window as Window & { navigationMarker?: boolean }).navigationMarker = true;
    });
    const link = tray.getByRole('link').first();
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'About this service' })).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as Window & { navigationMarker?: boolean }).navigationMarker,
      ),
    ).toBe(true);
  });

test('mobile sheet traps focus, closes with its button, backdrop and downward gesture', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/notifications');
  const tray = await openTray(page);
  const bounds = await tray.boundingBox();
  expect(bounds!.y).toBeGreaterThan(0);
  expect(bounds!.height).toBeLessThanOrEqual(844 * 0.85 + 2);
  await tray.getByRole('button', { name: 'Close notifications' }).click();
  await expect(tray).toBeHidden();
  await openTray(page);
  await page.mouse.click(10, 10);
  await expect(tray).toBeHidden();
  await openTray(page);
  await expect(page.locator('[data-entering]')).toHaveCount(0);
  const handle = tray.locator('[data-notification-drag-handle]');
  let handleBounds = await handle.boundingBox();
  const surface = handle.locator('..');
  const surfaceTop = (await surface.boundingBox())!.y;
  await page.mouse.move(handleBounds!.x + handleBounds!.width / 2, handleBounds!.y + 10);
  await page.mouse.down();
  await page.mouse.move(handleBounds!.x + handleBounds!.width / 2, handleBounds!.y + 30);
  await expect(surface).toHaveAttribute('data-dragging', 'true');
  expect((await surface.boundingBox())!.y).toBeGreaterThan(surfaceTop);
  await page.mouse.up();
  await expect(tray).toBeVisible();
  await expect(surface).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  handleBounds = await handle.boundingBox();
  await page.mouse.move(handleBounds!.x + handleBounds!.width / 2, handleBounds!.y + 10);
  await page.mouse.down();
  await page.mouse.move(handleBounds!.x + handleBounds!.width / 2, handleBounds!.y + 310, {
    steps: 5,
  });
  await page.mouse.up();
  await expect(tray).toBeHidden();
  await openTray(page);
  await expect(page.locator('[data-entering]')).toHaveCount(0);
  const headingBounds = await tray.getByRole('heading').boundingBox();
  await page.mouse.move(headingBounds!.x + 20, headingBounds!.y + 10);
  await page.mouse.down();
  await page.mouse.move(headingBounds!.x + 20, headingBounds!.y + 210, { steps: 5 });
  await page.mouse.up();
  await expect(tray).toBeHidden();
  await expect(page.getByRole('button', { name: /^Notifications/ })).toBeFocused();
});

test('desktop rows scroll to the tray edge without a fixed bottom gutter', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto('/notifications');
  await page.getByLabel('State').selectOption('long');
  const tray = await openTray(page);
  const scrollArea = tray.locator('.veli-notification-scroll');
  const content = tray.locator('.veli-notification-tray');
  await expect(content).toHaveCSS('padding-bottom', '0px');
  const contentBounds = await content.boundingBox();
  const scrollBounds = await scrollArea.boundingBox();
  expect(scrollBounds!.y + scrollBounds!.height).toBeCloseTo(
    contentBounds!.y + contentBounds!.height,
    0,
  );
  await tray.getByRole('link').last().focus();
  await expect(tray.getByRole('heading')).toBeVisible();
});

for (const width of [320, 1280])
  for (const language of ['en', 'dv'])
    for (const theme of ['light', 'dark']) {
      test(`${width}px ${language} ${theme}: notification reflow, focus and accessibility`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/notifications');
        if (language === 'dv') await page.getByRole('button', { name: 'Change language' }).click();
        if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
        await page.getByLabel('State').selectOption('long');
        const trigger = page.getByRole('button', {
          name: language === 'en' ? /^Notifications/ : /^ނޯޓިފިކޭޝަންތައް/,
        });
        await trigger.click();
        const tray = page.getByRole('dialog');
        await expect(tray).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        expect(await tray.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true,
        );
        const scrollArea = tray.locator('.veli-notification-scroll');
        const scrollBounds = await scrollArea.boundingBox();
        expect(scrollBounds!.y + scrollBounds!.height).toBeLessThanOrEqual(900);
        const headingTop = (await tray.getByRole('heading').boundingBox())!.y;
        await tray.getByRole('link').last().focus();
        expect((await tray.getByRole('heading').boundingBox())!.y).toBe(headingTop);
        await page.screenshot({ path: testInfo.outputPath('notification-tray.png') });
        const buttons = tray.getByRole('button');
        await buttons.last().focus();
        await page.keyboard.press('Tab');
        expect(await tray.evaluate((element) => element.contains(document.activeElement))).toBe(
          true,
        );
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '32px';
        });
        expect(await tray.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true,
        );
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
      });
    }
