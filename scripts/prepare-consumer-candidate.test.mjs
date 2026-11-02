import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { candidateInventory, candidateMode } from './prepare-consumer-candidate.mjs';
import { tarSync } from './windows-safe-tar.mjs';
const current = { '@veli-design/react': '0.17.0', '@veli-design/tokens': '0.10.0' };
const planned = { '@veli-design/react': '0.18.0', '@veli-design/tokens': '0.11.0' };
const blocks = (testedDependencies) => [{ manifest: { id: 'example', testedDependencies } }];
test('ordinary PRs test current packages while complete manual preparation tests the Changesets plan', () => {
  assert.equal(candidateMode(current, planned, blocks(current), false), 'current');
  assert.equal(candidateMode(current, planned, blocks(planned), false), 'preparation');
  assert.throws(
    () =>
      candidateMode(
        current,
        planned,
        blocks({ ...planned, '@veli-design/tokens': '0.10.0' }),
        false,
      ),
    /Changesets plan/,
  );
  assert.throws(
    () =>
      candidateMode(current, planned, blocks({ ...planned, '@veli-design/react': '9.0.0' }), false),
    /Changesets plan/,
  );
});
test('authenticated final release always tests its exact tree without projecting again', () => {
  assert.equal(candidateMode(current, planned, blocks(planned), true), 'release');
  assert.equal(candidateMode(planned, planned, blocks(planned), true), 'release');
});

test('site inventory uses actual packed package versions and rejects stale source, metadata and wrong package identities', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-packed-inventory-'));
  const sha = 'a'.repeat(40);
  const packages = { ...planned, '@veli-design/cli': '0.2.0' };
  const inventory = { schema: 1, sourceCommit: sha, mode: 'preparation', packages };
  const save = (value) =>
    writeFileSync(resolve(directory, 'preparation.json'), JSON.stringify(value));
  mkdirSync(resolve(directory, 'package'));
  try {
    for (const [index, [name, version]] of Object.entries(packages).entries()) {
      writeFileSync(resolve(directory, 'package/package.json'), JSON.stringify({ name, version }));
      tarSync([
        '-czf',
        resolve(directory, ['ui.tgz', 'tokens.tgz', 'cli.tgz'][index]),
        '-C',
        directory,
        'package/package.json',
      ]);
    }
    save(inventory);
    assert.deepEqual(candidateInventory(directory, sha), inventory);
    assert.throws(() => candidateInventory(directory, 'b'.repeat(40)), /source mismatch/);
    save({ ...inventory, packages: { ...packages, '@veli-design/react': '0.17.0' } });
    assert.throws(() => candidateInventory(directory, sha), /version mismatch/);
    save({ ...inventory, mode: 'approved' });
    assert.throws(() => candidateInventory(directory, sha), /mode/);
    save(inventory);
    writeFileSync(
      resolve(directory, 'package/package.json'),
      JSON.stringify({ name: '@fazofazaal/react', version: '0.18.0' }),
    );
    tarSync(['-czf', resolve(directory, 'ui.tgz'), '-C', directory, 'package/package.json']);
    assert.throws(() => candidateInventory(directory, sha), /Unexpected package/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
