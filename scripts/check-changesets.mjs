#!/usr/bin/env node

import path from 'node:path';

import { getChangesetFiles, parseChangeset } from './changeset-format.mjs';
import fs from 'node:fs/promises';

const cwd = process.cwd();
const files = await getChangesetFiles(cwd);
const errors = [];

for (const file of files) {
  try {
    parseChangeset(await fs.readFile(file, 'utf8'), path.relative(cwd, file));
  } catch (error) {
    errors.push(`${path.relative(cwd, file)}: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error('Invalid Changeset authoring format:\n');
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    files.length === 0
      ? 'No pending changesets to validate.'
      : `Validated ${files.length} changeset${files.length === 1 ? '' : 's'}.`,
  );
}
