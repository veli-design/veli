/* global console, document, localStorage, process, URL */
// Regenerates the light and dark block screenshots shown on /docs/blocks/<id>/.
//
// Builds the capture routes (src/pages/capture/blocks) into a temporary directory, serves that
// build, and screenshots each demo at 2x. Output: public/images/blocks/<id>-<theme>.png.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const appRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputRoot = join(appRoot, 'public', 'images', 'blocks');
const require = createRequire(import.meta.url);
const { chromium } = require('@playwright/test');

const blocks = [
  'account-panel',
  'error-page',
  'filter-bar',
  'notification-tray',
  'page-navigation-footer',
  'preview-banner',
  'service-detail',
  'side-nav',
  'site-footer',
  'site-header',
  'site-shell',
];
const themes = ['light', 'dark'];
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function run(command, args, options) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`${command} exited with ${code}`)),
    );
  });
}

async function build(outDir) {
  const astroBin = join(dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');
  await run(process.execPath, [astroBin, 'build', '--outDir', outDir], {
    cwd: appRoot,
    env: { ...process.env, VELI_BLOCK_CAPTURE: '1' },
  });
}

async function serve(root) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    if (!path.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      const body = await readFile(path);
      response.writeHead(200, {
        'content-type': contentTypes[extname(path)] ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolvePromise) => server.listen(0, '127.0.0.1', resolvePromise));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

const workDir = await mkdtemp(join(tmpdir(), 'veli-block-capture-'));
const buildDir = join(workDir, 'dist');
let server;
let origin;
let browser;
try {
  await build(buildDir);
  ({ server, origin } = await serve(buildDir));
  await mkdir(outputRoot, { recursive: true });
  browser = await chromium.launch();

  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 2,
    });
    await context.addInitScript((scheme) => {
      localStorage.setItem('veli-color-scheme', scheme);
    }, theme);
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const block of blocks) {
      await page.goto(`${origin}/capture/blocks/${block}/`, { waitUntil: 'load' });
      const target = page.locator(`[data-block-demo="${block}"]`);
      await target.locator('astro-island > div').first().waitFor({ state: 'attached' });
      await page.waitForFunction(
        (id) => {
          const island = document.querySelector(`[data-block-demo="${id}"] astro-island`);
          return island && !island.hasAttribute('ssr');
        },
        block,
        { timeout: 30000 },
      );
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await target.screenshot({
        path: join(outputRoot, `${block}-${theme}.png`),
        animations: 'disabled',
      });
      console.log(`captured ${block} (${theme})`);
    }
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolvePromise) => (server ? server.close(resolvePromise) : resolvePromise()));
  await rm(workDir, { recursive: true, force: true });
}
