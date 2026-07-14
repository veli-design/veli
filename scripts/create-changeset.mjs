#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import { cancel, confirm, isCancel, multiselect, outro, select, text } from '@clack/prompts';
import { getPackages } from '@manypkg/get-packages';

import { CHANGELOG_CATEGORIES } from './changeset-format.mjs';

function stopIfCancelled(value) {
  if (isCancel(value)) {
    cancel('Changeset creation cancelled.');
    process.exit(0);
  }
  return value;
}

async function createChangeset() {
  const cwd = process.cwd();
  const config = JSON.parse(await fs.readFile(path.join(cwd, '.changeset', 'config.json'), 'utf8'));
  const ignored = new Set(config.ignore ?? []);
  const { packages } = await getPackages(cwd);
  const publishablePackages = packages
    .filter(({ packageJson }) => packageJson.name && !packageJson.private)
    .filter(({ packageJson }) => !ignored.has(packageJson.name))
    .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name));

  const selectedPackages = stopIfCancelled(
    await multiselect({
      message: 'Which published packages need a release?',
      options: publishablePackages.map(({ packageJson }) => ({
        label: packageJson.name,
        value: packageJson.name,
      })),
      required: true,
    }),
  );

  const releases = [];
  for (const packageName of selectedPackages) {
    const type = stopIfCancelled(
      await select({
        message: `What release type does ${packageName} need?`,
        options: [
          { label: 'Patch', value: 'patch', hint: 'backwards-compatible fix' },
          { label: 'Minor', value: 'minor', hint: 'backwards-compatible feature' },
          { label: 'Major', value: 'major', hint: 'breaking change' },
        ],
      }),
    );
    releases.push({ name: packageName, type });
  }

  const sections = [];
  const availableCategories = new Set(CHANGELOG_CATEGORIES);

  do {
    const category = stopIfCancelled(
      await select({
        message: 'Which Keep a Changelog category describes this change?',
        options: [...availableCategories].map((value) => ({ label: value, value })),
      }),
    );
    const description = stopIfCancelled(
      await text({
        message: `Describe the ${category} change as one bullet.`,
        placeholder: 'Add a searchable CommandMenu component.',
        validate: (value) => (value?.trim() ? undefined : 'A description is required.'),
      }),
    ).trim();

    sections.push({ category, description });
    availableCategories.delete(category);

    if (availableCategories.size === 0) break;
  } while (
    stopIfCancelled(
      await confirm({
        message: 'Add another changelog category to this changeset?',
        initialValue: false,
      }),
    )
  );

  const frontmatter = releases.map(({ name, type }) => `'${name}': ${type}`).join('\n');
  const body = sections
    .map(({ category, description }) => `### ${category}\n\n- ${description}`)
    .join('\n\n');
  const contents = `---\n${frontmatter}\n---\n\n${body}\n`;
  const filename = `kac-${randomUUID().slice(0, 8)}.md`;
  const filepath = path.join(cwd, '.changeset', filename);

  await fs.writeFile(filepath, contents);
  outro(`Created .changeset/${filename}`);
}

function runRawChangesets(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['exec', 'changeset', ...args], { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve(code));
  });
}

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  await createChangeset();
} else if (['status', 'version', 'publish', 'pre', 'tag', 'init'].includes(rawArgs[0])) {
  const code = await runRawChangesets(rawArgs);
  process.exitCode = code;
} else {
  console.error('Use `pnpm changeset` to create a Veli changeset.');
  console.error('Use `pnpm changeset:raw` for the unmodified Changesets CLI.');
  process.exitCode = 1;
}
