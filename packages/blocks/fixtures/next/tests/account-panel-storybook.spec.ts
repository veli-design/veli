import { test, expect } from '@playwright/test';

type StorybookWindow = Window & { __STORYBOOK_PREVIEW__?: { storyRenders: { phase: string }[] } };

for (const [story, width, reducedMotion] of [
  ['desktop', 1280, 'no-preference'],
  ['mobile', 390, 'no-preference'],
  ['desktop', 1280, 'reduce'],
] as const) {
  test(`Storybook ${story} ${reducedMotion}: play completes and restores focus`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('net::'))
        errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await page.goto(`/storybook/iframe.html?id=blocks-account-panel--${story}&viewMode=story`);
    await page.waitForFunction(() =>
      ['finished', 'errored'].includes(
        (window as StorybookWindow).__STORYBOOK_PREVIEW__?.storyRenders[0]?.phase ?? '',
      ),
    );
    expect(
      await page.evaluate(
        () => (window as StorybookWindow).__STORYBOOK_PREVIEW__?.storyRenders[0]?.phase,
      ),
    ).toBe('finished');
    expect(errors).toEqual([]);
    await expect(page.getByRole('button', { name: 'Open account panel' })).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    if (story === 'desktop')
      await expect(page.getByRole('status')).toHaveText('Sign-out callback received');
  });
}
