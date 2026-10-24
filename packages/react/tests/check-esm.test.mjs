import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkEsm } from '../scripts/check-esm.mjs';

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'veli-esm-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, source] of Object.entries(files)) {
    const path = join(root, name);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, source);
  }
  return root;
}

test('every built JavaScript file uses resolvable relative ESM imports', () => {
  assert.ok(checkEsm(fileURLToPath(new URL('../dist/', import.meta.url))) > 0);
});
test('accepts explicit relative imports, reexports and dynamic imports', (t) => {
  const root = fixture(t, {
    'entry.js': `import 'react'; import './nested/target.js'; export * from './nested/target.js'; import('./nested/target.js'); // import './ignored'`,
    'nested/target.js': 'export const value = 1;',
  });
  assert.equal(checkEsm(root), 2);
});
for (const source of [
  "import './target';",
  "export * from './target';",
  "export { value } from './target';",
  "import('./target');",
]) {
  test(`rejects extensionless ESM: ${source}`, (t) => {
    const root = fixture(t, {
      'unexported/nested.js': source,
      'unexported/target.js': 'export const value = 1;',
    });
    assert.throws(() => checkEsm(root), /relative ESM imports must end in \.js/);
  });
}
test('rejects missing explicit targets', (t) => {
  assert.throws(
    () => checkEsm(fixture(t, { 'entry.js': "import './missing.js';" })),
    /target file does not exist/,
  );
});
test('rejects an empty dist directory', (t) => {
  assert.throws(() => checkEsm(fixture(t, {})), /no JavaScript files found/);
});
