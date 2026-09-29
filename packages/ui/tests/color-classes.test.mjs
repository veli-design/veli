import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(__dirname, '..', 'src');
const themePath = join(__dirname, '..', '..', 'tokens', 'dist', 'tailwind-theme.css');

/** Components audited for public release whose color utilities must all resolve. */
const auditedSources = ['dropzone.tsx'];

const utilityNamespaces = {
  text: ['text-color', 'color'],
  bg: ['background-color', 'color'],
  border: ['border-color', 'color'],
  ring: ['ring-color', 'color'],
  'ring-offset': ['ring-color', 'color'],
  stroke: ['stroke', 'color'],
  fill: ['fill', 'color'],
};

const nonColorValues = new Set([
  'transparent',
  'current',
  'inherit',
  'white',
  'black',
  'dashed',
  'solid',
  'dotted',
  'none',
  'x',
  'y',
  'start',
  'end',
  'center',
  'left',
  'right',
  'balance',
  'wrap',
  'nowrap',
  'ellipsis',
  'clip',
  'cover',
  'contain',
  'fixed',
  'local',
  'scroll',
]);

function readThemeVariables() {
  assert.ok(existsSync(themePath), 'Build @tradenetcorp/veli-tokens before running this test.');
  const theme = readFileSync(themePath, 'utf8');
  return new Set(Array.from(theme.matchAll(/--([a-z0-9-]+):/g), (match) => match[1]));
}

test('audited components only use color utilities defined by the Veli theme', () => {
  const themeVariables = readThemeVariables();
  const findings = [];
  const utilityPattern =
    /(?<![A-Za-z0-9-[,])(text|bg|border|ring-offset|ring|stroke|fill)-([a-z][a-z0-9-]*)(?![A-Za-z0-9[\]-])/g;

  for (const filename of auditedSources) {
    const source = readFileSync(join(sourceDir, filename), 'utf8');

    for (const match of source.matchAll(utilityPattern)) {
      const [utility, prefix, value] = match;

      if (nonColorValues.has(value) || /^\d/.test(value)) continue;
      if (prefix === 'text' && /^(xs|sm|base|lg|xl|\dxl|start|end|center|left|right)$/.test(value))
        continue;
      if (prefix === 'border' && /^(t|b|l|r|s|e|x|y)(-\d+)?$/.test(value)) continue;
      if (prefix === 'ring' && /^offset-\d+$/.test(value)) continue;

      const resolves = utilityNamespaces[prefix].some((namespace) =>
        themeVariables.has(`${namespace}-${value}`),
      );

      if (!resolves) {
        const line = source.slice(0, match.index).split('\n').length;
        findings.push(`${filename}:${line} (${utility})`);
      }
    }
  }

  assert.deepEqual(findings, []);
});
