#!/usr/bin/env node

import assert from 'node:assert/strict';
import { verifyCurrentPublication } from './release-ci.mjs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { licensingPackages } from './package-licensing.mjs';
import { checkPackageLicensingArtifacts } from './check-package-licensing.mjs';
import { assertReleaseLegal } from './release-legal.mjs';

import { getPackages } from '@manypkg/get-packages';

import { spawnCorepack } from './corepack.mjs';
import { withReleaseReadmes } from './release-readme.mjs';

function run(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawnCorepack(args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`corepack ${args.join(' ')} exited with ${code}.`));
    });
  });
}

if (process.env.VELI_NPM_PUBLICATION_APPROVED !== 'true') {
  throw new Error(
    'Public npm publication requires separate rollout approval. Use pnpm pack for rehearsal.',
  );
}
const tag = process.env.VELI_NPM_DIST_TAG;
if (!tag || !/^[a-z][a-z0-9-]*$/.test(tag)) {
  throw new Error('Set the separately approved VELI_NPM_DIST_TAG explicitly.');
}
if (process.argv.slice(2).some((argument) => argument.startsWith('--tag'))) {
  throw new Error('Use VELI_NPM_DIST_TAG for the approved dist-tag.');
}
const cwd = process.cwd();
assertReleaseLegal(cwd);
if (process.env.GITHUB_ACTIONS === 'true') await verifyCurrentPublication();
const { packages } = await getPackages(cwd);
const publicPackages = packages.filter((pkg) => !pkg.packageJson.private);
assert.deepEqual(
  publicPackages.map((pkg) => pkg.packageJson.name).sort(),
  ['@veli-design/cli', '@veli-design/react', '@veli-design/tokens'],
  'Only @veli-design/react, @veli-design/tokens and @veli-design/cli may be published',
);
for (const { packageJson } of publicPackages) {
  assert.equal(packageJson.publishConfig?.registry, 'https://registry.npmjs.org');
  assert.equal(packageJson.publishConfig?.access, 'public');
}

await run(
  [
    'pnpm',
    'exec',
    'turbo',
    'build',
    '--filter=@veli-design/react',
    '--filter=@veli-design/tokens',
    '--filter=@veli-design/cli',
  ],
  cwd,
);
await run(['pnpm', '--filter', '@veli-design/react', 'package:check'], cwd);

await withReleaseReadmes(packages, async () => {
  const candidate = await mkdtemp(join(tmpdir(), 'veli-release-artifacts-'));
  try {
    for (const pkg of licensingPackages) {
      await run(['pnpm', '--filter', pkg.name, 'pack', '--out', join(candidate, pkg.tarball)], cwd);
    }
    checkPackageLicensingArtifacts(candidate, { release: true });
    await run(
      ['pnpm', 'exec', 'changeset', 'publish', '--tag', tag, ...process.argv.slice(2)],
      cwd,
    );
  } finally {
    await rm(candidate, { recursive: true, force: true });
  }
});
