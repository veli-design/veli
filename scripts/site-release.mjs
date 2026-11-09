import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stageConsumer, validateManifest, packages } from './release-sites.mjs';
import { spawnSyncCorepack } from './corepack.mjs';
import { validatePublishedSnapshot, versionManifest } from './published-packages.mjs';

export const repository = fileURLToPath(new URL('../', import.meta.url));
export const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sha = /^[a-f0-9]{40}$/;
const hash = /^[a-f0-9]{64}$/;
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const git = (root, ...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

export function siteOrigin(value) {
  const url = new URL(value);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  assert.ok(
    url.protocol === 'https:' || (loopback && url.protocol === 'http:'),
    'Use HTTPS or local loopback',
  );
  assert.ok(
    !url.username && !url.password && !url.search && !url.hash,
    'Origin must not contain credentials, query or fragment',
  );
  assert.equal(url.pathname, '/', 'Pass a site origin without a path');
  return url.origin;
}

export function validateSitePlan(plan) {
  validateManifest(plan);
  assert.deepEqual(Object.keys(plan.packages).sort(), ['@veli-design/cli', ...packages].sort());
  const data = plan.siteRelease;
  assert.equal(data?.schema, 1);
  assert.ok(['candidate', 'published', 'local-fixture'].includes(data.mode));
  assert.match(data.requiredAncestor, sha);
  assert.match(data.sourceLockSha256, hash);
  assert.match(data.packageManifestSha256, hash);
  assert.match(data.packageSourceCommit, sha);
  assert.match(data.packageManager, /^pnpm@\d+\.\d+\.\d+$/);
  assert.equal(siteOrigin(data.webOrigin), data.webOrigin);
  assert.equal(siteOrigin(data.storybookOrigin), data.storybookOrigin);
  assert.notEqual(
    data.webOrigin,
    data.storybookOrigin,
    'Web and Storybook require distinct root origins',
  );
  assert.equal(typeof data.canonical, 'boolean');
  if (data.manualOverride !== undefined) assert.equal(data.manualOverride, true);
  if (data.publication) {
    validatePublishedSnapshot(data.publication);
    assert.deepEqual(versionManifest(data.publication).packages, plan.packages);
    assert.equal(data.publication.sourceCommit, data.packageSourceCommit);
  }
  if (data.mode === 'published') {
    assert.match(data.packageReleaseTag, /^[A-Za-z0-9@_][A-Za-z0-9@._/-]*$/);
    for (const value of [data.webOrigin, data.storybookOrigin]) {
      const url = new URL(value);
      assert.equal(url.protocol, 'https:');
      assert.ok(!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname));
      assert.ok(
        !url.hostname.endsWith('.invalid'),
        'Published preparation requires an intended public destination',
      );
    }
  }
  return plan;
}

export async function assertSiteSource(plan, root = repository) {
  validateSitePlan(plan);
  assert.equal(
    git(root, 'rev-parse', 'HEAD').trim(),
    plan.sourceCommit,
    'Checkout HEAD differs from selected site commit',
  );
  assert.equal(
    git(root, 'status', '--porcelain', '--untracked-files=all').trim(),
    '',
    'Site source checkout must be clean',
  );
  git(root, 'merge-base', '--is-ancestor', plan.siteRelease.requiredAncestor, plan.sourceCommit);
  assert.equal(
    digest(await readFile(resolve(root, 'pnpm-lock.yaml'))),
    plan.siteRelease.sourceLockSha256,
    'Source lockfile differs',
  );
}

export async function createSitePlan({
  root = repository,
  packageManifest,
  webOrigin,
  storybookOrigin,
  requiredAncestor,
  mode,
  packageReleaseTag = '',
  sourceCommit = git(root, 'rev-parse', 'HEAD').trim(),
  canonical = false,
  manualOverride = false,
  publication,
}) {
  const baseline = validateManifest(JSON.parse(packageManifest));
  // Adapted from PD-1121's retained site-release validation implementation.
  // The package-release asset is a small public provenance descriptor, never credentials.
  assert.deepEqual(Object.keys(baseline).sort(), ['packages', 'schema', 'sourceCommit']);
  assert.match(sourceCommit, sha);
  assert.match(requiredAncestor, sha);
  git(root, 'merge-base', '--is-ancestor', requiredAncestor, sourceCommit);
  const sourceLock = git(root, 'show', `${sourceCommit}:pnpm-lock.yaml`);
  const packageManager = JSON.parse(
    git(root, 'show', `${sourceCommit}:package.json`),
  ).packageManager;
  const plan = validateSitePlan({
    schema: 1,
    sourceCommit,
    packages: baseline.packages,
    siteRelease: {
      schema: 1,
      mode,
      requiredAncestor,
      webOrigin: siteOrigin(webOrigin),
      storybookOrigin: siteOrigin(storybookOrigin),
      canonical,
      ...(manualOverride ? { manualOverride: true } : {}),
      ...(publication ? { publication } : {}),
      sourceLockSha256: digest(sourceLock),
      packageManifestSha256: digest(packageManifest),
      packageSourceCommit: baseline.sourceCommit,
      packageReleaseTag,
      packageManager,
    },
  });
  if (mode !== 'local-fixture') await assertSiteSource(plan, root);
  return plan;
}

async function emptyDirectory(directory) {
  await mkdir(directory, { recursive: true });
  assert.deepEqual(await readdir(directory), [], 'Use a fresh empty output directory');
}

export async function stageSitePlan(plan, target, tarballs = {}) {
  validateSitePlan(plan);
  assert.notEqual(
    plan.siteRelease.mode,
    'local-fixture',
    'A rollback fixture cannot prepare a new release',
  );
  if (plan.siteRelease.mode === 'published')
    assert.deepEqual(tarballs, {}, 'Published preparation cannot use candidate tarballs');
  await assertSiteSource(plan);
  assert.ok(
    !resolve(target).startsWith(resolve(repository) + '/') &&
      resolve(target) !== resolve(repository),
  );
  await emptyDirectory(target);
  await stageConsumer(target, plan, tarballs);
}

export function safeArtifactPath(path) {
  assert.equal(typeof path, 'string');
  assert.ok(path && !isAbsolute(path) && !/^[A-Za-z]:/.test(path) && !path.includes('\\'));
  assert.ok(
    !path
      .split('/')
      .some(
        (part) =>
          ['', '.', '..', '.git', 'node_modules', '.npmrc', '.wrangler'].includes(part) ||
          part.startsWith('.env'),
      ),
  );
  assert.ok(
    [...path].every(
      (character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127,
    ) && !path.endsWith('.log'),
  );
  assert.ok(
    path.startsWith('apps/web/dist/') ||
      path.startsWith('apps/storybook/storybook-static/') ||
      [
        'apps/web/wrangler.jsonc',
        'apps/storybook/wrangler.jsonc',
        'locks/source-pnpm-lock.yaml',
        'locks/consumer-pnpm-lock.yaml',
      ].includes(path),
    `Unexpected bundle member: ${path}`,
  );
  return path;
}

async function inventory(root, prefix = '') {
  assert.ok((await lstat(root)).isDirectory(), 'Bundle root must be a real directory');
  const entries = [];
  for (const name of (await readdir(root)).sort()) {
    const path = prefix ? `${prefix}/${name}` : name;
    const filename = resolve(root, name);
    const stat = await lstat(filename);
    assert.ok(!stat.isSymbolicLink(), `Symlink not allowed: ${path}`);
    if (stat.isDirectory()) {
      assert.ok(
        [
          'apps',
          'apps/web',
          'apps/storybook',
          'apps/web/dist',
          'apps/storybook/storybook-static',
          'locks',
        ].includes(path) ||
          path.startsWith('apps/web/dist/') ||
          path.startsWith('apps/storybook/storybook-static/'),
        `Unexpected directory: ${path}`,
      );
      entries.push(...(await inventory(filename, path)));
    } else {
      assert.ok(stat.isFile(), `Non-regular member: ${path}`);
      if (path === 'snapshot.json') continue;
      safeArtifactPath(path);
      entries.push({ path, bytes: stat.size, sha256: digest(await readFile(filename)) });
    }
  }
  return entries;
}

export async function captureSiteBundle(plan, consumer, output, root = repository) {
  validateSitePlan(plan);
  assert.equal(git(consumer, 'rev-parse', 'HEAD').trim(), plan.sourceCommit);
  const stagedManifest = JSON.parse(
    await readFile(resolve(consumer, 'release-manifest.json'), 'utf8'),
  );
  assert.equal(stagedManifest.sourceCommit, plan.sourceCommit);
  assert.deepEqual(stagedManifest.packages, plan.packages);
  if (plan.siteRelease.mode !== 'local-fixture') assert.deepEqual(stagedManifest, plan);
  for (const path of ['packages/react/package.json', 'packages/tokens/src/design.tokens.json'])
    await assert.rejects(
      lstat(resolve(consumer, path)),
      (error) => error.code === 'ENOENT',
      'Consumer must exclude authored package sources',
    );
  const sourceLock = git(root, 'show', `${plan.sourceCommit}:pnpm-lock.yaml`);
  assert.equal(digest(sourceLock), plan.siteRelease.sourceLockSha256);
  assert.ok(
    !resolve(output).startsWith(resolve(consumer) + '/') && resolve(output) !== resolve(consumer),
  );
  await emptyDirectory(output);
  for (const [app, directory] of [
    ['web', 'dist'],
    ['storybook', 'storybook-static'],
  ]) {
    // Check every source member before copying, including symlinks.
    await inventory(resolve(consumer, 'apps', app, directory), `apps/${app}/${directory}`);
    await mkdir(resolve(output, 'apps', app), { recursive: true });
    await cp(resolve(consumer, 'apps', app, directory), resolve(output, 'apps', app, directory), {
      recursive: true,
    });
    const config = resolve(consumer, 'apps', app, 'wrangler.jsonc');
    assert.ok((await lstat(config)).isFile() && !(await lstat(config)).isSymbolicLink());
    assert.equal(
      await readFile(config, 'utf8'),
      git(root, 'show', `${plan.sourceCommit}:apps/${app}/wrangler.jsonc`),
      'Worker configuration differs from selected source',
    );
    await cp(config, resolve(output, 'apps', app, 'wrangler.jsonc'));
  }
  await mkdir(resolve(output, 'locks'));
  await writeFile(resolve(output, 'locks/source-pnpm-lock.yaml'), sourceLock);
  await cp(resolve(consumer, 'pnpm-lock.yaml'), resolve(output, 'locks/consumer-pnpm-lock.yaml'));
  const installed = {};
  for (const app of ['web', 'storybook']) {
    installed[app] = {};
    for (const name of packages) {
      const actual = JSON.parse(
        await readFile(
          resolve(consumer, 'apps', app, 'node_modules', name, 'package.json'),
          'utf8',
        ),
      ).version;
      assert.equal(actual, plan.packages[name], `Wrong installed ${app}/${name}`);
      installed[app][name] = actual;
    }
  }
  const tools = { node: process.version, packageManager: plan.siteRelease.packageManager };
  for (const [name, args] of [
    ['corepack', ['--version']],
    ['pnpm', ['pnpm', '--version']],
  ]) {
    const result = spawnSyncCorepack(args, { cwd: consumer, encoding: 'utf8' });
    assert.equal(result.status, 0, `Cannot record actual ${name} version`);
    tools[name] = result.stdout.trim();
  }
  assert.equal(
    `pnpm@${tools.pnpm}`,
    tools.packageManager,
    'Actual pnpm differs from the source requirement',
  );
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
  ])
    tools[name] = JSON.parse(
      await readFile(resolve(consumer, 'apps', app, 'node_modules', name, 'package.json'), 'utf8'),
    ).version;
  const require = createRequire(
    await realpath(resolve(consumer, 'apps/web/node_modules/astro/package.json')),
  );
  tools.vite = require('vite/package.json').version;
  const snapshot = {
    schema: 1,
    plan,
    installed,
    tools,
    consumerLockSha256: digest(await readFile(resolve(consumer, 'pnpm-lock.yaml'))),
    files: await inventory(output),
  };
  const bytes = json(snapshot);
  await writeFile(resolve(output, 'snapshot.json'), bytes);
  return { snapshot, snapshotSha256: digest(bytes) };
}

export async function verifySiteBundle(directory, expectedDigest) {
  assert.match(expectedDigest, hash, 'Supply the independently recorded snapshot SHA-256');
  const stat = await lstat(resolve(directory, 'snapshot.json'));
  assert.ok(stat.isFile() && !stat.isSymbolicLink());
  const bytes = await readFile(resolve(directory, 'snapshot.json'));
  assert.equal(digest(bytes), expectedDigest, 'Snapshot manifest digest differs');
  const snapshot = JSON.parse(bytes);
  assert.equal(snapshot.schema, 1);
  validateSitePlan(snapshot.plan);
  assert.ok(Array.isArray(snapshot.files) && snapshot.files.length > 0);
  for (const entry of snapshot.files) {
    safeArtifactPath(entry.path);
    assert.match(entry.sha256, hash);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0);
  }
  assert.equal(
    new Set(snapshot.files.map(({ path }) => path)).size,
    snapshot.files.length,
    'Duplicate inventory member',
  );
  assert.deepEqual(
    await inventory(directory),
    snapshot.files,
    'Bundle inventory differs: missing, extra or changed file',
  );
  assert.equal(
    digest(await readFile(resolve(directory, 'locks/source-pnpm-lock.yaml'))),
    snapshot.plan.siteRelease.sourceLockSha256,
  );
  assert.equal(
    digest(await readFile(resolve(directory, 'locks/consumer-pnpm-lock.yaml'))),
    snapshot.consumerLockSha256,
  );
  for (const app of ['web', 'storybook'])
    assert.deepEqual(
      snapshot.installed[app],
      Object.fromEntries(packages.map((name) => [name, snapshot.plan.packages[name]])),
    );
  return snapshot;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'plan') {
    const [
      mode,
      baseline,
      webOrigin,
      storybookOrigin,
      requiredAncestor,
      output,
      packageReleaseTag = '',
    ] = args;
    const plan = await createSitePlan({
      mode,
      manualOverride: process.env.VELI_MANUAL_SITE_OVERRIDE === 'true',
      packageManifest: await readFile(baseline),
      ...(mode === 'published'
        ? {
            publication: JSON.parse(
              await readFile(resolve(baseline, '../publication.json'), 'utf8'),
            ),
          }
        : {}),
      webOrigin,
      storybookOrigin,
      requiredAncestor,
      packageReleaseTag,
    });
    await writeFile(output, json(plan), { flag: 'wx' });
  } else if (command === 'stage') {
    await stageSitePlan(
      JSON.parse(await readFile(args[0], 'utf8')),
      args[1],
      JSON.parse(process.env.VELI_TARBALLS || '{}'),
    );
  } else if (command === 'capture') {
    const result = await captureSiteBundle(
      JSON.parse(await readFile(args[0], 'utf8')),
      args[1],
      args[2],
    );
    console.log(result.snapshotSha256);
  } else if (command === 'verify') {
    const result = await verifySiteBundle(args[0], args[1]);
    console.log(
      json({
        sourceCommit: result.plan.sourceCommit,
        mode: result.plan.siteRelease.mode,
        files: result.files.length,
        snapshotSha256: args[1],
      }),
    );
  } else throw new Error('Expected plan, stage, capture or verify');
}
