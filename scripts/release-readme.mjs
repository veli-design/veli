import fs from 'node:fs/promises';
import path from 'node:path';

import { extractReleaseContent } from './changeset-format.mjs';

export function createReleaseReadme(readme, releaseContent, version) {
  return `## What's new in ${version}\n\n${releaseContent.trim()}\n\n---\n\n${readme}`;
}

export async function withReleaseReadmes(packages, publish) {
  const originals = new Map();

  try {
    for (const pkg of packages) {
      if (!pkg.packageJson.name || pkg.packageJson.private) continue;

      const changelogPath = path.join(pkg.dir, 'CHANGELOG.md');
      const readmePath = path.join(pkg.dir, 'README.md');
      let changelog;

      try {
        changelog = await fs.readFile(changelogPath, 'utf8');
      } catch (error) {
        if (error.code === 'ENOENT') continue;
        throw error;
      }

      const exactHeading = `## ${pkg.packageJson.version}`;
      const hasExactHeading = changelog.replace(/\r\n/g, '\n').split('\n').includes(exactHeading);
      if (!hasExactHeading) continue;

      const releaseContent = extractReleaseContent(changelog, pkg.packageJson.version);

      const original = await fs.readFile(readmePath, 'utf8');
      originals.set(readmePath, original);
      await fs.writeFile(
        readmePath,
        createReleaseReadme(original, releaseContent, pkg.packageJson.version),
      );
    }

    return await publish();
  } finally {
    await Promise.all(
      [...originals].map(([readmePath, original]) => fs.writeFile(readmePath, original)),
    );
  }
}
