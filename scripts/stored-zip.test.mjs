import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createStoredZip } from './stored-zip.mjs';

test('createStoredZip builds an archive unzip can read', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'veli-stored-zip-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const payload = JSON.stringify({ schema: 3, kind: 'recovery' });
  const bytes = createStoredZip({ 'delivery.json': payload });
  const archive = join(root, 'receipt.zip');
  writeFileSync(archive, bytes);
  assert.equal(
    execFileSync('unzip', ['-p', archive, 'delivery.json'], { encoding: 'utf8' }),
    payload,
  );
});

test('createStoredZip rejects empty archives and nested names', () => {
  assert.throws(() => createStoredZip({}), /at least one file/);
  assert.throws(() => createStoredZip({ 'nested/file.json': '{}' }), /single-segment/);
});
