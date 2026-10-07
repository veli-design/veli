import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { before, test } from 'node:test';

const root = new URL('../', import.meta.url);
const sourcePath = new URL('src/design.tokens.json', root);
const sourceBytes = readFileSync(sourcePath);
const source = JSON.parse(sourceBytes);
let normalized;
let theme;

before(() => {
  execFileSync('corepack', ['pnpm', 'run', 'build'], {
    cwd: fileURLToPath(root),
    stdio: 'pipe',
  });
  normalized = JSON.parse(readFileSync(new URL('.cache/design.tokens.normalized.json', root)));
  theme = readFileSync(new URL('dist/tailwind-theme.css', root), 'utf8');
});

test('a fresh variable/style export builds without rewriting the canonical source', () => {
  assert.deepEqual(readFileSync(sourcePath), sourceBytes);
  assert.ok(source['Typography-styles'].Type);
  assert.ok(source['Typography-styles'].Dhivehi);
  assert.ok(source['Effect-styles'].Shadow);
  assert.ok(theme.includes('@utility type-body-sm-semibold'));
  assert.ok(theme.includes(':lang(dv)'));
  assert.ok(!theme.includes('--color-_docs-'));
});

test('Alert live mode aliases produce stable Tailwind names from Figma camelCase', () => {
  const token = source.color.components.alert.highContrast.info.bg;
  assert.equal(token.$extensions.mode.Light, '{color.primitives.blue.800}');
  assert.equal(token.$extensions.mode.Dark, '{color.primitives.blue.1000}');
  assert.ok(theme.includes('--color-alert-high-contrast-info-bg: var(--color-blue-800);'));
  assert.ok(theme.includes('--color-alert-high-contrast-info-bg: var(--color-blue-1000);'));
});

test('fresh Figma exports retain the existing code-owned motion contract', () => {
  const motion = JSON.parse(readFileSync(new URL('src/motion.tokens.json', root)));
  for (const [group, values] of Object.entries(motion)) {
    for (const name of Object.keys(values)) {
      assert.ok(normalized[group][name], `${group}.${name}`);
      assert.ok(theme.includes(`--${group}-${name}:`), `${group}.${name}`);
    }
  }
  assert.ok(theme.includes('@utility duration-fast'));
  assert.ok(theme.includes('@utility delay-slow'));
});
