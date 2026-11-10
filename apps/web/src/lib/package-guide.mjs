import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

/**
 * @param {{ markdownFile: string, versionFile: string }} projection
 */
export function readPackageGuide(projection) {
  const absolutePath = resolve(repoRoot, projection.markdownFile);
  const markdown = readFileSync(absolutePath, 'utf8');
  const versionFile = JSON.parse(readFileSync(resolve(repoRoot, projection.versionFile), 'utf8'));
  const version = versionFile.version;
  const title = packageGuideTitle(markdown);
  const description = packageGuideDescription(markdown);

  if (typeof version !== 'string' || version.length === 0) {
    throw new Error(`[package-guide] ${projection.versionFile} is missing a version`);
  }

  return { absolutePath, markdown, version, title, description };
}

/**
 * @param {string} markdown
 */
export function packageGuideTitle(markdown) {
  const line = markdown.split(/\r?\n/).find((entry) => entry.startsWith('# '));
  if (!line) throw new Error('[package-guide] the package guide is missing an H1');
  return line.slice(2).trim();
}

/**
 * @param {string} markdown
 */
export function packageGuideDescription(markdown) {
  const lines = markdown.split(/\r?\n/);
  let seenTitle = false;
  /** @type {string[]} */
  const paragraph = [];

  for (const line of lines) {
    if (!seenTitle) {
      if (line.startsWith('# ')) seenTitle = true;
      continue;
    }
    if (paragraph.length === 0 && line.trim() === '') continue;
    if (line.trim() === '') break;
    paragraph.push(line.trim());
  }

  const description = paragraph.join(' ');
  if (!description) throw new Error('[package-guide] the package guide is missing a description');
  return description;
}
