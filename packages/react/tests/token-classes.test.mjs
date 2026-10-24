import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { twMerge } from 'tailwind-merge';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', 'src');
const designTokensPath = join(__dirname, '..', '..', 'tokens', 'src', 'design.tokens.json');
const bareTextBasePattern = /(?<![A-Za-z0-9-])text-base(?![A-Za-z0-9-])/g;

function collectTokenNames(value, path = [], names = new Set()) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return names;
  }

  if ('$type' in value) {
    names.add(path.join('-'));
  }

  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith('$')) {
      collectTokenNames(child, [...path, key], names);
    }
  }

  return names;
}

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

test('UI semantic border utilities reference canonical DTCG tokens', () => {
  const designTokens = JSON.parse(readFileSync(designTokensPath, 'utf8'));
  const semanticBorderNames = collectTokenNames(designTokens.color.border);
  const semanticBorderRoots = new Set(
    Object.keys(designTokens.color.border).filter((key) => !key.startsWith('$')),
  );
  semanticBorderRoots.add('default');
  const findings = [];
  const sourceFiles = readdirSync(sourceDir, { recursive: true })
    .filter((filename) => /\.(?:ts|tsx)$/.test(filename))
    .sort();

  for (const filename of sourceFiles) {
    const source = readFileSync(join(sourceDir, filename), 'utf8');
    const borderUtilityPattern = /(?<![a-z0-9-])border-([a-z0-9-]+)/g;
    const crossPropertyUtilityPattern = /(?:bg|text)-border-([a-z0-9-]+)/g;

    for (const match of source.matchAll(borderUtilityPattern)) {
      const tokenName = match[1];
      const tokenRoot = tokenName.split('-')[0];

      if (
        tokenName.startsWith('border-') ||
        (semanticBorderRoots.has(tokenRoot) && !semanticBorderNames.has(tokenName))
      ) {
        const line = source.slice(0, match.index).split('\n').length;
        findings.push(`${filename}:${line} (${match[0]})`);
      }
    }

    for (const match of source.matchAll(crossPropertyUtilityPattern)) {
      if (!semanticBorderNames.has(match[1])) {
        const line = source.slice(0, match.index).split('\n').length;
        findings.push(`${filename}:${line} (${match[0]})`);
      }
    }
  }

  assert.deepEqual(findings, []);
});
