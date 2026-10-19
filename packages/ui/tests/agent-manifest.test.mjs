import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, URL } from 'node:url';

const uiDir = fileURLToPath(new URL('../', import.meta.url));
const repoDir = fileURLToPath(new URL('../../../', import.meta.url));
const agentDir = path.join(uiDir, 'agent');
const componentDir = path.join(agentDir, 'components');

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

const packageJson = await readJson(path.join(uiDir, 'package.json'));
const tokensPackageJson = await readJson(path.join(repoDir, 'packages/tokens/package.json'));
const manifest = await readJson(path.join(agentDir, 'manifest.json'));
const manifestComponents = manifest.groups.flatMap((group) => group.components);
const manifestIds = manifestComponents.map((component) => component.id);
const manifestIdSet = new Set(manifestIds);
const nonComponentExports = new Set([
  './package.json',
  './tailwind',
  './manifest',
  './theme-script',
  // Form helpers are documented under patterns/forms, not the component catalog.
  './form',
]);
const componentExportSlugs = Object.keys(packageJson.exports)
  .filter((exportPath) => !nonComponentExports.has(exportPath))
  .map((exportPath) => exportPath.slice(2));

test('agent manifest is a complete index of public component exports', () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(new Set(manifest.groups.map((group) => group.id)).size, manifest.groups.length);
  assert.equal(manifestIdSet.size, manifestIds.length);
  assert.deepEqual([...manifestIdSet].sort(), componentExportSlugs.sort());
});

test('manifest entries point to published declarations and metadata', async () => {
  for (const component of manifestComponents) {
    assert.equal(component.importPath, `${packageJson.name}/${component.id}`);
    assert.equal(component.declaration, `../dist/${component.id}.d.ts`);
    assert.equal(component.metadata, `./components/${component.id}.json`);
    assert.equal(packageJson.exports[`./${component.id}`].types, `./dist/${component.id}.d.ts`);
    assert.equal(component.source, undefined);
    assert.equal(component.docs, undefined);
    assert.equal(component.storybook, undefined);

    await fs.access(path.join(agentDir, component.metadata));

    const sourceCandidates = [`src/${component.id}.tsx`, `src/${component.id}.ts`];
    const sourceExists = await Promise.all(
      sourceCandidates.map(async (relativePath) => {
        try {
          await fs.access(path.join(uiDir, relativePath));
          return true;
        } catch {
          return false;
        }
      }),
    );
    assert.ok(sourceExists.some(Boolean), `${component.id} is missing a src file`);

    const docsPath = path.join(repoDir, 'apps/web/src/content/docs', `${component.id}.mdx`);
    const docsSource = await fs.readFile(docsPath, 'utf8');
    const docsTitle = docsSource.match(/^title:\s*(.+)$/m)?.[1]?.trim();
    assert.equal(docsTitle, component.name);

    if (component.id === 'provider') {
      continue;
    }

    await fs.access(
      path.join(repoDir, 'apps/storybook/src/stories', `${component.id}.stories.tsx`),
    );
  }
});

test('component sidecars contain semantic guidance without duplicating TypeScript APIs', async () => {
  const sidecarFiles = (await fs.readdir(componentDir))
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();
  assert.deepEqual(sidecarFiles, manifestIds.map((id) => `${id}.json`).sort());

  const apiPatterns = new Set(['flat', 'data-driven', 'compound', 'multi-part', 'provider']);
  const providerModes = new Set(['required', 'recommended', 'optional']);
  const listKeys = [
    'useWhen',
    'avoidWhen',
    'supportedInteractions',
    'approvedPatterns',
    'limitations',
    'accessibility',
    'responsive',
    'rtl',
    'relatedComponents',
  ];
  const forbiddenKeys = ['props', 'variants', 'defaults', 'status', 'tokens'];

  for (const fileName of sidecarFiles) {
    const sidecar = await readJson(path.join(componentDir, fileName));
    const expectedId = path.basename(fileName, '.json');

    assert.equal(sidecar.$schema, '../component.schema.json');
    assert.equal(sidecar.schemaVersion, 1);
    assert.equal(sidecar.id, expectedId);
    assert.ok(apiPatterns.has(sidecar.apiPattern));
    assert.equal(typeof sidecar.purpose, 'string');
    assert.ok(sidecar.purpose.length > 0);
    assert.equal(sidecar.runtime.clientComponent, true);
    assert.ok(providerModes.has(sidecar.runtime.provider));
    assert.ok(sidecar.useWhen.length > 0);

    for (const key of listKeys) assert.ok(Array.isArray(sidecar[key]), `${expectedId}.${key}`);
    for (const key of forbiddenKeys) assert.ok(!(key in sidecar), `${expectedId}.${key}`);

    for (const relatedId of sidecar.relatedComponents) {
      assert.ok(manifestIdSet.has(relatedId), `${expectedId} references unknown ${relatedId}`);
    }
    for (const alternative of sidecar.avoidWhen.flatMap((item) => item.useInstead ?? [])) {
      assert.ok(manifestIdSet.has(alternative), `${expectedId} references unknown ${alternative}`);
    }
  }
});

test('docs only use published Veli UI subpath imports', async () => {
  const docsDir = path.join(repoDir, 'apps/web/src/content/docs');
  const docsFiles = (await fs.readdir(docsDir)).filter((fileName) => fileName.endsWith('.mdx'));
  const importPattern = /@tradenetcorp\/veli-ui\/([a-z0-9-]+)/g;

  assert.deepEqual(
    docsFiles.map((fileName) => path.basename(fileName, '.mdx')).sort(),
    [...manifestIdSet].sort(),
  );

  for (const fileName of docsFiles) {
    const source = await fs.readFile(path.join(docsDir, fileName), 'utf8');
    for (const [, slug] of source.matchAll(importPattern)) {
      assert.ok(packageJson.exports[`./${slug}`], `${fileName} imports unknown ${slug}`);
    }
  }
});

test('published package includes the manifest, guide, and recipes', () => {
  assert.equal(packageJson.exports['./manifest'], './agent/manifest.json');
  for (const publishedPath of ['agent', 'AGENT_GUIDE.md']) {
    assert.ok(packageJson.files.includes(publishedPath));
  }
});

test('Veli tokens are an explicit compatible UI peer', () => {
  assert.equal(
    packageJson.peerDependencies['@tradenetcorp/veli-tokens'],
    `^${tokensPackageJson.version}`,
  );
  assert.equal(packageJson.devDependencies['@tradenetcorp/veli-tokens'], 'workspace:*');
});
