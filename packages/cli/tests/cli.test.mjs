import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { sourceArchive, getBlocks } from '../../blocks/scripts/catalog.mjs';
import { parseSourceArchive, VeliWebClient, WFA_URL } from '../dist/client.js';
import { normalizeBlocksDir, normalizeWebUrl, readConfig, writeConfig } from '../dist/config.js';
import { installBlock, blockState, installedBlocks, restoreBlock } from '../dist/project.js';
import { abortUpdate, continueUpdate, hasPendingUpdate, updateBlock } from '../dist/update.js';
import { sha256 } from '../dist/contracts.js';

const provenance = { sourceCommit: 'a'.repeat(40), dirty: false };
const block = getBlocks().find(({ manifest }) => manifest.id === 'site-footer');
const execFileAsync = promisify(execFile);

async function fixture(run) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'veli-cli-test-'));
  await writeFile(path.join(cwd, 'package.json'), '{}\n');
  try {
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

function release(version, source, hashCharacter) {
  const bytes = Buffer.from(source);
  const manifest = { ...block.manifest, version, files: ['site-footer.tsx'] };
  return {
    manifest,
    receipt: {
      schemaVersion: 1,
      id: manifest.id,
      version,
      sourceCommit: hashCharacter.repeat(40),
      dirty: false,
      sourceUrl: `https://example.test/${version}`,
      files: [{ path: 'site-footer.tsx', sha256: sha256(bytes) }],
    },
    source: new Map([['site-footer.tsx', bytes]]),
  };
}

test('configuration normalizes safe destinations and web origins', async () => {
  await fixture(async (cwd) => {
    assert.equal(normalizeWebUrl('https://veli.example.test/'), 'https://veli.example.test');
    assert.equal(normalizeBlocksDir(cwd, './src/components/blocks/'), 'src/components/blocks');
    assert.throws(() => normalizeBlocksDir(cwd, '../elsewhere'));
    assert.throws(() => normalizeBlocksDir(cwd, '.veli/blocks'), /reserved/);
    assert.throws(() => normalizeWebUrl('http://veli.example.test'));
    const config = {
      schemaVersion: 1,
      webUrl: 'https://veli.example.test',
      blocksDir: 'src/blocks',
    };
    await writeConfig(cwd, config);
    assert.deepEqual(await readConfig(cwd), config);
  });
});

for (const block of getBlocks())
  test(`${block.manifest.id}: canonical source archives verify and install exact working and baseline bytes`, async () => {
    const parsed = parseSourceArchive(sourceArchive(block, provenance));
    await fixture(async (cwd) => {
      const installed = await installBlock(cwd, 'src/components/blocks', parsed);
      for (const [file, source] of parsed.source) {
        assert.deepEqual(await readFile(path.join(installed.targetDir, file)), source);
        assert.deepEqual(await readFile(path.join(installed.baselineDir, file)), source);
      }
      assert.deepEqual(await blockState(installed), {
        baselineValid: true,
        customized: [],
        missing: [],
      });
    });
  });

test('restore discards managed customization while preserving unknown application files', async () => {
  await fixture(async (cwd) => {
    const installed = await installBlock(
      cwd,
      'src/components/blocks',
      release('0.1.0', 'one\ntwo\n', 'a'),
    );
    await writeFile(path.join(installed.targetDir, 'site-footer.tsx'), 'custom\n');
    await writeFile(path.join(installed.targetDir, 'application.ts'), 'keep\n');
    await restoreBlock(installed);
    assert.equal(
      await readFile(path.join(installed.targetDir, 'site-footer.tsx'), 'utf8'),
      'one\ntwo\n',
    );
    assert.equal(
      await readFile(path.join(installed.targetDir, 'application.ts'), 'utf8'),
      'keep\n',
    );
  });
});

test('overwrite refuses to remove unknown application files', async () => {
  await fixture(async (cwd) => {
    const installed = await installBlock(
      cwd,
      'src/components/blocks',
      release('0.1.0', 'one\n', 'a'),
    );
    await writeFile(path.join(installed.targetDir, 'application.ts'), 'keep\n');
    await assert.rejects(
      () => installBlock(cwd, 'src/components/blocks', release('0.2.0', 'two\n', 'b'), true),
      /not managed by this block/,
    );
    assert.equal(
      await readFile(path.join(installed.targetDir, 'application.ts'), 'utf8'),
      'keep\n',
    );
    assert.equal(
      await readFile(path.join(installed.targetDir, 'site-footer.tsx'), 'utf8'),
      'one\n',
    );
    assert.equal((await installedBlocks(cwd))[0].receipt.version, '0.1.0');
  });
});

test('clean updates preserve application changes and advance the verified baseline', async () => {
  await fixture(async (cwd) => {
    const installed = await installBlock(
      cwd,
      'src/components/blocks',
      release('0.1.0', 'one\ntwo\nthree\nfour\nfive\n', 'a'),
    );
    await writeFile(
      path.join(installed.targetDir, 'site-footer.tsx'),
      'one local\ntwo\nthree\nfour\nfive\n',
    );
    const result = await updateBlock(
      cwd,
      installed,
      release('0.2.0', 'one\ntwo\nthree\nfour\nfive upstream\n', 'b'),
    );
    assert.deepEqual(result.conflicts, []);
    assert.match(
      await readFile(path.join(installed.targetDir, 'site-footer.tsx'), 'utf8'),
      /one local/,
    );
    assert.match(
      await readFile(path.join(installed.targetDir, 'site-footer.tsx'), 'utf8'),
      /five upstream/,
    );
    assert.equal((await installedBlocks(cwd))[0].receipt.version, '0.2.0');
  });
});

test('conflicted updates retain the old baseline and can be aborted or continued', async () => {
  await fixture(async (cwd) => {
    let installed = await installBlock(
      cwd,
      'src/components/blocks',
      release('0.1.0', 'one\ntwo\nthree\n', 'a'),
    );
    const working = path.join(installed.targetDir, 'site-footer.tsx');
    await writeFile(working, 'one\nlocal\nthree\n');
    const result = await updateBlock(
      cwd,
      installed,
      release('0.2.0', 'one\nupstream\nthree\n', 'b'),
    );
    assert.deepEqual(result.conflicts, ['site-footer.tsx']);
    assert.equal((await installedBlocks(cwd))[0].receipt.version, '0.1.0');
    assert.equal(await hasPendingUpdate(cwd, block.manifest.id), true);
    await abortUpdate(cwd, installed);
    assert.equal(await readFile(working, 'utf8'), 'one\nlocal\nthree\n');

    await updateBlock(cwd, installed, release('0.2.0', 'one\nupstream\nthree\n', 'b'));
    await assert.rejects(() => continueUpdate(cwd, installed), /Resolve conflict markers/);
    await writeFile(working, 'one\nresolved local and upstream\nthree\n');
    const candidate = path.join(
      cwd,
      '.veli',
      'updates',
      block.manifest.id,
      'candidate',
      'site-footer.tsx',
    );
    await writeFile(candidate, 'tampered upstream\n');
    await assert.rejects(() => continueUpdate(cwd, installed), /candidate hash failed/);
    assert.equal((await installedBlocks(cwd))[0].receipt.version, '0.1.0');
    await writeFile(candidate, 'one\nupstream\nthree\n');
    await continueUpdate(cwd, installed);
    installed = (await installedBlocks(cwd))[0];
    assert.equal(installed.receipt.version, '0.2.0');
    assert.equal(await hasPendingUpdate(cwd, block.manifest.id), false);
  });
});

test('service-token requests send credentials only as Access headers', async () => {
  const previous = globalThis.fetch;
  let headers;
  globalThis.fetch = async (_url, init) => {
    headers = init.headers;
    return new Response(JSON.stringify({ schemaVersion: 1, blocks: [] }), {
      headers: { 'content-type': 'application/json' },
    });
  };
  try {
    const client = new VeliWebClient('https://veli.example.test', {
      CF_ACCESS_CLIENT_ID: 'client-id',
      CF_ACCESS_CLIENT_SECRET: 'client-secret',
      CI: 'true',
    });
    assert.deepEqual(await client.catalog(), { schemaVersion: 1, blocks: [] });
    assert.deepEqual(headers, {
      'CF-Access-Client-Id': 'client-id',
      'CF-Access-Client-Secret': 'client-secret',
    });
  } finally {
    globalThis.fetch = previous;
  }
});

test('WFA access challenge provides the IP-approval recovery path without token replay', async () => {
  const previous = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (_url, init) => {
    requests.push(init);
    return new Response('<html>Access</html>', {
      status: 403,
      headers: { 'content-type': 'text/html' },
    });
  };
  try {
    const client = new VeliWebClient('https://veli.example.test', {});
    await assert.rejects(
      () => client.catalog(),
      (error) =>
        error.message.includes(WFA_URL) &&
        error.message.includes('up to 24 hours') &&
        error.message.includes('same network/IP'),
    );
    assert.equal(requests.length, 1);
    assert.equal(requests[0].headers, undefined);
  } finally {
    globalThis.fetch = previous;
  }
});

test('non-interactive Access challenges require service-token credentials', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('<html>Access</html>', {
      status: 302,
      headers: { 'content-type': 'text/html', location: '/cdn-cgi/access/login' },
    });
  try {
    const client = new VeliWebClient('https://veli.example.test', { CI: 'true' });
    await assert.rejects(() => client.catalog(), /CF_ACCESS_CLIENT_ID/);
  } finally {
    globalThis.fetch = previous;
  }
});

test('authenticated requests reject cross-origin catalog URLs before sending secrets', async () => {
  let called = false;
  const previous = globalThis.fetch;
  globalThis.fetch = async () => {
    called = true;
    return new Response();
  };
  try {
    const client = new VeliWebClient('https://veli.example.test', {
      CF_ACCESS_CLIENT_ID: 'client-id',
      CF_ACCESS_CLIENT_SECRET: 'client-secret',
    });
    await assert.rejects(() => client.request('https://attacker.example/archive'), /cross-origin/);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = previous;
  }
});

for (const block of getBlocks())
  test(`${block.manifest.id}: CLI add from canonical catalog retains exact source and receipt`, async () => {
    const bytes = sourceArchive(block, provenance);
    const server = createServer((request, response) => {
      if (request.url === '/api/blocks/v1/catalog.json') {
        response.setHeader('content-type', 'application/json');
        response.end(
          JSON.stringify({
            schemaVersion: 1,
            blocks: [
              {
                manifest: block.manifest,
                documentationUrl: `/blocks/${block.manifest.id}/`,
                versions: [
                  {
                    version: block.manifest.version,
                    sourceCommit: provenance.sourceCommit,
                    archiveUrl: `/api/blocks/v1/${block.manifest.id}/${block.manifest.version}.tar.gz`,
                    archiveSha256: sha256(bytes),
                  },
                ],
              },
            ],
          }),
        );
      } else {
        response.setHeader('content-type', 'application/gzip');
        response.end(bytes);
      }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      await fixture(async (cwd) => {
        await writeFile(
          path.join(cwd, 'package.json'),
          JSON.stringify({ dependencies: { react: '^18.0.0' } }),
        );
        const webUrl = `http://127.0.0.1:${server.address().port}`;
        const executable = fileURLToPath(new URL('../dist/index.js', import.meta.url));
        await execFileAsync(process.execPath, [
          executable,
          '--cwd',
          cwd,
          '--web-url',
          webUrl,
          'init',
        ]);
        const { stdout } = await execFileAsync(process.execPath, [
          executable,
          '--cwd',
          cwd,
          '--json',
          'add',
          block.manifest.id,
          '--yes',
          '--no-install',
        ]);
        assert.deepEqual(JSON.parse(stdout).added, [block.manifest.id]);
        const installed = (await installedBlocks(cwd))[0];
        assert.equal(installed.id, block.manifest.id);
        assert.equal(installed.receipt.sourceCommit, provenance.sourceCommit);
        for (const file of block.files) {
          const working = await readFile(path.join(installed.targetDir, file.path));
          const baseline = await readFile(path.join(installed.baselineDir, file.path));
          assert.deepEqual(working, file.bytes);
          assert.deepEqual(baseline, file.bytes);
          assert.equal(
            installed.receipt.files.find((entry) => entry.path === file.path).sha256,
            sha256(working),
          );
        }
      });
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });

test('the packaged executable exposes command help', () => {
  const output = execFileSync(
    process.execPath,
    [fileURLToPath(new URL('../dist/index.js', import.meta.url)), '--help'],
    {
      encoding: 'utf8',
    },
  );
  for (const command of ['init', 'add', 'status', 'update', 'restore', 'doctor'])
    assert.match(output, new RegExp(`\\b${command}\\b`));
});

for (const conflicting of [false, true])
  test(`multi-block add ${conflicting ? 'rejects conflicts before writing' : 'retains shared requirements'} in either order`, async () => {
    const blocks = getBlocks().map((entry) => ({
      ...entry,
      manifest: {
        ...entry.manifest,
        dependencies: {
          ...entry.manifest.dependencies,
          '@veli-design/react':
            conflicting && entry.manifest.id === 'site-footer' ? '^0.10.0' : '^0.13.0',
        },
        setupDependencies: {
          ...entry.manifest.setupDependencies,
          '@veli-design/tokens': '^0.7.1',
        },
      },
    }));
    const archives = new Map(
      blocks.map((entry) => [
        `/api/blocks/v1/${entry.manifest.id}/${entry.manifest.version}.tar.gz`,
        sourceArchive(entry, provenance),
      ]),
    );
    const catalog = {
      schemaVersion: 1,
      blocks: blocks.map(({ manifest }) => {
        const archiveUrl = `/api/blocks/v1/${manifest.id}/${manifest.version}.tar.gz`;
        return {
          manifest,
          documentationUrl: `/blocks/${manifest.id}/`,
          versions: [
            {
              version: manifest.version,
              sourceCommit: provenance.sourceCommit,
              archiveUrl,
              archiveSha256: sha256(archives.get(archiveUrl)),
            },
          ],
        };
      }),
    };
    const server = createServer((request, response) => {
      if (request.url === '/api/blocks/v1/catalog.json') {
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify(catalog));
      } else {
        response.setHeader('content-type', 'application/gzip');
        response.end(archives.get(request.url));
      }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const executable = fileURLToPath(new URL('../dist/index.js', import.meta.url));
      const ids = blocks.map(({ manifest }) => manifest.id);
      for (const order of [ids, [...ids].reverse()])
        await fixture(async (cwd) => {
          await writeFile(
            path.join(cwd, 'package.json'),
            JSON.stringify({ dependencies: { '@veli-design/react': '0.10.0' } }),
          );
          await execFileAsync(process.execPath, [
            executable,
            '--cwd',
            cwd,
            '--web-url',
            `http://127.0.0.1:${server.address().port}`,
            'init',
          ]);
          const args = [
            executable,
            '--cwd',
            cwd,
            '--json',
            'add',
            ...order,
            '--yes',
            '--no-install',
          ];
          if (conflicting) {
            await assert.rejects(
              () => execFileAsync(process.execPath, args),
              /Conflicting block requirements/,
            );
            assert.deepEqual(await installedBlocks(cwd), []);
          } else {
            const { stdout } = await execFileAsync(process.execPath, args);
            const result = JSON.parse(stdout);
            assert.deepEqual(result.added, order);
            assert.deepEqual(result.dependencies.incompatible, [
              { name: '@veli-design/react', current: '0.10.0', required: '^0.13.0' },
            ]);
            assert.deepEqual(
              (await installedBlocks(cwd)).map(({ id }) => id).sort(),
              [...ids].sort(),
            );
          }
        });
    } finally {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
