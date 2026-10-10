import process from 'node:process';
import console from 'node:console';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { tokenFixture } from './token-fixture.mjs';
import { getBlocks, bundleFiles, packageRoot } from './catalog.mjs';

const target = process.env.BLOCKS_CONSUMER_DIR
  ? resolve(process.env.BLOCKS_CONSUMER_DIR)
  : mkdtempSync(resolve(tmpdir(), 'veli-blocks-consumer-'));
if (process.env.BLOCKS_CONSUMER_DIR && existsSync(target))
  throw new Error('BLOCKS_CONSUMER_DIR must not exist');
mkdirSync(target, { recursive: true });
cpSync(resolve(packageRoot, 'fixtures/next'), target, { recursive: true });
// Exercise Storybook play functions against the same canonical imports in a real browser.
// Build its workspace dependencies first: fresh checkouts have no generated token CSS or UI dist.
const storybookBuild = spawnSync(
  'corepack',
  ['pnpm', 'exec', 'turbo', 'build', '--filter=@tradenetcorp/veli-storybook'],
  {
    cwd: resolve(packageRoot, '../..'),
    stdio: 'inherit',
  },
);
if (storybookBuild.status !== 0) throw new Error('Storybook build failed');
cpSync(
  resolve(packageRoot, '../../apps/storybook/storybook-static'),
  resolve(target, 'public/storybook'),
  { recursive: true },
);

/** @param {string} id */
function adapterFileName(id) {
  if (id === 'site-footer') return 'footer-adapter.tsx';
  if (id === 'site-header') return 'header-adapter.tsx';
  if (id === 'notification-tray') return 'notification-adapter.tsx';
  if (id === 'account-panel') return 'account-adapter.tsx';
  return `${id}-adapter.tsx`;
}

for (const block of getBlocks()) {
  for (const file of bundleFiles(block)) {
    const path = resolve(target, file.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, file.bytes);
  }
  // Execute the same adapter displayed in the documentation; only its relative destination changes.
  const exampleName = `${block.manifest.id}-next.tsx`;
  const adapter = resolve(target, adapterFileName(block.manifest.id));
  cpSync(resolve(packageRoot, 'examples', exampleName), adapter);
  writeFileSync(
    adapter,
    readFileSync(adapter, 'utf8').replace("'../components/", "'./components/"),
  );
}

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
const tarballs = process.env.VELI_TARBALLS ? JSON.parse(process.env.VELI_TARBALLS) : null;
if (tarballs) {
  const filename = resolve(target, 'package.json');
  const manifest = JSON.parse(readFileSync(filename, 'utf8'));
  for (const [name, path] of Object.entries(tarballs))
    manifest.dependencies[name] = `file:${resolve(path)}`;
  manifest.pnpm = {
    overrides: Object.fromEntries(
      Object.entries(tarballs).map(([name, path]) => [name, `file:${resolve(path)}`]),
    ),
  };
  writeFileSync(filename, `${JSON.stringify(manifest, null, 2)}\n`);
}
if (!env.NODE_AUTH_TOKEN && !tarballs)
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
  [
    'pnpm',
    'exec',
    'playwright',
    'install',
    ...(process.platform === 'linux' ? ['--with-deps'] : []),
    'chromium',
    'firefox',
    'webkit',
  ],
  ['pnpm', 'test'],
]) {
  if (args[1] === 'test') await tokenFixture(target);
  const result = spawnSync('corepack', args, { cwd: target, env, stdio: 'inherit' });
  if (result.status !== 0)
    throw new Error(`Consumer check failed: ${args.join(' ')}. Fixture retained at ${target}`);
}
console.log(`Consumer build and browser checks passed. Evidence: ${target}/test-results`);
