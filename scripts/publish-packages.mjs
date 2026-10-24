#!/usr/bin/env node

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
const { packages } = await getPackages(cwd);

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

await withReleaseReadmes(packages, () =>
  run(['pnpm', 'exec', 'changeset', 'publish', '--tag', tag, ...process.argv.slice(2)], cwd),
);
