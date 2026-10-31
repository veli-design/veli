import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
for (const [path, entry] of Object.entries(manifest.exports)) {
  if (typeof entry !== 'object' || !entry.import?.endsWith('.js')) continue;
  test(`published ESM entry resolves in Node: ${path}`, async () => {
    const exports = await import(`${manifest.name}/${path.slice(2)}`);
    assert.ok(Object.keys(exports).length > 0);
  });
}
