import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { sourceArchive, getBlocks } from '../../blocks/scripts/catalog.mjs';
import { parseSourceArchive, VeliWebClient } from '../dist/client.js';
import { normalizeBlocksDir, normalizeWebUrl, readConfig, writeConfig } from '../dist/config.js';
import { installBlock, blockState, installedBlocks, restoreBlock } from '../dist/project.js';
import { abortUpdate, continueUpdate, hasPendingUpdate, updateBlock } from '../dist/update.js';
import { sha256 } from '../dist/contracts.js';

const provenance = { sourceCommit: 'a'.repeat(40), dirty: false };
const block = getBlocks()[0];

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

test('canonical source archives verify and install exact working and baseline bytes', async () => {
  const parsed = parseSourceArchive(sourceArchive(block, provenance));
  await fixture(async (cwd) => {
    const installed = await installBlock(cwd, 'src/components/blocks', parsed);
    const source = parsed.source.get('site-footer.tsx');
    assert.deepEqual(await readFile(path.join(installed.targetDir, 'site-footer.tsx')), source);
    assert.deepEqual(await readFile(path.join(installed.baselineDir, 'site-footer.tsx')), source);
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

test('interactive requests reuse a cloudflared user token after an Access challenge', async () => {
  await fixture(async (cwd) => {
    const cloudflared = path.join(cwd, 'cloudflared');
    await writeFile(cloudflared, '#!/bin/sh\nprintf cached-user-token\n');
    await chmod(cloudflared, 0o755);
    const previous = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (_url, init) => {
      requests.push(init);
      if (requests.length === 1)
        return new Response('<html>Access</html>', {
          status: 302,
          headers: { 'content-type': 'text/html', location: '/cdn-cgi/access/login' },
        });
      return new Response(JSON.stringify({ schemaVersion: 1, blocks: [] }), {
        headers: { 'content-type': 'application/json' },
      });
    };
    try {
      const client = new VeliWebClient(
        'https://veli.example.test',
        { PATH: `${cwd}:${process.env.PATH}` },
        true,
      );
      await client.catalog();
      assert.equal(requests.length, 2);
      assert.deepEqual(requests[1].headers, { 'cf-access-token': 'cached-user-token' });
    } finally {
      globalThis.fetch = previous;
    }
  });
});

test('non-interactive Access challenges require service-token credentials', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('<html>Access</html>', {
      status: 302,
      headers: { 'content-type': 'text/html', location: '/cdn-cgi/access/login' },
    });
  try {
    const client = new VeliWebClient('https://veli.example.test', { CI: 'true' }, false);
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
