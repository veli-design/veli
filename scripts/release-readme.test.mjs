import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { gunzipSync } from 'node:zlib';

import { withReleaseReadmes } from './release-readme.mjs';

const execFileAsync = promisify(execFile);
const npmCli = path.join(
  path.dirname(process.execPath),
  'node_modules',
  'npm',
  'bin',
  'npm-cli.js',
);

function readTarEntry(tarball, entryName) {
  const buffer = gunzipSync(tarball);
  let offset = 0;

  while (offset + 512 <= buffer.length) {
    const name = buffer.toString('utf8', offset, offset + 100).replace(/\0.*$/, '');
    if (!name) {
      break;
    }

    const size = Number.parseInt(buffer.toString('utf8', offset + 124, offset + 136).trim(), 8);
    offset += 512;

    if (name === entryName || name === `./${entryName}`) {
      return buffer.subarray(offset, offset + size).toString('utf8');
    }

    offset += Math.ceil(size / 512) * 512;
  }

  throw new Error(`Missing ${entryName} in tarball`);
}

async function createPackageFixture() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'veli-release-readme-'));
  const originalReadme = '# Package documentation\n\nInstall and usage instructions.\n';
  const changelog = `# Package

## [Unreleased]

## 1.2.3

_Released 2026-07-30._

### Fixed

- Publish release-specific notes.

## 1.2.2

### Fixed

- Older fix.
`;

  await fs.writeFile(path.join(dir, 'README.md'), originalReadme);
  await fs.writeFile(path.join(dir, 'CHANGELOG.md'), changelog);
  await fs.writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: '@tradenetcorp/example', version: '1.2.3' }),
  );

  return {
    dir,
    originalReadme,
    packages: [{ dir, packageJson: { name: '@tradenetcorp/example', version: '1.2.3' } }],
  };
}

test('stages only current release notes and restores the package README', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  await withReleaseReadmes(fixture.packages, async () => {
    assert.equal(
      await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
      '_Released 2026-07-30._\n\n### Fixed\n\n- Publish release-specific notes.\n',
    );
  });

  assert.equal(
    await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
    fixture.originalReadme,
  );
});

test('restores the package README when publishing fails', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  await assert.rejects(
    withReleaseReadmes(fixture.packages, async () => {
      throw new Error('publish failed');
    }),
    /publish failed/,
  );

  assert.equal(
    await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
    fixture.originalReadme,
  );
});

test('packs the release-specific README into the package artifact', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));
  const packDirectory = path.join(fixture.dir, 'packed');
  await fs.mkdir(packDirectory);

  let tarball;
  await withReleaseReadmes(fixture.packages, async () => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', packDirectory],
      {
        cwd: fixture.dir,
        env: { ...process.env, npm_config_cache: path.join(fixture.dir, '.npm-cache') },
      },
    );
    tarball = path.join(packDirectory, JSON.parse(stdout)[0].filename);
  });

  const packedReadme = readTarEntry(await fs.readFile(tarball), 'package/README.md');
  assert.equal(
    packedReadme,
    '_Released 2026-07-30._\n\n### Fixed\n\n- Publish release-specific notes.\n',
  );
  assert.equal(
    await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
    fixture.originalReadme,
  );
});

test('leaves legacy package versions without an exact heading unchanged', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));
  fixture.packages[0].packageJson.version = '1.2.1';

  await withReleaseReadmes(fixture.packages, async () => {
    assert.equal(
      await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
      fixture.originalReadme,
    );
  });
});
