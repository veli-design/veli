import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

/**
 * Prefer Corepack next to the active Node binary (works when `spawn('corepack')`
 * cannot launch Windows `.cmd` shims without a shell). Fall back to PATH-based
 * `corepack` for installs that keep Corepack separate (for example Homebrew).
 *
 * @returns {{ mode: 'node', cli: string } | { mode: 'path' }}
 */
export function resolveCorepackInvocation() {
  const execDir = dirname(process.execPath);
  const candidates = [
    join(execDir, 'node_modules', 'corepack', 'dist', 'corepack.js'),
    join(execDir, '..', 'lib', 'node_modules', 'corepack', 'dist', 'corepack.js'),
  ];
  const cli = candidates.find((candidate) => existsSync(candidate));
  if (cli != null) return { mode: 'node', cli };
  return { mode: 'path' };
}

/**
 * @param {readonly string[]} args
 * @returns {{ command: string, args: string[], options: { shell?: boolean } }}
 */
export function corepackSpawnTarget(args) {
  const resolved = resolveCorepackInvocation();
  if (resolved.mode === 'node') {
    return { command: process.execPath, args: [resolved.cli, ...args], options: {} };
  }
  // PATH fallback: shell is required on Windows so `.cmd` shims resolve.
  return {
    command: 'corepack',
    args: [...args],
    options: { shell: process.platform === 'win32' },
  };
}

/**
 * @param {readonly string[]} args
 * @param {import('node:child_process').SpawnOptions} [options]
 */
export function spawnCorepack(args, options = {}) {
  const target = corepackSpawnTarget(args);
  return spawn(target.command, target.args, { ...options, ...target.options });
}

/**
 * @param {readonly string[]} args
 * @param {import('node:child_process').SpawnSyncOptions} [options]
 */
export function spawnSyncCorepack(args, options = {}) {
  const target = corepackSpawnTarget(args);
  return spawnSync(target.command, target.args, { ...options, ...target.options });
}
