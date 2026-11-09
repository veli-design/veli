import assert from 'node:assert/strict';
import { gzipSync, gunzipSync } from 'node:zlib';
import fs from 'node:fs/promises';
import test from 'node:test';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { corepackSpawnTarget } from './corepack.mjs';
import { licensingPackages } from './package-licensing.mjs';
import { checkPackageLicensingArtifacts } from './check-package-licensing.mjs';
import { tarSync } from './windows-safe-tar.mjs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assertReleaseLegal } from './release-legal.mjs';

const packages = [
  {
    manifest: new URL('../packages/react/package.json', import.meta.url),
    name: '@veli-design/react',
    directory: 'packages/react',
  },
  {
    manifest: new URL('../packages/tokens/package.json', import.meta.url),
    name: '@veli-design/tokens',
    directory: 'packages/tokens',
  },
  {
    manifest: new URL('../packages/cli/package.json', import.meta.url),
    name: '@veli-design/cli',
    directory: 'packages/cli',
  },
];

test('published package metadata points to the Veli website and transferred repository', async () => {
  for (const expected of packages) {
    const manifest = JSON.parse(await fs.readFile(expected.manifest, 'utf8'));

    assert.equal(manifest.name, expected.name);
    assert.deepEqual(manifest.publishConfig, {
      registry: 'https://registry.npmjs.org',
      access: 'public',
    });
    assert.ok(manifest.description);
    assert.equal(manifest.license, '(MIT AND CC-BY-4.0)');
    assert.ok(manifest.keywords.length);
    assert.deepEqual(manifest.repository, {
      type: 'git',
      url: 'git+https://github.com/veli-design/veli.git',
      directory: expected.directory,
    });
    assert.equal(manifest.homepage, 'https://veli.design');
    assert.equal(manifest.bugs.url, 'https://github.com/veli-design/veli/issues');
  }
});

test('publishing refuses to run without explicit approval and an approved dist-tag', () => {
  const script = fileURLToPath(new URL('./publish-packages.mjs', import.meta.url));
  const env = { ...process.env, VELI_NPM_PUBLICATION_APPROVED: '', VELI_NPM_DIST_TAG: '' };
  assert.throws(
    () => execFileSync(process.execPath, [script], { env, stdio: 'pipe' }),
    /separate rollout approval/,
  );
  env.VELI_NPM_PUBLICATION_APPROVED = 'true';
  assert.throws(
    () => execFileSync(process.execPath, [script], { env, stdio: 'pipe' }),
    /approved VELI_NPM_DIST_TAG/,
  );
});

// Pins the complete official CC legal text and MIT terms obtained from primary sources.
// MIT's project-specific copyright line is deliberately outside the standard-terms hash.
test('canonical standard licence terms stay intact', async () => {
  const cc = await fs.readFile(new URL('../LICENSES/CC-BY-4.0.txt', import.meta.url));
  assert.equal(
    createHash('sha256').update(cc).digest('hex'),
    '2ade8c89b8bbe0d859b124a9e47032c8494022f43091e8278ae8e2554a292196',
  );
  const mit = await fs.readFile(new URL('../LICENSE', import.meta.url), 'utf8');
  const terms = mit.split('Permission is hereby')[1].trim().split(/\s+/).join(' ');
  assert.equal(
    createHash('sha256').update(terms).digest('hex'),
    'c3cca002c5ce1c85dbb5954f864012d9a0ec9c40dc986ba1448fa04b226cd7cd',
  );
});

test('repository copyright and attribution notices are complete', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  assert.doesNotThrow(() => assertReleaseLegal(root));
});

test('real workspace tarballs inherit MIT and contain only applicable self-contained notices', async () => {
  const target = await fs.mkdtemp(join(tmpdir(), 'veli-licensing-artifacts-'));
  try {
    for (const pkg of licensingPackages) {
      const invocation = corepackSpawnTarget([
        'pnpm',
        '--filter',
        pkg.name,
        'pack',
        '--out',
        join(target, pkg.tarball),
      ]);
      await promisify(execFile)(invocation.command, invocation.args, {
        cwd: fileURLToPath(new URL('../', import.meta.url)),
        ...invocation.options,
        maxBuffer: 10 * 1024 * 1024,
      });
    }
    checkPackageLicensingArtifacts(target);
    assert.doesNotThrow(() => checkPackageLicensingArtifacts(target, { release: true }));
    // Mutate only this test's own tarball: an excluded asset must still fail
    // even when all licence/reference checks succeed.
    const plainTar = join(target, 'ui.tar');
    const injected = join(target, 'injected');
    await fs.writeFile(plainTar, gunzipSync(await fs.readFile(join(target, 'ui.tgz'))));
    await fs.mkdir(join(injected, 'package'), { recursive: true });
    await fs.writeFile(join(injected, 'package/font.woff2'), 'fixture, not a real font');
    tarSync(['-rf', plainTar, '-C', injected, 'package/font.woff2']);
    await fs.writeFile(join(target, 'ui.tgz'), gzipSync(await fs.readFile(plainTar)));
    assert.throws(() => checkPackageLicensingArtifacts(target), /excluded asset/);
  } finally {
    await fs.rm(target, { recursive: true, force: true });
  }
});

test('npm legal gate checks shipped material while website asset decisions remain separate', async () => {
  const root = await fs.mkdtemp(join(tmpdir(), 'veli-legal-scope-'));
  try {
    const paths = [
      'LICENSE',
      'LICENSES/CC-BY-4.0.txt',
      'packaging/LICENSING.md',
      'THIRD_PARTY_NOTICES.md',
      ...licensingPackages.map((pkg) => `packages/${pkg.directory}/README.md`),
    ];
    for (const path of paths) {
      let source = await fs.readFile(new URL(`../${path}`, import.meta.url), 'utf8');
      // These values are test data only, never applied to repository legal files.
      source = source
        .replaceAll('[YEAR]', '2030')
        .replaceAll(
          '[CREATOR / ATTRIBUTION IDENTITY — TO BE CONFIRMED]',
          'Example documentation author',
        )
        .replaceAll('**TO BE CONFIRMED**', 'complete in fixture')
        .replace(/draft\s+notice/gi, 'notice')
        .replace(
          /unresolved fields block publication\./g,
          'completed notices accompany this fixture.',
        )
        .replace(
          /The copyright year and documentation attribution remain unresolved and block publication\./g,
          'See the completed scope notice.',
        );
      const destination = join(root, path);
      await fs.mkdir(join(destination, '..'), { recursive: true });
      await fs.writeFile(destination, source);
    }
    await fs.writeFile(
      join(root, 'ASSET_LICENSES.md'),
      'Draft inventory: website font permissions TO BE CONFIRMED',
    );
    await fs.writeFile(
      join(root, 'BRAND_POLICY.md'),
      'Engineering draft: website brand contact TO BE CONFIRMED',
    );
    assert.doesNotThrow(() => assertReleaseLegal(root));
    const licence = await fs.readFile(join(root, 'LICENSE'), 'utf8');
    await fs.writeFile(
      join(root, 'LICENSE'),
      licence.replace(/Copyright \(c\) \d{4}(?:-\d{4})?/, 'Copyright (c) [YEAR]'),
    );
    assert.throws(() => assertReleaseLegal(root), /unresolved legal template/);
    await fs.writeFile(join(root, 'LICENSE'), licence);
    const scope = await fs.readFile(join(root, 'packaging/LICENSING.md'), 'utf8');
    await fs.writeFile(
      join(root, 'packaging/LICENSING.md'),
      scope.replace(
        '© 2026 Government of the Republic of Maldives.',
        '[CREATOR — TO BE CONFIRMED]',
      ),
    );
    assert.throws(() => assertReleaseLegal(root), /unresolved legal template/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
