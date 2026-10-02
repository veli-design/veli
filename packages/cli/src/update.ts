import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mergeDiff3 } from 'node-diff3';
import type { SourceArchive } from './client.js';
import { parseManifest, parseReceipt, sha256 } from './contracts.js';
import { blockState, type InstalledBlock } from './project.js';

interface UpdateState {
  schemaVersion: 1;
  id: string;
  fromVersion: string;
  toVersion: string;
  targetDir: string;
  paths: string[];
  absent: string[];
  conflicts: string[];
}

const exists = async (file: string) => {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
};

const text = (bytes: Buffer) => !bytes.subarray(0, 8192).includes(0);
const lines = (bytes: Buffer) => bytes.toString('utf8').split('\n');

const updateRoot = (cwd: string, id: string) => path.join(cwd, '.veli', 'updates', id);

async function writeCandidate(root: string, archive: SourceArchive, targetRelative: string) {
  const candidate = path.join(root, 'candidate');
  for (const [file, bytes] of archive.source) {
    const destination = path.join(candidate, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
  await writeFile(
    path.join(candidate, 'manifest.json'),
    JSON.stringify(archive.manifest, null, 2) + '\n',
  );
  await writeFile(
    path.join(candidate, 'receipt.json'),
    JSON.stringify(archive.receipt, null, 2) + '\n',
  );
  await writeFile(
    path.join(candidate, 'install.json'),
    JSON.stringify({ schemaVersion: 1, targetDir: targetRelative }, null, 2) + '\n',
  );
}

async function promoteCandidate(block: InstalledBlock, root: string) {
  const candidate = path.join(root, 'candidate');
  const [manifest, receipt] = await Promise.all([
    readFile(path.join(candidate, 'manifest.json'), 'utf8').then(JSON.parse).then(parseManifest),
    readFile(path.join(candidate, 'receipt.json'), 'utf8').then(JSON.parse).then(parseReceipt),
  ]);
  const inventory = new Set(manifest.files);
  if (
    manifest.id !== block.id ||
    receipt.id !== block.id ||
    manifest.version !== receipt.version ||
    receipt.dirty ||
    receipt.files.length !== manifest.files.length ||
    !receipt.files.every(({ path: file }) => inventory.has(file))
  )
    throw new Error(`${block.id} update candidate metadata failed verification.`);
  for (const file of receipt.files) {
    let bytes: Buffer;
    try {
      bytes = await readFile(path.join(candidate, file.path));
    } catch {
      throw new Error(`${block.id} update candidate is missing ${file.path}.`);
    }
    if (sha256(bytes) !== file.sha256)
      throw new Error(`${block.id} update candidate hash failed for ${file.path}.`);
  }
  const old = path.join(root, 'old-baseline');
  await rename(block.baselineDir, old);
  try {
    await rename(candidate, block.baselineDir);
  } catch (error) {
    await rename(old, block.baselineDir);
    throw error;
  }
  await rm(root, { recursive: true, force: true });
}

export async function updateBlock(
  cwd: string,
  block: InstalledBlock,
  archive: SourceArchive,
): Promise<{ conflicts: string[]; retained: string[] }> {
  const state = await blockState(block);
  if (!state.baselineValid) throw new Error(`${block.id} baseline failed receipt verification.`);
  if (archive.manifest.id !== block.id) throw new Error('Update archive identifies another block.');
  const root = updateRoot(cwd, block.id);
  if (await exists(root))
    throw new Error(`${block.id} has an unfinished update. Continue or abort it first.`);
  const targetRelative = path.relative(cwd, block.targetDir).replaceAll(path.sep, '/');
  const oldPaths = new Set(block.receipt.files.map(({ path: file }) => file));
  const newPaths = new Set(archive.manifest.files);
  const paths = [...new Set([...oldPaths, ...newPaths])].sort();
  const desired = new Map<string, Buffer | null>();
  const conflicts: string[] = [];
  const retained: string[] = [];
  for (const file of paths) {
    const base = oldPaths.has(file) ? await readFile(path.join(block.baselineDir, file)) : null;
    const remote = archive.source.get(file) ?? null;
    const workingPath = path.join(block.targetDir, file);
    const local = (await exists(workingPath)) ? await readFile(workingPath) : null;
    if (!base && remote) {
      if (!local || sha256(local) === sha256(remote)) desired.set(file, remote);
      else {
        conflicts.push(file);
        desired.set(file, local);
      }
      continue;
    }
    if (base && !remote) {
      if (!local || sha256(local) === sha256(base)) desired.set(file, null);
      else {
        retained.push(file);
        desired.set(file, local);
      }
      continue;
    }
    if (!base || !remote) continue;
    if (!local) {
      if (sha256(base) === sha256(remote)) desired.set(file, null);
      else if (text(base) && text(remote)) {
        const merged = mergeDiff3([], lines(base), lines(remote), {
          excludeFalseConflicts: true,
          label: {
            a: 'application',
            o: `veli ${block.receipt.version}`,
            b: `veli ${archive.receipt.version}`,
          },
        });
        desired.set(file, Buffer.from(merged.result.join('\n')));
        if (merged.conflict) conflicts.push(file);
      } else {
        conflicts.push(file);
        desired.set(file, null);
      }
    } else if (sha256(local) === sha256(base)) desired.set(file, remote);
    else if (sha256(remote) === sha256(base)) desired.set(file, local);
    else if (text(local) && text(base) && text(remote)) {
      const merged = mergeDiff3(lines(local), lines(base), lines(remote), {
        excludeFalseConflicts: true,
        label: {
          a: 'application',
          o: `veli ${block.receipt.version}`,
          b: `veli ${archive.receipt.version}`,
        },
      });
      desired.set(file, Buffer.from(merged.result.join('\n')));
      if (merged.conflict) conflicts.push(file);
    } else {
      conflicts.push(file);
      desired.set(file, local);
    }
  }

  await mkdir(path.join(root, 'backup'), { recursive: true });
  const absent: string[] = [];
  for (const file of paths) {
    const working = path.join(block.targetDir, file);
    if (await exists(working)) {
      const backup = path.join(root, 'backup', file);
      await mkdir(path.dirname(backup), { recursive: true });
      await writeFile(backup, await readFile(working));
    } else absent.push(file);
  }
  await writeCandidate(root, archive, targetRelative);
  const updateState: UpdateState = {
    schemaVersion: 1,
    id: block.id,
    fromVersion: block.receipt.version,
    toVersion: archive.receipt.version,
    targetDir: targetRelative,
    paths,
    absent,
    conflicts,
  };
  await writeFile(path.join(root, 'state.json'), JSON.stringify(updateState, null, 2) + '\n');
  for (const [file, bytes] of desired) {
    const destination = path.join(block.targetDir, file);
    if (bytes === null) await rm(destination, { force: true });
    else {
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, bytes);
    }
  }
  if (!conflicts.length) await promoteCandidate(block, root);
  return { conflicts, retained };
}

async function readUpdateState(
  cwd: string,
  id: string,
): Promise<{ root: string; state: UpdateState }> {
  const root = updateRoot(cwd, id);
  const state = JSON.parse(await readFile(path.join(root, 'state.json'), 'utf8')) as UpdateState;
  if (state.schemaVersion !== 1 || state.id !== id)
    throw new Error(`Invalid update state for ${id}.`);
  return { root, state };
}

export async function continueUpdate(cwd: string, block: InstalledBlock): Promise<void> {
  const { root, state } = await readUpdateState(cwd, block.id);
  for (const file of state.conflicts) {
    const working = path.join(block.targetDir, file);
    if (!(await exists(working))) continue;
    const bytes = await readFile(working);
    if (text(bytes) && /^<<<<<<< application$/m.test(bytes.toString('utf8')))
      throw new Error(`Resolve conflict markers in ${path.relative(cwd, working)} first.`);
  }
  await promoteCandidate(block, root);
}

export async function abortUpdate(cwd: string, block: InstalledBlock): Promise<void> {
  const { root, state } = await readUpdateState(cwd, block.id);
  for (const file of state.paths) {
    const working = path.join(block.targetDir, file);
    if (state.absent.includes(file)) await rm(working, { force: true });
    else {
      await mkdir(path.dirname(working), { recursive: true });
      await writeFile(working, await readFile(path.join(root, 'backup', file)));
    }
  }
  await rm(root, { recursive: true, force: true });
}

export async function hasPendingUpdate(cwd: string, id: string): Promise<boolean> {
  return exists(updateRoot(cwd, id));
}
