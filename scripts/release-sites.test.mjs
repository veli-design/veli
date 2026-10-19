import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import test from 'node:test';
import { parse, stringify } from 'yaml';
import { createManifest, stageConsumer, validateManifest } from './release-sites.mjs';

function resolveCorepackCli() {
  const execDir = dirname(process.execPath);
  const candidates = [
    join(execDir, 'node_modules', 'corepack', 'dist', 'corepack.js'),
    join(execDir, '..', 'lib', 'node_modules', 'corepack', 'dist', 'corepack.js'),
  ];
  const cli = candidates.find((candidate) => existsSync(candidate));
  if (cli == null) {
    throw new Error(`Unable to locate corepack.js from ${process.execPath}`);
  }
  return cli;
}
test('release manifests require exact versions and immutable commit IDs', async () => {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest = await createManifest(sourceCommit);
  assert.equal(validateManifest(manifest), manifest);
  assert.throws(() => validateManifest({ ...manifest, sourceCommit: 'main' }));
  assert.throws(() =>
    validateManifest({
      ...manifest,
      packages: { ...manifest.packages, '@tradenetcorp/veli-ui': '^0.14.0' },
    }),
  );
});
test('staged sites use registry versions, locked tools and no source fallbacks', async () => {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest = await createManifest(sourceCommit);
  const target = await mkdtemp(join(tmpdir(), 'veli-release-stage-test-'));
  await stageConsumer(target, manifest);
  for (const app of ['web', 'storybook']) {
    const json = JSON.parse(await readFile(join(target, 'apps', app, 'package.json'), 'utf8'));
    assert.equal(
      json.dependencies['@tradenetcorp/veli-ui'],
      manifest.packages['@tradenetcorp/veli-ui'],
    );
    assert.equal(
      json.dependencies['@tradenetcorp/veli-tokens'],
      manifest.packages['@tradenetcorp/veli-tokens'],
    );
    assert.match(json.devDependencies.tailwindcss, /^\d+\.\d+\.\d+$/);
  }
  await assert.rejects(readFile(join(target, 'packages/ui/package.json')));
  await assert.rejects(readFile(join(target, 'packages/tokens/src/design.tokens.json')));
  const workspace = parse(await readFile(join(target, 'pnpm-workspace.yaml'), 'utf8'));
  assert.deepEqual(workspace.packages, ['apps/*', 'packages/blocks']);
  assert.equal(workspace.blockExoticSubdeps, true);
  assert.equal(workspace.minimumReleaseAge, 1440);
  assert.deepEqual(
    workspace.minimumReleaseAgeExclude,
    Object.entries(manifest.packages).map(([name, version]) => `${name}@${version}`),
  );
  assert.ok(
    execFileSync('git', ['log', '-1', '--format=%H'], { cwd: target, encoding: 'utf8' }).includes(
      sourceCommit,
    ),
  );
});
test('release deployment only follows successful publication and has durable redeployment', async () => {
  const release = await readFile(
    new URL('../.github/workflows/release.yml', import.meta.url),
    'utf8',
  );
  const web = await readFile(
    new URL('../.github/workflows/deploy-web.yml', import.meta.url),
    'utf8',
  );
  const reusable = await readFile(
    new URL('../.github/workflows/deploy-release-sites.yml', import.meta.url),
    'utf8',
  );
  assert.ok(release.includes("if: needs.release.outputs.published == 'true'"));
  assert.ok(release.includes('uploadReleaseAsset'));
  assert.ok(!parse(web).on.push);
  assert.ok(web.includes('release-manifest.json'));
  assert.ok(
    reusable.indexOf('Build against published packages') < reusable.indexOf('Deploy web docs'),
  );
});

test(
  'fresh release versions install while other versions and dependencies retain the age gate',
  { timeout: 30000 },
  async () => {
    const target = await mkdtemp(join(tmpdir(), 'veli-release-age-test-'));
    const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const manifest = await createManifest(sourceCommit);
    await stageConsumer(join(target, 'staged'), manifest);
    const workspace = parse(await readFile(join(target, 'staged/pnpm-workspace.yaml'), 'utf8'));
    const packageManager = JSON.parse(
      await readFile(new URL('../package.json', import.meta.url), 'utf8'),
    ).packageManager;
    const publishedAt = new Date().toISOString();
    const server = createServer((request, response) => {
      const name = decodeURIComponent(request.url.slice(1));
      const versions = [manifest.packages[name] ?? '1.0.0', '99.0.0'];
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          name,
          'dist-tags': { latest: versions[0] },
          versions: Object.fromEntries(
            versions.map((version) => [
              version,
              {
                name,
                version,
                dist: {
                  tarball: `http://127.0.0.1:${server.address().port}/unused.tgz`,
                  integrity: `sha512-${Buffer.alloc(64).toString('base64')}`,
                },
              },
            ]),
          ),
          time: Object.fromEntries(versions.map((version) => [version, publishedAt])),
        }),
      );
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const registry = `http://127.0.0.1:${server.address().port}/`;
      for (const [label, dependencies, expected] of [
        ['release', manifest.packages, 0],
        ['other-veli-version', { '@tradenetcorp/veli-tokens': '99.0.0' }, 1],
        ['external', { 'veli-test-external': '1.0.0' }, 1],
      ]) {
        const consumer = await mkdtemp(join(target, `${label}-`));
        await writeFile(
          join(consumer, 'package.json'),
          JSON.stringify({ private: true, packageManager, dependencies }),
        );
        await writeFile(
          join(consumer, 'pnpm-workspace.yaml'),
          stringify({ ...workspace, packages: [] }),
        );
        const userconfig = join(consumer, '.npmrc');
        await writeFile(
          userconfig,
          `registry=${registry}\n@tradenetcorp:registry=${registry}\nfetch-retries=0\n`,
        );
        const child = spawn(
          process.execPath,
          [
            resolveCorepackCli(),
            'pnpm',
            'install',
            '--lockfile-only',
            '--ignore-scripts',
            '--no-frozen-lockfile',
          ],
          {
            cwd: consumer,
            env: {
              ...process.env,
              CI: 'true',
              npm_config_userconfig: userconfig,
              NPM_CONFIG_USERCONFIG: userconfig,
            },
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 10000,
          },
        );
        let output = '';
        child.stdout.on('data', (data) => {
          output += data;
        });
        child.stderr.on('data', (data) => {
          output += data;
        });
        const code = await new Promise((resolve, reject) => {
          child.on('error', reject);
          child.on('close', resolve);
        });
        assert.equal(code, expected, `${label}: ${output}`);
        if (expected !== 0) assert.match(output, /ERR_PNPM_NO_MATURE_MATCHING_VERSION/);
      }
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await rm(target, { recursive: true, force: true });
    }
  },
);
