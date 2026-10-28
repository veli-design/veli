#!/usr/bin/env node

import { getPackages } from '@manypkg/get-packages';

import { spawnCorepack } from './corepack.mjs';
import { withReleaseReadmes } from './release-readme.mjs';
import { verifyCurrentPublication } from './release-ci.mjs';

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

const cwd = process.cwd();
// Keep this guard at the publication entry point as well as in the workflow:
// Changesets may call publish even when pending Markdown contains no releases.
if (process.env.GITHUB_ACTIONS === 'true') await verifyCurrentPublication();
const { packages } = await getPackages(cwd);

// Release preparation does not build sites. Publication builds only distributable
// packages and their dependencies, after the workflow's exact-tree gate passes.
await run(
  [
    'pnpm',
    'exec',
    'turbo',
    'build',
    '--filter=@tradenetcorp/veli-ui',
    '--filter=@tradenetcorp/veli-tokens',
    '--filter=@tradenetcorp/veli',
  ],
  cwd,
);
await run(['pnpm', '--filter', '@tradenetcorp/veli-ui', 'package:check'], cwd);

await withReleaseReadmes(packages, () =>
  run(['pnpm', 'exec', 'changeset', 'publish', ...process.argv.slice(2)], cwd),
);
