import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { gunzipSync } from 'node:zlib';

import { withReleaseReadmes } from './release-readme.mjs';

const execFileAsync = promisify(execFile);

function resolveBundledCli(relativeSegments) {
  const execDir = path.dirname(process.execPath);
  const candidates = [
    // Windows Node distributions keep package managers next to the node binary.
    path.join(execDir, ...relativeSegments),
    // Unix Node distributions keep package managers under lib/.
    path.join(execDir, '..', 'lib', ...relativeSegments),
  ];
  const cli = candidates.find((candidate) => existsSync(candidate));
  if (cli == null) {
    throw new Error(`Unable to locate ${relativeSegments.join('/')} from ${process.execPath}`);
  }
  return cli;
}

function resolveNpmCli() {
  return resolveBundledCli(['node_modules', 'npm', 'bin', 'npm-cli.js']);
}

function resolveCorepackCli() {
  return resolveBundledCli(['node_modules', 'corepack', 'dist', 'corepack.js']);
}

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
    JSON.stringify({
      name: '@tradenetcorp/example',
      version: '1.2.3',
      packageManager: 'pnpm@11.18.0',
    }),
  );

  return {
    dir,
    originalReadme,
    releaseReadme: `## What's new in 1.2.3

_Released 2026-07-30._

### Fixed

- Publish release-specific notes.

---

${originalReadme}`,
    packages: [{ dir, packageJson: { name: '@tradenetcorp/example', version: '1.2.3' } }],
  };
}

test('prepends current release notes and restores the package README', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));

  await withReleaseReadmes(fixture.packages, async () => {
    assert.equal(
      await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
      fixture.releaseReadme,
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
      [resolveNpmCli(), 'pack', '--ignore-scripts', '--json', '--pack-destination', packDirectory],
      {
        cwd: fixture.dir,
        env: { ...process.env, npm_config_cache: path.join(fixture.dir, '.npm-cache') },
      },
    );
    tarball = path.join(packDirectory, JSON.parse(stdout)[0].filename);
  });

  const packedReadme = readTarEntry(await fs.readFile(tarball), 'package/README.md');
  assert.equal(packedReadme, fixture.releaseReadme);
  assert.equal(
    await fs.readFile(path.join(fixture.dir, 'README.md'), 'utf8'),
    fixture.originalReadme,
  );
});

test('publishes the release-specific README in pnpm registry metadata', async (t) => {
  const fixture = await createPackageFixture();
  t.after(() => fs.rm(fixture.dir, { recursive: true, force: true }));
  const requests = [];
  const registry = http.createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    requests.push({ method: request.method, url: request.url, body });

    if (request.method === 'PUT') {
      response.writeHead(201, { 'content-type': 'application/json' });
      response.end('{"ok":true}');
      return;
    }

    response.writeHead(404, { 'content-type': 'application/json' });
    response.end('{"error":"not_found"}');
  });
  await new Promise((resolve) => registry.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => registry.close(resolve)));

  const address = registry.address();
  const registryUrl = `http://127.0.0.1:${address.port}`;
  const userConfig = path.join(fixture.dir, '.npmrc');
  await fs.writeFile(userConfig, '');

  await withReleaseReadmes(fixture.packages, () =>
    execFileAsync(
      process.execPath,
      [
        resolveCorepackCli(),
        'pnpm',
        'publish',
        '--registry',
        registryUrl,
        '--no-git-checks',
        '--ignore-scripts',
      ],
      {
        cwd: fixture.dir,
        env: { ...process.env, npm_config_userconfig: userConfig },
      },
    ),
  );

  const publishRequest = requests.find((request) => request.method === 'PUT');
  assert.ok(publishRequest, 'expected pnpm to send a registry publish request');
  const metadata = JSON.parse(publishRequest.body);
  assert.equal(metadata.versions['1.2.3'].readme, fixture.releaseReadme);
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
