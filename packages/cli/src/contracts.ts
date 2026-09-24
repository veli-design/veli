import { createHash } from 'node:crypto';

export type DependencyMap = Record<string, string>;
export type BlockStatus = 'experimental' | 'stable' | 'deprecated';

export interface BlockManifest {
  id: string;
  title: string;
  version: string;
  status: BlockStatus;
  description: string;
  files: string[];
  dependencies: DependencyMap;
  setupDependencies: DependencyMap;
  testedDependencies: DependencyMap;
}

export interface Receipt {
  schemaVersion: 1;
  id: string;
  version: string;
  sourceCommit: string;
  dirty: boolean;
  sourceUrl: string;
  files: { path: string; sha256: string }[];
}

export interface CatalogVersion {
  version: string;
  sourceCommit: string;
  archiveUrl: string;
  archiveSha256: string;
}

export interface CatalogBlock {
  manifest: BlockManifest;
  documentationUrl: string;
  versions: CatalogVersion[];
}

export interface BlocksCatalog {
  schemaVersion: 1;
  blocks: CatalogBlock[];
}

export const sha256 = (bytes: Uint8Array | string) =>
  createHash('sha256').update(bytes).digest('hex');

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function safeRelativePath(value: string): string {
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(value) ||
    value.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new Error(`Unsafe relative path: ${value}`);
  return value;
}

function dependencies(value: unknown): value is DependencyMap {
  return (
    record(value) &&
    Object.entries(value).every(
      ([name, range]) =>
        /^(?:@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(name) &&
        typeof range === 'string' &&
        /^[~^]?\d+\.\d+\.\d+$/.test(range),
    )
  );
}

export function parseManifest(value: unknown): BlockManifest {
  if (!record(value)) throw new Error('Block manifest must be an object.');
  const manifest = value as Partial<BlockManifest>;
  if (
    typeof manifest.id !== 'string' ||
    !/^[a-z][a-z0-9-]*$/.test(manifest.id) ||
    typeof manifest.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(manifest.version) ||
    typeof manifest.title !== 'string' ||
    !manifest.title ||
    typeof manifest.description !== 'string' ||
    !manifest.description ||
    !['experimental', 'stable', 'deprecated'].includes(manifest.status ?? '') ||
    !Array.isArray(manifest.files) ||
    !manifest.files.length ||
    !manifest.files.every((path) => typeof path === 'string') ||
    new Set(manifest.files).size !== manifest.files.length ||
    !dependencies(manifest.dependencies) ||
    !dependencies(manifest.setupDependencies) ||
    !dependencies(manifest.testedDependencies)
  )
    throw new Error('Invalid block manifest.');
  manifest.files.forEach(safeRelativePath);
  return manifest as BlockManifest;
}

export function parseReceipt(value: unknown): Receipt {
  if (!record(value)) throw new Error('Block receipt must be an object.');
  const receipt = value as unknown as Receipt;
  if (
    receipt.schemaVersion !== 1 ||
    typeof receipt.id !== 'string' ||
    !/^[a-z][a-z0-9-]*$/.test(receipt.id) ||
    typeof receipt.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(receipt.version) ||
    typeof receipt.sourceCommit !== 'string' ||
    !/^[a-f0-9]{40}$/.test(receipt.sourceCommit) ||
    typeof receipt.dirty !== 'boolean' ||
    typeof receipt.sourceUrl !== 'string' ||
    !Array.isArray(receipt.files) ||
    !receipt.files.length
  )
    throw new Error('Invalid block receipt.');
  for (const file of receipt.files) {
    if (
      !record(file) ||
      typeof file.path !== 'string' ||
      typeof file.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/.test(file.sha256)
    )
      throw new Error('Invalid block receipt file entry.');
    safeRelativePath(file.path);
  }
  if (new Set(receipt.files.map(({ path }) => path)).size !== receipt.files.length)
    throw new Error('Block receipt contains duplicate file entries.');
  return receipt;
}

export function parseCatalog(value: unknown): BlocksCatalog {
  if (!record(value) || value.schemaVersion !== 1 || !Array.isArray(value.blocks))
    throw new Error('Unsupported Veli Blocks catalog.');
  const blocks = value.blocks.map((item) => {
    if (!record(item) || typeof item.documentationUrl !== 'string' || !Array.isArray(item.versions))
      throw new Error('Invalid Veli Blocks catalog entry.');
    const manifest = parseManifest(item.manifest);
    const versions = item.versions.map((version) => {
      if (
        !record(version) ||
        typeof version.version !== 'string' ||
        !/^\d+\.\d+\.\d+$/.test(version.version) ||
        typeof version.sourceCommit !== 'string' ||
        !/^[a-f0-9]{40}$/.test(version.sourceCommit) ||
        typeof version.archiveUrl !== 'string' ||
        typeof version.archiveSha256 !== 'string' ||
        !/^[a-f0-9]{64}$/.test(version.archiveSha256)
      )
        throw new Error(`Invalid version metadata for ${manifest.id}.`);
      return version as unknown as CatalogVersion;
    });
    if (!versions.some(({ version }) => version === manifest.version))
      throw new Error(`Catalog does not contain ${manifest.id}@${manifest.version}.`);
    return { manifest, documentationUrl: item.documentationUrl, versions };
  });
  return { schemaVersion: 1, blocks };
}
