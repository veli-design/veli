/* global document */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const [fixture, output, storybookUrl] = process.argv.slice(2);
if (!fixture || !output || !storybookUrl) {
  console.error(
    'Usage: node scripts/capture-toast-parity.mjs <playwright-consumer-directory> <output-directory> <storybook-url>',
  );
  process.exit(1);
}

const states = [
  {
    name: 'subtle-positive-en',
    id: 'components-toast--default',
    args: 'appearance:subtle;intent:positive',
    language: 'en',
  },
  {
    name: 'emphasis-info-en',
    id: 'components-toast--default',
    args: 'appearance:emphasis;intent:info',
    language: 'en',
  },
  {
    name: 'subtle-neutral-dv',
    id: 'components-toast--default',
    args: 'appearance:subtle;intent:neutral',
    language: 'dv',
  },
];

const { chromium } = createRequire(`${fixture}/package.json`)('@playwright/test');
const browser = await chromium.launch();
await mkdir(output, { recursive: true });
const report = [];
const page = await browser.newPage();

try {
  const index = await (await fetch(`${storybookUrl}/index.json`)).json();
  const entries = Object.values(index.entries ?? {});
  const missing = states.filter((state) => !entries.some((entry) => entry.id === state.id));
  if (missing.length) {
    throw new Error(`Story ids not in index.json: ${missing.map((s) => s.id).join(', ')}`);
  }

  await page.setViewportSize({ width: 800, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const state of states) {
    const errors = [];
    const listen = (e) => errors.push(e.message);
    page.on('pageerror', listen);
    const url =
      `${storybookUrl}/iframe.html?id=${state.id}` +
      `&viewMode=story&args=${state.args}` +
      `&veli-language=${state.language}&veli-theme=light`;
    await page.goto(url);
    await page.waitForSelector('#storybook-root > *', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const toast = page.locator('[role="alertdialog"]').first();
    await toast.waitFor({ state: 'visible', timeout: 15000 });
    await toast.screenshot({ path: `${output}/current-${state.name}.png` });
    report.push({ state: state.name, url, errors });
    page.off('pageerror', listen);
  }

  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      screenshots: report.length,
      errors: report.filter((x) => x.errors.length),
      output,
    }),
  );
} finally {
  await page.close();
  await browser.close();
}
