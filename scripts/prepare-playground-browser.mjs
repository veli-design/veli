import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSyncCorepack } from './corepack.mjs';

const target = resolve(process.argv[2]);
// Use the exact browser version already exercised by the block consumer.
const fixture = JSON.parse(
  readFileSync(new URL('../packages/blocks/fixtures/next/package.json', import.meta.url), 'utf8'),
);
mkdirSync(target);
writeFileSync(
  resolve(target, 'package.json'),
  JSON.stringify({
    private: true,
    packageManager: fixture.packageManager,
    devDependencies: { '@playwright/test': fixture.devDependencies['@playwright/test'] },
  }),
);
const skipBrowserInstall = process.argv.includes('--skip-browser-install');
for (const args of [
  ['pnpm', 'install', '--ignore-scripts'],
  ...(skipBrowserInstall
    ? []
    : [
        [
          'pnpm',
          'exec',
          'playwright',
          'install',
          ...(process.platform === 'linux' ? ['--with-deps'] : []),
          'chromium',
        ],
      ]),
])
  assert.equal(spawnSyncCorepack(args, { cwd: target, stdio: 'inherit' }).status, 0);
