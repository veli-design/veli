#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

import getReleasePlan from '@changesets/get-release-plan';
import { getPackages } from '@manypkg/get-packages';

import { readChangesets, updateChangelog } from './changeset-format.mjs';

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}.`));
    });
  });
}

const cwd = process.cwd();
const pendingChangesets = await readChangesets(cwd);
const changesetsById = new Map(pendingChangesets.map((changeset) => [changeset.id, changeset]));
const releasePlan = await getReleasePlan(cwd);

await run('pnpm', ['exec', 'changeset', 'version', ...process.argv.slice(2)], cwd);

const { packages } = await getPackages(cwd);
const packagesByName = new Map(packages.map((pkg) => [pkg.packageJson.name, pkg]));
const date = new Date().toISOString().slice(0, 10);

for (const release of releasePlan.releases) {
  if (release.type === 'none') continue;

  const pkg = packagesByName.get(release.name);
  if (!pkg) continue;

  const relevantChangesets = (release.changesets ?? [])
    .map((id) => changesetsById.get(id))
    .filter(Boolean);
  const changelogPath = path.join(pkg.dir, 'CHANGELOG.md');
  const existing = await fs.readFile(changelogPath, 'utf8');
  const next = updateChangelog(
    existing,
    release.name,
    release.newVersion,
    date,
    relevantChangesets,
  );

  await fs.writeFile(changelogPath, next);
}
