import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const packages = [
  {
    manifest: new URL('../packages/ui/package.json', import.meta.url),
    name: '@tradenetcorp/veli-ui',
    directory: 'packages/ui',
  },
  {
    manifest: new URL('../packages/tokens/package.json', import.meta.url),
    name: '@tradenetcorp/veli-tokens',
    directory: 'packages/tokens',
  },
  {
    manifest: new URL('../packages/cli/package.json', import.meta.url),
    name: '@tradenetcorp/veli',
    directory: 'packages/cli',
  },
];

test('published package metadata points to package-specific monorepo locations', async () => {
  for (const expected of packages) {
    const manifest = JSON.parse(await fs.readFile(expected.manifest, 'utf8'));

    assert.equal(manifest.name, expected.name);
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
