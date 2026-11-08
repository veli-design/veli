import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { DEFAULT_WEB_URL, readConfig, resolveWebUrl, writeConfig } from '../dist/config.js';

const exec = promisify(execFile);
const executable = fileURLToPath(new URL('../dist/index.js', import.meta.url));

test('registry selection prefers flag, environment, then saved config over the public default', () => {
  assert.equal(DEFAULT_WEB_URL, 'https://veli.design');
  assert.equal(resolveWebUrl(), DEFAULT_WEB_URL);
  assert.equal(resolveWebUrl(undefined, undefined, 'https://saved.test/'), 'https://saved.test');
  assert.equal(
    resolveWebUrl(undefined, 'https://env.test', 'https://saved.test'),
    'https://env.test',
  );
  assert.equal(
    resolveWebUrl('http://localhost:4321', 'https://env.test', 'https://saved.test'),
    'http://localhost:4321',
  );
  assert.throws(() => resolveWebUrl('http://insecure.test'));
  assert.throws(() => resolveWebUrl('', 'https://env.test'));
});

async function fixture(run) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'veli-cli-default-'));
  const mock = path.join(cwd, 'mock-fetch.mjs');
  await writeFile(path.join(cwd, 'package.json'), '{}\n');
  // This preload replaces fetch completely: no public registry, credentials, or network required.
  await writeFile(
    mock,
    `import assert from 'node:assert/strict';
globalThis.fetch = async (url) => {
  assert.equal(String(url), process.env.EXPECTED_CATALOG);
  return new Response(JSON.stringify({schemaVersion: 1, blocks: []}), {
    status: Number(process.env.MOCK_STATUS ?? 200),
    headers: {'content-type': 'application/json'}
  });
};\n`,
  );
  const cli = (args, env = {}) =>
    exec(process.execPath, ['--import', mock, executable, '--cwd', cwd, '--json', ...args], {
      env: {
        PATH: process.env.PATH,
        HOME: cwd,
        EXPECTED_CATALOG: 'https://veli.design/api/blocks/v1/catalog.json',
        ...env,
      },
    });
  try {
    await run({ cwd, cli });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

test('non-interactive init uses and saves the public registry without a URL argument', async () => {
  await fixture(async ({ cwd, cli }) => {
    const { stdout } = await cli(['init']);
    const config = JSON.parse(stdout);
    assert.equal(config.webUrl, DEFAULT_WEB_URL);
    assert.equal(config.blocksDir, 'components/blocks');
    assert.deepEqual(await readConfig(cwd), config);
  });
});

for (const args of [
  ['auth', 'status'],
  ['auth', 'login'],
])
  test(`${args.join(' ')} can check the default registry before initialization`, async () => {
    await fixture(async ({ cwd, cli }) => {
      const { stdout } = await cli(args);
      assert.ok(JSON.parse(stdout).accessible || JSON.parse(stdout).authenticated);
      await assert.rejects(readConfig(cwd), /not initialized/);
    });
  });

test('init retains explicit URL and environment overrides', async () => {
  for (const flag of [false, true])
    await fixture(async ({ cwd, cli }) => {
      const webUrl = flag ? 'http://localhost:4321' : 'https://env.test';
      await cli([...(flag ? ['--web-url', webUrl] : []), 'init'], {
        VELI_WEB_URL: 'https://env.test',
        EXPECTED_CATALOG: `${webUrl}/api/blocks/v1/catalog.json`,
      });
      assert.equal((await readConfig(cwd)).webUrl, webUrl);
    });
});

test('existing projects retain saved registry, and per-command overrides do not persist', async () => {
  await fixture(async ({ cwd, cli }) => {
    const config = { schemaVersion: 1, webUrl: 'https://saved.test', blocksDir: 'src/blocks' };
    await writeConfig(cwd, config);
    for (const args of [['list'], ['auth', 'status']]) {
      await cli(args, { EXPECTED_CATALOG: 'https://saved.test/api/blocks/v1/catalog.json' });
      await cli(args, {
        VELI_WEB_URL: 'https://env.test',
        EXPECTED_CATALOG: 'https://env.test/api/blocks/v1/catalog.json',
      });
      await cli(['--web-url', 'http://localhost:4321', ...args], {
        VELI_WEB_URL: 'https://env.test',
        EXPECTED_CATALOG: 'http://localhost:4321/api/blocks/v1/catalog.json',
      });
      assert.deepEqual(await readConfig(cwd), config);
    }
    await assert.rejects(cli(['init']), /already initialized/);
    assert.deepEqual(await readConfig(cwd), config);
  });
});

test('invalid saved configuration is not silently replaced by the default', async () => {
  await fixture(async ({ cwd, cli }) => {
    await writeConfig(cwd, {
      schemaVersion: 1,
      webUrl: 'https://saved.test',
      blocksDir: 'src/blocks',
    });
    const config = path.join(cwd, '.veli', 'config.json');
    await writeFile(config, '{invalid');
    await assert.rejects(cli(['auth', 'status']));
    await assert.rejects(cli(['init']));
    assert.equal(await readFile(config, 'utf8'), '{invalid');
  });
});

test('default registry still respects Access challenges without writing project config', async () => {
  await fixture(async ({ cwd, cli }) => {
    await assert.rejects(cli(['init'], { MOCK_STATUS: '403' }), /access is missing or expired/);
    await assert.rejects(readConfig(cwd), /not initialized/);
  });
});
