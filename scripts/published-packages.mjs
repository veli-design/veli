// Verify installed public artifacts against the expected release.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateManifest } from './release-sites.mjs';

export const targets = {
  '@veli-design/react': ['react', 'ui.tgz'],
  '@veli-design/tokens': ['tokens', 'tokens.tgz'],
  '@veli-design/cli': ['cli', 'cli.tgz'],
};
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const integrity = (bytes) => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const json = (value) => JSON.stringify(value, null, 2) + '\n';

export function validatePublishedSnapshot(snapshot) {
  assert.equal(snapshot.schema, 1);
  for (const key of ['sourceCommit', 'sourceTree']) assert.match(snapshot[key], /^[a-f0-9]{40}$/);
  assert.deepEqual(Object.keys(snapshot.packages).sort(), Object.keys(targets).sort());
  for (const [name, [, file]] of Object.entries(targets)) {
    const item = snapshot.packages[name];
    assert.equal(item.file, file);
    assert.match(item.version, /^\d+\.\d+\.\d+$/);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.match(item.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/);
  }
  if (snapshot.execution) {
    assert.match(snapshot.execution.repository, /^[^/]+\/[^/]+$/);
    assert.match(snapshot.execution.controllerCommit, /^[a-f0-9]{40}$/);
    assert.equal(snapshot.execution.validatedCommit, snapshot.sourceCommit);
    for (const key of ['run', 'attempt'])
      assert.ok(Number.isSafeInteger(snapshot.execution[key]) && snapshot.execution[key] > 0);
  }
  return snapshot;
}

export function versionManifest(snapshot) {
  validatePublishedSnapshot(snapshot);
  return {
    schema: 1,
    sourceCommit: snapshot.sourceCommit,
    packages: Object.fromEntries(
      Object.entries(snapshot.packages).map(([name, p]) => [name, p.version]),
    ),
  };
}

async function artifact(name, version, request) {
  assert.ok(name in targets);
  assert.match(version, /^\d+\.\d+\.\d+$/);
  const get = async (url) => {
    const response = await request(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `Public npm read failed: ${url}`);
    return response;
  };
  const metadata = await (await get(`https://registry.npmjs.org/${name}/${version}`)).json();
  assert.equal(metadata.name, name);
  assert.equal(metadata.version, version);
  assert.match(metadata.dist.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/);
  const url = `https://registry.npmjs.org/${name}/-/${name.split('/')[1]}-${version}.tgz`;
  assert.equal(metadata.dist.tarball, url, `${name}: unexpected registry artifact URL`);
  const response = await get(url);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.ok(bytes.length > 0 && bytes.length < 10 * 1024 * 1024, 'Unexpected artifact size');
  assert.equal(integrity(bytes), metadata.dist.integrity, `${name}: registry integrity differs`);
  return {
    name,
    version,
    file: targets[name][1],
    sha256: sha256(bytes),
    integrity: integrity(bytes),
    bytes,
  };
}

export async function verifyPublishedPackages(snapshot, request = fetch) {
  validatePublishedSnapshot(snapshot);
  const artifacts = [];
  for (const [name, expected] of Object.entries(snapshot.packages)) {
    const downloaded = await artifact(name, expected.version, request);
    assert.equal(downloaded.integrity, expected.integrity, `${name}: registry integrity changed`);
    assert.equal(downloaded.sha256, expected.sha256, `${name}: changed bytes`);
    artifacts.push(downloaded);
  }
  return artifacts;
}

export async function recordPublication(manifest, sourceTree, request = fetch) {
  validateManifest(manifest);
  assert.deepEqual(Object.keys(manifest.packages).sort(), Object.keys(targets).sort());
  assert.match(sourceTree, /^[a-f0-9]{40}$/);
  const artifacts = [];
  for (const [name, version] of Object.entries(manifest.packages))
    artifacts.push(await artifact(name, version, request));
  const snapshot = validatePublishedSnapshot({
    schema: 1,
    sourceCommit: manifest.sourceCommit,
    sourceTree,
    packages: Object.fromEntries(
      artifacts.map(({ name, version, file, sha256, integrity }) => [
        name,
        { version, file, sha256, integrity },
      ]),
    ),
  });
  return { snapshot, artifacts };
}

export async function writePublication(output, snapshot, artifacts) {
  await mkdir(resolve(output)); // Refuse to overwrite evidence.
  for (const a of artifacts) await writeFile(resolve(output, a.file), a.bytes);
  await writeFile(resolve(output, 'publication.json'), json(snapshot));
  await writeFile(resolve(output, 'release-manifest.json'), json(versionManifest(snapshot)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, input, output] = process.argv.slice(2);
  assert.ok(input && output, 'Expected publication record/manifest and new output directory');
  const value = JSON.parse(await readFile(input, 'utf8'));
  if (command === 'verify') {
    const artifacts = await verifyPublishedPackages(value);
    await writePublication(output, value, artifacts);
  } else if (command === 'record') {
    const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
    assert.equal(value.sourceCommit, git('rev-parse', 'HEAD'));
    const { snapshot, artifacts } = await recordPublication(value, git('rev-parse', 'HEAD^{tree}'));
    if (process.env.GITHUB_ACTIONS === 'true' && process.env.RELEASE_SOURCE) {
      assert.equal(process.env.RELEASE_SOURCE, snapshot.sourceCommit);
      snapshot.execution = {
        repository: process.env.GITHUB_REPOSITORY,
        controllerCommit: process.env.GITHUB_SHA,
        validatedCommit: snapshot.sourceCommit,
        run: Number(process.env.GITHUB_RUN_ID),
        attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      };
      validatePublishedSnapshot(snapshot);
    }
    await writePublication(output, snapshot, artifacts);
  } else throw new Error('Expected record or verify; this tool never publishes');
  console.log('Verified all three public npm artifacts; no publication performed.');
}
