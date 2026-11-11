import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { URL } from 'node:url';
import { legacyRedirects } from './site-routes.mjs';

const base = process.argv[2];
assert(base, 'Usage: node scripts/check-site-http.mjs http://127.0.0.1:8789');
const entries = Object.entries(legacyRedirects);
for (let offset = 0; offset < entries.length; offset += 8) {
  await Promise.all(
    entries.slice(offset, offset + 8).map(async ([from, to]) => {
      const redirect = await globalThis.fetch(new URL(from, base), {
        method: 'HEAD',
        redirect: 'manual',
      });
      assert.equal(redirect.status, 301, `${from} must permanently redirect`);
      assert.equal(
        new URL(redirect.headers.get('location'), base).pathname,
        to,
        `${from} destination`,
      );
      const response = await globalThis.fetch(new URL(to, base));
      assert.equal(response.status, 200, `${to} must resolve`);
      if (to.endsWith('.md')) {
        assert.match(response.headers.get('content-type'), /^text\/markdown/);
        assert.match(await response.text(), /^# /);
      } else if (to.endsWith('.tar.gz')) {
        assert.match(response.headers.get('content-type'), /^application\/gzip/);
        const bytes = new Uint8Array(await response.arrayBuffer());
        assert.deepEqual(Array.from(bytes.slice(0, 2)), [31, 139], 'download must be gzip bytes');
      } else assert.match(response.headers.get('content-type'), /^text\/html/);
    }),
  );
}
for (const path of ['/docs/', '/blocks/govmv-logo.svg', '/api/blocks/v1/catalog.json']) {
  const response = await globalThis.fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 200, `${path} must not be shadowed by a legacy redirect`);
}
console.log(
  `Verified ${entries.length} HTTP 301 redirects, destination MIME types, downloads, and current routes.`,
);
