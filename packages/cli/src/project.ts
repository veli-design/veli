import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BlockManifest,
  Receipt,
  parseManifest,
  parseReceipt,
  safeRelativePath,
  sha256,
} from './contracts.js';
import type { SourceArchive } from './client.js';

export interface InstalledBlock {
  id: string;
  baselineDir: string;
  targetDir: string;
  manifest: BlockManifest;
  receipt: Receipt;
}

export interface BlockState {
  baselineValid: boolean;
  customized: string[];
  missing: string[];
}

const inside = (root: string, relative: string) => {
  safeRelativePath(relative);
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(root + path.sep))
    throw new Error('Path escapes project.');
  return resolved;
};

const exists = async (file: string) => {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
};

export async function installedBlocks(cwd: string): Promise<InstalledBlock[]> {
  const root = path.join(cwd, '.veli', 'blocks');
  let names: string[];
  try {
    names = await readdir(root);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const blocks: InstalledBlock[] = [];
  for (const id of names.sort()) {
    const baselineDir = path.join(root, id);
    try {
      const [manifest, receipt, install] = await Promise.all([
        readFile(path.join(baselineDir, 'manifest.json'), 'utf8')
          .then(JSON.parse)
          .then(parseManifest),
        readFile(path.join(baselineDir, 'receipt.json'), 'utf8')
          .then(JSON.parse)
          .then(parseReceipt),
        readFile(path.join(baselineDir, 'install.json'), 'utf8').then(JSON.parse),
      ]);
      const manifestFiles = new Set(manifest.files);
      if (
        manifest.id !== id ||
        receipt.id !== id ||
        manifest.version !== receipt.version ||
        receipt.files.length !== manifest.files.length ||
        !receipt.files.every(({ path: file }) => manifestFiles.has(file)) ||
        install.schemaVersion !== 1 ||
        typeof install.targetDir !== 'string'
      )
        throw new Error(`Invalid installation metadata for ${id}.`);
      blocks.push({
        id,
        baselineDir,
        targetDir: inside(cwd, install.targetDir),
        manifest,
        receipt,
      });
    } catch (error) {
      throw new Error(`Cannot read installed block ${id}: ${(error as Error).message}`);
    }
  }
  return blocks;
}

export async function blockState(block: InstalledBlock): Promise<BlockState> {
  let baselineValid = true;
  const customized: string[] = [];
  const missing: string[] = [];
  for (const file of block.receipt.files) {
    const baseline = path.join(block.baselineDir, file.path);
    let original: Buffer;
    try {
      original = await readFile(baseline);
      if (sha256(original) !== file.sha256) baselineValid = false;
    } catch {
      baselineValid = false;
      continue;
    }
    const working = path.join(block.targetDir, file.path);
    try {
      if (sha256(await readFile(working)) !== file.sha256) customized.push(file.path);
    } catch {
      missing.push(file.path);
    }
  }
  return { baselineValid, customized, missing };
}

export async function installBlock(
  cwd: string,
  blocksDir: string,
  archive: SourceArchive,
  overwrite = false,
): Promise<InstalledBlock> {
  const id = archive.manifest.id;
  const targetRelative = `${blocksDir}/${id}`;
  const targetDir = inside(cwd, targetRelative);
  const baselineDir = path.join(cwd, '.veli', 'blocks', id);
  await preflightInstall(cwd, blocksDir, archive, overwrite);
  const staging = path.join(cwd, '.veli', '.staging', `${id}-${process.pid}-${Date.now()}`);
  const stagedTarget = path.join(staging, 'working');
  const stagedBaseline = path.join(staging, 'baseline');
  try {
    for (const [file, bytes] of archive.source) {
      for (const root of [stagedTarget, stagedBaseline]) {
        const destination = path.join(root, file);
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, bytes);
      }
    }
    await writeFile(
      path.join(stagedBaseline, 'manifest.json'),
      JSON.stringify(archive.manifest, null, 2) + '\n',
    );
    await writeFile(
      path.join(stagedBaseline, 'receipt.json'),
      JSON.stringify(archive.receipt, null, 2) + '\n',
    );
    await writeFile(
      path.join(stagedBaseline, 'install.json'),
      JSON.stringify({ schemaVersion: 1, targetDir: targetRelative }, null, 2) + '\n',
    );
    if (overwrite) {
      await rm(targetDir, { recursive: true, force: true });
      await rm(baselineDir, { recursive: true, force: true });
    }
    await mkdir(path.dirname(targetDir), { recursive: true });
    await mkdir(path.dirname(baselineDir), { recursive: true });
    await rename(stagedTarget, targetDir);
    await rename(stagedBaseline, baselineDir);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  return { id, baselineDir, targetDir, manifest: archive.manifest, receipt: archive.receipt };
}

export async function preflightInstall(
  cwd: string,
  blocksDir: string,
  archive: SourceArchive,
  overwrite = false,
): Promise<void> {
  const id = archive.manifest.id;
  const targetDir = inside(cwd, `${blocksDir}/${id}`);
  const baselineDir = path.join(cwd, '.veli', 'blocks', id);
  if ((await exists(baselineDir)) && !overwrite)
    throw new Error(`${id} is already installed. Use veli update.`);
  for (const file of archive.manifest.files) {
    const target = path.join(targetDir, file);
    if ((await exists(target)) && !overwrite)
      throw new Error(`${path.relative(cwd, target)} already exists; no files were changed.`);
  }
}

export async function restoreBlock(block: InstalledBlock): Promise<void> {
  const state = await blockState(block);
  if (!state.baselineValid) throw new Error(`${block.id} baseline failed receipt verification.`);
  for (const file of block.receipt.files) {
    const destination = path.join(block.targetDir, file.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, await readFile(path.join(block.baselineDir, file.path)));
  }
}
