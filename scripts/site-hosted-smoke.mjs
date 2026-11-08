/* global document, getComputedStyle, window */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, siteOrigin, verifySiteBundle } from './site-release.mjs';
import { assertSnapshotProducer } from './site-snapshot-policy.mjs';

const roots = { web: 'apps/web/dist/', storybook: 'apps/storybook/storybook-static/' };
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;

export function validateSmokeTarget(target, snapshot) {
  assert.equal(target.schema, 1);
  assert.ok(['protected-preview', 'local-fixture'].includes(target.environment));
  for (const app of Object.keys(roots)) {
    const destination = target[app];
    assert.equal(siteOrigin(destination.origin), destination.origin);
    const url = new URL(destination.origin);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    assert.equal(local, target.environment === 'local-fixture');
    if (!local) {
      assert.ok(
        ![
          'https://veli.design',
          'https://storybook.veli.design',
          'https://veli-web.onegov.mv',
          'https://veli-storybook.onegov.mv',
        ].includes(destination.origin),
        'Known production origin is not a rehearsal target',
      );
      assert.notEqual(destination.origin, snapshot.plan.siteRelease.webOrigin);
      assert.notEqual(destination.origin, snapshot.plan.siteRelease.storybookOrigin);
      assert.match(destination.workerVersion, uuid);
      assert.match(destination.workerDeployment, uuid);
      assert.match(destination.workerName, /^[a-z0-9-]+$/);
    }
  }
  assert.notEqual(target.web.origin, target.storybook.origin);
  return target;
}

// Do not include _headers/_redirects: these are routing inputs, not public assets.
export function servedEntries(snapshot, app) {
  return snapshot.files
    .filter(({ path }) => path.startsWith(roots[app]))
    .flatMap((entry) => {
      const relative = entry.path.slice(roots[app].length);
      if (['_headers', '_redirects'].includes(relative)) return [];
      const pathname = '/' + relative.split('/').map(encodeURIComponent).join('/');
      return [{ ...entry, pathname: pathname.replace(/index\.html$/, '') }];
    });
}

// Credentials are supplied in memory by the caller, keyed by exact approved origin.
// No browser-wide extraHTTPHeaders/storageState and no automatic fetch redirects.
export function accessHeaders(origin, credentials = {}) {
  const supplied = credentials[origin] ?? {};
  for (const [key, value] of Object.entries(supplied)) {
    assert.ok(
      ['cf-access-client-id', 'cf-access-client-secret', 'cookie'].includes(key.toLowerCase()),
    );
    assert.equal(typeof value, 'string');
    assert.ok(!/[\r\n]/.test(value));
  }
  return { ...supplied };
}

export async function readApprovedURL(url, origin, credentials = {}, fetcher = fetch) {
  for (let redirects = 0; redirects <= 4; redirects++) {
    assert.equal(url.origin, origin, 'Request left approved origin');
    assert.ok(!url.username && !url.password, 'URL credentials are forbidden');
    const response = await fetcher(url, {
      method: 'GET',
      redirect: 'manual',
      headers: accessHeaders(origin, credentials),
      signal: AbortSignal.timeout(30000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      assert.ok(location, 'Redirect has no location');
      url = new URL(location, url);
      continue;
    }
    assert.equal(response.status, 200, 'Asset did not return 200');
    return Buffer.from(await response.arrayBuffer());
  }
  throw new Error('Too many redirects');
}

export async function verifyServedAssets(snapshot, target, credentials = {}, fetcher = fetch) {
  const checked = {};
  for (const app of Object.keys(roots)) {
    const entries = servedEntries(snapshot, app);
    assert.ok(entries.length > 0);
    for (const entry of entries) {
      const bytes = await readApprovedURL(
        new URL(entry.pathname, target[app].origin),
        target[app].origin,
        credentials,
        fetcher,
      );
      assert.equal(bytes.length, entry.bytes, `Served size differs: ${app}${entry.pathname}`);
      assert.equal(digest(bytes), entry.sha256, `Served hash differs: ${app}${entry.pathname}`);
    }
    checked[app] = { files: entries.length, inventorySha256: digest(JSON.stringify(entries)) };
  }
  return checked;
}

export async function installBrowserGuard(
  context,
  target,
  credentials,
  failures,
  suppressed,
  fetcher = fetch,
) {
  const approved = new Set(Object.keys(roots).map((app) => target[app].origin));
  await context.routeWebSocket('**/*', (socket) => {
    failures.push('WebSocket blocked');
    socket.close();
  });
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (
      url.origin === 'https://fonts.googleapis.com' &&
      request.method() === 'GET' &&
      request.resourceType() === 'stylesheet' &&
      !request.isNavigationRequest()
    ) {
      suppressed.push(url.origin);
      await route.abort();
      return;
    }
    if (!approved.has(url.origin) || url.username || url.password || request.method() !== 'GET') {
      failures.push('Unapproved browser request');
      await route.abort();
      return;
    }
    try {
      // Native fetch has no cookie jar. Do not use route.fetch/continue: their
      // context cookies or redirect headers can cross the per-origin boundary.
      const response = await fetcher(url, {
        method: 'GET',
        redirect: 'manual',
        headers: accessHeaders(url.origin, credentials),
        signal: AbortSignal.timeout(30000),
      });
      if (response.status >= 400) failures.push('Browser HTTP failure');
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        assert.ok(location);
        const next = new URL(location, url);
        assert.equal(next.origin, url.origin, 'Browser redirect left approved origin');
        assert.ok(!next.username && !next.password, 'Redirect URL credentials are forbidden');
      }
      const headers = Object.fromEntries(response.headers);
      // No response cookie may populate the browser jar. Fetch decompresses bodies.
      for (const header of ['set-cookie', 'content-encoding', 'content-length'])
        delete headers[header];
      await route.fulfill({
        status: response.status,
        headers,
        body: Buffer.from(await response.arrayBuffer()),
      });
    } catch {
      failures.push('Browser request failed');
      await route.abort();
    }
  });
}

export async function browserSmoke(browser, snapshot, directory, target, credentials = {}) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const failures = [];
  const suppressed = [];
  try {
    await installBrowserGuard(context, target, credentials, failures, suppressed);
    const page = await context.newPage();
    page.on('pageerror', () => failures.push('Browser runtime error'));
    page.setDefaultTimeout(15000);
    await page.goto(`${target.web.origin}/`);
    await page.locator('h1').first().waitFor();
    await page.locator('a[href="/foundations/"]').first().click();
    await page.waitForURL(`${target.web.origin}/foundations/`);
    await page.goto(`${target.web.origin}/docs/button/`);
    await page.locator('h1').filter({ hasText: 'Button' }).first().waitFor();
    const heading = page.locator('main h2[id]').first();
    const anchor = await heading.getAttribute('id');
    assert.ok(anchor, 'MDX section anchor missing');
    await page.goto(`${target.web.origin}/docs/button/#${encodeURIComponent(anchor)}`);
    await heading.waitFor();
    assert.equal(new URL(page.url()).hash, `#${encodeURIComponent(anchor)}`);
    await page.waitForFunction((id) => {
      const box = document.getElementById(id)?.getBoundingClientRect();
      return box && box.top >= 0 && box.top < window.innerHeight;
    }, anchor);
    await page.goto(`${target.web.origin}/docs/input/`);
    await page.locator('h1').filter({ hasText: 'Input' }).first().waitFor();
    await page.getByRole('button', { name: 'Search documentation', exact: true }).first().click();
    await page.getByRole('searchbox', { name: 'Search documentation' }).fill('Button');
    const result = page.getByRole('menuitem').filter({ hasText: 'Button' }).first();
    await result.waitFor();
    await result.click();
    await page.waitForURL(/\/docs\/button\//);
    await page.locator('h1').filter({ hasText: 'Button' }).first().waitFor();
    const themes = new Set();
    for (let index = 0; index < 3; index++) {
      await page.locator('[data-theme-cycle]').first().click();
      themes.add(await page.locator('html').getAttribute('data-theme'));
    }
    assert.ok(
      themes.has('light') && themes.has('dark'),
      'Theme control did not switch both themes',
    );
    assert.ok(
      await page.evaluate(async () => {
        await document.fonts.ready;
        return (
          [...document.fonts].some(
            (font) => /Inter/i.test(font.family) && font.status === 'loaded',
          ) && /Inter/i.test(getComputedStyle(document.body).fontFamily)
        );
      }),
      'Local Inter font not loaded/applied',
    );
    const catalog = JSON.parse(
      await readFile(resolve(directory, roots.web, 'docs-catalog.json'), 'utf8'),
    );
    assert.ok(catalog.includes('/docs/button/index.md'));
    const filter = catalog.includes('/blocks/filter-bar/index.md');
    if (filter) {
      await page.goto(`${target.web.origin}/blocks/filter-bar/`);
      await page.locator('h1').filter({ hasText: 'Filter Bar' }).first().waitFor();
      assert.ok(
        snapshot.files.some(
          ({ path }) => path === `${roots.web}api/blocks/v1/filter-bar/0.1.1.tar.gz`,
        ),
        'Candidate Filter Bar 0.1.1 missing',
      );
    }
    const stories = JSON.parse(
      await readFile(resolve(directory, roots.storybook, 'index.json'), 'utf8'),
    );
    assert.ok(stories.entries['components-button--playground']);
    await page.goto(
      `${target.storybook.origin}/iframe.html?id=components-button--playground&viewMode=story`,
    );
    await page.locator('#storybook-root button').first().waitFor();
    assert.equal(await page.locator('.sb-errordisplay').isVisible(), false);
    assert.deepEqual(failures, []);
    return {
      landingNavigation: true,
      suppressedOptionalFontRequests: {
        count: suppressed.length,
        origins: [...new Set(suppressed)],
      },
      docsNavigation: true,
      search: true,
      deepLink: anchor,
      mdx: true,
      themes: ['light', 'dark'],
      localFont: true,
      filterBar: filter ? '0.1.1' : 'absent-in-snapshot',
      story: 'components-button--playground',
    };
  } finally {
    await context.close();
  }
}

export function validateSmokeProvenance(provenance, producer, expectedDigest) {
  assert.match(provenance.repository, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  assertSnapshotProducer(producer, provenance.repository);
  assert.match(producer.head_sha, /^[a-f0-9]{40}$/);
  for (const value of [producer.id, producer.run_attempt, provenance.artifactId])
    assert.ok(Number.isSafeInteger(value) && value > 0);
  assert.equal(provenance.producerRun, producer.id);
  assert.equal(provenance.snapshotSha256, expectedDigest);
  assert.match(provenance.artifactName, /^[A-Za-z0-9_.-]+$/);
  return {
    repository: provenance.repository,
    producerRun: producer.id,
    artifactId: provenance.artifactId,
    artifactName: provenance.artifactName,
    snapshotSha256: expectedDigest,
  };
}

export async function smokeHostedBundle({
  directory,
  expectedDigest,
  target,
  producer,
  browser,
  credentials = {},
  fetcher = fetch,
}) {
  const snapshot = await verifySiteBundle(directory, expectedDigest);
  validateSmokeTarget(target, snapshot);
  const provenance = validateSmokeProvenance(target.provenance, producer, expectedDigest);
  const assets = await verifyServedAssets(snapshot, target, credentials, fetcher);
  const smoke = await browserSmoke(browser, snapshot, directory, target, credentials);
  // Deliberately not delivery.json/recoveryReceipt: this cannot prove production deployment.
  return {
    schema: 1,
    kind: 'site-hosted-smoke',
    environment: target.environment,
    observedAt: new Date().toISOString(),
    sourceCommit: snapshot.plan.sourceCommit,
    snapshotSha256: expectedDigest,
    provenance: { ...provenance, association: 'operator-supplied' },
    producerRun: producer.id,
    producerAttempt: producer.run_attempt,
    producerWorkflow: producer.path,
    producerConclusion: producer.conclusion,
    workerIdentitySource: 'operator-supplied',
    producerHead: producer.head_sha,
    canonicalOrigins: {
      web: snapshot.plan.siteRelease.webOrigin,
      storybook: snapshot.plan.siteRelease.storybookOrigin,
    },
    destinations: Object.fromEntries(
      Object.keys(roots).map((app) => [
        app,
        {
          origin: target[app].origin,
          workerName: target[app].workerName,
          workerVersion: target[app].workerVersion,
          workerDeployment: target[app].workerDeployment,
        },
      ]),
    ),
    assets,
    smoke,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [directory, expectedDigest, targetFile, producerFile, playwrightRoot, output] =
    process.argv.slice(2);
  let browser;
  try {
    const require = createRequire(resolve(playwrightRoot, 'package.json'));
    const { chromium } = require('@playwright/test');
    browser = await chromium.launch();
    const evidence = await smokeHostedBundle({
      directory,
      expectedDigest,
      target: JSON.parse(await readFile(targetFile, 'utf8')),
      producer: JSON.parse(await readFile(producerFile, 'utf8')),
      browser,
      credentials: JSON.parse(process.env.VELI_SMOKE_ACCESS_JSON || '{}'),
    });
    await writeFile(output, JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx' });
    console.log('Read-only smoke passed; separate rehearsal evidence written.');
  } catch {
    // Auth responses, browser errors and URLs may contain credentials. Never print them.
    console.error(
      'Smoke failed. No successful evidence was written; inspect inputs and access privately.',
    );
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
}
