import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import test from 'node:test';
import { parse, stringify } from 'yaml';
import { spawnCorepack } from './corepack.mjs';
import { createManifest, stageConsumer, validateManifest } from './release-sites.mjs';

test('release manifests require exact versions and immutable commit IDs', async () => {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest = await createManifest(sourceCommit);
  assert.equal(validateManifest(manifest), manifest);
  for (const [name, directory] of [
    ['@veli-design/react', 'react'],
    ['@veli-design/tokens', 'tokens'],
    ['@veli-design/cli', 'cli'],
  ]) {
    const source = JSON.parse(
      await readFile(new URL(`../packages/${directory}/package.json`, import.meta.url), 'utf8'),
    );
    assert.equal(manifest.packages[name], source.version);
  }
  assert.throws(() => validateManifest({ ...manifest, sourceCommit: 'main' }));
  assert.throws(() =>
    validateManifest({
      ...manifest,
      packages: { ...manifest.packages, '@veli-design/react': '^0.14.0' },
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
    assert.equal(json.dependencies['@veli-design/react'], manifest.packages['@veli-design/react']);
    assert.equal(
      json.dependencies['@veli-design/tokens'],
      manifest.packages['@veli-design/tokens'],
    );
    assert.match(json.devDependencies.tailwindcss, /^\d+\.\d+\.\d+$/);
  }
  await assert.rejects(readFile(join(target, 'packages/react/package.json')));
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
  const releaseWorkflow = parse(release);
  assert.deepEqual(releaseWorkflow.on.push, { branches: ['main'] });
  assert.equal(releaseWorkflow.on.workflow_dispatch, null);
  assert.equal(
    releaseWorkflow.jobs.release.steps.find((s) => s.uses === 'changesets/action@v1').env
      .VELI_NPM_DIST_TAG,
    '${{ vars.VELI_NPM_DIST_TAG }}',
  );
  assert.equal(parse(web).jobs.deploy.with['verification-only'], true);
  assert.match(releaseWorkflow.jobs.release.if, /VELI_NPM_PUBLICATION_APPROVED/);
  assert.match(releaseWorkflow.jobs.release.if, /github.ref_name == vars.VELI_RELEASE_BRANCH/);
  assert.match(parse(reusable).jobs.deploy.if, /VELI_REGISTRY_TRANSITION_APPROVED/);
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
  { timeout: 210000 },
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
        ['other-veli-version', { '@veli-design/tokens': '99.0.0' }, 1],
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
          `registry=${registry}\n@veli-design:registry=${registry}\nfetch-retries=0\n`,
        );
        const child = spawnCorepack(
          ['pnpm', 'install', '--lockfile-only', '--ignore-scripts', '--no-frozen-lockfile'],
          {
            cwd: consumer,
            env: {
              ...process.env,
              CI: 'true',
              npm_config_userconfig: userconfig,
              NPM_CONFIG_USERCONFIG: userconfig,
            },
            stdio: ['ignore', 'pipe', 'pipe'],
            // Process startup can be slow under a full parallel repository check.
            // Keep a bound without mistaking a launcher timeout for registry policy.
            timeout: 60000,
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
