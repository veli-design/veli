import assert from 'node:assert/strict';
import test from 'node:test';
import { digest } from './site-release.mjs';
import {
  accessHeaders,
  installBrowserGuard,
  validateSmokeProvenance,
  readApprovedURL,
  servedEntries,
  validateSmokeTarget,
  verifyServedAssets,
} from './site-hosted-smoke.mjs';

const origin = 'https://docs-preview.example.test';
const target = {
  schema: 1,
  environment: 'local-fixture',
  web: { origin: 'http://127.0.0.1:4321' },
  storybook: { origin: 'http://127.0.0.1:6006' },
};
const file = (path, contents) => ({
  path,
  bytes: Buffer.byteLength(contents),
  sha256: digest(contents),
});
const snapshot = {
  plan: {
    siteRelease: {
      webOrigin: 'https://veli.design',
      storybookOrigin: 'https://storybook.veli.design',
    },
  },
  files: [
    file('apps/web/dist/index.html', 'home'),
    file('apps/web/dist/docs/button/index.html', 'button'),
    file('apps/web/dist/_headers', 'headers'),
    file('apps/web/dist/docs-catalog.json', '[]'),
    file('apps/storybook/storybook-static/index.json', '{}'),
    file('locks/source-pnpm-lock.yaml', 'lock'),
  ],
};

test('inventory maps directory index routes and excludes private routing inputs/locks', () => {
  assert.deepEqual(
    servedEntries(snapshot, 'web').map(({ pathname }) => pathname),
    ['/', '/docs/button/', '/docs-catalog.json'],
  );
});

test('target distinguishes local fixtures and protected preview, rejects canonical destinations', () => {
  validateSmokeTarget(target, snapshot);
  assert.throws(() =>
    validateSmokeTarget({ ...target, environment: 'protected-preview' }, snapshot),
  );
  const remote = {
    origin,
    workerName: 'veli-preview',
    workerVersion: '12345678-1234-1234-1234-123456789abc',
    workerDeployment: '12345678-1234-1234-1234-123456789abc',
  };
  const preview = {
    schema: 1,
    environment: 'protected-preview',
    web: remote,
    storybook: { ...remote, origin: 'https://stories-preview.example.test' },
  };
  validateSmokeTarget(preview, snapshot);
  assert.throws(() =>
    validateSmokeTarget(
      { ...preview, web: { ...remote, origin: 'https://veli.design' } },
      snapshot,
    ),
  );
  assert.throws(() =>
    validateSmokeTarget({ ...preview, web: { ...remote, workerVersion: '' } }, snapshot),
  );
  assert.throws(() => validateSmokeTarget({ ...target, storybook: target.web }, snapshot));
});

test('access headers are exact-origin only and reject dangerous overrides', () => {
  const credentials = { [origin]: { 'CF-Access-Client-Secret': 'test-only-secret' } };
  assert.deepEqual(accessHeaders('https://elsewhere.example.test', credentials), {});
  assert.equal(accessHeaders(origin, credentials)['CF-Access-Client-Secret'], 'test-only-secret');
  assert.throws(() => accessHeaders(origin, { [origin]: { Host: 'elsewhere.example.test' } }));
  assert.throws(() => accessHeaders(origin, { [origin]: { cookie: 'bad\r\nheader' } }));
});

test('cross-origin and credential-bearing redirects fail before sending a second request', async () => {
  for (const location of [
    'https://elsewhere.example.test/',
    'https://user:password@docs-preview.example.test/',
  ]) {
    let calls = 0;
    await assert.rejects(
      readApprovedURL(new URL(origin), origin, {}, async () => {
        calls++;
        return new Response(null, { status: 302, headers: { location } });
      }),
    );
    assert.equal(calls, 1);
  }
});

test('same-origin redirects are bounded and manually authenticated per request', async () => {
  let calls = 0;
  const bytes = await readApprovedURL(
    new URL(origin),
    origin,
    { [origin]: { cookie: 'test-only' } },
    async (url, options) => {
      calls++;
      assert.equal(options.redirect, 'manual');
      assert.equal(options.headers.cookie, 'test-only');
      return calls === 1
        ? new Response(null, { status: 302, headers: { location: '/target' } })
        : new Response('ok');
    },
  );
  assert.equal(bytes.toString(), 'ok');
  assert.equal(calls, 2);
  await assert.rejects(
    readApprovedURL(
      new URL(origin),
      origin,
      {},
      async () => new Response(null, { status: 302, headers: { location: '/' } }),
    ),
    /Too many redirects/,
  );
});

test('served inventory checks every hash, catching login HTML, stale files, and missing assets', async () => {
  const bodies = {
    '/': 'home',
    '/docs/button/': 'button',
    '/docs-catalog.json': '[]',
    '/index.json': '{}',
  };
  const result = await verifyServedAssets(
    snapshot,
    target,
    {},
    async (url) => new Response(bodies[url.pathname]),
  );
  assert.equal(result.web.files, 3);
  assert.equal(result.storybook.files, 1);
  for (const response of [
    () => new Response('login'),
    () => new Response('xxxx'),
    () => new Response('', { status: 404 }),
  ]) {
    await assert.rejects(verifyServedAssets(snapshot, target, {}, response));
  }
});

async function guardFixture(fetcher) {
  let handler, socketHandler;
  const failures = [],
    suppressed = [];
  await installBrowserGuard(
    {
      route: async (_, callback) => {
        handler = callback;
      },
      routeWebSocket: async (_, callback) => {
        socketHandler = callback;
      },
    },
    target,
    {
      [target.web.origin]: { Cookie: 'web-only' },
      [target.storybook.origin]: { Cookie: 'story-only' },
    },
    failures,
    suppressed,
    fetcher,
  );
  return {
    failures,
    suppressed,
    socketHandler,
    request: async (url, method = 'GET', type = 'document', navigation = true) => {
      let aborted = false,
        fulfilled;
      await handler({
        request: () => ({
          url: () => url,
          method: () => method,
          resourceType: () => type,
          isNavigationRequest: () => navigation,
        }),
        abort: async () => {
          aborted = true;
        },
        fulfill: async (response) => {
          fulfilled = response;
        },
      });
      return { aborted, fulfilled };
    },
  };
}

test('browser guard rejects external requests, POST, external redirects, URL credentials and sockets', async () => {
  let calls = 0;
  const guard = await guardFixture(async () => {
    calls++;
    return new Response(null, {
      status: 302,
      headers: { location: 'https://elsewhere.example.test' },
    });
  });
  for (const [url, method] of [
    ['https://elsewhere.example.test', 'GET'],
    [target.web.origin, 'POST'],
    ['http://user:password@127.0.0.1:4321/', 'GET'],
  ])
    assert.equal((await guard.request(url, method)).aborted, true);
  assert.equal(calls, 0);
  assert.equal((await guard.request(target.web.origin)).aborted, true);
  assert.equal(calls, 1);
  let closed = false;
  guard.socketHandler({
    close: () => {
      closed = true;
    },
  });
  assert.equal(closed, true);
  assert.equal(guard.failures.length, 5);
});

test('browser guard uses exact-origin credentials without request/response cookie persistence', async () => {
  const seen = [];
  const guard = await guardFixture(async (url, options) => {
    seen.push(options.headers.Cookie);
    assert.equal(options.redirect, 'manual');
    return new Response('ok', {
      headers: {
        'set-cookie': 'secret=bad; Domain=127.0.0.1',
        'content-encoding': 'gzip',
        'content-length': '50',
      },
    });
  });
  for (const app of ['web', 'storybook']) {
    const result = await guard.request(target[app].origin);
    assert.equal(result.fulfilled.body.toString(), 'ok');
    assert.equal(result.fulfilled.headers['set-cookie'], undefined);
    assert.equal(result.fulfilled.headers['content-encoding'], undefined);
    assert.equal(result.fulfilled.headers['content-length'], undefined);
  }
  assert.deepEqual(seen, ['web-only', 'story-only']);
  assert.deepEqual(guard.failures, []);
});

test('only optional Google Fonts stylesheets are suppressed and reported without fetching', async () => {
  const guard = await guardFixture(async () => {
    throw new Error('Must never fetch');
  });
  assert.equal(
    (
      await guard.request(
        'https://fonts.googleapis.com/css2?private=query',
        'GET',
        'stylesheet',
        false,
      )
    ).aborted,
    true,
  );
  assert.deepEqual(guard.suppressed, ['https://fonts.googleapis.com']);
  assert.deepEqual(guard.failures, []);
  await guard.request('https://fonts.googleapis.com/css2');
  await guard.request('https://fonts.gstatic.com/font.woff2', 'GET', 'font', false);
  assert.equal(guard.failures.length, 2);
});

test('operator provenance records explicit repository/artifact association and producer attempt', () => {
  const producer = {
    id: 123,
    run_attempt: 1,
    head_sha: 'a'.repeat(40),
    repository: { full_name: 'veli-design/veli' },
    status: 'completed',
    conclusion: 'success',
    path: '.github/workflows/prepare-site-release.yml',
    event: 'workflow_dispatch',
    head_branch: 'main',
  };
  const provenance = {
    repository: 'veli-design/veli',
    producerRun: 123,
    artifactId: 456,
    artifactName: 'site-snapshot',
    snapshotSha256: 'b'.repeat(64),
  };
  validateSmokeProvenance(provenance, producer, 'b'.repeat(64));
  for (const patch of [
    { repository: 'other/repo' },
    { producerRun: 124 },
    { artifactId: 0 },
    { snapshotSha256: 'c'.repeat(64) },
  ])
    assert.throws(() =>
      validateSmokeProvenance({ ...provenance, ...patch }, producer, 'b'.repeat(64)),
    );
});

test('old canonical snapshot cannot target either current or historical production pair', () => {
  const previous = {
    ...snapshot,
    plan: {
      siteRelease: {
        webOrigin: 'https://veli-web.onegov.mv',
        storybookOrigin: 'https://veli-storybook.onegov.mv',
      },
    },
  };
  for (const origin of [
    'https://veli.design',
    'https://storybook.veli.design',
    'https://veli-web.onegov.mv',
    'https://veli-storybook.onegov.mv',
  ])
    assert.throws(
      () =>
        validateSmokeTarget(
          { ...target, environment: 'protected-preview', web: { origin } },
          previous,
        ),
      /Known production origin/,
    );
});
