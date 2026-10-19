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

const cwd = process.cwd();
const { packages } = await getPackages(cwd);

await run(['pnpm', '--filter', '@tradenetcorp/veli-ui', 'build'], cwd);
await run(['pnpm', '--filter', '@tradenetcorp/veli-ui', 'package:check'], cwd);

await withReleaseReadmes(packages, () =>
  run(['pnpm', 'exec', 'changeset', 'publish', ...process.argv.slice(2)], cwd),
);
