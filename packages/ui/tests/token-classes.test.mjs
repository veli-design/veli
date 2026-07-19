import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { twMerge } from 'tailwind-merge';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', 'src');
const bareTextBasePattern = /(?<![A-Za-z0-9-])text-base(?![A-Za-z0-9-])/g;

test('text-base-default does not conflict with explicit typography in tailwind-merge', () => {
  assert.equal(twMerge('text-[10px] text-base'), 'text-base');
  assert.equal(twMerge('text-[10px] text-base-default'), 'text-[10px] text-base-default');
  assert.equal(
    twMerge('type-caption-regular text-base-default'),
    'type-caption-regular text-base-default',
  );
});

test('UI internals do not use ambiguous bare text-base color utilities', () => {
  const findings = [];
  const sourceFiles = readdirSync(sourceDir, { recursive: true })
    .filter((filename) => /\.(?:ts|tsx)$/.test(filename))
    .sort();

  for (const filename of sourceFiles) {
    const source = readFileSync(join(sourceDir, filename), 'utf8');

    for (const match of source.matchAll(bareTextBasePattern)) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${filename}:${line}`);
    }
  }

  assert.deepEqual(findings, []);
});
