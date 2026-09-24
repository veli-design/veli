import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { detect, resolveCommand } from 'package-manager-detector';
import semver from 'semver';
import type { DependencyMap } from './contracts.js';

export interface DependencyPlan {
  missing: string[];
  incompatible: { name: string; current: string; required: string }[];
}

export async function dependencyPlan(
  cwd: string,
  required: DependencyMap,
): Promise<DependencyPlan> {
  const packageJson = JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8'));
  const declared = {
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
    ...packageJson.dependencies,
  } as Record<string, string>;
  const missing: string[] = [];
  const incompatible: DependencyPlan['incompatible'] = [];
  for (const [name, range] of Object.entries(required)) {
    const current = declared[name];
    if (!current) missing.push(`${name}@${range}`);
    else if (
      semver.validRange(current) &&
      semver.validRange(range) &&
      !semver.intersects(current, range)
    )
      incompatible.push({ name, current, required: range });
  }
  return { missing, incompatible };
}

export async function installDependencies(cwd: string, packages: string[]): Promise<void> {
  if (!packages.length) return;
  const detected = await detect({ cwd });
  if (!detected || detected.name === 'deno')
    throw new Error('Could not detect a supported npm package manager.');
  const command = resolveCommand(detected.agent, 'add', packages);
  if (!command) throw new Error(`Cannot construct an install command for ${detected.name}.`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command.command, command.args, { cwd, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${detected.name} exited with code ${code}.`)),
    );
  });
}
