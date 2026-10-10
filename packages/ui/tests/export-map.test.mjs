import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('JavaScript subpath exports have types, import, and default conditions', () => {
  for (const [subpath, conditions] of Object.entries(manifest.exports)) {
    if (typeof conditions === 'string') {
      continue;
    }

    assert.deepEqual(
      Object.keys(conditions),
      ['types', 'import', 'default'],
      `${subpath} must keep types first and default last`,
    );
    assert.equal(
      conditions.default,
      conditions.import,
      `${subpath} must use its ESM file by default`,
    );
    assert.ok(existsSync(join(packageDir, conditions.types)), `${subpath} types file must exist`);
    assert.ok(existsSync(join(packageDir, conditions.import)), `${subpath} ESM file must exist`);
  }
});
