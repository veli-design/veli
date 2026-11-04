import process from 'node:process';
import console from 'node:console';
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { spawnSyncCorepack } from '../../../scripts/corepack.mjs';
import { tokenFixture } from './token-fixture.mjs';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
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
const storybookBuild = spawnSyncCorepack(
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
  if (id === 'site-shell') return 'shell-adapter.tsx';
  if (id === 'preview-banner') return 'preview-banner-adapter.tsx';
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
    // Examples may import several blocks; rewrite every relative components import.
    readFileSync(adapter, 'utf8').replaceAll("'../components/", "'./components/"),
  );
}

// Application-owned example content is shared by docs, stories and the copied adapters.
for (const name of [
  'error-page-messages.ts',
  'page-navigation-footer-content.tsx',
  'service-detail-content.tsx',
  'service-detail-composition.tsx',
]) {
  cpSync(resolve(packageRoot, 'examples', name), resolve(target, name));
  if (name.startsWith('service-detail-')) {
    const path = resolve(target, name);
    writeFileSync(
      path,
      readFileSync(path, 'utf8').replaceAll(
        "'../src/service-detail/",
        "'./components/blocks/service-detail/",
      ),
    );
  }
}

mkdirSync(resolve(target, 'public/blocks'), { recursive: true });
cpSync(
  resolve(packageRoot, '../../apps/storybook/public/blocks/example-organization-emblem.svg'),
  resolve(target, 'public/blocks/example-organization-emblem.svg'),
);

mkdirSync(resolve(target, 'public/fonts'), { recursive: true });
cpSync(
  resolve(packageRoot, '../../apps/web/public/fonts/inter-latin.woff2'),
  resolve(target, 'public/fonts/inter-latin.woff2'),
);
cpSync(
  resolve(packageRoot, '../../apps/storybook/public/fonts/MV_Faseyha_Regular.ttf'),
  resolve(target, 'public/fonts/MV_Faseyha_Regular.ttf'),
);
cpSync(
  resolve(packageRoot, '../../apps/storybook/public/fonts/MV_A_Waheed_Bold_2.ttf'),
  resolve(target, 'public/fonts/MV_A_Waheed_Bold_2.ttf'),
);
if (process.argv.includes('--prepare')) {
  console.log(target);
  process.exit(0);
}
/** @type {NodeJS.ProcessEnv} */
const env = {
  ...process.env,
  NEXT_TELEMETRY_DISABLED: '1',
  NPM_CONFIG_USERCONFIG: undefined,
};
const tarballs = process.env.VELI_TARBALLS ? JSON.parse(process.env.VELI_TARBALLS) : null;
if (tarballs) {
  const filename = resolve(target, 'package.json');
  const manifest = JSON.parse(readFileSync(filename, 'utf8'));
  for (const [name, path] of Object.entries(tarballs))
    manifest.dependencies[name] = `file:${resolve(path)}`;
  const workspacePath = resolve(target, 'pnpm-workspace.yaml');
  const workspace = parseYAML(readFileSync(workspacePath, 'utf8'));
  workspace.minimumReleaseAge ??= 1440;
  workspace.overrides = {
    ...workspace.overrides,
    ...Object.fromEntries(
      Object.entries(tarballs).map(([name, path]) => [name, `file:${resolve(path)}`]),
    ),
  };
  writeFileSync(workspacePath, stringifyYAML(workspace));
  writeFileSync(filename, `${JSON.stringify(manifest, null, 2)}\n`);
}
const npmConfigDirectory = mkdtempSync(resolve(tmpdir(), 'veli-blocks-npmrc-'));
const npmConfigPath = resolve(npmConfigDirectory, 'npmrc');
// Isolate public installation from any developer-level private-registry configuration.
writeFileSync(npmConfigPath, '@veli-design:registry=https://registry.npmjs.org\n', { mode: 0o600 });
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
  const result = spawnSyncCorepack(args, { cwd: target, env, stdio: 'inherit' });
  if (result.status !== 0)
    throw new Error(`Consumer check failed: ${args.join(' ')}. Fixture retained at ${target}`);
}
console.log(`Consumer build and browser checks passed. Evidence: ${target}/test-results`);
