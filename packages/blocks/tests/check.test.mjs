import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { packageRoot, sourceRoot } from '../scripts/catalog.mjs';

function fixture(run) {
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-block-version-'));
  const blocks = resolve(directory, 'packages/blocks');
  const source = resolve(blocks, 'src/site-footer');
  // Hooks can export Git paths. Keep every fixture Git operation in its own repo.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8', env }).trim();
  try {
    mkdirSync(resolve(blocks, 'scripts'), { recursive: true });
    for (const file of ['check.mjs', 'catalog.mjs'])
      cpSync(resolve(packageRoot, 'scripts', file), resolve(blocks, 'scripts', file));
    cpSync(resolve(sourceRoot, 'site-footer'), source, { recursive: true });
    symlinkSync(resolve(packageRoot, 'node_modules'), resolve(directory, 'node_modules'), 'dir');
    git('init', '-q');
    git('config', 'user.email', 'ci@example.test');
    git('config', 'user.name', 'CI');
    git('add', 'packages/blocks/src');
    git('commit', '-qm', 'baseline');
    const base = git('rev-parse', 'HEAD');
    const check = () =>
      spawnSync(process.execPath, ['scripts/check.mjs'], {
        cwd: blocks,
        encoding: 'utf8',
        env: { ...env, BLOCKS_BASE_REF: base },
        timeout: 15000,
      });
    run({ source, git, check });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('the version gate accepts an unchanged block when invoked from the package directory', () => {
  fixture(({ check }) => {
    const result = check();
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /Validated 1 blocks against [a-f0-9]{40}/);
  });
});

for (const state of ['unstaged', 'staged', 'committed']) {
  test(`the version gate rejects ${state} source changes without a version bump`, () => {
    fixture(({ source, git, check }) => {
      const filename = resolve(source, 'site-footer.tsx');
      writeFileSync(
        filename,
        readFileSync(filename, 'utf8') + '\n// Changed after the baseline.\n',
      );
      if (state !== 'unstaged') git('add', 'packages/blocks/src');
      if (state === 'committed') git('commit', '-qm', 'source change without a release');
      const result = check();
      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.match(result.stderr, /site-footer: increment version and add changelog/);
    });
  });
}

test('the version gate rejects downgrades and requires release notes for a new patch', () => {
  fixture(({ source, check }) => {
    const manifestPath = resolve(source, 'manifest.json');
    const changelogPath = resolve(source, 'CHANGELOG.md');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const changelog = readFileSync(changelogPath, 'utf8');
    const [major, minor, patch] = manifest.version.split('.').map(Number);
    const nextVersion = `${major}.${minor}.${patch + 1}`;

    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: '0.0.0' }));
    writeFileSync(changelogPath, '## 0.0.0\n\n### Fixed\n\n- Fixture downgrade.\n\n' + changelog);
    const downgrade = check();
    assert.equal(downgrade.status, 1, downgrade.stderr || downgrade.stdout);
    assert.match(downgrade.stderr, /site-footer: increment version and add changelog/);

    writeFileSync(manifestPath, JSON.stringify({ ...manifest, version: nextVersion }));
    writeFileSync(changelogPath, changelog);
    const missingNotes = check();
    assert.equal(missingNotes.status, 1, missingNotes.stderr || missingNotes.stdout);
    assert.match(missingNotes.stderr, /Missing changelog entry for site-footer/);

    writeFileSync(
      changelogPath,
      `## ${nextVersion}\n\n### Fixed\n\n- Fixture patch.\n\n${changelog}`,
    );
    const released = check();
    assert.equal(released.status, 0, released.stderr || released.stdout);
  });
});
