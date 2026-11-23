/* global document, requestAnimationFrame, window */
// Run with PLAYWRIGHT_MODULE pointing to an installed Playwright module, if it is
// not resolvable locally. Uses the repository's installed player and WASM.
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { Console } from 'node:console';
import { URL } from 'node:url';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assets from '../src/lib/component-animation-assets.json' with { type: 'json' };
import { componentAnimationSlugs } from '../src/lib/component-animations.mjs';

const console = new Console(process.stdout, process.stderr);
const require = createRequire(import.meta.url);
const runtimeDirectory = dirname(require.resolve('@lottiefiles/dotlottie-web'));
const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/') {
      response.setHeader('Content-Type', 'text/html');
      response.end('<!doctype html><canvas width="805" height="476"></canvas>');
      return;
    }
    const path =
      pathname === '/runtime.js'
        ? join(runtimeDirectory, 'index.js')
        : pathname === '/runtime.wasm'
          ? join(runtimeDirectory, 'dotlottie-player.wasm')
          : resolve(publicDirectory, `.${pathname}`);
    if (!path.startsWith(publicDirectory) && !path.startsWith(runtimeDirectory))
      throw new Error('Invalid path');
    response.setHeader(
      'Content-Type',
      pathname.endsWith('.js')
        ? 'text/javascript'
        : pathname.endsWith('.wasm')
          ? 'application/wasm'
          : 'application/octet-stream',
    );
    response.end(await readFile(path));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((accept) => server.listen(0, '127.0.0.1', accept));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  const page = await browser.newPage({
    viewport: { width: 805, height: 476 },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  for (const asset of assets.filter(
    (asset) => asset.locale === 'en' && componentAnimationSlugs.includes(asset.slug),
  )) {
    const data = await page.evaluate(
      async ({ src, frame }) => {
        const { DotLottie } = await import('/runtime.js');
        DotLottie.setWasmUrl('/runtime.wasm');
        const canvas = document.querySelector('canvas');
        canvas.style.cssText = 'width:805px;height:476px';
        const player = new DotLottie({
          canvas,
          src,
          autoplay: false,
          loop: false,
          renderConfig: { devicePixelRatio: 1, freezeOnOffscreen: false },
        });
        try {
          await new Promise((accept, reject) => {
            const timer = window.setTimeout(() => reject(new Error(`Timed out: ${src}`)), 15000);
            player.addEventListener('load', () => {
              window.clearTimeout(timer);
              accept();
            });
            player.addEventListener('loadError', () => {
              window.clearTimeout(timer);
              reject(new Error(`Cannot render ${src}`));
            });
          });
          player.setFrame(frame);
          // Capture the chosen rendered frame, not an asynchronous previous paint.
          await new Promise(requestAnimationFrame);
          return canvas.toDataURL('image/webp', 0.92).split(',')[1];
        } finally {
          player.destroy();
        }
      },
      { src: asset.path, frame: asset.posterFrame },
    );
    await writeFile(
      join(publicDirectory, asset.path.replace('.lottie', '.webp')),
      Buffer.from(data, 'base64'),
    );
    console.log(`${asset.slug}/${asset.theme}: frame ${asset.posterFrame}`);
  }
} finally {
  await browser.close();
  await new Promise((accept) => server.close(accept));
}
