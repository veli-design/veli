import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const targets = {
  '@veli-design/react': ['react', 'ui.tgz'],
  '@veli-design/tokens': ['tokens', 'tokens.tgz'],
  '@veli-design/cli': ['cli', 'cli.tgz'],
};
export function validateBootstrapSnapshot(snapshot) {
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
  return snapshot;
}
export async function verifyBootstrapSource(snapshot, sourceRef, sourceRoot) {
  validateBootstrapSnapshot(snapshot);
  assert.equal(sourceRef, snapshot.sourceCommit, 'Only the reviewed bootstrap source is allowed');
  const git = (...args) =>
    execFileSync('git', ['-C', sourceRoot, ...args], { encoding: 'utf8' }).trim();
  assert.equal(git('rev-parse', 'HEAD'), snapshot.sourceCommit);
  assert.equal(git('rev-parse', 'HEAD^{tree}'), snapshot.sourceTree);
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Source must be clean');
  for (const [name, [directory]] of Object.entries(targets)) {
    const pkg = JSON.parse(
      await readFile(resolve(sourceRoot, 'packages', directory, 'package.json')),
    );
    assert.equal(pkg.name, name);
    assert.equal(pkg.version, snapshot.packages[name].version);
  }
}
export async function verifyPublishedBootstrap(snapshot, request = fetch) {
  validateBootstrapSnapshot(snapshot);
  const artifacts = [];
  const get = async (url) => {
    const result = await request(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.equal(result.status, 200, `Public npm read failed: ${url}`);
    return result;
  };
  for (const [name, item] of Object.entries(snapshot.packages)) {
    const metadata = await (await get(`https://registry.npmjs.org/${name}/${item.version}`)).json();
    assert.equal(metadata.name, name);
    assert.equal(metadata.version, item.version);
    assert.equal(metadata.dist.integrity, item.integrity, `${name}: registry integrity changed`);
    const expected = `https://registry.npmjs.org/${name}/-/${name.split('/')[1]}-${item.version}.tgz`;
    assert.equal(metadata.dist.tarball, expected, `${name}: unexpected registry artifact URL`);
    const response = await get(expected);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.ok(bytes.length > 0 && bytes.length < 10 * 1024 * 1024, 'Unexpected artifact size');
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      item.sha256,
      `${name}: changed bytes`,
    );
    assert.equal(`sha512-${createHash('sha512').update(bytes).digest('base64')}`, item.integrity);
    artifacts.push({ name, ...item, bytes });
  }
  return artifacts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [sourceRef, sourceRoot, output] = process.argv.slice(2);
  assert.ok(
    sourceRef && sourceRoot && output,
    'Expected source ref, source checkout and new output directory',
  );
  const snapshot = JSON.parse(
    await readFile(new URL('../releases/npm-bootstrap-2026-11-01.json', import.meta.url)),
  );
  await verifyBootstrapSource(snapshot, sourceRef, resolve(sourceRoot));
  const artifacts = await verifyPublishedBootstrap(snapshot);
  await mkdir(resolve(output)); // Never overwrite prior evidence or artifacts.
  for (const item of artifacts) await writeFile(resolve(output, item.file), item.bytes);
  const manifest = {
    schema: 1,
    sourceCommit: snapshot.sourceCommit,
    packages: Object.fromEntries(artifacts.map((a) => [a.name, a.version])),
  };
  await writeFile(
    resolve(output, 'release-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  await writeFile(
    resolve(output, 'publication-verification.json'),
    JSON.stringify(
      { ...snapshot, verifiedAt: new Date().toISOString(), registry: 'https://registry.npmjs.org' },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Verified ${artifacts.length} published artifacts for ${sourceRef}; no publication performed.`,
  );
}
