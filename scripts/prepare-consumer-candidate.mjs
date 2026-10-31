import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import getReleasePlan from '@changesets/get-release-plan';
import { getBlocks } from '../packages/blocks/scripts/catalog.mjs';
import { spawnSyncCorepack } from './corepack.mjs';

export const packageDirectories = {
  '@veli-design/react': 'react',
  '@veli-design/tokens': 'tokens',
  '@veli-design/cli': 'cli',
};

// Forward declarations opt a manual preparation PR into real versioned builds.
// Final release runs always use their already-versioned exact source tree.
export function candidateMode(current, planned, blocks, release) {
  if (release) return 'release';
  const forward = blocks.some(({ manifest }) =>
    Object.entries(manifest.testedDependencies).some(
      ([name, version]) => name in current && version !== current[name],
    ),
  );
  if (!forward) return 'current';
  for (const { manifest } of blocks)
    for (const [name, version] of Object.entries(manifest.testedDependencies))
      if (name in current)
        assert.equal(
          version,
          planned[name],
          `${manifest.id}: ${name} must target the Changesets plan`,
        );
  assert.notDeepEqual(planned, current, 'Preparation requires pending package versions');
  return 'preparation';
}

export function packedVersions(directory) {
  return Object.fromEntries(
    Object.keys(packageDirectories).map((name, index) => {
      const filename = ['ui.tgz', 'tokens.tgz', 'cli.tgz'][index];
      const pkg = JSON.parse(
        execFileSync('tar', ['-xOf', resolve(directory, filename), 'package/package.json'], {
          encoding: 'utf8',
        }),
      );
      assert.equal(pkg.name, name, `Unexpected package in ${filename}`);
      return [name, pkg.version];
    }),
  );
}

export function candidateInventory(directory, sourceCommit) {
  const inventory = JSON.parse(readFileSync(resolve(directory, 'preparation.json'), 'utf8'));
  assert.equal(inventory.schema, 1, 'Invalid candidate inventory');
  assert.ok(
    ['current', 'preparation', 'release'].includes(inventory.mode),
    'Invalid candidate mode',
  );
  assert.equal(inventory.sourceCommit, sourceCommit, 'Candidate source mismatch');
  assert.deepEqual(inventory.packages, packedVersions(directory), 'Candidate version mismatch');
  return inventory;
}

export async function prepareCandidate(target, release = false) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(git('status', '--porcelain'), '', 'Commit the candidate source before rehearsal');
  const sha = git('rev-parse', 'HEAD');
  const current = Object.fromEntries(
    Object.entries(packageDirectories).map(([name, directory]) => [
      name,
      JSON.parse(readFileSync(resolve(root, 'packages', directory, 'package.json'))).version,
    ]),
  );
  const plan = await getReleasePlan(root);
  const planned = { ...current };
  for (const entry of plan.releases)
    if (entry.name in planned && entry.type !== 'none') planned[entry.name] = entry.newVersion;
  const mode = candidateMode(current, planned, getBlocks(), release);
  const temporary = mkdtempSync(resolve(tmpdir(), 'veli-preparation-'));
  const checkout = resolve(temporary, 'source');
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const run = (args) => {
    const result = spawnSyncCorepack(['pnpm', ...args], { cwd: checkout, env, stdio: 'inherit' });
    assert.equal(result.status, 0, `Candidate command failed: ${args.join(' ')}`);
  };
  mkdirSync(target); // Refuse to overwrite prior evidence.
  try {
    execFileSync('git', ['clone', '--quiet', '--shared', '--no-hardlinks', root, checkout], {
      env,
    });
    execFileSync('git', ['checkout', '--quiet', '--detach', sha], { cwd: checkout, env });
    run(['install', '--frozen-lockfile']);
    if (mode === 'preparation') {
      run(['version-packages']);
      // Versioning changes workspace package identities and peer links. Refresh
      // the disposable dependency graph before building the prospective artifacts.
      run(['install', '--no-frozen-lockfile']);
    }
    run([
      'exec',
      'turbo',
      'build',
      '--filter=@veli-design/react',
      '--filter=@veli-design/tokens',
      '--filter=@veli-design/cli',
    ]);
    for (const [index, name] of Object.keys(packageDirectories).entries())
      run([
        '--filter',
        name,
        'pack',
        '--out',
        resolve(target, ['ui.tgz', 'tokens.tgz', 'cli.tgz'][index]),
      ]);
    const packages = packedVersions(target);
    assert.deepEqual(
      packages,
      mode === 'preparation' ? planned : current,
      'Packed versions differ from the candidate plan',
    );
    // Inventory only: this file is not evidence of successful tests or release authorization.
    writeFileSync(
      resolve(target, 'preparation.json'),
      JSON.stringify({ schema: 1, sourceCommit: sha, mode, packages }, null, 2) + '\n',
    );
    console.log(JSON.stringify({ mode, sourceCommit: sha, packages }));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [target, release] = process.argv.slice(2);
  assert.ok(target, 'Expected a new candidate directory');
  assert.ok(
    ['true', 'false'].includes(release),
    'Expected authenticated release selection true or false',
  );
  await prepareCandidate(resolve(target), release === 'true');
}
