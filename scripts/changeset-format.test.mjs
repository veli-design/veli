import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHANGELOG_CATEGORIES,
  extractReleaseContent,
  parseChangeset,
  updateChangelog,
} from './changeset-format.mjs';

const frontmatter = "---\n'@tradenetcorp/veli-ui': patch\n---";

test('accepts every Keep a Changelog category', () => {
  for (const category of CHANGELOG_CATEGORIES) {
    const changeset = parseChangeset(
      `${frontmatter}\n\n### ${category}\n\n- Describe a user-facing change.\n`,
      `${category}.md`,
    );

    assert.deepEqual(changeset.sections, [
      { category, entries: ['- Describe a user-facing change.'] },
    ]);
  }
});

test('accepts several category sections in one changeset', () => {
  const changeset = parseChangeset(
    `${frontmatter}\n\n### Added\n\n- Add a component.\n\n### Fixed\n\n- Correct its focus behaviour.\n`,
    'multiple-categories.md',
  );

  assert.deepEqual(changeset.sections, [
    { category: 'Added', entries: ['- Add a component.'] },
    { category: 'Fixed', entries: ['- Correct its focus behaviour.'] },
  ]);
});

test('allows an empty no-release changeset', () => {
  const changeset = parseChangeset('---\n---\n', 'empty.md');
  assert.equal(changeset.empty, true);
});

test('rejects malformed changelog entries', () => {
  assert.throws(
    () => parseChangeset(`${frontmatter}\n\n- Missing a category.\n`, 'missing.md'),
    /category heading/,
  );
  assert.throws(
    () => parseChangeset(`${frontmatter}\n\n### fixed\n\n- Wrong casing.\n`, 'case.md'),
    /must use one of/,
  );
  assert.throws(
    () =>
      parseChangeset(
        `${frontmatter}\n\n### Added\n\n- A feature.\n\n### Added\n\n- Another feature.\n`,
        'duplicate.md',
      ),
    /only once/,
  );
  assert.throws(
    () => parseChangeset(`${frontmatter}\n\n### Added\n\nNo bullet.\n`, 'bullet.md'),
    /Markdown bullets/,
  );
});

test('renders a dated, category-grouped release above legacy history', () => {
  const existing = '# @tradenetcorp/veli-ui\n\n## 0.7.2\n\n### Patch Changes\n\n- Legacy entry.\n';
  const changesets = [
    {
      empty: false,
      sections: [{ category: 'Fixed', entries: ['- Correct a focus-ring regression.'] }],
    },
    {
      empty: false,
      sections: [{ category: 'Added', entries: ['- Add a command menu component.'] }],
    },
  ];
  const rendered = updateChangelog(
    existing,
    '@tradenetcorp/veli-ui',
    '0.7.3',
    '2026-07-14',
    changesets,
  );

  assert.match(rendered, /## \[Unreleased\]\n\n## 0.7.3\n\n_Released 2026-07-14\._/);
  assert.ok(rendered.indexOf('### Added') < rendered.indexOf('### Fixed'));
  assert.ok(rendered.indexOf('## 0.7.2') > rendered.indexOf('## 0.7.3'));
  assert.match(rendered, /All notable changes to `@tradenetcorp\/veli-ui`/);
});

test('extracts only the exact version content used by release outputs', () => {
  const changelog = `# Package

## [Unreleased]

## 0.8.0

_Released 2026-07-19._

### Added

- Add a component.

## 0.7.2

### Patch Changes

- Legacy entry.
`;

  assert.equal(
    extractReleaseContent(changelog, '0.8.0'),
    '_Released 2026-07-19._\n\n### Added\n\n- Add a component.\n',
  );
  assert.throws(() => extractReleaseContent(changelog, '0.8'), /exact ## 0\.8/);
});

test('rejects an empty exact version section', () => {
  assert.throws(
    () => extractReleaseContent('# Package\n\n## 1.0.0\n\n## 0.9.0\n\n- Older.\n', '1.0.0'),
    /section is empty/,
  );
});
