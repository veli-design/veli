import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { parse } from 'yaml';
import { createManifest, stageConsumer, validateManifest } from './release-sites.mjs';
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
