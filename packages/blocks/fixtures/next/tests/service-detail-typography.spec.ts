import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('guideline typography survives the real Tailwind reset without leaking in EN/DV', async ({
  page,
}, info) => {
  await page.goto('/services');
  await page.addStyleTag({
    content:
      '@font-face { font-family: Inter; src: url("/fonts/inter-latin.woff2"); font-weight: 100 900; }',
  });
  expect(
    await page.evaluate(async () => (await document.fonts.load('600 24px Inter')).length),
  ).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Typography fixture', exact: true }).click();
  const evidence = [];
  for (const language of ['en', 'dv']) {
    if (language === 'dv')
      await page.getByRole('button', { name: 'Fixture language', exact: true }).click();
    const outside = page.getByTestId('outside-guideline-typography');
    const reset = await outside.evaluate((node) => ({
      lists: Array.from(node.querySelectorAll('ul,ol')).map((list) => ({
        type: getComputedStyle(list).listStyleType,
        padding: getComputedStyle(list).paddingInlineStart,
      })),
      weight: getComputedStyle(node.querySelector('h2')!).fontWeight,
    }));
    // A control outside the block proves Preflight is active and the fix stays scoped.
    expect(reset).toEqual({
      lists: [
        { type: 'none', padding: '0px' },
        { type: 'none', padding: '0px' },
      ],
      weight: '400',
    });
    await page.locator('.veli-service-detail-root .veli-service-detail-guideline-trigger').click();
    const sheet = page.locator('.veli-service-detail-guideline-sheet');
    await expect(sheet).toBeVisible();
    if (language === 'dv')
      expect(
        await page.evaluate(
          async () => (await document.fonts.load('700 27px "MV A Waheed"')).length,
        ),
      ).toBeGreaterThan(0);
    const styles = await sheet.evaluate((node) => {
      const content = node.querySelector('[data-testid="guideline-typography"]')!;
      const token = getComputedStyle(node);
      const heading = getComputedStyle(
        node.querySelector('.veli-service-detail-guideline-section > h2')!,
      );
      return {
        direction: getComputedStyle(content).direction,
        indent: token.getPropertyValue('--veli-spacing-6').trim(),
        headingToken: token
          .getPropertyValue(
            node.lang === 'dv'
              ? '--veli-typography-dv-title-2-medium-font-weight'
              : '--veli-typography-en-title-2-semibold-font-weight',
          )
          .trim(),
        sectionWeight: getComputedStyle(
          node.querySelector('.veli-service-detail-guideline-section > h2')!,
        ).fontWeight,
        sectionFamily: heading.fontFamily,
        sectionSize: heading.fontSize,
        sectionLine: heading.lineHeight,
        sectionTracking: heading.letterSpacing,
        richWeights: Array.from(content.querySelectorAll('h2,h3')).map(
          (h) => getComputedStyle(h).fontWeight,
        ),
        lists: Array.from(content.querySelectorAll('ul,ol')).map((list) => ({
          tag: list.tagName,
          type: getComputedStyle(list).listStyleType,
          position: getComputedStyle(list).listStylePosition,
          indent: getComputedStyle(list).paddingInlineStart,
          left: getComputedStyle(list).paddingLeft,
          right: getComputedStyle(list).paddingRight,
          itemDisplay: getComputedStyle(list.querySelector('li')!).display,
        })),
      };
    });
    evidence.push({ language, reset, styles });
    await page.screenshot({
      path: info.outputPath(language + '-guideline.png'),
      animations: 'disabled',
    });
    expect.soft(styles.direction).toBe(language === 'dv' ? 'rtl' : 'ltr');
    expect.soft(styles.sectionWeight).toBe(styles.headingToken);
    expect.soft(styles.sectionFamily).toContain(language === 'dv' ? 'MV A Waheed' : 'Inter');
    expect.soft(styles.sectionSize).toBe(language === 'dv' ? '27px' : '24px');
    expect.soft(styles.sectionLine).toBe(language === 'dv' ? '40px' : '32px');
    expect.soft(styles.sectionTracking).toMatch(/^(normal|0px)$/);
    expect.soft(styles.richWeights).toEqual(language === 'dv' ? ['700', '700'] : ['600', '600']);
    expect
      .soft(styles.lists.map((list) => list.type))
      .toEqual(['disc', 'decimal', 'decimal', 'disc']);
    for (const list of styles.lists) {
      expect.soft(list.position).toBe('outside');
      expect.soft(list.indent).toBe('24px');
      expect.soft(list.itemDisplay).toBe('list-item');
      expect.soft(language === 'dv' ? list.right : list.left).toBe('24px');
      expect.soft(language === 'dv' ? list.left : list.right).toBe('0px');
    }
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    expect(
      await outside.evaluate((node) => getComputedStyle(node.querySelector('h2')!).fontWeight),
    ).toBe(reset.weight);
  }
  await test.info().attach('computed-typography.json', {
    body: JSON.stringify(evidence, null, 2),
    contentType: 'application/json',
  });
  await writeFile(info.outputPath('computed-typography.json'), JSON.stringify(evidence, null, 2));
});
