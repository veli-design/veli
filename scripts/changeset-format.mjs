import fs from 'node:fs/promises';
import path from 'node:path';

import parseChangesetFile from '@changesets/parse';

export const CHANGELOG_CATEGORIES = [
  'Added',
  'Changed',
  'Deprecated',
  'Removed',
  'Fixed',
  'Security',
];

const categorySet = new Set(CHANGELOG_CATEGORIES);

export function parseKeepAChangelogSummary(summary, filename = 'changeset') {
  const lines = summary.trim().split(/\r?\n/);
  const sections = [];
  let currentSection;

  for (const line of lines) {
    const heading = line.match(/^### (.+)$/);
    if (heading) {
      const category = heading[1];
      if (!categorySet.has(category)) {
        throw new Error(`${filename} must use one of: ${CHANGELOG_CATEGORIES.join(', ')}.`);
      }
      if (sections.some((section) => section.category === category)) {
        throw new Error(`${filename} may contain each category heading only once.`);
      }

      currentSection = { category, entries: [] };
      sections.push(currentSection);
      continue;
    }

    if (line.trim() === '') continue;

    if (line.startsWith('- ')) {
      if (!currentSection) {
        throw new Error(`${filename} must start with a Keep a Changelog category heading.`);
      }
      currentSection.entries.push(line);
      continue;
    }

    if (line.startsWith('  ') && currentSection?.entries.length) {
      currentSection.entries[currentSection.entries.length - 1] += `\n${line}`;
      continue;
    }

    throw new Error(`${filename} entries must be Markdown bullets.`);
  }

  if (sections.length === 0) {
    throw new Error(`${filename} must start with a Keep a Changelog category heading.`);
  }

  for (const section of sections) {
    if (section.entries.length === 0) {
      throw new Error(`${filename} must contain at least one non-empty bullet per category.`);
    }
  }

  return { sections };
}

export function parseChangeset(contents, filename = 'changeset') {
  const parsed = parseChangesetFile(contents);

  if (parsed.releases.length === 0) {
    if (parsed.summary.trim() !== '') {
      throw new Error(`${filename} is an empty changeset and must not include a changelog entry.`);
    }

    return { ...parsed, empty: true };
  }

  return {
    ...parsed,
    empty: false,
    ...parseKeepAChangelogSummary(parsed.summary, filename),
  };
}

export async function getChangesetFiles(cwd) {
  const changesetDirectory = path.join(cwd, '.changeset');
  const entries = await fs.readdir(changesetDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .filter((entry) => entry.name !== 'README.md')
    .map((entry) => path.join(changesetDirectory, entry.name))
    .sort();
}

export async function readChangesets(cwd) {
  const files = await getChangesetFiles(cwd);
  const changesets = [];

  for (const file of files) {
    const contents = await fs.readFile(file, 'utf8');
    changesets.push({
      id: path.basename(file, '.md'),
      file,
      ...parseChangeset(contents, path.relative(cwd, file)),
    });
  }

  return changesets;
}

function ensurePreamble(existing, packageName) {
  if (/^## \[Unreleased\]$/m.test(existing)) return existing.trimEnd();

  const title = `# ${packageName}`;
  const titleIndex = existing.indexOf(title);
  const remainder =
    titleIndex === 0 ? existing.slice(title.length).trimStart() : existing.trimStart();

  return [
    title,
    '',
    `All notable changes to \`${packageName}\` will be documented in this file.`,
    '',
    'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
    '',
    '## [Unreleased]',
    '',
    remainder,
  ]
    .join('\n')
    .trimEnd();
}

export function renderReleaseSection(version, date, changesets) {
  const entriesByCategory = new Map(CHANGELOG_CATEGORIES.map((category) => [category, []]));

  for (const changeset of changesets) {
    if (changeset.empty) continue;
    for (const section of changeset.sections) {
      entriesByCategory.get(section.category).push(...section.entries);
    }
  }

  const sections = CHANGELOG_CATEGORIES.flatMap((category) => {
    const entries = entriesByCategory.get(category);
    return entries.length === 0 ? [] : [`### ${category}\n\n${entries.join('\n')}`];
  });

  if (sections.length === 0) {
    sections.push('### Changed\n\n- Updated internal package dependencies.');
  }

  return `## [${version}] - ${date}\n\n${sections.join('\n\n')}`;
}

export function updateChangelog(existing, packageName, version, date, changesets) {
  const changelog = ensurePreamble(existing, packageName);
  const releaseSection = renderReleaseSection(version, date, changesets);
  const unreleased = /^## \[Unreleased\]$/m.exec(changelog);

  if (!unreleased) {
    throw new Error(`Could not find the Unreleased section for ${packageName}.`);
  }

  const sectionEnd = unreleased.index + unreleased[0].length;
  const before = changelog.slice(0, sectionEnd);
  const after = changelog.slice(sectionEnd).trimStart();

  return `${before}\n\n${releaseSection}\n\n${after}`.trimEnd() + '\n';
}
