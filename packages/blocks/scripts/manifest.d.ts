export type BlockStatus = 'experimental' | 'stable' | 'deprecated';

export type DependencyMap = Record<string, string>;

/** The canonical, JSON-serializable contract for a copied Veli block. */
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

export interface BlockSourceFile {
  path: string;
  bytes: Buffer;
  sha256: string;
}

export interface ValidatedBlock {
  manifest: BlockManifest;
  files: BlockSourceFile[];
  readme: string;
  changelog: string;
}

export interface Provenance {
  sourceCommit: string;
  dirty: boolean;
}

export interface BundledFile {
  path: string;
  bytes: Buffer;
}
