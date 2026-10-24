import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';
import { execFileSync } from 'node:child_process';

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
