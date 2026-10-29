import assert from 'node:assert/strict';
import test from 'node:test';
import { getBlocks } from '../packages/blocks/scripts/catalog.mjs';
import {
  fixtureDependencies,
  assertBlockDependencies,
  assertCliDependencyReport,
} from './npm-migration-dependencies.mjs';

const blocks = getBlocks();
const installed = fixtureDependencies(blocks);

test('the fixture supplies all runtime and setup dependencies at tested compatible versions', () => {
  assert.doesNotThrow(() => assertBlockDependencies(blocks, installed));
  assert.equal(installed.tailwindcss, '4.3.2');
  for (const name of ['react-aria-components', '@phosphor-icons/react', 'motion'])
    assert.ok(installed[name]);
});

for (const [name, version] of [
  ['@veli-design/react', '0.18.0'],
  ['@veli-design/tokens', '0.11.0'],
  ['tailwindcss', '4.1.17'],
]) {
  test(`installed ${name}@${version} cannot pass with stale Block ranges`, () => {
    assert.throws(
      () => assertBlockDependencies(blocks, { ...installed, [name]: version }),
      /does not satisfy/,
    );
  });
}

test('missing or file declarations are not accepted as installed versions', () => {
  for (const version of [undefined, 'file:ui.tgz'])
    assert.throws(
      () => assertBlockDependencies(blocks, { ...installed, '@veli-design/react': version }),
      /missing installed version/,
    );
});

test('compatible candidate versions still require the tested-version record to be refreshed', () => {
  assert.throws(
    () => assertBlockDependencies(blocks, { ...installed, '@veli-design/react': '0.17.1' }),
    /refresh testedDependencies/,
  );
});

test('versioned Block contracts and tested versions accept the new candidate', () => {
  const versioned = structuredClone(blocks);
  for (const { manifest } of versioned) {
    if (manifest.dependencies['@veli-design/react']) {
      manifest.dependencies['@veli-design/react'] = '^0.18.0';
      manifest.testedDependencies['@veli-design/react'] = '0.18.0';
    }
    manifest.setupDependencies['@veli-design/tokens'] = '^0.11.0';
    manifest.testedDependencies['@veli-design/tokens'] = '0.11.0';
  }
  assert.doesNotThrow(() =>
    assertBlockDependencies(versioned, {
      ...installed,
      '@veli-design/react': '0.18.0',
      '@veli-design/tokens': '0.11.0',
    }),
  );
});

test('CLI reports must confirm the block and have no missing or incompatible requirements', () => {
  const valid = { added: ['account-panel'], dependencies: { missing: [], incompatible: [] } };
  assert.doesNotThrow(() => assertCliDependencyReport(valid, 'account-panel'));
  for (const report of [
    { ...valid, added: ['other'] },
    { ...valid, dependencies: { missing: ['motion@^12'], incompatible: [] } },
    {
      ...valid,
      dependencies: {
        missing: [],
        incompatible: [{ name: '@veli-design/react', current: '0.18.0', required: '^0.17.0' }],
      },
    },
    { added: valid.added },
  ])
    assert.throws(() => assertCliDependencyReport(report, 'account-panel'));
});
