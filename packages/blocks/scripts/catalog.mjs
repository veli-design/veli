// @ts-check

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, resolve, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';

/** @typedef {import('./manifest.d.ts').BlockManifest} BlockManifest */
/** @typedef {import('./manifest.d.ts').BundledFile} BundledFile */
/** @typedef {import('./manifest.d.ts').DependencyMap} DependencyMap */
/** @typedef {import('./manifest.d.ts').Provenance} Provenance */
/** @typedef {import('./manifest.d.ts').ValidatedBlock} ValidatedBlock */

export const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const sourceRoot = resolve(packageRoot, 'src');
/** @param {import('node:crypto').BinaryLike} bytes */
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
/** @param {string} path @returns {unknown} */
const json = (path) => JSON.parse(readFileSync(path, 'utf8'));
/** @param {string} message @returns {never} */
const fail = (message) => {
  throw new Error(`[blocks] ${message}`);
};

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @returns {value is DependencyMap} */
function isDependencyMap(value) {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');
}

/** @param {unknown} input @returns {asserts input is BlockManifest} */
export function validateManifest(input) {
  if (!isRecord(input)) fail('Manifest must be an object');
  const manifest = input;
  if (
    typeof manifest.id !== 'string' ||
    !/^[a-z][a-z0-9-]*$/.test(manifest.id) ||
    typeof manifest.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(manifest.version)
  )
    fail('Invalid block identity/version');
  if (
    typeof manifest.status !== 'string' ||
    !['experimental', 'stable', 'deprecated'].includes(manifest.status) ||
    typeof manifest.title !== 'string' ||
    !manifest.title ||
    typeof manifest.description !== 'string' ||
    !manifest.description
  )
    fail(`${manifest.id}: missing metadata`);
  if (
    !Array.isArray(manifest.files) ||
    !manifest.files.length ||
    !manifest.files.every((path) => typeof path === 'string') ||
    new Set(manifest.files).size !== manifest.files.length
  )
    fail(`${manifest.id}: invalid file inventory`);
  for (const key of ['dependencies', 'setupDependencies', 'testedDependencies']) {
    const dependencies = manifest[key];
    if (!isDependencyMap(dependencies)) fail(`Missing ${key}`);
    for (const [name, version] of Object.entries(dependencies)) {
      if (
        !/^(?:@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(name) ||
        !/^\d+\.\d+\.\d+$/.test(version.replace(/^[~^]/, ''))
      )
        fail(`Invalid dependency ${name}`);
    }
  }
}

/** @param {string} path @returns {string} */
export function safePath(path) {
  if (
    typeof path !== 'string' ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(path) ||
    path.split('/').some((part) => !part || part === '.' || part === '..')
  )
    fail(`Unsafe path: ${path}`);
  return path;
}

/** @param {string} directory @returns {ValidatedBlock} */
export function validateBlock(directory) {
  const manifest = json(resolve(directory, 'manifest.json'));
  validateManifest(manifest);
  const files = manifest.files.map((path) => {
    safePath(path);
    const fullPath = realpathSync(resolve(directory, path));
    if (relative(realpathSync(directory), fullPath).startsWith('..'))
      fail(`File escapes block: ${path}`);
    const bytes = readFileSync(fullPath);
    if (/\.[cm]?[jt]sx?$/.test(path)) {
      const source = ts.createSourceFile(
        path,
        bytes.toString('utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      /** @type {string[]} */
      const imports = [];
      /** @param {import('typescript').Node} node */
      function visit(node) {
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        )
          imports.push(node.moduleSpecifier.text);
        if (
          ts.isCallExpression(node) &&
          (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
            node.expression.getText(source) === 'require')
        ) {
          if (node.arguments.length !== 1 || !ts.isStringLiteral(node.arguments[0]))
            fail(`Nonliteral import in ${path}`);
          imports.push(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
      for (const specifier of imports) {
        if (specifier.startsWith('.')) {
          const target = posix.normalize(posix.join(posix.dirname(path), specifier));
          if (
            ![
              target,
              ...['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'].map(
                (suffix) => target + suffix,
              ),
            ].some((candidate) => manifest.files.includes(candidate))
          )
            fail(`Unlisted import ${specifier} in ${path}`);
        } else {
          const name = specifier.startsWith('@')
            ? specifier.split('/').slice(0, 2).join('/')
            : specifier.split('/')[0];
          if (!manifest.dependencies[name] || /^(next|astro)(\/|$)/.test(specifier))
            fail(`Undeclared/framework import ${specifier}`);
          if (name === '@tradenetcorp/veli-ui') {
            const uiPackage = json(resolve(packageRoot, '../ui/package.json'));
            if (!isRecord(uiPackage) || !isRecord(uiPackage.exports))
              fail('Invalid Veli UI export map');
            const exports = uiPackage.exports;
            if (!exports['.' + specifier.slice(name.length)] || specifier === name)
              fail(`Nonpublic Veli import ${specifier}`);
          }
        }
      }
    }
    return { path, bytes, sha256: sha256(bytes) };
  });
  const readme = readFileSync(resolve(directory, 'README.md'), 'utf8');
  const changelog = readFileSync(resolve(directory, 'CHANGELOG.md'), 'utf8');
  if (!changelog.includes(`## ${manifest.version}\n`))
    fail(`Missing changelog entry for ${manifest.id}@${manifest.version}`);
  return { manifest, files, readme, changelog };
}

/** @returns {ValidatedBlock[]} */
export function getBlocks() {
  return readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const block = validateBlock(resolve(sourceRoot, entry.name));
      if (block.manifest.id !== entry.name) fail('Directory and block ID differ');
      return block;
    })
    .sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
}

/** @returns {Provenance} */
export function getProvenance() {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: packageRoot,
    encoding: 'utf8',
  }).trim();
  const dirty = Boolean(
    execFileSync('git', ['status', '--porcelain', '--', 'src'], {
      cwd: packageRoot,
      encoding: 'utf8',
    }).trim(),
  );
  if (process.env.CI && dirty) fail('CI cannot publish uncommitted block source');
  return { sourceCommit, dirty };
}

/** @param {ValidatedBlock} block @param {Provenance} [provenance] @returns {BundledFile[]} */
export function bundleFiles(block, provenance = getProvenance()) {
  const { manifest, files } = block;
  const receipt = {
    schemaVersion: 1,
    id: manifest.id,
    version: manifest.version,
    ...provenance,
    sourceUrl: `https://github.com/tradenetcorp/veli/tree/${provenance.sourceCommit}/packages/blocks/src/${manifest.id}`,
    files: files.map(({ path, sha256 }) => ({ path, sha256 })),
  };
  const baseline = `.veli/blocks/${manifest.id}`;
  return [
    ...files.map(({ path, bytes }) => ({
      path: `components/blocks/${manifest.id}/${path}`,
      bytes,
    })),
    ...files.map(({ path, bytes }) => ({ path: `${baseline}/${path}`, bytes })),
    {
      path: `${baseline}/receipt.json`,
      bytes: Buffer.from(JSON.stringify(receipt, null, 2) + '\n'),
    },
    { path: 'README.md', bytes: Buffer.from(block.readme) },
    { path: 'CHANGELOG.md', bytes: Buffer.from(block.changelog) },
    { path: 'manifest.json', bytes: Buffer.from(JSON.stringify(manifest, null, 2) + '\n') },
  ];
}

/** Deterministic ustar archive: fixed metadata, exact source bytes, no shell tools. */
/** @param {ValidatedBlock} block @param {Provenance} [provenance] @returns {Buffer} */
export function archive(block, provenance = getProvenance()) {
  /** @type {Buffer[]} */
  const parts = [];
  for (const { path, bytes } of bundleFiles(block, provenance)) {
    if (Buffer.byteLength(path) > 100) fail(`Archive path too long: ${path}`);
    const header = Buffer.alloc(512);
    header.write(path, 0, 100);
    /** @param {number} value @param {number} offset @param {number} length */
    const octal = (value, offset, length) =>
      header.write(value.toString(8).padStart(length - 1, '0') + '\0', offset, length);
    octal(0o644, 100, 8);
    octal(0, 108, 8);
    octal(0, 116, 8);
    octal(bytes.length, 124, 12);
    octal(0, 136, 12);
    header.fill(32, 148, 156);
    header.write('0', 156);
    header.write('ustar\0', 257);
    header.write('00', 263);
    header.write(
      [...header]
        .reduce((a, b) => a + b, 0)
        .toString(8)
        .padStart(6, '0') + '\0 ',
      148,
      8,
    );
    parts.push(header, bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512));
  }
  return gzipSync(Buffer.concat([...parts, Buffer.alloc(1024)]));
}

/** @param {ValidatedBlock} block @returns {string} */
export function blockMarkdown(block) {
  const { manifest, readme, files, changelog } = block;
  const example = readFileSync(resolve(packageRoot, 'examples', `${manifest.id}-next.tsx`), 'utf8');
  return `# ${manifest.title}\n\n${manifest.description}\n\nStatus: **${manifest.status}** · Version: **${manifest.version}**\n\n[Download source and update baseline](/blocks/${manifest.id}/source.tar.gz)\n\n${readme.trim()}\n\n## Tested dependency baseline\n\n${Object.entries(
    manifest.testedDependencies,
  )
    .map(([name, version]) => `- ${name}: ${version}`)
    .join(
      '\n',
    )}\n\n## Next.js example\n\nCreate this adapter in a Client Component. Pass serializable data from server components; keep render callbacks in this adapter. Adjust the relative import to your destination.\n\n\`\`\`tsx\n${example.trimEnd()}\n\`\`\`\n\n## Source\n\n${files.map(({ path, bytes }) => `### ${path}\n\n\`\`\`${path.endsWith('tsx') ? 'tsx' : 'text'}\n${bytes.toString('utf8').trimEnd()}\n\`\`\``).join('\n\n')}\n\n## Changelog\n\n${changelog
    .replace(/^## /gm, '### ')
    .replace(/^### (Added|Changed|Fixed|Removed)/gm, '#### $1')
    .trim()}\n`;
}
