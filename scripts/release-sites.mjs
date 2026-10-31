import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSyncCorepack } from './corepack.mjs';
import { candidateInventory } from './prepare-consumer-candidate.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const packageDirectories = {
  '@veli-design/react': 'react',
  '@veli-design/tokens': 'tokens',
  '@veli-design/cli': 'cli',
};
// Sites consume only React and tokens; the durable snapshot records all publications.
export const packages = ['@veli-design/react', '@veli-design/tokens'];
export function validateManifest(manifest) {
  if (manifest.schema !== 1 || !/^[a-f0-9]{40}$/.test(manifest.sourceCommit))
    throw new Error('Invalid release snapshot');
  for (const name of Object.keys(packageDirectories))
    if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(manifest.packages?.[name] ?? ''))
      throw new Error(`Missing exact release version: ${name}`);
  return manifest;
}
export async function createManifest(sourceCommit) {
  return validateManifest({
    schema: 1,
    sourceCommit,
    packages: Object.fromEntries(
      await Promise.all(
        Object.entries(packageDirectories).map(async ([name, directory]) => {
          return [
            name,
            JSON.parse(await readFile(resolve(root, 'packages', directory, 'package.json'), 'utf8'))
              .version,
          ];
        }),
      ),
    ),
  });
}
export async function stageConsumer(target, manifest, tarballs = {}) {
  validateManifest(manifest);
  if (resolve(target) === resolve(root) || resolve(target).startsWith(resolve(root) + '/'))
    throw new Error('Consumer must be outside the repository');
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  for (const filename of files) {
    if (!existsSync(resolve(root, filename))) continue;
    if (
      /^packages\/(react|tokens)\//.test(filename) &&
      filename !== 'packages/tokens/lib/playground.mjs'
    )
      continue;
    if (filename === '.npmrc' || filename === 'pnpm-lock.yaml') continue;
    const destination = resolve(target, filename);
    await mkdir(dirname(destination), { recursive: true });
    await cp(resolve(root, filename), destination);
  }
  if (!existsSync(resolve(target, '.git'))) {
    execFileSync('git', ['clone', '--bare', '--shared', '--quiet', root, resolve(target, '.git')]);
    execFileSync('git', ['--git-dir', resolve(target, '.git'), 'config', 'core.bare', 'false']);
    execFileSync('git', [
      '--git-dir',
      resolve(target, '.git'),
      'config',
      'core.worktree',
      resolve(target),
    ]);
    execFileSync('git', ['--git-dir', resolve(target, '.git'), 'read-tree', manifest.sourceCommit]);
  }
  await cp(resolve(root, 'pnpm-lock.yaml'), resolve(target, 'pnpm-lock.yaml'));
  const workspace = parseYAML(await readFile(resolve(root, 'pnpm-workspace.yaml'), 'utf8'));
  workspace.packages = ['apps/*', 'packages/blocks'];
  // Deployment immediately follows publication; exempt only this release snapshot.
  workspace.minimumReleaseAgeExclude = [
    ...(workspace.minimumReleaseAgeExclude ?? []),
    ...Object.entries(manifest.packages).map(([name, version]) => `${name}@${version}`),
  ];
  const lock = parseYAML(await readFile(resolve(root, 'pnpm-lock.yaml'), 'utf8'));
  if (Object.keys(tarballs).length)
    for (const name of packages) workspace.overrides[name] = `file:${resolve(tarballs[name])}`;
  await writeFile(resolve(target, 'pnpm-workspace.yaml'), stringifyYAML(workspace));
  for (const directory of ['apps/web', 'apps/storybook', 'packages/blocks', 'packages/cli']) {
    const filename = resolve(target, directory, 'package.json');
    const json = JSON.parse(await readFile(filename, 'utf8'));
    for (const section of ['dependencies', 'devDependencies', 'peerDependencies'])
      for (const name of packages)
        if (json[section]?.[name])
          json[section][name] = tarballs[name]
            ? `file:${resolve(tarballs[name])}`
            : manifest.packages[name];
    for (const section of ['dependencies', 'devDependencies'])
      for (const name of Object.keys(json[section] ?? {})) {
        if (packages.includes(name) || json[section][name].startsWith('workspace:')) continue;
        const locked = lock.importers[directory]?.[section]?.[name]?.version?.split('(')[0];
        if (locked && /^\d+\.\d+\.\d+/.test(locked)) json[section][name] = locked;
      }
    await writeFile(filename, `${JSON.stringify(json, null, 2)}\n`);
  }
  // The UI package registers its installed dist itself; source scanning is local-only.
  for (const filename of ['apps/web/src/styles/global.css', 'apps/storybook/src/global.css']) {
    const path = resolve(target, filename);
    const css = await readFile(path, 'utf8');
    await writeFile(
      path,
      css
        .split('\n')
        .filter((line) => !/^@source .*packages\/react/.test(line))
        .join('\n'),
    );
  }
  await writeFile(
    resolve(target, 'release-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}
function run(args, cwd) {
  const result = spawnSyncCorepack(['pnpm', ...args], {
    cwd,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) throw new Error(`Consumer command failed: ${args.join(' ')}`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, target, manifestPath] = process.argv.slice(2);
  if (command === 'manifest') {
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    await mkdir(dirname(resolve(target)), { recursive: true });
    const manifest = await createManifest(sha);
    if (process.env.VELI_TARBALLS) {
      const tarballs = JSON.parse(process.env.VELI_TARBALLS);
      const candidate = dirname(tarballs['@veli-design/react']);
      manifest.packages = candidateInventory(candidate, sha).packages;
      validateManifest(manifest);
    }
    await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`);
  } else if (command === 'stage') {
    await stageConsumer(
      target,
      JSON.parse(await readFile(manifestPath, 'utf8')),
      process.env.VELI_TARBALLS ? JSON.parse(process.env.VELI_TARBALLS) : {},
    );
  } else if (command === 'build') {
    run(['install', '--no-frozen-lockfile'], target);
    const manifest = validateManifest(
      JSON.parse(await readFile(resolve(target, 'release-manifest.json'), 'utf8')),
    );
    // Every UI/token import must resolve to an installed package, never checkout source.
    for (const name of packages) {
      const result = spawnSync(
        'node',
        [
          '--input-type=module',
          '-e',
          `import fs from 'node:fs';import {fileURLToPath} from 'node:url';import {dirname,resolve} from 'node:path';const path=import.meta.resolve('${name}/'+${JSON.stringify(name === '@veli-design/react' ? 'button' : 'tokens')});if(!path.includes('/node_modules/'))throw new Error(path);const actual=JSON.parse(fs.readFileSync(resolve(dirname(fileURLToPath(path)),'../package.json'))).version;if(actual!==${JSON.stringify(manifest.packages[name])})throw new Error('Unexpected package version: '+actual);`,
        ],
        { cwd: resolve(target, 'apps/web'), stdio: 'inherit' },
      );
      if (result.status !== 0) throw new Error(`Workspace fallback for ${name}`);
    }
    for (const app of ['veli-web', 'veli-storybook'])
      run(['--filter', `@tradenetcorp/${app}`, 'build'], target);
  } else throw new Error('Expected manifest, stage or build');
}
