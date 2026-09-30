import process from 'node:process';
import console from 'node:console';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { getBlocks, bundleFiles, packageRoot } from './catalog.mjs';

const target = process.env.BLOCKS_CONSUMER_DIR
  ? resolve(process.env.BLOCKS_CONSUMER_DIR)
  : mkdtempSync(resolve(tmpdir(), 'veli-blocks-consumer-'));
if (process.env.BLOCKS_CONSUMER_DIR && existsSync(target))
  throw new Error('BLOCKS_CONSUMER_DIR must not exist');
mkdirSync(target, { recursive: true });
cpSync(resolve(packageRoot, 'fixtures/next'), target, { recursive: true });
for (const block of getBlocks()) {
  for (const file of bundleFiles(block)) {
    const path = resolve(target, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.bytes);
  }
}
// Execute the same adapter displayed in the documentation; only its relative destination changes.
cpSync(
  resolve(packageRoot, 'examples/site-footer-next.tsx'),
  resolve(target, 'footer-adapter.tsx'),
);
const { readFileSync } = await import('node:fs');
const adapter = resolve(target, 'footer-adapter.tsx');
writeFileSync(adapter, readFileSync(adapter, 'utf8').replace("'../components/", "'./components/"));
writeFileSync(
  resolve(target, 'notification-adapter.tsx'),
  readFileSync(resolve(packageRoot, 'examples/notification-tray-next.tsx'), 'utf8').replace(
    "'../components/",
    "'./components/",
  ),
);
mkdirSync(resolve(target, 'public/fonts'), { recursive: true });
cpSync(
  resolve(packageRoot, '../../apps/storybook/public/fonts/MV_Faseyha_Regular.ttf'),
  resolve(target, 'public/fonts/MV_Faseyha_Regular.ttf'),
);
if (process.argv.includes('--prepare')) {
  console.log(target);
  process.exit(0);
}
/** @type {NodeJS.ProcessEnv} */
const env = {
  ...process.env,
  NODE_AUTH_TOKEN: process.env.NODE_AUTH_TOKEN || process.env.GITHUB_TOKEN,
  NEXT_TELEMETRY_DISABLED: '1',
  NPM_CONFIG_USERCONFIG: undefined,
};
if (!env.NODE_AUTH_TOKEN)
  throw new Error(`Set NODE_AUTH_TOKEN with package-read access. Fixture retained at ${target}`);
const npmConfigDirectory = mkdtempSync(resolve(tmpdir(), 'veli-blocks-npmrc-'));
const npmConfigPath = resolve(npmConfigDirectory, 'npmrc');
// pnpm intentionally ignores environment expansion in a project .npmrc. A temporary
// user-level config keeps the token out of the fixture while allowing CI authentication.
writeFileSync(
  npmConfigPath,
  '@tradenetcorp:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n',
  { mode: 0o600 },
);
env.NPM_CONFIG_USERCONFIG = npmConfigPath;
console.log(`Isolated consumer: ${target}`);
for (const args of [
  // The fixture is intentionally materialized in a temporary directory and has no lockfile.
  ['pnpm', 'install', '--no-frozen-lockfile'],
  ['pnpm', 'build'],
  ['pnpm', 'exec', 'playwright', 'install', 'chromium'],
  ['pnpm', 'test'],
]) {
  const result = spawnSync('corepack', args, { cwd: target, env, stdio: 'inherit' });
  if (result.status !== 0)
    throw new Error(`Consumer check failed: ${args.join(' ')}. Fixture retained at ${target}`);
}
console.log(`Consumer build and browser checks passed. Evidence: ${target}/test-results`);
