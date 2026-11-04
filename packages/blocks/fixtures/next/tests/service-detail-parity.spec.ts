import { test, expect } from '@playwright/test';

const root = '.veli-service-detail-root';
const sheet = '.veli-service-detail-guideline-sheet';

test('repaired layouts reflow at breakpoints and Show less keeps only its inline word gap', async ({
  page,
}) => {
  for (const language of ['en', 'dv']) {
    await page.goto('/services');
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    await page.locator('.veli-service-detail-service-summary button').click();
    await page.locator('.veli-service-detail-meta-value-row button').click();
    for (const width of [320, 360, 400, 440, 767, 768, 769, 1023, 1024, 1025, 1512]) {
      await page.setViewportSize({ width, height: 982 });
      const result = await page
        .locator('.veli-service-detail-service-summary button')
        .evaluate((node) => {
          const summary = node.parentElement!;
          // DisplayText isolates Latin runs in bdi elements, so the final visible
          // character may be nested rather than a direct child of the span.
          const walker = document.createTreeWalker(
            summary.querySelector('span')!,
            NodeFilter.SHOW_TEXT,
          );
          let text: Node | null = null;
          while (walker.nextNode()) {
            if (walker.currentNode.textContent!.trimEnd()) text = walker.currentNode;
          }
          if (!text) throw new Error('Missing expanded summary text');
          const length = text.textContent!.trimEnd().length;
          const range = document.createRange();
          range.setStart(text, length - 1);
          range.setEnd(text, length);
          const tail = range.getBoundingClientRect(),
            button = node.getBoundingClientRect(),
            box = summary.getBoundingClientRect();
          const rtl = getComputedStyle(summary).direction === 'rtl';
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            wrapped: button.top > tail.bottom - 2,
            indent: rtl ? box.right - button.right : button.left - box.left,
            gap: rtl ? tail.left - button.right : button.left - tail.right,
            columns: getComputedStyle(
              document.querySelector('.veli-service-detail-breakdown')!,
            ).gridTemplateColumns.split(' ').length,
          };
        });
      expect(result.overflow).toBe(false);
      expect(result.columns).toBe(1);
      if (result.wrapped) expect(Math.abs(result.indent)).toBeLessThan(1);
      else expect(result.gap).toBeGreaterThan(0);
    }
  }
});

test('summary fees expand under their value in one column in EN/DV and both themes', async ({
  page,
}) => {
  for (const language of ['en', 'dv']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [320, 440, 1512]) {
        await page.setViewportSize({ width, height: 982 });
        await page.goto('/services');
        if (language === 'dv')
          await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
        if (theme === 'dark')
          await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
        await page.locator('.veli-service-detail-meta-value-row button').click();
        const geometry = await page.locator('.veli-service-detail-breakdown').evaluate((node) => {
          const rows = Array.from(node.children);
          const item = node.closest('.veli-service-detail-meta-item')!;
          return {
            nested: !!node.closest('dd'),
            columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
            below:
              node.getBoundingClientRect().top >=
              item.querySelector('button')!.getBoundingClientRect().bottom - 4,
            borders: rows.map((row) => getComputedStyle(row).borderBottomWidth),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        expect(geometry.nested).toBe(true);
        expect(geometry.columns).toBe(1);
        expect(geometry.below).toBe(true);
        expect(geometry.overflow).toBe(false);
        expect(geometry.borders.at(-1)).toBe('0px');
        expect(geometry.borders.slice(0, -1).every((border) => border !== '0px')).toBe(true);
      }
    }
  }
});

test('link-like actions use link semantic tokens in both themes', async ({ page }) => {
  for (const language of ['en', 'dv']) {
    for (const theme of ['light', 'dark']) {
      await page.goto('/services');
      if (language === 'dv')
        await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
      if (theme === 'dark')
        await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
      for (const selector of [
        '.veli-service-detail-meta-value-row button',
        '.veli-service-detail-service-summary button',
        '.veli-service-detail-guideline-link',
      ]) {
        const action = page.locator(selector).first();
        const tokenColor = await action.evaluate((node) => {
          const probe = document.createElement('span');
          node.appendChild(probe);
          probe.style.color = 'var(--veli-color-text-links-default)';
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        });
        await expect(action).toHaveCSS('color', tokenColor);
        await action.hover();
        const hoverColor = await action.evaluate((node) => {
          const probe = document.createElement('span');
          node.appendChild(probe);
          probe.style.color = 'var(--veli-color-text-links-hover)';
          const color = getComputedStyle(probe).color;
          probe.remove();
          return color;
        });
        await expect(action).toHaveCSS('color', hoverColor);
        await page.mouse.move(0, 0);
      }
    }
  }
});

test('platform trigger exposes its visible name and filled inactive info icon in every apply mode', async ({
  page,
}) => {
  for (const language of ['en', 'dv']) {
    await page.goto('/services');
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    for (const mode of ['online', 'mixed', 'external', 'manual']) {
      await page.getByRole('combobox', { name: 'Mode', exact: true }).selectOption(mode);
      const trigger = page.locator('button.veli-service-detail-platform-trigger');
      const name = await trigger.evaluate((node) =>
        Array.from(node.querySelectorAll(':scope > span:first-child, :scope > strong'))
          .map((n) => n.textContent)
          .join(' '),
      );
      await expect(trigger).toHaveAccessibleName(name);
      await expect(trigger).toHaveAccessibleDescription(
        language === 'en' ? 'How to apply' : 'ހުށަހެޅޭނެ ގޮތް',
      );
      const icon = trigger.locator(':scope > svg');
      await expect(icon).toHaveCSS('width', '16px');
      await expect(icon.locator('circle')).toHaveCount(0);
      await expect(icon.locator('path')).toHaveCount(1);
      const color = await icon.evaluate((node) => {
        const probe = document.createElement('span');
        node.parentElement!.appendChild(probe);
        probe.style.color = 'var(--veli-color-icon-base-inactive)';
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      await expect(icon).toHaveCSS('color', color);
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    }
  }
});

test('guideline icons, section gaps and inactive TOC padding match the desktop and mobile variants', async ({
  page,
}) => {
  for (const language of ['en', 'dv']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [440, 1512]) {
        await page.setViewportSize({ width, height: 982 });
        await page.goto('/services');
        if (language === 'dv')
          await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
        if (theme === 'dark')
          await page.getByRole('button', { name: 'Fixture theme', exact: true }).click();
        await page.locator(`${root} .veli-service-detail-guideline-trigger`).click();
        const close = page.locator(
          `${sheet} .veli-service-detail-guideline-sheet-header button svg`,
        );
        await expect(close).toHaveCSS('width', '20px');
        await expect(close).toHaveCSS('height', '20px');
        const headings = page.locator(`${sheet} .veli-service-detail-guideline-section > h2`);
        await expect(headings.first()).toHaveCSS('margin-bottom', '12px');
        await expect(headings.nth(1)).toHaveCSS('margin-bottom', '16px');
        const heading = headings.nth(1);
        // WebKit can advance the sheet's translate animation between rectangle reads.
        await page.locator(sheet).evaluate(async (node) => {
          await Promise.all(node.getAnimations().map((animation) => animation.finished));
        });
        const visualGap = await heading.evaluate((node) => {
          const title = node.getBoundingClientRect();
          const body = node.nextElementSibling!.getBoundingClientRect();
          return body.top - title.bottom;
        });
        expect(visualGap).toBeCloseTo(16, 1);
        if (width === 1512) {
          const toc = page.locator(
            `${sheet} .veli-service-detail-guideline-sidebar .veli-service-detail-toc-link`,
          );
          await expect(toc.nth(1)).toHaveCSS('padding-inline-start', '16px');
          await expect(toc.nth(1)).toHaveCSS('padding-inline-end', '8px');
          await expect(toc.first()).toHaveCSS('padding', '2px');
          await expect(toc.first().locator('span')).toHaveCSS('padding', '8px 16px');
        }
        await page.keyboard.press('Escape');
        await expect(page.locator(sheet)).toHaveCount(0);
      }
    }
  }
});
