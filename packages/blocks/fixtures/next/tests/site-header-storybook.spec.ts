import { test, expect } from '@playwright/test';

for (const story of ['with-page-content', 'switching-sites', 'default']) {
  test(`Storybook site header ${story}: skip link focuses the main landmark`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/storybook/iframe.html?id=blocks-site-header--${story}&viewMode=story`);

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(page.locator('main#main-content')).toBeFocused();
  });
}
