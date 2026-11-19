/* global document, window, localStorage, URL, setTimeout, Event */
import assert from 'node:assert/strict';
import process from 'node:process';
import { Console } from 'node:console';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  componentAnimationSlugs,
  getComponentAnimation,
  missingComponentAnimations,
} from '../src/lib/component-animations.mjs';

const console = new Console(process.stdout, process.stderr);
const playwright = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.ANIMATION_BASE_URL ?? 'http://127.0.0.1:4386';
const output = process.env.ANIMATION_SCREENSHOTS ?? join(tmpdir(), 'veli-component-animations');
await mkdir(output, { recursive: true });
const available = componentAnimationSlugs.filter(
  (slug) => getComponentAnimation(slug).status === 'available',
);
const rootSelector = '[data-component-animation]';
let checks = 0;

async function state(page, value) {
  await page.waitForFunction(
    ({ selector, value }) => document.querySelector(selector)?.getAttribute('data-state') === value,
    { selector: rootSelector, value },
  );
  checks++;
}
async function open(page, slug) {
  const response = await page.goto(`${base}/docs/components/${slug}/`);
  assert.equal(response.status(), 200);
  assert.match(await page.title(), /Veli Design System/);
  assert.ok(await page.locator('h1').first().textContent());
  assert.equal(await page.locator('astro-error-overlay, vite-error-overlay').count(), 0);
  assert.equal(await page.locator(rootSelector).count(), 1);
  await page.locator(rootSelector).scrollIntoViewIfNeeded();
  checks += 5;
}
async function configure(context, theme = 'light') {
  await context.addInitScript((theme) => localStorage.setItem('veli-color-scheme', theme), theme);
}

for (const name of (process.env.ANIMATION_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
  const executablePath = process.env[`${name.toUpperCase()}_EXECUTABLE`];
  const browser = await playwright[name].launch({ executablePath });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1000 },
      reducedMotion: 'no-preference',
      deviceScaleFactor: 2,
    });
    await configure(context);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const requests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.lottie')) requests.push(request.url());
    });
    await open(page, 'button');
    await state(page, 'playing');
    assert.equal(await page.locator('[data-animation-replay]').isVisible(), false);
    await page.waitForFunction(() =>
      document.querySelector('[data-component-animation]').classList.contains('is-rendered'),
    );
    assert.deepEqual(
      requests.map((url) => new URL(url).pathname),
      ['/animations/components/button/en-light.lottie'],
    );
    assert.equal(await page.locator('[data-animation-play]').isVisible(), false);
    assert.equal(await page.locator('.docs-component-animation__controls').count(), 0);
    await page.getByRole('tab', { name: 'Design', exact: true }).click();
    await state(page, 'paused');
    await page.getByRole('tab', { name: 'Overview', exact: true }).click();
    await state(page, 'playing');
    // Make the artwork leave the viewport independently of tab selection.
    await page.locator(rootSelector).evaluate((root) => {
      root.style.marginTop = '2000px';
    });
    await state(page, 'paused');
    await page.locator(rootSelector).evaluate((root) => {
      root.style.marginTop = '';
    });
    await page.locator(rootSelector).scrollIntoViewIfNeeded();
    await state(page, 'playing');
    // Synthetic visibility changes exercise the same document lifecycle listener.
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await state(page, 'paused');
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await state(page, 'playing');
    await page.locator('[data-theme-cycle]').first().click(); // light -> dark, through the site control
    await state(page, 'playing');
    await page.waitForFunction(() =>
      document.querySelector('[data-component-animation]').classList.contains('is-rendered'),
    );
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.ok(requests.at(-1).endsWith('/button/en-dark.lottie'));
    await page.locator('[data-theme-cycle]').first().click(); // dark -> system (light)
    await state(page, 'playing');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await state(page, 'playing');
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await state(page, 'poster');
    assert.equal(await page.locator(`${rootSelector}.is-rendered`).count(), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(150);
    await state(page, 'poster');
    await page.locator('[data-animation-play]').click();
    await state(page, 'playing');
    await state(page, 'completed');
    const replay = page.locator('[data-animation-replay]');
    assert.ok(await replay.isVisible());
    assert.equal(await replay.locator('svg').count(), 1);
    await page.screenshot({ path: join(output, `${name}-completed-desktop.png`) });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(rootSelector).scrollIntoViewIfNeeded();
    assert.ok(await replay.isVisible());
    await page.screenshot({ path: join(output, `${name}-completed-mobile.png`) });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.locator(rootSelector).scrollIntoViewIfNeeded();

    const corner = await replay.boundingBox();
    const artwork = await page.locator(rootSelector).boundingBox();
    assert.ok(corner.x > artwork.x + artwork.width / 2 && corner.y < artwork.y + 20);
    await replay.focus();
    await page.keyboard.press('Enter');
    await state(page, 'playing');
    assert.equal(await replay.isVisible(), false);
    assert.ok(await page.locator(rootSelector).evaluate((root) => document.activeElement === root));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(rootSelector).scrollIntoViewIfNeeded();
    const geometry = await page.locator(rootSelector).evaluate((root) => {
      const canvas = root.querySelector('canvas');
      const rect = root.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        canvasWidth: canvas.width,
        viewport: window.innerWidth,
      };
    });
    assert.ok(geometry.width <= geometry.viewport && geometry.canvasWidth > 0);
    assert.ok(
      Math.abs(geometry.canvasWidth - (geometry.width - 2) * 2) < 3,
      'Canvas must render at device pixel ratio 2',
    );
    assert.ok(Math.abs(geometry.width / geometry.height - 805 / 476) < 0.03);
    await page.screenshot({ path: join(output, `${name}-mobile-dark.png`) });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.screenshot({ path: join(output, `${name}-desktop-dark.png`) });
    // Detached roots and repeated initialization must not retain active controllers.
    await page.locator(rootSelector).evaluate((root) => {
      window.animationTestRoot = root;
      root.remove();
    });
    await page.waitForTimeout(50);
    await page.evaluate(() =>
      document.querySelector('.docs-component-animation').prepend(window.animationTestRoot),
    );
    await state(page, 'playing');
    await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
    await state(page, 'poster');
    await page.evaluate(() => {
      document.dispatchEvent(new Event('astro:after-swap'));
      document.dispatchEvent(new Event('astro:page-load'));
    });
    await state(page, 'playing');
    assert.equal(await page.locator(`${rootSelector} canvas`).count(), 1);
    await open(page, 'menu');
    await state(page, 'playing');
    assert.equal(await page.locator('.docs-component-animation iframe').count(), 0);
    assert.deepEqual(errors, [], `${name}: console/page errors`);
    await context.close();

    const reduced = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 1000 },
    });
    await configure(reduced);
    const still = await reduced.newPage();
    const reducedRequests = [];
    still.on('request', (request) => {
      if (/\.lottie$|\.wasm($|\?)/.test(request.url())) reducedRequests.push(request.url());
    });
    await open(still, 'accordion');
    await state(still, 'poster');
    await still.waitForTimeout(200);
    assert.deepEqual(
      reducedRequests,
      [],
      'Reduced motion must not load player WASM or animation assets',
    );
    assert.ok(
      await still
        .locator('.docs-component-animation__poster--light')
        .evaluate((image) => image.complete && image.naturalWidth === 805),
    );
    await still.locator('[data-animation-play]').click();
    await state(still, 'playing');
    await reduced.close();

    for (const failure of ['asset', 'wasm']) {
      const failed = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
      await configure(failed);
      await failed.route(failure === 'asset' ? '**/*.lottie' : '**/*.wasm', (route) =>
        route.abort(),
      );
      const fallback = await failed.newPage();
      await open(fallback, 'card');
      await state(fallback, 'error');
      assert.ok(await fallback.locator('.docs-component-animation__poster--light').isVisible());
      assert.equal(await fallback.locator('[data-animation-play]').isVisible(), false);
      assert.match(
        await fallback.locator('[data-component-animation] [role="status"]').textContent(),
        /still image/,
      );
      await failed.close();
    }

    // Theme changes while a load is pending must discard the stale completion.
    const racing = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
    await configure(racing);
    await racing.route('**/*.lottie', async (route) => {
      await new Promise((accept) => setTimeout(accept, 500));
      await route.continue().catch(() => {});
    });
    const race = await racing.newPage();
    await open(race, 'card');
    await state(race, 'loading');
    await race.locator(rootSelector).evaluate((root) => {
      window.animationTestRoot = root;
      root.remove();
    });
    await race.waitForTimeout(50);
    await race.evaluate(() =>
      document.querySelector('.docs-component-animation').prepend(window.animationTestRoot),
    );
    await state(race, 'loading');

    await race.locator('[data-theme-cycle]').first().click();
    await state(race, 'playing');
    assert.equal(await race.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await race.locator(`${rootSelector} canvas`).count(), 1);
    await racing.close();

    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const staticPage = await noJS.newPage();
    await staticPage.goto(`${base}/docs/components/menu/`);
    assert.ok(await staticPage.locator('.docs-component-animation__poster--light').isVisible());
    assert.equal(await staticPage.locator('[data-animation-play]').isVisible(), false);
    assert.equal(await staticPage.locator('[data-animation-replay]').isVisible(), false);
    await noJS.close();

    if (process.env.ANIMATION_FULL_AUDIT === '1') {
      // Four pages at a time, each completing the authored sequence. Screenshots
      // cover the initial, representative middle, final and narrow-mobile views.
      for (const theme of ['light', 'dark']) {
        const audit = await browser.newContext({
          viewport: { width: 1280, height: 1000 },
          reducedMotion: 'no-preference',
        });
        await configure(audit, theme);
        for (let offset = 0; offset < available.length; offset += 4) {
          await Promise.all(
            available.slice(offset, offset + 4).map(async (slug) => {
              const sample = await audit.newPage();
              const sampleErrors = [];
              sample.on('pageerror', (error) => sampleErrors.push(error.message));
              sample.on('console', (message) => {
                if (message.type() === 'error') sampleErrors.push(message.text());
              });
              await open(sample, slug);
              await state(sample, 'playing');
              await sample.waitForFunction(() =>
                document
                  .querySelector('[data-component-animation]')
                  .classList.contains('is-rendered'),
              );
              await sample
                .locator(rootSelector)
                .screenshot({ path: join(output, `${name}-${slug}-${theme}-start.png`) });
              await sample.waitForTimeout(3400);
              await sample
                .locator(rootSelector)
                .screenshot({ path: join(output, `${name}-${slug}-${theme}-middle.png`) });
              await state(sample, 'completed');
              await sample
                .locator(rootSelector)
                .screenshot({ path: join(output, `${name}-${slug}-${theme}-end.png`) });
              await sample.setViewportSize({ width: 390, height: 844 });
              await sample.locator(rootSelector).scrollIntoViewIfNeeded();
              await sample
                .locator(rootSelector)
                .screenshot({ path: join(output, `${name}-${slug}-${theme}-mobile.png`) });
              assert.deepEqual(sampleErrors, [], `${name}/${slug}/${theme}`);
              await sample.close();
            }),
          );
          console.log(
            `${name}: audited ${Math.min(offset + 4, available.length)}/${available.length} ${theme}`,
          );
        }
        for (const slug of missingComponentAnimations) {
          const page = await audit.newPage();
          await page.goto(`${base}/docs/components/${slug}/`);
          assert.equal(await page.locator('.docs-component-animation').count(), 0, slug);
          await page.close();
        }
        await audit.close();
      }
    }
    console.log(
      `${name}: passed lifecycle, motion, theme, fallback, responsive and navigation checks (${checks} cumulative assertions).`,
    );
  } finally {
    await browser.close();
  }
}
console.log(`Screenshots: ${output}`);
