import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openPanel(page: Page) {
  const trigger = page.getByRole('button', { name: 'Open account panel' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Your account' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  return dialog;
}

for (const width of [320, 639, 640, 1280]) {
  test(`${width}px: keyboard containment, dismissal and focus restoration`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/accounts');
    const dialog = await openPanel(page);
    expect(await dialog.evaluate((element) => element.closest('header') === null)).toBe(true);
    if (width >= 640) {
      const panelBox = await dialog.boundingBox();
      const triggerBox = await page
        .getByRole('button', { name: 'Open account panel' })
        .boundingBox();
      if (!panelBox || !triggerBox) throw new Error('Missing anchored panel geometry');
      expect(Math.abs(panelBox.x + panelBox.width - triggerBox.x - triggerBox.width)).toBeLessThan(
        2,
      );
      expect(panelBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height);
    } else {
      const panelBox = await dialog.boundingBox();
      if (!panelBox) throw new Error('Missing bottom sheet geometry');
      expect(panelBox.x).toBe(0);
      expect(panelBox.width).toBe(width);
    }
    await expect(dialog.getByRole('radiogroup')).toHaveCount(width < 640 ? 0 : 1);
    for (let index = 0; index < 12; index++) {
      await page.keyboard.press(index % 2 ? 'Shift+Tab' : 'Tab');
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      );
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
    await openPanel(page);
    await page.mouse.click(1, 1);
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('host callbacks retain the panel, account updates and theme changes are controlled', async ({
  page,
}) => {
  await page.goto('/accounts');
  const dialog = await openPanel(page);
  await dialog.getByRole('button', { name: /Ali Hassan/ }).focus();
  await page.keyboard.press('Enter');
  await expect(dialog.getByText('Ali Hassan')).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Ali Hassan/ })).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Sign out' }).click();
  await dialog.getByRole('button', { name: 'Manage account' }).click();
  await dialog.getByRole('radio', { name: 'Light' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('radio', { name: 'Dark' })).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-calls]')).toHaveText(
    'Selection: 1; logout: 1; delegation: 0; management: 1',
  );
});

test('empty, loading, failed, display-only and disabled actions have distinct semantics', async ({
  page,
}) => {
  await page.goto('/accounts');
  for (const state of [
    'empty',
    'loading',
    'error',
    'pending',
    'disabled',
    'action-error',
    'display-only',
    'one',
  ]) {
    await page.getByLabel('State').selectOption(state);
    const dialog = await openPanel(page);
    if (state === 'empty') {
      await dialog.getByRole('button', { name: 'Setup Delegation' }).click();
      await expect(dialog).toBeVisible();
    }
    if (state === 'loading' || state === 'error') {
      await expect(dialog.getByText('Add other accounts')).toHaveCount(0);
      await expect(dialog.getByRole(state === 'loading' ? 'status' : 'alert')).toContainText(
        state === 'loading' ? 'Loading accounts' : 'Could not load',
      );
    }
    if (state === 'pending' || state === 'disabled') {
      const signOut = dialog.getByRole('button', { name: 'Sign out' });
      await expect(
        dialog.getByText(state === 'pending' ? 'Working…' : 'Unavailable').first(),
      ).toBeVisible();
      await expect(signOut).toHaveAttribute(
        state === 'pending' ? 'aria-busy' : 'disabled',
        state === 'pending' ? 'true' : '',
      );
      // Native click attempts must not invoke a blocked action.
      await signOut.evaluate((button: HTMLButtonElement) => button.click());
      await expect(dialog.getByRole('button', { name: /Ali Hassan/ })).toHaveAttribute(
        state === 'pending' ? 'aria-busy' : 'disabled',
        state === 'pending' ? 'true' : '',
      );
    }
    if (state === 'action-error') {
      await expect(dialog.getByRole('alert')).toHaveCount(3);
      await expect(dialog.getByRole('button', { name: 'Sign out' })).toHaveAccessibleDescription(
        'Sign out failed.',
      );
    }
    if (state === 'display-only') {
      await expect(dialog.getByRole('button', { name: /Ali Hassan/ })).toHaveCount(0);
      await expect(dialog.getByRole('listitem')).toHaveCount(2);
    }
    if (state === 'one') await expect(dialog.getByRole('listitem')).toHaveCount(1);
    await page.keyboard.press('Escape');
  }
  await expect(page.locator('[data-calls]')).toHaveText(
    'Selection: 0; logout: 0; delegation: 1; management: 0',
  );
  await page.getByLabel('State').selectOption('trigger-disabled');
  await expect(page.getByRole('button', { name: 'Open account panel' })).toBeDisabled();
});

test('mobile sheet portals out of the header, drag cancellation resets and downward drag dismisses', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/accounts');
  await page.locator('main').evaluate((element) => {
    const filler = document.createElement('div');
    filler.style.height = '2000px';
    element.append(filler);
  });
  const dialog = await openPanel(page);
  // React Aria deliberately uses background inertness instead of aria-modal
  // to preserve programmatic focus in Safari iframe consumers.
  expect(
    await page.locator('main').evaluate((element) => element.closest('[inert]') !== null),
  ).toBe(true);
  expect(await dialog.evaluate((element) => element.closest('header') === null)).toBe(true);
  await page.mouse.move(1, 1);
  await page.mouse.wheel(0, 500);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  const handle = page.locator('[data-account-drag-handle]');
  const startBox = await handle.boundingBox();
  if (!startBox) throw new Error('Missing drag handle');
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2 + 40);
  await handle.dispatchEvent('pointercancel', { pointerId: 1 });
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await expect(handle.locator('..')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const box = await handle.boundingBox();
  if (!box) throw new Error('Missing drag handle');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 280, { steps: 5 });
  await page.mouse.up();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
});

test('breakpoint changes dismiss without replacing the trigger avatar', async ({ page }) => {
  await page.goto('/accounts');
  await openPanel(page);
  await page
    .getByRole('button', { name: 'Open account panel' })
    .evaluate((button) => button.setAttribute('data-retained', 'true'));
  await page.setViewportSize({ width: 639, height: 800 });
  await expect(page.getByRole('dialog')).toBeHidden();
  const trigger = page.getByRole('button', { name: 'Open account panel' });
  await expect(trigger).toHaveAttribute('data-retained', 'true');
  await expect(trigger).toBeFocused();
  await openPanel(page);
  await page.setViewportSize({ width: 640, height: 800 });
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const width of [320, 1280])
  for (const language of ['en', 'dv'])
    for (const theme of ['light', 'dark']) {
      test(`${width}px ${language} ${theme}: accessible reflow, long content and reduced motion`, async ({
        page,
      }, testInfo) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/accounts');
        if (language === 'dv') await page.getByRole('button', { name: 'Change language' }).click();
        if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
        await page.getByLabel('State').selectOption('long');
        await page
          .getByRole('button', {
            name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
            exact: true,
          })
          .click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        expect(
          (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
        ).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('account-panel.png'), fullPage: true });
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '32px';
        });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await expect(
          dialog.getByRole('button', { name: language === 'dv' ? 'ސައިން އައުޓް' : 'Sign out' }),
        ).toBeInViewport();
        await page.screenshot({
          path: testInfo.outputPath('account-panel-large-text.png'),
          fullPage: true,
        });
      });
    }

test('image loading and failed image fallback preserve the profile name', async ({ page }) => {
  await page.goto('/accounts');
  for (const state of ['image', 'broken-image']) {
    await page.getByLabel('State').selectOption(state);
    const dialog = await openPanel(page);
    await expect(dialog.getByText('Aisha Ahmed')).toBeVisible();
    if (state === 'broken-image')
      await expect(dialog.getByText('AA', { exact: true })).toBeVisible();
    else await expect(dialog.locator('img').first()).toHaveJSProperty('naturalWidth', 60);
    await page.keyboard.press('Escape');
  }
});

for (const language of ['en', 'dv'])
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`${language} ${reducedMotion}: appearance pill moves to the controlled selection`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto('/accounts');
      if (language === 'dv') await page.getByRole('button', { name: 'Change language' }).click();
      await page
        .getByRole('button', {
          name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog');
      const pill = dialog.locator('[data-account-appearance-pill]');
      const start = await pill.boundingBox();
      if (!start) throw new Error('Missing appearance pill');
      // Auto changes the preference while retaining the light theme, so the host's
      // disableTransitionOnChange does not suppress this independent movement.
      const target = dialog.getByRole('radio').nth(2);
      const targetBox = await target.evaluate((element) => {
        const label = element.closest('label');
        if (!label) throw new Error('Missing radio label');
        const { x, width } = label.getBoundingClientRect();
        return { x, width };
      });
      await target.focus();
      await page.keyboard.press('Space');
      await expect(target).toBeChecked();
      if (reducedMotion === 'reduce') {
        expect(await pill.evaluate((element) => element.getAnimations().length)).toBe(0);
      } else {
        const midway = await pill.evaluate((element) => {
          const animation = element.getAnimations()[0];
          if (!animation) throw new Error('Missing pill movement animation');
          animation.pause();
          animation.currentTime = Number(animation.effect?.getTiming().duration) * 0.1;
          const x = element.getBoundingClientRect().x;
          animation.finish();
          return x;
        });
        expect(midway).toBeGreaterThan(Math.min(start.x, targetBox.x));
        expect(midway).toBeLessThan(Math.max(start.x, targetBox.x));
      }
      const end = await pill.boundingBox();
      if (!end) throw new Error('Missing selected appearance pill');
      expect(Math.abs(end.x - targetBox.x)).toBeLessThan(1);
      expect(Math.abs(end.width - targetBox.width)).toBeLessThan(1);
    });
  }

test('documented adapter owns asynchronous errors and retry presentation', async ({ page }) => {
  await page.goto('/account-example');
  const dialog = await openPanel(page);
  await dialog.getByRole('button', { name: 'Ali Hassan' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('Operation failed. Try again.');
  await dialog.getByRole('button', { name: 'Sign out' }).click();
  await expect(dialog.getByRole('alert')).toHaveCount(2);
  await expect(dialog).toBeVisible();
});
