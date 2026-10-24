import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import getReleasePlan from '@changesets/get-release-plan';
import { assertCompatibleTokensPeer } from './ui-token-peer.mjs';

const uiPackage = { peerDependencies: { '@veli-design/tokens': '^0.9.0' } };

test('tokens peer accepts its supported minimum and compatible patch releases', () => {
  for (const version of ['0.9.0', '0.9.1', '0.9.7'])
    assert.doesNotThrow(() => assertCompatibleTokensPeer(uiPackage, version));
});

test('tokens peer rejects versions outside its range and unapproved prereleases', () => {
  for (const version of ['0.8.9', '0.10.0', '1.0.0', '0.9.1-rc.0'])
    assert.throws(() => assertCompatibleTokensPeer(uiPackage, version), /must satisfy UI peer/);
});

test('tokens peer requires present, nonempty and valid range metadata', () => {
  for (const range of [undefined, null, '', ' ', 'workspace:*', 'invalid', 42, {}])
    assert.throws(
      () =>
        assertCompatibleTokensPeer({ peerDependencies: { '@veli-design/tokens': range } }, '0.9.1'),
      /must declare a valid .* peer range/,
    );
  for (const metadata of [undefined, null, {}, { peerDependencies: {} }])
    assert.throws(() => assertCompatibleTokensPeer(metadata, '0.9.1'), /peer range/);
});

test('tokens peer requires valid exact package version metadata', () => {
  for (const version of [undefined, null, '', 'invalid', '^0.9.1', 42, {}])
    assert.throws(() => assertCompatibleTokensPeer(uiPackage, version), /valid exact version/);
});

test('planned tokens release satisfies the UI peer before package versioning', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const ui = JSON.parse(await readFile(new URL('../packages/react/package.json', import.meta.url)));
  const tokens = JSON.parse(
    await readFile(new URL('../packages/tokens/package.json', import.meta.url)),
  );
  const plan = await getReleasePlan(root);
  const candidate =
    plan.releases.find(({ name }) => name === tokens.name)?.newVersion ?? tokens.version;
  assertCompatibleTokensPeer(ui, candidate);
});

test('UI requires tokens with high-contrast Button colors', async () => {
  const ui = JSON.parse(await readFile(new URL('../packages/react/package.json', import.meta.url)));
  for (const version of ['0.9.0', '0.9.1', '0.9.99', '0.10.0-rc.0', '0.12.0'])
    assert.throws(() => assertCompatibleTokensPeer(ui, version), /must satisfy UI peer/);
  for (const version of ['0.10.0', '0.10.1', '0.10.99', '0.11.0', '0.11.99'])
    assert.doesNotThrow(() => assertCompatibleTokensPeer(ui, version));
});
