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

export function mergeDependencyRequirements(requirements: readonly DependencyMap[]): DependencyMap {
  const ranges = new Map<string, Set<string>>();
  for (const dependencies of requirements) {
    for (const [name, range] of Object.entries(dependencies)) {
      const entries = ranges.get(name) ?? new Set<string>();
      entries.add(range);
      ranges.set(name, entries);
    }
  }

  return Object.fromEntries(
    [...ranges]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, entries]) => {
        // Manifest ranges are exact, caret or tilde ranges. Joining them forms
        // their intersection, so every selected block's requirement is retained.
        const range = [...entries].sort().join(' ');
        const minimum = semver.minVersion(range);
        if (!minimum || !semver.satisfies(minimum, range))
          throw new Error(
            `Conflicting block requirements for ${name}: ${[...entries].sort().join(', ')}`,
          );
        return [name, range];
      }),
  );
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

export async function installDependencies(
  cwd: string,
  packages: string[],
  json = false,
): Promise<void> {
  if (!packages.length) return;
  const detected = await detect({ cwd });
  if (!detected || detected.name === 'deno')
    throw new Error('Could not detect a supported npm package manager.');
  const command = resolveCommand(detected.agent, 'add', packages);
  if (!command) throw new Error(`Cannot construct an install command for ${detected.name}.`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command.command, command.args, {
      cwd,
      stdio: json ? ['inherit', 'ignore', 'inherit'] : 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${detected.name} exited with code ${code}.`)),
    );
  });
}
