/* global getComputedStyle, document */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const root = new URL('../', import.meta.url);
const require = createRequire(resolve(process.argv[2], 'package.json'));
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const context = await browser.newContext();
const docs = await context.newPage();
const story = await context.newPage();
const errors = [];
for (const page of [docs, story]) page.on('pageerror', (error) => errors.push(error.message));
const motionURL = new URL('packages/tokens/src/motion.tokens.json', root);
const buttonURL = new URL('packages/ui/src/button.tsx', root);
const canonicalURL = new URL('packages/tokens/src/design.tokens.json', root);
const motion = await readFile(motionURL, 'utf8');
const button = await readFile(buttonURL, 'utf8');
const canonical = await readFile(canonicalURL, 'utf8');
try {
  await docs.goto(process.env.VELI_DOCS_URL ?? 'http://127.0.0.1:4321/docs/button/');
  await story.goto(
    process.env.VELI_STORYBOOK_URL ??
      'http://127.0.0.1:6006/iframe.html?id=components-button--playground&viewMode=story',
  );
  for (const page of [docs, story])
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--veli-duration-fast')
          .trim() === '80ms',
    );
  const next = JSON.parse(motion);
  next.duration.fast.$value.value = 81;
  await writeFile(motionURL, JSON.stringify(next, null, 2) + '\n');
  for (const page of [docs, story])
    await page.waitForFunction(
      () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--veli-duration-fast')
          .trim() === '81ms',
    );
  await writeFile(
    buttonURL,
    button.replace('<AriaButton\n', '<AriaButton\n      data-development-probe="live"\n'),
  );
  for (const page of [docs, story]) {
    console.log('Checking UI update:', page.url());
    await page.waitForSelector('[data-development-probe="live"]');
  }
  assert.equal(await readFile(canonicalURL, 'utf8'), canonical);
  assert.deepEqual(errors, []);
  console.log(
    'Docs and Storybook: token CSS HMR and UI source HMR passed without package builds; canonical source unchanged.',
  );
} finally {
  await writeFile(motionURL, motion);
  await writeFile(buttonURL, button);
  await browser.close();
}
