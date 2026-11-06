import { test, expect } from '@playwright/test';
import { waitForMotion } from './wait-for-motion';

for (const width of [390, 1280]) {
  test(`${width}px: primary-user identity is independent of selected business`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/account-primary');
    const trigger = page.getByRole('button', { name: 'Open account panel' });
    for (const business of ['Business A', 'Business B']) {
      await page.getByLabel('Selected business').selectOption(business);
      await expect(page.getByText(`Editing permissions for ${business}`)).toBeVisible();
      await trigger.click();
      const dialog = page.getByRole('dialog', { name: 'Your account' });
      await expect(dialog.getByText('Aisha Ahmed')).toBeVisible();
      await expect(dialog.getByText('aisha@example.test')).toBeVisible();
      await expect(dialog.getByText('Primary User', { exact: true })).toBeVisible();
      await expect(dialog.getByText(/Business [AB]/)).toHaveCount(0);
      await expect(dialog.getByRole('listitem')).toHaveCount(0);
      await expect(dialog.getByRole('button', { name: /Switch|Manage|Delegate/ })).toHaveCount(0);
      await expect(dialog.getByRole('button', { name: 'Sign out' })).toBeVisible();
      await waitForMotion(page);
      await dialog.screenshot({ path: testInfo.outputPath(`${business.replace(' ', '-')}.png`) });
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  });

  test(`${width}px: profile-only mode suppresses legacy groups, delegation, management and retrieval states`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const args of ['', '&args=isLoading:true', '&args=error:Could%20not%20load']) {
      await page.goto(
        `/storybook/iframe.html?id=blocks-account-panel--primary-user&viewMode=story${args}`,
      );
      await page.getByRole('button', { name: 'Open account panel' }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Aisha Ahmed')).toBeVisible();
      await expect(dialog.getByRole('listitem')).toHaveCount(0);
      await expect(dialog.getByText('Other accounts', { exact: true })).toHaveCount(0);
      await expect(dialog.getByRole('alert')).toHaveCount(0);
      await expect(dialog.locator('[data-account-skeleton]')).toHaveCount(0);
      await expect(
        dialog.getByRole('button', { name: /Manage account|Setup Delegation/ }),
      ).toHaveCount(0);
      await expect(dialog.getByRole('radiogroup')).toHaveCount(width >= 640 ? 1 : 0);
      await expect(dialog.getByRole('button', { name: 'Sign out' })).toBeVisible();
    }
  });
}

test('compact desktop matches the Figma card geometry', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/account-primary');
  await page.getByRole('button', { name: 'Open account panel' }).click();
  const dialog = page.getByRole('dialog');
  await waitForMotion(page);
  const box = await dialog.boundingBox();
  expect(box?.width).toBe(389);
  expect(box?.height).toBe(440);
  await expect(dialog.locator('[data-account-profile]')).toHaveCSS('border-radius', '16px');
  await expect(dialog.getByRole('button', { name: 'Sign out' })).toHaveCSS('width', '357px');
  await dialog.screenshot({ path: testInfo.outputPath('compact-desktop-figma.png') });
});
