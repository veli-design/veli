#!/usr/bin/env node

import { spawn } from 'node:child_process';

import { getPackages } from '@manypkg/get-packages';

import { withReleaseReadmes } from './release-readme.mjs';

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}.`));
    });
  });
}

const cwd = process.cwd();
const { packages } = await getPackages(cwd);

await run('corepack', ['pnpm', '--filter', '@tradenetcorp/veli-ui', 'build'], cwd);
await run('corepack', ['pnpm', '--filter', '@tradenetcorp/veli-ui', 'package:check'], cwd);

await withReleaseReadmes(packages, () =>
  run('corepack', ['pnpm', 'exec', 'changeset', 'publish', ...process.argv.slice(2)], cwd),
);
