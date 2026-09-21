import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import {
  getBlocks,
  validateBlock,
  sourceRoot,
  safePath,
  bundleFiles,
  archive,
  sha256,
  blockMarkdown,
} from '../scripts/catalog.mjs';

const block = getBlocks()[0];
const provenance = { sourceCommit: 'a'.repeat(40), dirty: false };
function fixture(run) {
  const dir = mkdtempSync(resolve(tmpdir(), 'veli-block-test-'));
  cpSync(resolve(sourceRoot, 'site-footer'), dir, { recursive: true });
  try {
    run(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('valid canonical source is used by markdown and both downloaded copies', () => {
  const files = bundleFiles(block, provenance);
  const receipt = JSON.parse(files.find((file) => file.path.endsWith('receipt.json')).bytes);
  assert.equal(receipt.id, block.manifest.id);
  for (const file of block.files) {
    assert.ok(blockMarkdown(block).includes(file.bytes.toString('utf8').trimEnd()));
    const copies = files.filter((entry) => entry.path.endsWith('/' + file.path));
    assert.equal(copies.length, 2);
    for (const copy of copies)
      assert.equal(
        sha256(copy.bytes),
        receipt.files.find((entry) => entry.path === file.path).sha256,
      );
  }
});

test('archive is deterministic and its entries contain the exact advertised bytes', () => {
  const zipped = archive(block, provenance);
  assert.deepEqual(zipped, archive(block, provenance));
  const tar = gunzipSync(zipped);
  let offset = 0;
  for (const file of bundleFiles(block, provenance)) {
    const header = tar.subarray(offset, offset + 512);
    assert.equal(header.subarray(0, 100).toString().replace(/\0.*$/s, ''), file.path);
    const size = parseInt(header.subarray(124, 136).toString(), 8);
    assert.deepEqual(tar.subarray(offset + 512, offset + 512 + size), file.bytes);
    offset += 512 + Math.ceil(size / 512) * 512;
  }
});

test('unsafe destinations and missing inventory files are rejected', () => {
  for (const path of ['../secret', '/tmp/file', 'a/../b', 'a\\b', 'a//b', '.env'])
    assert.throws(() => safePath(path));
  fixture((dir) => {
    rmSync(resolve(dir, 'site-footer.tsx'));
    assert.throws(() => validateBlock(dir));
  });
});

test('manifest fields must match the typed runtime contract', () => {
  for (const manifest of [
    null,
    { id: 'site-footer', version: '0.1.0' },
    { ...block.manifest, status: 'preview' },
    { ...block.manifest, files: ['site-footer.tsx', 42] },
    { ...block.manifest, dependencies: ['@tradenetcorp/veli-ui'] },
  ])
    fixture((dir) => {
      writeFileSync(resolve(dir, 'manifest.json'), JSON.stringify(manifest));
      assert.throws(() => validateBlock(dir));
    });
});

test('external symlinks cannot leak files into a download', () =>
  fixture((dir) => {
    rmSync(resolve(dir, 'site-footer.tsx'));
    symlinkSync(
      resolve(sourceRoot, 'site-footer/site-footer.tsx'),
      resolve(dir, 'site-footer.tsx'),
    );
    assert.throws(() => validateBlock(dir), /escapes/);
  }));

for (const specifier of ['@/auth', 'next/link', '@tradenetcorp/veli-ui/src/link', './missing']) {
  test(`rejects nonportable import ${specifier}`, () =>
    fixture((dir) => {
      writeFileSync(resolve(dir, 'site-footer.tsx'), `import x from '${specifier}'; export { x };`);
      assert.throws(() => validateBlock(dir), /import/);
    }));
}

test('dynamic imports must be statically declared', () =>
  fixture((dir) => {
    writeFileSync(resolve(dir, 'site-footer.tsx'), 'export const load = (path) => import(path);');
    assert.throws(() => validateBlock(dir), /Nonliteral/);
  }));

test('every release needs its own changelog entry', () =>
  fixture((dir) => {
    writeFileSync(resolve(dir, 'CHANGELOG.md'), '## 0.0.1\n');
    assert.throws(() => validateBlock(dir), /changelog/);
  }));

test('three-way update retains an application customization and upstream fix', () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'veli-block-update-'));
  try {
    const original = block.files[0].bytes.toString();
    const local = original.replace("className = ''", "className = 'application-footer'");
    const upstream = original.replace('gap-y-3', 'gap-y-4');
    for (const [name, text] of Object.entries({ original, local, upstream }))
      writeFileSync(resolve(dir, name), text);
    const merged = execFileSync(
      'git',
      [
        'merge-file',
        '-p',
        resolve(dir, 'local'),
        resolve(dir, 'original'),
        resolve(dir, 'upstream'),
      ],
      { encoding: 'utf8' },
    );
    assert.ok(merged.includes("className = 'application-footer'"));
    assert.ok(merged.includes('gap-y-4'));
    assert.equal(readFileSync(resolve(dir, 'original'), 'utf8'), original);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
