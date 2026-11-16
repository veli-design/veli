/* global fetch, AbortSignal */
import console from 'node:console';
import { setTimeout } from 'node:timers';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

const origin = new URL(process.argv[2] ?? '');
assert.ok(
  ['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname),
  'Use a task-owned loopback dev server',
);
assert.equal(origin.pathname, '/');
const dev = await fetch(new URL('/@vite/client', origin), { signal: AbortSignal.timeout(10_000) });
assert.ok(
  dev.ok && (await dev.text()).includes('WebSocket'),
  'A running Vite development server is required',
);
const path = fileURLToPath(new URL('../src/content/docs/pagination.mdx', import.meta.url));
const original = await readFile(path, 'utf8');
const marker = `Content freshness probe ${randomUUID()}`;
const modified = `${original.trimEnd()}\n\n${marker}\n`;
const routes = [
  '/docs/components/pagination/',
  '/docs/components/pagination/index.md',
  '/search-index.json',
];
async function check(present) {
  const deadline = Date.now() + 45_000;
  let stale;
  do {
    stale = [];
    for (const route of routes) {
      const response = await fetch(new URL(route, origin), { signal: AbortSignal.timeout(20_000) });
      assert.ok(response.ok, `${route}: ${response.status}`);
      if ((await response.text()).includes(marker) !== present) stale.push(route);
    }
    if (!stale.length) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  } while (Date.now() < deadline);
  assert.fail(`Stale content after ${present ? 'edit' : 'restore'}: ${stale.join(', ')}`);
}
// Prime lazy routes before editing so the probe exercises invalidation, not just
// their first render reading the modified source.
await check(false);
try {
  await writeFile(path, modified);
  await check(true);
} finally {
  const current = await readFile(path, 'utf8');
  assert.equal(
    current,
    modified,
    'Probe file changed concurrently; refusing to overwrite unrelated work',
  );
  await writeFile(path, original);
}
await check(false);
assert.equal(await readFile(path, 'utf8'), original);
console.log('PASS: native HTML, Markdown and search refresh on edit and exact restoration.');
