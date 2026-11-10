import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docArea } from './doc-areas.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const gettingStartedDirectory = 'apps/web/src/content/getting-started';

/**
 * Tags that must keep an owner. New tags are allowed without editing this list.
 * The owner is the one Getting Started file whose body wins.
 */
export const requiredSetupFences = [
  { id: 'install', owner: 'installation.mdx' },
  { id: 'npmrc', owner: 'installation.mdx' },
  { id: 'css-imports', owner: 'installation.mdx' },
  { id: 'vite-plugin', owner: 'vite.mdx' },
  { id: 'client-theme', owner: 'vite.mdx' },
  { id: 'cli-init', owner: 'cli.mdx' },
  { id: 'font-sans', owner: 'fonts.mdx' },
  { id: 'font-dhivehi', owner: 'fonts.mdx' },
];

/**
 * Needles that may appear only in `allowed` repo-relative paths.
 * An empty list means the needle is forbidden on every scanned file.
 */
export const exclusiveSnippets = [
  {
    needle: '@font-face',
    allowed: [
      'apps/web/src/content/getting-started/fonts.mdx',
      'packages/tokens/README.md',
    ],
  },
  {
    needle: 'next/font',
    allowed: [
      'apps/web/src/content/getting-started/fonts.mdx',
      'packages/tokens/README.md',
    ],
  },
  {
    needle: 'next-themes',
    allowed: [
      'apps/web/src/content/getting-started/nextjs.mdx',
      // The provider stub heading keeps the anchor `#nextjs-with-next-themes` for one release.
      'apps/web/src/content/docs/provider.mdx',
    ],
  },
  {
    needle: '@veli-design/cli init',
    allowed: [
      'apps/web/src/content/getting-started/cli.mdx',
      'packages/cli/README.md',
    ],
  },
  {
    needle: 'pnpm dlx @veli-design/cli',
    // The published CLI README still shows this command. The package PR removes it.
    allowed: ['packages/cli/README.md'],
  },
  { needle: 'MV_Faseyha_Regular.ttf', allowed: [] },
  { needle: 'MV_A_Waheed_Bold_2.ttf', allowed: [] },
  { needle: 'MV_Aaamu_FK_Bold.ttf', allowed: [] },
];

const fencePattern = /```([^\n]*)\n([\s\S]*?)```/g;

/**
 * @param {string} repoPath
 */
function readRepoFile(repoPath) {
  return readFileSync(resolve(repoRoot, repoPath), 'utf8').replaceAll('\r\n', '\n');
}

function scannedFiles() {
  /** @type {string[]} */
  const files = [];

  function walk(directory) {
    const absolute = resolve(repoRoot, directory);
    for (const entry of readdir(absolute)) {
      const repoPath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) walk(repoPath);
      else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) files.push(repoPath);
    }
  }

  walk('apps/web/src/content');
  files.push(
    'apps/web/src/lib/blocks.ts',
    'packages/react/README.md',
    'packages/react/AGENT_GUIDE.md',
    'packages/tokens/README.md',
    'packages/cli/README.md',
  );
  return files;
}

function readdir(directory) {
  return readdirSync(directory, { withFileTypes: true });
}

/**
 * @param {string} source
 */
function readFences(source) {
  /** @type {{ id: string, body: string, index: number, length: number }[]} */
  const fences = [];
  for (const match of source.matchAll(fencePattern)) {
    const info = match[1] ?? '';
    const id = info.match(/(?:^|\s)setup=([a-z0-9-]+)(?:\s|$)/)?.[1];
    if (!id || match.index === undefined) continue;
    fences.push({
      id,
      body: match[2] ?? '',
      index: match.index,
      length: match[0].length,
    });
  }
  return fences;
}

/**
 * @param {string} ownerBody
 * @param {string} mirrorBody
 * @param {string} repoPath
 * @param {string} id
 */
function fenceDiff(ownerBody, mirrorBody, repoPath, id) {
  const lines = [`--- ${id} owner`, `+++ ${repoPath}`];
  const expected = ownerBody.split('\n');
  const actual = mirrorBody.split('\n');
  const count = Math.max(expected.length, actual.length);
  for (let index = 0; index < count; index += 1) {
    if (expected[index] === actual[index]) continue;
    if (expected[index] !== undefined) lines.push(`-${expected[index]}`);
    if (actual[index] !== undefined) lines.push(`+${actual[index]}`);
  }
  return lines.join('\n');
}

/**
 * @param {{ write: boolean }} options
 */
export function applySetupFences({ write }) {
  const files = scannedFiles();
  /** @type {Map<string, { repoPath: string, body: string, index: number, length: number }[]>} */
  const byId = new Map();

  for (const repoPath of files) {
    const source = readRepoFile(repoPath);
    for (const fence of readFences(source)) {
      const group = byId.get(fence.id) ?? [];
      group.push({ repoPath, body: fence.body, index: fence.index, length: fence.length });
      byId.set(fence.id, group);
    }
  }

  const requiredOwners = new Map(requiredSetupFences.map((fence) => [fence.id, fence.owner]));
  /** @type {string[]} */
  const diffs = [];

  for (const [id, occurrences] of byId) {
    const ownerName = requiredOwners.get(id);
    const gettingStarted = occurrences.filter((occurrence) =>
      occurrence.repoPath.startsWith(`${gettingStartedDirectory}/`),
    );
    const owners = ownerName
      ? gettingStarted.filter((occurrence) => occurrence.repoPath.endsWith(`/${ownerName}`))
      : gettingStarted.length === 1
        ? gettingStarted
        : [];

    if (owners.length !== 1) {
      throw new Error(
        `[setup-fences] setup=${id} needs exactly one owner in ${gettingStartedDirectory}. Found ${owners.length}.`,
      );
    }

    const owner = owners[0];
    if (!owner) throw new Error(`[setup-fences] setup=${id} is missing an owner`);

    for (const occurrence of occurrences) {
      if (occurrence === owner) continue;
      if (occurrence.body === owner.body) continue;
      diffs.push(fenceDiff(owner.body, occurrence.body, occurrence.repoPath, id));
      if (write) {
        const absolute = resolve(repoRoot, occurrence.repoPath);
        const source = readRepoFile(occurrence.repoPath);
        const next = `${source.slice(0, occurrence.index)}` +
          source.slice(occurrence.index, occurrence.index + occurrence.length).replace(
            occurrence.body,
            owner.body,
          ) +
          source.slice(occurrence.index + occurrence.length);
        writeFileSync(absolute, next);
      }
    }
  }

  for (const required of requiredSetupFences) {
    const occurrences = byId.get(required.id) ?? [];
    const owned = occurrences.some((occurrence) =>
      occurrence.repoPath.endsWith(`/${required.owner}`),
    );
    if (!owned) {
      throw new Error(
        `[setup-fences] ${required.owner} is missing the required setup=${required.id} fence`,
      );
    }
  }

  if (!write && diffs.length > 0) {
    throw new Error(`[setup-fences] fence bodies differ\n${diffs.join('\n')}`);
  }

  for (const snippet of exclusiveSnippets) {
    for (const repoPath of files) {
      if (snippet.allowed.includes(repoPath)) continue;
      if (readRepoFile(repoPath).includes(snippet.needle)) {
        throw new Error(`[setup-fences] ${repoPath} contains forbidden text "${snippet.needle}"`);
      }
    }
  }

  const engines = JSON.parse(readRepoFile('package.json')).engines?.node;
  const major = String(engines ?? '').match(/(\d+)/)?.[1];
  if (!major) throw new Error('[setup-fences] package.json engines.node is missing a major version');
  const phrase = `Node.js ${major} or newer`;
  const nodeFiles = [
    ...docArea('getting-started').frameworkGuides.map(
      (slug) => `${gettingStartedDirectory}/${slug}.mdx`,
    ),
    `${gettingStartedDirectory}/cli.mdx`,
  ];
  for (const repoPath of nodeFiles) {
    if (!readRepoFile(repoPath).includes(phrase)) {
      throw new Error(`[setup-fences] ${repoPath} must contain "${phrase}"`);
    }
  }
}
