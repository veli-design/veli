import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

/**
 * Resolve the Corepack JS entry next to the running Node binary.
 * Windows cannot `spawn('corepack')` without a shell (ENOENT on the .cmd shim).
 */
export function resolveCorepackCli() {
  const execDir = dirname(process.execPath);
  const candidates = [
    join(execDir, 'node_modules', 'corepack', 'dist', 'corepack.js'),
    join(execDir, '..', 'lib', 'node_modules', 'corepack', 'dist', 'corepack.js'),
  ];
  const cli = candidates.find((candidate) => existsSync(candidate));
  if (cli == null) {
    throw new Error(`Unable to locate corepack.js from ${process.execPath}`);
  }
  return cli;
}

/**
 * Arguments for `spawn(process.execPath, …)` / `spawnSync(process.execPath, …)`.
 * @param {readonly string[]} args
 */
export function corepackArgs(args) {
  return [resolveCorepackCli(), ...args];
}

/**
 * @param {readonly string[]} args
 * @param {import('node:child_process').SpawnOptions} [options]
 */
export function spawnCorepack(args, options = {}) {
  return spawn(process.execPath, corepackArgs(args), options);
}

/**
 * @param {readonly string[]} args
 * @param {import('node:child_process').SpawnSyncOptions} [options]
 */
export function spawnSyncCorepack(args, options = {}) {
  return spawnSync(process.execPath, corepackArgs(args), options);
}
