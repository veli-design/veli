import { test, expect } from '@playwright/test';
for (const theme of ['light', 'dark'])
  for (const width of [390, 1280]) {
    test(`canonical CSS and Tailwind parity: ${theme}, ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      async function values(type: string) {
        await page.goto(`/token-tests/${type}.html`);
        await page.evaluate((mode) => (document.documentElement.className = mode), theme);
        return page.evaluate(() => {
          const sample = getComputedStyle(document.querySelector('#sample')!);
          const type = getComputedStyle(document.querySelector('#type')!);
          return {
            background: sample.backgroundColor,
            color: sample.color,
            border: sample.borderColor,
            fontSize: type.fontSize,
            lineHeight: type.lineHeight,
            tracking: type.letterSpacing,
          };
        });
      }
      const plain = await values('plain');
      const tailwind = await values('tailwind');
      expect(tailwind).toEqual(plain);
      expect(tailwind.fontSize).toBe('64px');
      expect(parseFloat(tailwind.lineHeight)).toBeCloseTo(84, 2);
      expect(parseFloat(tailwind.tracking)).toBeCloseTo(-1.92, 2);
      const grid = await page.locator('#grid').evaluate((element) => {
        const css = getComputedStyle(element);
        return {
          columns: css.gridTemplateColumns.split(' ').length,
          gap: css.columnGap,
          padding: css.paddingInlineStart,
        };
      });
      expect(grid).toEqual(
        width < 768
          ? { columns: 2, gap: '16px', padding: '16px' }
          : { columns: 8, gap: '20px', padding: '32px' },
      );
      const other = await page.evaluate(() => {
        const root = document.documentElement;
        const before = getComputedStyle(document.querySelector('#sample')!).backgroundColor;
        root.className = root.className === 'dark' ? 'light' : 'dark';
        return {
          before,
          after: getComputedStyle(document.querySelector('#sample')!).backgroundColor,
        };
      });
      expect(other.before).not.toBe(other.after);
    });
  }
