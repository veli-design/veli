import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, readdir, lstat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const licensingPackages = [
  {
    directory: 'react',
    name: '@veli-design/react',
    productName: 'Veli Design React component library',
    tarball: 'ui.tgz',
    notices: true,
  },
  {
    directory: 'tokens',
    name: '@veli-design/tokens',
    productName: 'Veli Design tokens',
    tarball: 'tokens.tgz',
    notices: false,
  },
  {
    directory: 'cli',
    name: '@veli-design/cli',
    productName: 'Veli Design CLI',
    tarball: 'cli.tgz',
    notices: true,
  },
];

export function packageNotices(source, directory) {
  const start = `<!-- BEGIN PACKAGE ${directory} -->`;
  const end = `<!-- END PACKAGE ${directory} -->`;
  assert.equal(source.split(start).length, 2, `Missing/duplicate ${directory} notice`);
  const section = source.split(start)[1];
  assert.equal(section.split(end).length, 2, `Missing/duplicate ${directory} notice end`);
  return section.split(end)[0].trim() + '\n';
}

// prepack stages only the extra notices. pnpm supplies workspace-root LICENSE.
export async function stagePackageLicensing(packageRoot = process.cwd()) {
  const pkg = licensingPackages.find(
    ({ directory }) => resolve(packageRoot) === resolve(repositoryRoot, 'packages', directory),
  );
  assert.ok(pkg, 'Expected a publishable workspace package');
  const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.name, pkg.name);
  const target = resolve(packageRoot, 'licensing');
  await mkdir(target, { recursive: true });
  assert.ok(!(await lstat(target)).isSymbolicLink(), 'Licensing directory must not be a symlink');
  const allowed = [
    'LICENSING.md',
    'CC-BY-4.0.txt',
    ...(pkg.notices ? ['THIRD_PARTY_NOTICES.md'] : []),
  ];
  for (const entry of await readdir(target)) {
    assert.ok(allowed.includes(entry), `Unexpected licensing artifact: ${entry}`);
    assert.ok((await lstat(resolve(target, entry))).isFile(), 'Expected regular notice files');
  }
  const template = await readFile(resolve(repositoryRoot, 'packaging/LICENSING.md'), 'utf8');
  const scope = template
    .replaceAll('{{PACKAGE_NAME}}', pkg.name)
    .replaceAll('{{PRODUCT_NAME}}', pkg.productName)
    .replaceAll('{{SOURCE_URL}}', manifest.homepage)
    .replaceAll(
      '{{THIRD_PARTY_NOTICE}}',
      pkg.notices
        ? 'See [third-party notices](THIRD_PARTY_NOTICES.md) beside this notice. External dependencies retain their own installed licence files.'
        : 'The Veli Design tokens package has no runtime dependencies or bundled third-party implementations. Build tools retain their own licences and are not included.',
    );
  assert.ok(!/\{\{/.test(scope), 'Unresolved staging template');
  await writeFile(resolve(target, 'LICENSING.md'), scope);
  await writeFile(
    resolve(target, 'CC-BY-4.0.txt'),
    await readFile(resolve(repositoryRoot, 'LICENSES/CC-BY-4.0.txt')),
  );
  if (pkg.notices) {
    await writeFile(
      resolve(target, 'THIRD_PARTY_NOTICES.md'),
      packageNotices(
        await readFile(resolve(repositoryRoot, 'THIRD_PARTY_NOTICES.md'), 'utf8'),
        pkg.directory,
      ),
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await stagePackageLicensing();
}
