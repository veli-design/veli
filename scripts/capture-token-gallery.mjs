/* global document */
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const [fixture, output, baseline, candidate] = process.argv.slice(2);
const { chromium } = createRequire(`${fixture}/package.json`)('@playwright/test');
const browser = await chromium.launch();
await mkdir(output, { recursive: true });
const report = [];
try {
  for (const [version, url] of [
    ['baseline', baseline],
    ['candidate', candidate],
  ]) {
    const entries = Object.values((await (await fetch(`${url}/index.json`)).json()).entries);
    const titles = new Map();
    for (const entry of entries)
      if (
        entry.type === 'story' &&
        /^(Components|Foundations)\//.test(entry.title) &&
        !titles.has(entry.title)
      )
        titles.set(entry.title, entry);
    const page = await browser.newPage();
    for (const width of [390, 1280])
      for (const language of ['en', 'dv'])
        for (const theme of ['light', 'dark'])
          for (const entry of titles.values()) {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            const errors = [];
            const listen = (e) => errors.push(e.message);
            page.on('pageerror', listen);
            await page.goto(
              `${url}/iframe.html?id=${entry.id}&viewMode=story&veli-language=${language}&veli-theme=${theme}`,
            );
            await page.waitForSelector('#storybook-root > *', { timeout: 15000 });
            await page.evaluate(() => document.fonts.ready);
            await page.screenshot({
              path: `${output}/${version}-${entry.id}-${width}-${language}-${theme}.png`,
            });
            report.push({ version, story: entry.id, width, language, theme, errors });
            page.off('pageerror', listen);
          }
    await page.close();
  }
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({ screenshots: report.length, errors: report.filter((x) => x.errors.length) }),
  );
} finally {
  await browser.close();
}
