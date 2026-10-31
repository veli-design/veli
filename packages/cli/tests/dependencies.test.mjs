import assert from 'node:assert/strict';
import test from 'node:test';
import semver from 'semver';
import { mergeDependencyRequirements } from '../dist/dependencies.js';
import { getBlocks } from '../../blocks/scripts/catalog.mjs';

test('shared requirements intersect independently of block order', () => {
  const requirements = [{ react: '^19.0.0' }, { react: '~19.2.0' }, { react: '^19.2.6' }];
  const merged = mergeDependencyRequirements(requirements);
  assert.deepEqual(mergeDependencyRequirements([...requirements].reverse()), merged);
  assert.equal(semver.satisfies('19.2.6', merged.react), true);
  assert.equal(semver.satisfies('19.2.5', merged.react), false);
  assert.equal(semver.satisfies('19.3.0', merged.react), false);
});

test('identical and independent requirements keep their declared ranges', () => {
  assert.deepEqual(
    mergeDependencyRequirements([{ react: '^19.0.0' }, { react: '^19.0.0', next: '16.2.11' }]),
    { next: '16.2.11', react: '^19.0.0' },
  );
});

test('disjoint requirements fail in either order instead of downgrading a block', () => {
  const requirements = [{ '@veli-design/react': '^0.13.0' }, { '@veli-design/react': '^0.10.0' }];
  for (const order of [requirements, [...requirements].reverse()])
    assert.throws(
      () => mergeDependencyRequirements(order),
      /Conflicting block requirements.*veli-design\/react/,
    );
});

test('exact versions must satisfy all other selected ranges', () => {
  assert.equal(
    semver.satisfies(
      '19.2.6',
      mergeDependencyRequirements([{ react: '^19.0.0' }, { react: '19.2.6' }]).react,
    ),
    true,
  );
  assert.throws(() => mergeDependencyRequirements([{ react: '~19.1.0' }, { react: '19.2.6' }]));
});

test('every catalog selection has compatible runtime and setup requirements', () => {
  const blocks = getBlocks();
  // Exercise individual blocks, every combination, and the entire catalog. A new
  // block automatically participates, so independently valid ranges cannot leave
  // a consumer with an impossible combined CLI installation.
  for (let selection = 1; selection < 2 ** blocks.length; selection++) {
    const selected = blocks.filter((_, index) => selection & (2 ** index));
    const requirements = selected.flatMap(({ manifest }) => [
      manifest.dependencies,
      manifest.setupDependencies,
    ]);
    const merged = mergeDependencyRequirements(requirements);
    const context = selected.map(({ manifest }) => manifest.id).join(', ');
    assert.deepEqual(mergeDependencyRequirements([...requirements].reverse()), merged, context);
    for (const { manifest } of selected)
      for (const [name, version] of Object.entries(manifest.testedDependencies))
        if (merged[name])
          assert.ok(
            semver.satisfies(version, merged[name]),
            `${context}: tested ${name}@${version} must satisfy ${merged[name]}`,
          );
  }
});
