import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  recordPublication,
  validatePublishedSnapshot,
  verifyPublishedPackages,
  versionManifest,
} from './published-packages.mjs';

const recorded = JSON.parse(
  await readFile(new URL('../releases/npm-bootstrap-2026-11-01.json', import.meta.url)),
);
function fixture() {
  const snapshot = structuredClone(recorded);
  const payload = Buffer.from('verified package fixture');
  const integrity = `sha512-${createHash('sha512').update(payload).digest('base64')}`;
  for (const p of Object.values(snapshot.packages)) {
    p.integrity = integrity;
    p.sha256 = createHash('sha256').update(payload).digest('hex');
  }
  const request = async (url, options) => {
    assert.equal(options.redirect, 'error');
    if (url.endsWith('.tgz')) return { status: 200, arrayBuffer: async () => payload };
    const [, name, version] = url.match(
      /^https:\/\/registry.npmjs.org\/(@veli-design\/[^/]+)\/(.+)$/,
    );
    return {
      status: 200,
      json: async () => ({
        name,
        version,
        dist: {
          integrity,
          tarball: `https://registry.npmjs.org/${name}/-/${name.split('/')[1]}-${version}.tgz`,
        },
      }),
    };
  };
  return { snapshot, request };
}

test('publication records require exact identities and immutable artifact evidence', () => {
  assert.equal(validatePublishedSnapshot(recorded), recorded);
  for (const mutate of [
    (s) => {
      s.sourceCommit = 'main';
    },
    (s) => {
      s.packages['@veli-design/react'].version = '^0.19.0';
    },
    (s) => {
      s.packages['@veli-design/react'].file = '../escape';
    },
    (s) => {
      delete s.packages['@veli-design/cli'];
    },
  ]) {
    const s = structuredClone(recorded);
    mutate(s);
    assert.throws(() => validatePublishedSnapshot(s));
  }
});

test('record and retry verify all three packages without publishing or registry authentication', async () => {
  const { snapshot, request } = fixture();
  const result = await recordPublication(versionManifest(snapshot), snapshot.sourceTree, request);
  assert.deepEqual(result.snapshot, snapshot);
  assert.equal((await verifyPublishedPackages(snapshot, request)).length, 3);
  assert.equal(result.artifacts.length, 3);
});

test('unavailable versions, changed bytes, identity, registry URL and integrity fail closed', async () => {
  for (const mutation of [
    (m) => {
      m.name = '@other/react';
    },
    (m) => {
      m.version = '999.0.0';
    },
    (m) => {
      m.dist.tarball = 'https://other.invalid/payload.tgz';
    },
    (m) => {
      m.dist.integrity = 'sha512-wrong';
    },
  ]) {
    const { snapshot, request } = fixture();
    await assert.rejects(
      verifyPublishedPackages(snapshot, async (url, options) => {
        const r = await request(url, options);
        if (url.endsWith('.tgz')) return r;
        const m = await r.json();
        mutation(m);
        return { status: 200, json: async () => m };
      }),
    );
  }
  const { snapshot, request } = fixture();
  await assert.rejects(
    verifyPublishedPackages(snapshot, async () => ({ status: 404 })),
    /Public npm read failed/,
  );
  await assert.rejects(
    verifyPublishedPackages(snapshot, (url, options) =>
      url.endsWith('.tgz')
        ? { status: 200, arrayBuffer: async () => Buffer.from('tampered') }
        : request(url, options),
    ),
    /integrity differs/,
  );
  snapshot.packages['@veli-design/react'].sha256 = '0'.repeat(64);
  await assert.rejects(verifyPublishedPackages(snapshot, request), /changed bytes/);
});

test('publication records distinguish delayed controller from the actual validated source', () => {
  const { snapshot } = fixture();
  snapshot.execution = {
    repository: 'veli-design/veli',
    controllerCommit: 'f'.repeat(40),
    validatedCommit: snapshot.sourceCommit,
    run: 123,
    attempt: 2,
  };
  validatePublishedSnapshot(snapshot);
  for (const change of [
    { validatedCommit: 'a'.repeat(40) },
    { controllerCommit: 'bad' },
    { run: 0 },
    { attempt: NaN },
  ])
    assert.throws(() =>
      validatePublishedSnapshot({ ...snapshot, execution: { ...snapshot.execution, ...change } }),
    );
});
