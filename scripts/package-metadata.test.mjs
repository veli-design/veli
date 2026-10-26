import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertReleaseLegal } from './release-legal.mjs';

const packages = [
  {
    manifest: new URL('../packages/react/package.json', import.meta.url),
    name: '@veli-design/react',
    directory: 'packages/react',
  },
  {
    manifest: new URL('../packages/tokens/package.json', import.meta.url),
    name: '@veli-design/tokens',
    directory: 'packages/tokens',
  },
  {
    manifest: new URL('../packages/cli/package.json', import.meta.url),
    name: '@veli-design/cli',
    directory: 'packages/cli',
  },
];

test('published package metadata points to package-specific monorepo locations', async () => {
  for (const expected of packages) {
    const manifest = JSON.parse(await fs.readFile(expected.manifest, 'utf8'));

    assert.equal(manifest.name, expected.name);
    assert.deepEqual(manifest.publishConfig, {
      registry: 'https://registry.npmjs.org',
      access: 'public',
    });
    assert.ok(manifest.description);
    assert.equal(manifest.license, '(MIT AND CC-BY-4.0)');
    assert.ok(manifest.keywords.length);
    assert.deepEqual(manifest.repository, {
      type: 'git',
      url: 'git+https://github.com/tradenetcorp/veli.git',
      directory: expected.directory,
    });
    assert.equal(
      manifest.homepage,
      `https://github.com/tradenetcorp/veli/tree/main/${expected.directory}#readme`,
    );
    assert.equal(manifest.bugs.url, 'https://github.com/tradenetcorp/veli/issues');
  }
});

test('publishing refuses to run without explicit approval and an approved dist-tag', () => {
  const script = new URL('./publish-packages.mjs', import.meta.url);
  const env = { ...process.env, VELI_NPM_PUBLICATION_APPROVED: '', VELI_NPM_DIST_TAG: '' };
  assert.throws(
    () => execFileSync(process.execPath, [script.pathname], { env, stdio: 'pipe' }),
    /separate rollout approval/,
  );
  env.VELI_NPM_PUBLICATION_APPROVED = 'true';
  assert.throws(
    () => execFileSync(process.execPath, [script.pathname], { env, stdio: 'pipe' }),
    /approved VELI_NPM_DIST_TAG/,
  );
});

// Pins the complete official CC legal text and MIT terms obtained from primary sources.
// MIT's project-specific copyright line is deliberately outside the standard-terms hash.
test('standard licence terms and all distributed scope/notice copies stay intact', async () => {
  const documents = [
    'LICENSE',
    'LICENSES/CC-BY-4.0.txt',
    'LICENSING.md',
    'BRAND_POLICY.md',
    'ASSET_LICENSES.md',
    'THIRD_PARTY_NOTICES.md',
  ];
  for (const document of documents) {
    const root = await fs.readFile(new URL(`../${document}`, import.meta.url));
    for (const directory of ['react', 'tokens', 'cli']) {
      const copy = await fs.readFile(
        new URL(`../packages/${directory}/${document}`, import.meta.url),
      );
      assert.deepEqual(copy, root, `${directory}/${document}`);
    }
  }
  const cc = await fs.readFile(new URL('../LICENSES/CC-BY-4.0.txt', import.meta.url));
  assert.equal(
    createHash('sha256').update(cc).digest('hex'),
    '2ade8c89b8bbe0d859b124a9e47032c8494022f43091e8278ae8e2554a292196',
  );
  const mit = await fs.readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  const terms = mit.split('Permission is hereby')[1].trim().split(/\s+/).join(' ');
  assert.equal(
    createHash('sha256').update(terms).digest('hex'),
    'c3cca002c5ce1c85dbb5954f864012d9a0ec9c40dc986ba1448fa04b226cd7cd',
  );
});

test('incomplete copyright and attribution templates continue to block publication', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  assert.throws(() => assertReleaseLegal(root), /unresolved legal template/);
});
