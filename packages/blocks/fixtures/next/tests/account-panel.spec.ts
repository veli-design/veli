import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitForMotion } from './wait-for-motion';

async function openPanel(page: Page) {
  const trigger = page.getByRole('button', { name: 'Open account panel' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Your account' });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  return dialog;
}

// Reproduce the host's flex-centered navigation, including typography-dependent baseline spacing.
for (const width of [390, 1280]) {
  for (const theme of ['light', 'dark']) {
    for (const language of ['en', 'dv']) {
      test(`${width}px ${theme} ${language}: avatar wrappers fit and header controls align`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/accounts');
        if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
        if (language === 'dv') await page.getByRole('button', { name: 'Change language' }).click();
        const trigger = page.locator('header').getByRole('button', {
          name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
          exact: true,
        });
        for (const state of ['ready', 'image', 'broken-image']) {
          await page.getByLabel('State').selectOption(state);
          if (state === 'image')
            await expect(trigger.locator('img')).toHaveJSProperty('naturalWidth', 60);
          if (state === 'broken-image') await expect(trigger.locator('img')).toHaveClass(/sr-only/);
          const geometry = await trigger.evaluate((button) => {
            const avatar = button.querySelector('span[aria-hidden="true"] > div')!;
            const rect = (node: Element) => {
              const box = node.getBoundingClientRect();
              return { top: box.top, height: box.height, width: box.width };
            };
            return {
              button: rect(button),
              outer: rect(button.parentElement!),
              content: rect(avatar.parentElement!.parentElement!),
              wrapper: rect(avatar.parentElement!),
              avatar: rect(avatar),
            };
          });
          expect(geometry.button.width).toBe(44);
          expect(geometry.button.height).toBe(44);
          for (const box of [geometry.outer, geometry.content, geometry.wrapper, geometry.avatar]) {
            expect(box.height).toBe(44);
            expect(box.top).toBeCloseTo(geometry.button.top, 2);
          }
          for (const name of ['Menu', 'Search']) {
            const adjacent = await page.getByRole('button', { name, exact: true }).boundingBox();
            expect(adjacent?.width).toBe(44);
            expect(adjacent?.height).toBe(44);
            expect(adjacent?.y).toBeCloseTo(geometry.button.top, 2);
          }
          await trigger.click();
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();
          await waitForMotion(page);
          const avatarSizes = await dialog
            .locator('span[aria-hidden="true"] > div:has(img)')
            .evaluateAll((avatars) =>
              avatars.map((avatar) => ({
                avatar: avatar.getBoundingClientRect().height,
                wrapper: avatar.parentElement!.getBoundingClientRect().height,
              })),
            );
          expect(avatarSizes.map(({ avatar }) => avatar)).toEqual([60, 44, 44]);
          for (const { avatar, wrapper } of avatarSizes) expect(wrapper).toBe(avatar);
          if (width >= 640) expect((await dialog.boundingBox())?.width).toBe(389);
          await expect(trigger).toHaveClass(/ring-2/);
          await page.keyboard.press('Escape');
          await expect(dialog).toBeHidden();
          await expect(trigger).toBeFocused();
        }
      });
    }
  }
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

for (const theme of ['light', 'dark']) {
  test(`${theme}: account row press matches notification colors without scaling or ripple`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto('/accounts');
    if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
    const dialog = await openPanel(page);
    const row = dialog.getByRole('button', { name: /Ali Hassan/ });
    const idleColor = await row.evaluate((element) => getComputedStyle(element).backgroundColor);
    await row.hover();
    await expect(row).toHaveAttribute('data-hovered', 'true');
    const before = await row.boundingBox();
    if (!before) throw new Error('Missing account row geometry');
    const hoverColor = await row.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(hoverColor).not.toBe(idleColor);
    await waitForMotion(page);
    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);
    await row.screenshot({ path: testInfo.outputPath('account-row-hover.png') });
    await page.mouse.down();
    await expect(row).toHaveAttribute('data-pressed', 'true');
    expect(await row.boundingBox()).toEqual(before);
    const pressed = await row.evaluate((element) => {
      const style = getComputedStyle(element);
      const reference = document.createElement('span');
      reference.style.backgroundColor = 'var(--color-neutral-alpha-200)';
      element.append(reference);
      const tokenColor = getComputedStyle(reference).backgroundColor;
      reference.remove();
      return {
        color: style.backgroundColor,
        tokenColor,
        scale: style.scale,
        transform: style.transform,
        ripple: getComputedStyle(element, '::after').content,
        animations: element.getAnimations().length,
      };
    });
    expect(pressed.color).toBe(pressed.tokenColor);
    expect(pressed.color).toBe(hoverColor);
    expect(pressed.scale).toBe('none');
    expect(pressed.transform).toBe('none');
    expect(pressed.ripple).toBe('none');
    expect(pressed.animations).toBe(0);
    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);
    await row.screenshot({ path: testInfo.outputPath('account-row-pressed.png') });
    await page.mouse.up();
    await expect(dialog.getByRole('button', { name: /Ali Hassan/ })).toHaveCount(0);
    await expect(dialog).toBeVisible();
    const nextRow = dialog.getByRole('button', { name: /Example team/ });
    await page.keyboard.press('Tab');
    await nextRow.focus();
    await expect(nextRow).toHaveAttribute('data-focus-visible', 'true');
    expect(await nextRow.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
      'none',
    );
    await page.keyboard.press('Space');
    await expect(dialog.getByRole('button', { name: /Example team/ })).toHaveCount(0);
    await expect(page.locator('[data-calls]')).toContainText('Selection: 2');
  });
}

test('empty, skeleton loading, errors and pending actions have distinct semantics', async ({
  page,
}) => {
  await page.goto('/accounts');
  for (const state of ['empty', 'loading', 'error', 'pending', 'one']) {
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
    if (state === 'loading') {
      await expect(dialog.locator('[data-account-skeleton]')).toHaveCount(3);
      await expect(dialog.getByRole('button', { name: /Ali Hassan/ })).toHaveCount(0);
      await expect(dialog.getByText('Aisha Ahmed')).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Sign out' })).toBeVisible();
    }
    if (state === 'error') {
      await waitForMotion(page);
      expect(
        (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
      ).toEqual([]);
    }
    if (state === 'pending') {
      const signOut = dialog.getByRole('button', { name: 'Sign out' });
      await expect(signOut).toHaveAttribute('aria-busy', 'true');
      await expect(signOut.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
      await expect(signOut).toHaveAccessibleDescription('Working…');
      const actionStatus = signOut.locator('..').getByRole('status');
      expect(await actionStatus.evaluate((element) => element.getBoundingClientRect().height)).toBe(
        1,
      );
      expect(
        await actionStatus.locator('..').evaluate((element) => getComputedStyle(element).position),
      ).toBe('absolute');
      // Native click attempts must not invoke a blocked action.
      await signOut.evaluate((button: HTMLButtonElement) => button.click());
      const row = dialog.getByRole('button', { name: /Ali Hassan/ });
      await expect(row).toHaveAttribute('aria-busy', 'true');
      await expect(row.locator('[data-account-pending-avatar] svg')).toBeVisible();
      await expect(row.locator('img')).toHaveCount(0);
      await expect(row).toHaveAccessibleDescription('Working…');
      const rowStatus = row.locator('..').getByRole('status');
      expect(await rowStatus.evaluate((element) => element.getBoundingClientRect().height)).toBe(1);
      expect(
        await rowStatus.locator('..').evaluate((element) => getComputedStyle(element).position),
      ).toBe('absolute');
      await row.evaluate((button: HTMLButtonElement) => button.click());
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

for (const [width, theme, reducedMotion] of [
  [390, 'dark', 'reduce'],
  [1280, 'light', 'no-preference'],
] as const) {
  test(`${width}px ${theme}: pending replaces the avatar without changing row geometry`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto('/accounts');
    if (theme === 'dark') {
      await page.getByRole('button', { name: 'Change theme' }).click();
      await page.getByRole('button', { name: 'Change language' }).click();
    }
    const trigger = page.getByRole('button', {
      name: theme === 'dark' ? 'އެކައުންޓު' : 'Open account panel',
    });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    const row = dialog.getByRole('button', { name: /Ali Hassan/ });
    await expect(row.locator('img')).toHaveCount(1);
    await waitForMotion(page);
    const before = await row.boundingBox();
    if (!before) throw new Error('Missing account row geometry');
    const avatarColor = await row
      .locator(':scope > span > div')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.keyboard.press('Escape');
    await page.getByLabel('State').selectOption('pending');
    await trigger.click();
    await waitForMotion(page);
    const pending = row.locator('[data-account-pending-avatar]');
    await expect(pending.locator('svg')).toBeVisible();
    await expect(row.locator('img')).toHaveCount(0);
    await expect(row.getByText('Ali Hassan')).toBeVisible();
    await expect(row.getByText('ali@example.test')).toBeVisible();
    expect(await pending.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      avatarColor,
    );
    const slot = await pending.boundingBox();
    expect(slot?.width).toBe(44);
    expect(slot?.height).toBe(44);
    const during = await row.boundingBox();
    expect(during?.width).toBe(before.width);
    expect(during?.height).toBe(before.height);
    expect(
      await pending.locator('svg').evaluate((element) => getComputedStyle(element).animationName),
    ).toBe(reducedMotion === 'reduce' ? 'none' : 'spin');
    await expect(row).toHaveAccessibleDescription(theme === 'dark' ? 'ބަދަލުކުރަނީ…' : 'Working…');
    await row.evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator('[data-calls]')).toContainText('Selection: 0');
    await page.keyboard.press('Escape');
    await page.getByLabel('State').selectOption('ready');
    await trigger.click();
    await waitForMotion(page);
    await expect(pending).toHaveCount(0);
    await expect(row.locator('img')).toHaveCount(1);
    const after = await row.boundingBox();
    expect(after?.width).toBe(before.width);
    expect(after?.height).toBe(before.height);
  });
}

test('mobile sheet moves its surface and content together, cancellation resets and downward drag dismisses', async ({
  page,
}, testInfo) => {
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
  const sheet = page.locator('[data-account-sheet]');
  const profile = dialog.locator('[data-account-profile]');
  const surfaceBefore = await sheet.boundingBox();
  const profileBefore = await profile.boundingBox();
  const startBox = await handle.boundingBox();
  if (!startBox || !surfaceBefore || !profileBefore) throw new Error('Missing sheet geometry');
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2 + 40);
  const surfaceDuring = await sheet.boundingBox();
  const profileDuring = await profile.boundingBox();
  if (!surfaceDuring || !profileDuring) throw new Error('Missing dragged sheet geometry');
  expect(surfaceDuring.y - surfaceBefore.y).toBe(40);
  expect(profileDuring.y - profileBefore.y).toBe(40);
  expect(profileDuring.y - surfaceDuring.y).toBe(36);
  expect(await sheet.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(
    'rgba(0, 0, 0, 0)',
  );
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.hasAttribute('data-account-sheet-overlay'),
      {
        x: surfaceDuring.x + surfaceDuring.width / 2,
        y: surfaceDuring.y - 10,
      },
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('sheet-during-drag.png') });
  await handle.dispatchEvent('pointercancel', { pointerId: 1 });
  await page.mouse.up();
  await expect(dialog).toBeVisible();
  await expect(sheet).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  expect(await sheet.boundingBox()).toEqual(surfaceBefore);
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
        {
          const scrollArea = dialog.locator('.overflow-y-auto');
          const scrollBox = await scrollArea.boundingBox();
          const footerBox = await dialog
            .getByRole('button', { name: language === 'dv' ? 'ސައިން އައުޓް' : 'Sign out' })
            .locator('../..')
            .boundingBox();
          if (!scrollBox || !footerBox) throw new Error('Missing scroll area or footer geometry');
          expect(
            await scrollArea.evaluate((element) => element.scrollHeight > element.clientHeight),
          ).toBe(true);
          expect(Math.abs(scrollBox.y + scrollBox.height - footerBox.y)).toBeLessThan(1);
          const beforeScroll = footerBox;
          await scrollArea.evaluate((element) => {
            element.scrollTop = element.scrollHeight;
          });
          expect(
            await dialog
              .getByRole('button', { name: language === 'dv' ? 'ސައިން އައުޓް' : 'Sign out' })
              .locator('../..')
              .boundingBox(),
          ).toEqual(beforeScroll);
        }
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
      // Auto changes the preference while retaining the light theme, so the host's
      // disableTransitionOnChange does not suppress this independent movement.
      for (const targetIndex of [2, 0]) {
        const start = await pill.boundingBox();
        if (!start) throw new Error('Missing appearance pill');
        const target = dialog.getByRole('radio').nth(targetIndex);
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
          const samples = await pill.evaluate((element) => {
            const animation = element.getAnimations()[0];
            if (!animation) throw new Error('Missing pill movement animation');
            animation.pause();
            const duration = Number(animation.effect?.getTiming().duration);
            const positions = Array.from({ length: 21 }, (_, index) => {
              animation.currentTime = (duration * index) / 20;
              return element.getBoundingClientRect().x;
            });
            animation.finish();
            return positions;
          });
          const min = Math.min(start.x, targetBox.x);
          const max = Math.max(start.x, targetBox.x);
          expect(samples[2]).toBeGreaterThan(min);
          expect(samples[2]).toBeLessThan(max);
          // Keep both end-to-end movements within a subtle 2% bounce.
          const overshoot = (max - min) * 0.02;
          expect(Math.min(...samples)).toBeGreaterThanOrEqual(min - overshoot);
          expect(Math.max(...samples)).toBeLessThanOrEqual(max + overshoot);
        }
        const end = await pill.boundingBox();
        if (!end) throw new Error('Missing selected appearance pill');
        expect(Math.abs(end.x - targetBox.x)).toBeLessThan(1);
        expect(Math.abs(end.width - targetBox.width)).toBeLessThan(1);
      }
    });
  }

for (const width of [390, 1280]) {
  test(`${width}px: documented adapter presents action failures in consumer toasts`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/account-example');
    const dialog = await openPanel(page);
    const account = dialog.getByRole('button', { name: 'Ali Hassan' });
    await account.click();
    const toasts = page.getByRole('alertdialog', { name: 'Operation failed. Try again.' });
    await expect(toasts).toHaveCount(1);
    await expect(toasts.first()).toBeVisible();
    await expect(account).not.toHaveAttribute('aria-busy', 'true');
    await dialog.getByRole('button', { name: 'Sign out' }).click();
    await expect(toasts).toHaveCount(2);
    await expect(dialog.getByRole('alert')).toHaveCount(0);
    await expect(dialog.getByText('Operation failed. Try again.')).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await account.click();
    await expect(toasts).toHaveCount(3);
  });
}

for (const state of ['ready', 'empty']) {
  test(`mobile ${state}: Figma notch spacing and close focus do not shift the profile`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 440, height: 956 });
    await page.goto('/accounts');
    await page.getByLabel('State').selectOption(state);
    const dialog = await openPanel(page);
    const sheet = page.locator('[data-account-sheet]');
    const profile = dialog.locator('[data-account-profile]');
    const sheetBox = await sheet.boundingBox();
    const notchBox = await dialog.locator('[data-account-drag-handle] > span').boundingBox();
    const profileBox = await profile.boundingBox();
    if (!sheetBox || !notchBox || !profileBox) throw new Error('Missing mobile geometry');
    expect(notchBox.y - sheetBox.y).toBeCloseTo(8, 1);
    expect(notchBox.height).toBeCloseTo(4, 1);
    expect(profileBox.y - notchBox.y - notchBox.height).toBeCloseTo(24, 1);
    expect(profileBox.y - sheetBox.y).toBeCloseTo(36, 1);
    await expect(sheet).toHaveCSS('border-top-left-radius', '32px');
    await expect(sheet).toHaveCSS('border-top-right-radius', '32px');
    const close = dialog.getByRole('button', { name: 'Close', exact: true });
    expect((await close.boundingBox())?.width).toBe(1);
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await expect(close).toHaveAttribute('data-focus-visible', 'true');
    expect((await close.boundingBox())?.width).toBeGreaterThan(1);
    expect(await profile.boundingBox()).toEqual(profileBox);
    await page.screenshot({ path: testInfo.outputPath(`mobile-${state}.png`) });
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
  });
}

for (const width of [440, 1280]) {
  for (const theme of ['light', 'dark']) {
    test(`${width}px ${theme}: raised surface and open avatar ring use Veli tokens`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 956 });
      await page.goto('/accounts');
      if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
      const dialog = await openPanel(page);
      const colors = await dialog.evaluate((element) => {
        let surface: Element | null = element;
        while (surface && getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)')
          surface = surface.parentElement;
        const reference = document.createElement('span');
        reference.style.backgroundColor = 'var(--color-bg-surface-raised)';
        element.append(reference);
        const expected = getComputedStyle(reference).backgroundColor;
        reference.remove();
        return { actual: surface ? getComputedStyle(surface).backgroundColor : '', expected };
      });
      expect(colors.actual).toBe(colors.expected);
      if (width < 640) {
        const scrim = await page.locator('[data-account-sheet-overlay]').evaluate((element) => {
          const style = getComputedStyle(element);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d')!;
          context.fillStyle = style.backgroundColor;
          context.fillRect(0, 0, 1, 1);
          return {
            rgba: Array.from(context.getImageData(0, 0, 1, 1).data),
            blur: style.backdropFilter,
          };
        });
        expect(scrim.rgba).toEqual([0, 0, 0, 153]);
        expect(scrim.blur).toBe('blur(6px)');
      }
      const trigger = page.getByRole('button', { name: 'Open account panel' });
      expect(await trigger.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
        'none',
      );
      await page.screenshot({ path: testInfo.outputPath(`panel-${width}-${theme}.png`) });
    });
  }
}

test('reduced-motion skeletons are decorative and do not shimmer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/accounts');
  await page.getByLabel('State').selectOption('loading');
  const dialog = await openPanel(page);
  const rows = dialog.locator('[data-account-skeleton]');
  await expect(rows).toHaveCount(3);
  await expect(dialog.getByRole('status')).toHaveCount(1);
  // A busy ancestor can defer the loading announcement until after it has disappeared.
  expect(
    await dialog.getByRole('status').evaluate((element) => element.closest('[aria-busy="true"]')),
  ).toBeNull();
  const avatar = rows.first().locator(':scope > .rounded-full');
  await expect(avatar).toHaveCSS('width', '44px');
  await expect(avatar).toHaveCSS('height', '44px');
  await expect(rows.locator('.veli-skeleton')).toHaveCount(9);
  expect(
    await rows.evaluateAll((elements) =>
      elements.every(
        (row) =>
          row.getAttribute('aria-hidden') === 'true' &&
          row.getAnimations({ subtree: true }).length === 0,
      ),
    ),
  ).toBe(true);
});

test('mobile sheet uses token durations and monotonic ease-out motion without drag snap-back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 440, height: 956 });
  await page.goto('/accounts');
  await page.getByRole('button', { name: 'Open account panel' }).click();
  const sheet = page.locator('[data-account-sheet]');
  async function sampleSheetTransition() {
    return sheet.evaluate((element) => {
      const animation = document
        .getAnimations()
        .find(
          (candidate) =>
            candidate instanceof CSSTransition &&
            candidate.transitionProperty === 'translate' &&
            (candidate.effect as KeyframeEffect).target?.contains(element),
        );
      if (!animation?.effect) throw new Error('Missing sheet translation');
      animation.pause();
      const timing = animation.effect.getTiming();
      const positions = Array.from({ length: 21 }, (_, index) => {
        animation.currentTime = (Number(timing.duration) * index) / 20;
        return element.getBoundingClientRect().y;
      });
      animation.finish();
      return { duration: timing.duration, easing: timing.easing, positions };
    });
  }
  const entry = await sampleSheetTransition();
  expect(entry.duration).toBe(350);
  expect(entry.easing).toBe('cubic-bezier(0, 0, 0.2, 1)');
  for (let index = 1; index < entry.positions.length; index++)
    expect(entry.positions[index]).toBeLessThanOrEqual(entry.positions[index - 1]);
  await waitForMotion(page);
  await page.keyboard.press('Escape');
  const exit = await sampleSheetTransition();
  expect(exit.duration).toBe(200);
  expect(exit.easing).toBe(entry.easing);
  for (let index = 1; index < exit.positions.length; index++)
    expect(exit.positions[index]).toBeGreaterThanOrEqual(exit.positions[index - 1]);
  await expect(page.getByRole('dialog')).toBeHidden();
  await openPanel(page);
  await waitForMotion(page);
  const handle = page.locator('[data-account-drag-handle]');
  const box = await handle.boundingBox();
  if (!box) throw new Error('Missing drag handle');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 280, { steps: 5 });
  await page.mouse.up();
  expect(
    await sheet.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42),
  ).toBe(280);
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
});
