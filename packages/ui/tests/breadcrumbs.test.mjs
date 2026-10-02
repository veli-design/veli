import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'breadcrumbs.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('Breadcrumbs expose the supported public composition API', () => {
  for (const component of [
    'Breadcrumbs',
    'Breadcrumb',
    'BreadcrumbBackLink',
    'BreadcrumbOverflow',
  ]) {
    assert.match(source, new RegExp(`export function ${component}\\b`));
  }

  assert.ok(manifest.exports['./breadcrumbs']);
  assert.doesNotMatch(source, /tone\?: 'accent' \| 'muted'/);
});

test('Breadcrumbs preserve current-page and disabled semantics', () => {
  assert.match(source, /<span aria-current="page" className=\{breadcrumbCurrentVariants\(\)\}>/);
  assert.match(source, /aria-disabled=\{isDisabled \|\| undefined\}/);
  assert.match(source, /!state\.isCurrent && !isDisabled && \(href != null \|\| onPress != null\)/);
});

test('Breadcrumbs use the Figma typography and reduced-motion contracts', () => {
  assert.match(source, /type-body-sm-regular \[&:lang\(dv\)\]:type-body-sm-medium/);
  assert.match(source, /motion-safe:transition-colors/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /direction === 'rtl' \? CaretRight : CaretLeft/);
});
