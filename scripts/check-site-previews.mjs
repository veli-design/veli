/* global document, getComputedStyle */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { withLocalSitePreviews } from './local-site-previews.mjs';
import { packages, validateManifest } from './release-sites.mjs';

// Exercise the current route contract, not the superseded Astro 5 page fixture.
const [runtime, directory, output, mode = 'packaged'] = process.argv.slice(2);
assert.ok(
  runtime && directory && output,
  'Pass browser runtime, built checkout and evidence directory',
);
assert.ok(['source', 'packaged'].includes(mode));
const root = resolve(directory);
const evidence = resolve(output);
const report = { mode, installedPackages: {}, checks: [], errors: [] };
if (mode === 'packaged') {
  assert.ok(
    !existsSync(resolve(root, 'packages/react/package.json')),
    'Checkout React source remains',
  );
  assert.ok(
    !existsSync(resolve(root, 'packages/tokens/src/design.tokens.json')),
    'Checkout tokens remain',
  );
  const manifest = validateManifest(
    JSON.parse(await readFile(resolve(root, 'release-manifest.json'), 'utf8')),
  );
  report.sourceCommit = manifest.sourceCommit;
  for (const app of ['web', 'storybook']) {
    report.installedPackages[app] = {};
    for (const name of packages) {
      const installed = JSON.parse(
        await readFile(resolve(root, 'apps', app, 'node_modules', name, 'package.json'), 'utf8'),
      );
      assert.equal(installed.version, manifest.packages[name]);
      report.installedPackages[app][name] = installed.version;
    }
  }
} else {
  assert.ok(existsSync(resolve(root, 'packages/react/src/button.tsx')));
}
await mkdir(evidence, { recursive: true });
const require = createRequire(resolve(runtime, 'package.json'));
const { chromium } = require('@playwright/test');
try {
  await withLocalSitePreviews({ root, evidence }, async ({ web, storybook, run }) => {
    assert.equal(await run(resolve(root, 'apps/web/scripts/check-site-http.mjs'), [web]), 0);
    report.checks.push('current-routes-and-all-legacy-redirects');
    const browser = await chromium.launch();
    try {
      for (const width of [390, 1440]) {
        for (const colorScheme of ['light', 'dark']) {
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            colorScheme,
            reducedMotion: 'reduce',
          });
          const page = await context.newPage();
          page.on('pageerror', (error) => report.errors.push(error.message));
          for (const path of [
            '/',
            '/design/',
            '/docs/',
            '/docs/components/button/',
            '/docs/components/textarea/',
          ]) {
            const response = await page.goto(new URL(path, web).href);
            assert.equal(response.status(), 200, path);
            await page.locator('h1').first().waitFor();
            await page.waitForFunction(() =>
              [...document.querySelectorAll('astro-island[client="load"]')].every(
                (island) => !island.hasAttribute('ssr'),
              ),
            );
            assert.ok(await page.title(), `Missing title: ${path}`);
            const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
            assert.equal(new URL(canonical).pathname, path, `Wrong canonical: ${path}`);
            await page.screenshot({
              path: resolve(
                evidence,
                `${width}-${colorScheme}-${path.replaceAll('/', '_') || 'home'}.png`,
              ),
            });
          }
          await page.goto(
            new URL('/iframe.html?id=components-button--playground&viewMode=story', storybook).href,
          );
          await page.locator('#storybook-root button:visible').first().waitFor();
          assert.ok(
            await page.evaluate(() =>
              getComputedStyle(document.documentElement)
                .getPropertyValue('--veli-duration-fast')
                .trim(),
            ),
          );
          report.checks.push(`${width}-${colorScheme}-pages-hydration-storybook`);
          await context.close();
        }
      }
      assert.deepEqual(report.errors, [], 'Browser runtime errors');
    } finally {
      await browser.close();
    }
  });
} finally {
  await writeFile(resolve(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
