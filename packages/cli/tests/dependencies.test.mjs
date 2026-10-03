import assert from 'node:assert/strict';
import test from 'node:test';
import semver from 'semver';
import { mergeDependencyRequirements } from '../dist/dependencies.js';

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
  const requirements = [
    { '@tradenetcorp/veli-ui': '^0.13.0' },
    { '@tradenetcorp/veli-ui': '^0.10.0' },
  ];
  for (const order of [requirements, [...requirements].reverse()])
    assert.throws(
      () => mergeDependencyRequirements(order),
      /Conflicting block requirements.*veli-ui/,
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
