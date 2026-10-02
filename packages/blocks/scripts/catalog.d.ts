import type {
  BlocksCatalog,
  BundledFile,
  Provenance,
  ValidatedBlock,
  VersionedBlock,
} from './manifest';

export const packageRoot: string;
export const sourceRoot: string;
export function sha256(bytes: import('node:crypto').BinaryLike): string;
export function validateManifest(
  input: unknown,
): asserts input is import('./manifest').BlockManifest;
export function safePath(path: string): string;
export function validateBlock(directory: string): ValidatedBlock;
export function getBlocks(): ValidatedBlock[];
export function getBlockVersions(
  current: ValidatedBlock,
  provenance?: Provenance,
): VersionedBlock[];
export function getProvenance(): Provenance;
export function bundleFiles(block: ValidatedBlock, provenance?: Provenance): BundledFile[];
export function sourceBundleFiles(block: ValidatedBlock, provenance?: Provenance): BundledFile[];
export function archive(block: ValidatedBlock, provenance?: Provenance): Buffer;
export function sourceArchive(block: ValidatedBlock, provenance?: Provenance): Buffer;
export function blocksCatalog(provenance?: Provenance): BlocksCatalog;
export function blockMarkdown(block: ValidatedBlock): string;
