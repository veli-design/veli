import { test, expect, type Page } from '@playwright/test';
import { waitForMotion } from './wait-for-motion';

type StoryFinishedPayload = { status: 'success' | 'error'; storyId: string };
type StorybookWindow = Window & {
  __STORYBOOK_ADDONS_CHANNEL__?: {
    on: (event: string, cb: (payload: StoryFinishedPayload) => void) => void;
  };
  __veliStoryFinished?: Promise<StoryFinishedPayload>;
};

/** Storybook still ends in phase `finished` after a failed play — use storyFinished.status. */
async function listenForStoryFinished(page: Page) {
  await page.addInitScript(() => {
    const w = window as StorybookWindow;
    w.__veliStoryFinished = new Promise((resolve) => {
      const attach = () => {
        const channel = w.__STORYBOOK_ADDONS_CHANNEL__;
        if (!channel) return false;
        channel.on('storyFinished', resolve);
        return true;
      };
      if (attach()) return;
      const id = window.setInterval(() => {
        if (attach()) window.clearInterval(id);
      }, 5);
    });
  });
}

async function storyPlayResult(page: Page) {
  return page.evaluate(async () => {
    const pending = (window as StorybookWindow).__veliStoryFinished;
    if (!pending) throw new Error('storyFinished listener was not installed');
    return await Promise.race([
      pending,
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('storyFinished timed out')), 120_000);
      }),
    ]);
  });
}

for (const [story, width, reducedMotion, language = 'en'] of [
  ['desktop', 1280, 'no-preference'],
  ['desktop', 390, 'no-preference'],
  ['desktop', 639, 'no-preference'],
  ['desktop', 640, 'no-preference'],
  ['mobile', 390, 'no-preference'],
  ['mobile', 1280, 'no-preference'],
  ['desktop', 1280, 'reduce'],
  ['desktop', 390, 'reduce'],
  ['desktop', 1280, 'no-preference', 'dv'],
  ['desktop', 390, 'no-preference', 'dv'],
  ['mobile', 390, 'no-preference', 'dv'],
] as const) {
  test(`Storybook ${story} ${width}px ${reducedMotion} ${language}: play completes and restores focus`, async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion });
    await listenForStoryFinished(page);
    await page.goto(
      `/storybook/iframe.html?id=blocks-account-panel--${story}&viewMode=story&veli-language=${language}`,
    );
    // exact: Dhivehi account rows also contain އެކައުންޓު in their accessible name.
    const trigger = page.getByRole('button', {
      name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
      exact: true,
    });
    expect((await storyPlayResult(page)).status).toBe('success');
    expect(pageErrors).toEqual([]);
    await expect(trigger).toBeFocused();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

for (const [theme, language] of [
  ['dark', 'en'],
  ['light', 'en'],
  ['light', 'dv'],
  ['dark', 'dv'],
] as const) {
  test(`Storybook ${theme} ${language}: explicit toolbar settings reach the portal`, async ({
    page,
  }) => {
    await page.goto(
      `/storybook/iframe.html?id=blocks-account-panel--one-additional-account&viewMode=story&veli-theme=${theme}&veli-language=${language}`,
    );
    const trigger = page.getByRole('button', {
      name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    expect(
      await dialog.evaluate((element) => element.closest('[lang]')?.getAttribute('lang')),
    ).toBe(language);
    expect(await dialog.evaluate((element) => element.closest('[dir]')?.getAttribute('dir'))).toBe(
      language === 'dv' ? 'rtl' : 'ltr',
    );
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', theme);
    expect(
      await dialog.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--color-bg-surface-raised').trim(),
      ),
    ).not.toBe('');
  });
}

for (const language of ['en', 'dv'] as const) {
  test(`Storybook manager ${language}: toolbar translates open content and persists across stories`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(
      `/storybook/index.html?path=/story/blocks-account-panel--one-additional-account&veli-theme=dark&veli-language=${language}`,
    );
    const preview = page.frameLocator('#storybook-preview-iframe');
    await expect(preview.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(preview.locator('div[data-color-scheme][lang]').first()).toHaveAttribute(
      'lang',
      language,
    );
    const trigger = preview.getByRole('button', {
      name: language === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
      exact: true,
    });
    await trigger.click();
    await expect(preview.getByRole('dialog')).toBeVisible();
    await page
      .getByRole('button', { name: language === 'dv' ? 'RTL' : 'LTR', exact: true })
      .click();
    const nextLanguage = language === 'dv' ? 'en' : 'dv';
    const dialog = preview.getByRole('dialog');
    await expect(
      dialog.getByText(nextLanguage === 'dv' ? 'އާއިޝާ އަޙްމަދު' : 'Aisha Ahmed'),
    ).toBeVisible();
    await expect(
      dialog.getByRole('radio', { name: nextLanguage === 'dv' ? 'އަލި' : 'Light', exact: true }),
    ).toBeVisible();
    await expect(dialog.getByText('aisha@example.test')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open canvas in new tab' })).toHaveAttribute(
      'href',
      new RegExp(`veli-language=${nextLanguage}`),
    );
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await expect(preview.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await page.getByRole('button', { name: 'System', exact: true }).click();
    await expect(preview.locator('html')).toHaveAttribute('data-color-scheme', 'system');
    await page.getByRole('link', { name: 'No Additional Accounts', exact: true }).click();
    await preview
      .getByRole('button', {
        name: nextLanguage === 'dv' ? 'އެކައުންޓު' : 'Open account panel',
        exact: true,
      })
      .click();
    await expect(
      preview.getByRole('dialog').getByRole('button', {
        name: nextLanguage === 'dv' ? 'ޑެލިގޭޝަން ސެޓްއަޕް ކުރައްވާ' : 'Setup Delegation',
      }),
    ).toBeVisible();
    await expect(
      page.locator(
        'a[href*="blocks-account-panel--dhivehi"], a[href*="blocks-account-panel--dark"]',
      ),
    ).toHaveCount(0);
  });
}

for (const story of [
  'one-additional-account',
  'no-additional-accounts',
  'delegate-selected',
  'long-content',
  'loading',
  'error',
  'pending',
  'image',
  'broken-image-fallback',
  'reduced-motion',
]) {
  test(`Storybook ${story}: all sample copy except emails translates to Dhivehi`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(
      `/storybook/iframe.html?id=blocks-account-panel--${story}&viewMode=story&veli-language=dv&args=isOpen:true`,
    );
    const dialog = page.getByRole('dialog', { name: 'ތިޔަ އެކައުންޓު' });
    await expect(dialog).toBeVisible();
    const content = await dialog.evaluate((element) => {
      const nodes = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const values: string[] = [];
      while (nodes.nextNode()) values.push(nodes.currentNode.textContent ?? '');
      return values.filter((value) => !value.includes('@')).join('\n');
    });
    expect(content).not.toMatch(/[A-Za-z]/);
    for (const element of await dialog.locator('[data-account-profile] p').all()) {
      expect(await element.evaluate((node) => getComputedStyle(node).textAlign)).toBe('center');
    }
    const emails = dialog
      .locator('[data-account-profile] p, li button > span:last-child > span[dir]')
      .filter({ hasText: /@/ });
    for (const email of await emails.all()) {
      expect(
        await email.evaluate((node) => {
          const style = getComputedStyle(node);
          return {
            language: node.getAttribute('lang'),
            direction: style.direction,
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
          };
        }),
      ).toEqual({
        language: 'en',
        direction: 'ltr',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        fontSize: (await email.evaluate((node) => node.tagName === 'P')) ? '16px' : '14px',
        lineHeight: (await email.evaluate((node) => node.tagName === 'P')) ? '24px' : '20.3px',
      });
    }
    const names = dialog.getByRole('listitem').locator('button > span:last-child > span[dir]');
    for (const element of await names.all()) {
      expect(await element.evaluate((node) => getComputedStyle(node).textAlign)).toBe('right');
    }
    if (!['long-content', 'delegate-selected'].includes(story))
      await expect(dialog.getByText('aisha@example.test')).toBeVisible();
    await expect(dialog.getByRole('radio', { name: 'އަލި', exact: true })).toBeVisible();
    await expect(dialog.getByRole('radio', { name: 'އަނދިރި', exact: true })).toBeVisible();
    await expect(dialog.getByRole('radio', { name: 'އޮޓޯ', exact: true })).toBeVisible();
  });
}

for (const theme of ['light', 'dark']) {
  test(`Veli Modal ${theme}: scrim stays black at 60% with 6px blur`, async ({ page }) => {
    await page.goto(
      `/storybook/iframe.html?id=components-modal--default&viewMode=story&veli-theme=${theme}&veli-language=en`,
    );
    const trigger = page.getByRole('button', { name: 'Open modal' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toBeVisible();
    await waitForMotion(page);
    const scrim = await dialog.evaluate((element) => {
      let overlay: Element | null = element.parentElement;
      while (overlay && getComputedStyle(overlay).position !== 'fixed')
        overlay = overlay.parentElement;
      if (!overlay) throw new Error('Missing modal overlay');
      const style = getComputedStyle(overlay);
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
    await page.mouse.click(8, 8);
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
