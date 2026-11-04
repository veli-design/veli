import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import test from 'node:test';
import {
  assertSiteSource,
  captureSiteBundle,
  createSitePlan,
  digest,
  safeArtifactPath,
  stageSitePlan,
  validateSitePlan,
  verifySiteBundle,
} from './site-release.mjs';

const packages = {
  '@veli-design/react': '0.18.0',
  '@veli-design/tokens': '0.11.0',
  '@veli-design/cli': '0.2.0',
};
async function put(root, path, value) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), typeof value === 'string' ? value : JSON.stringify(value));
}
function git(root, ...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}
async function fixture(t) {
  const temporary = await mkdtemp(join(tmpdir(), 'veli-site-snapshot-test-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const root = join(temporary, 'source');
  await mkdir(root);
  git(root, 'init', '--quiet');
  await put(root, 'package.json', { private: true, packageManager: 'pnpm@11.18.0' });
  await put(root, 'pnpm-lock.yaml', "lockfileVersion: '9.0'\n");
  await put(root, 'packages/react/package.json', { version: '99.0.0' });
  await put(root, 'packages/tokens/src/design.tokens.json', {});
  for (const app of ['web', 'storybook'])
    await put(root, `apps/${app}/wrangler.jsonc`, {
      name: `veli-${app}`,
      assets: { directory: app === 'web' ? './dist' : './storybook-static' },
    });
  git(root, 'add', '.');
  git(
    root,
    '-c',
    'user.name=Veli fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'fixture',
  );
  const sourceCommit = git(root, 'rev-parse', 'HEAD');
  const packageManifest = JSON.stringify({ schema: 1, sourceCommit: 'a'.repeat(40), packages });
  const input = {
    root,
    packageManifest,
    mode: 'candidate',
    requiredAncestor: sourceCommit,
    webOrigin: 'https://veli-preview.invalid',
    storybookOrigin: 'https://storybook-preview.invalid',
  };
  const plan = await createSitePlan(input);
  return { temporary, root, sourceCommit, input, plan };
}

test('site-only selection uses retained package versions and rejects dirty, stale or unrelated source', async (t) => {
  const f = await fixture(t);
  assert.deepEqual(f.plan.packages, packages);
  await assertSiteSource(f.plan, f.root);
  await put(f.root, 'unreviewed.txt', 'dirty');
  await assert.rejects(createSitePlan(f.input), /must be clean/);
  await rm(join(f.root, 'unreviewed.txt'));
  await assert.rejects(
    assertSiteSource({ ...f.plan, sourceCommit: 'b'.repeat(40) }, f.root),
    /HEAD differs/,
  );
  await assert.rejects(
    assertSiteSource(
      { ...f.plan, siteRelease: { ...f.plan.siteRelease, sourceLockSha256: '0'.repeat(64) } },
      f.root,
    ),
    /lockfile differs/,
  );
  await assert.rejects(createSitePlan({ ...f.input, requiredAncestor: 'b'.repeat(40) }));
});

test('published preparation rejects candidate overrides and ambiguous destination inputs', async (t) => {
  const f = await fixture(t);
  const plan = await createSitePlan({
    ...f.input,
    mode: 'published',
    webOrigin: 'https://docs.example.com',
    storybookOrigin: 'https://storybook.example.com',
    packageReleaseTag: '@veli-design/react@0.17.0',
  });
  await assert.rejects(
    stageSitePlan(plan, join(f.temporary, 'unused'), { '@veli-design/react': '/tmp/local.tgz' }),
    /cannot use candidate tarballs/,
  );
  for (const webOrigin of [
    'http://docs.example.com',
    'https://user:secret@docs.example.com',
    'https://docs.example.com/path',
    'https://docs.example.com/?x=y',
  ])
    await assert.rejects(createSitePlan({ ...f.input, webOrigin }));
  await assert.rejects(
    createSitePlan({ ...f.input, storybookOrigin: f.input.webOrigin }),
    /distinct root origins/,
  );
  assert.throws(() =>
    validateSitePlan({ ...f.plan, siteRelease: { ...f.plan.siteRelease, mode: 'published' } }),
  );
});

async function artifactFixture(t) {
  const f = await fixture(t);
  const consumer = join(f.temporary, 'consumer');
  git(f.root, 'clone', '--quiet', f.root, consumer);
  await rm(join(consumer, 'packages/react'), { recursive: true });
  await rm(join(consumer, 'packages/tokens'), { recursive: true });
  await put(consumer, 'release-manifest.json', f.plan);
  for (const app of ['web', 'storybook']) {
    await put(
      consumer,
      `apps/${app}/${app === 'web' ? 'dist' : 'storybook-static'}/index.html`,
      `<h1>${app}</h1>`,
    );
    for (const [name, version] of Object.entries(packages))
      await put(consumer, `apps/${app}/node_modules/${name}/package.json`, { version });
  }
  for (const [name, app] of [
    ['astro', 'web'],
    ['@astrojs/react', 'web'],
    ['@astrojs/mdx', 'web'],
    ['@astrojs/markdown-remark', 'web'],
    ['react', 'web'],
    ['react-dom', 'web'],
    ['tailwindcss', 'web'],
    ['wrangler', 'web'],
    ['storybook', 'storybook'],
    ['vite', 'web'],
  ])
    await put(consumer, `apps/${app}/node_modules/${name}/package.json`, { version: '1.2.3' });
  // Match pnpm's real dependency layout: Vite is beside Astro in the virtual
  // store, not a direct dependency of the web app.
  await rm(join(consumer, 'apps/web/node_modules/astro'), { recursive: true });
  await rm(join(consumer, 'apps/web/node_modules/vite'), { recursive: true });
  await put(consumer, 'node_modules/.pnpm/astro@1.2.3/node_modules/astro/package.json', {
    version: '1.2.3',
  });
  await put(consumer, 'node_modules/.pnpm/astro@1.2.3/node_modules/vite/package.json', {
    version: '8.3.5',
  });
  await symlink(
    join(consumer, 'node_modules/.pnpm/astro@1.2.3/node_modules/astro'),
    join(consumer, 'apps/web/node_modules/astro'),
    'dir',
  );
  const bundle = join(f.temporary, 'bundle');
  const result = await captureSiteBundle(f.plan, consumer, bundle, f.root);
  return { ...f, consumer, bundle, ...result };
}

test('snapshot binds both built outputs, source/staged locks and actual package versions to an external digest', async (t) => {
  const f = await artifactFixture(t);
  assert.deepEqual(await verifySiteBundle(f.bundle, f.snapshotSha256), f.snapshot);
  assert.equal(f.snapshot.installed.storybook['@veli-design/react'], '0.18.0');
  assert.equal(f.snapshot.tools.vite, '8.3.5');
  assert.equal(
    f.snapshot.plan.siteRelease.sourceLockSha256,
    digest(await readFile(join(f.root, 'pnpm-lock.yaml'))),
  );
  await assert.rejects(verifySiteBundle(f.bundle, '0'.repeat(64)), /manifest digest differs/);
});

test('corrupt, extra, missing, symlink and duplicate artifact members cannot verify', async (t) => {
  const f = await artifactFixture(t);
  for (const kind of ['corrupt', 'extra', 'missing', 'symlink', 'duplicate']) {
    const target = join(f.temporary, kind);
    await cp(f.bundle, target, { recursive: true });
    let expected = f.snapshotSha256;
    const path = join(target, 'apps/web/dist/index.html');
    if (kind === 'corrupt') await writeFile(path, 'wrong');
    if (kind === 'extra') await writeFile(join(target, 'apps/web/dist/extra.js'), 'extra');
    if (kind === 'missing') await rm(path);
    if (kind === 'symlink') {
      await rm(path);
      await symlink(join(f.bundle, 'apps/web/dist/index.html'), path);
    }
    if (kind === 'duplicate') {
      const altered = structuredClone(f.snapshot);
      altered.files.push(altered.files[0]);
      const bytes = JSON.stringify(altered);
      await writeFile(join(target, 'snapshot.json'), bytes);
      expected = digest(bytes);
    }
    await assert.rejects(verifySiteBundle(target, expected), undefined, kind);
  }
  for (const path of [
    '../escape',
    '/absolute',
    'C:/drive',
    'apps/web/dist/../../secret',
    'apps/web/dist/link\\file',
    'apps/web/dist/.env',
    'node_modules/secret',
    'apps/web/.wrangler/cache',
  ])
    assert.throws(() => safeArtifactPath(path));
});

test('manual published snapshot can bind a reviewed pending-release tree without using unpublished packages', async (t) => {
  const f = await fixture(t);
  await put(
    f.root,
    '.changeset/pending.md',
    '---\n"@veli-design/react": minor\n---\n\n### Added\n\n- Pending package change.\n',
  );
  git(f.root, 'add', '.');
  git(
    f.root,
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'pending package',
  );
  const source = git(f.root, 'rev-parse', 'HEAD');
  const plan = await createSitePlan({
    ...f.input,
    sourceCommit: source,
    requiredAncestor: source,
    mode: 'published',
    webOrigin: 'https://docs.example.com',
    storybookOrigin: 'https://stories.example.com',
    packageReleaseTag: 'bootstrap-2026-11-01',
    manualOverride: true,
  });
  assert.equal(plan.sourceCommit, source);
  assert.equal(plan.siteRelease.manualOverride, true);
  assert.equal(plan.packages['@veli-design/react'], '0.18.0');
  assert.notEqual(
    plan.packages['@veli-design/react'],
    JSON.parse(await readFile(join(f.root, 'packages/react/package.json'), 'utf8')).version,
  );
  await assertSiteSource(plan, f.root);
});
