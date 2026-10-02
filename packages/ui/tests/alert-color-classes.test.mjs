import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(__dirname, '..', 'src', 'alert.tsx');
const themePath = join(__dirname, '..', '..', 'tokens', 'dist', 'tailwind-theme.css');

const utilityNamespaces = {
  text: ['text-color', 'color'],
  bg: ['background-color', 'color'],
  border: ['border-color', 'color'],
};

const nonColorValues = new Set(['current', 'transparent', 'inherit', 'white', 'black']);

function readThemeVariables() {
  assert.ok(existsSync(themePath), 'Build @tradenetcorp/veli-tokens before running this test.');
  const theme = readFileSync(themePath, 'utf8');
  return new Set(Array.from(theme.matchAll(/--([a-z0-9-]+):/g), (match) => match[1]));
}

test('Alert color utilities resolve from the Veli token theme', () => {
  const source = readFileSync(sourcePath, 'utf8');
  const themeVariables = readThemeVariables();
  const findings = [];
  const utilityPattern =
    /(?<![A-Za-z0-9-[,])(text|bg|border)-([a-z][a-z0-9-]*)(?![A-Za-z0-9[\]-])/g;

  for (const match of source.matchAll(utilityPattern)) {
    const [utility, prefix, value] = match;
    if (nonColorValues.has(value)) continue;

    const resolves = utilityNamespaces[prefix].some((namespace) =>
      themeVariables.has(`${namespace}-${value}`),
    );

    if (!resolves) {
      const line = source.slice(0, match.index).split('\n').length;
      findings.push(`${line} (${utility})`);
    }
  }

  assert.deepEqual(findings, []);
});
