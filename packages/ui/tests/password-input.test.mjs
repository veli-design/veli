import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'password-input-component.tsx'), 'utf8');
const fieldVariantsSource = readFileSync(
  join(packageDir, 'src', 'field-shared-variants.ts'),
  'utf8',
);
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('PasswordInput exposes the public API', () => {
  assert.match(source, /export function PasswordInput\b/);
  assert.ok(manifest.exports['./password-input']);
});

test('PasswordInput keeps the shell surface and themed text during browser autofill', () => {
  assert.match(source, /rounded-md overflow-hidden/);
  assert.match(
    source,
    /disabled:text-disabled \$\{fieldInputAutofill\} \$\{webkitDhivehiTextBaselineClassName\}/,
  );

  for (const selector of ['autofill:', '\\[&:-webkit-autofill\\]:']) {
    assert.match(
      fieldVariantsSource,
      new RegExp(`${selector}\\[transition:background-color_0s_600000s\\]`),
    );
    assert.match(
      fieldVariantsSource,
      new RegExp(`${selector}\\[-webkit-text-fill-color:var\\(--veli-color-text-base-strong\\)\\]`),
    );
    assert.match(fieldVariantsSource, new RegExp(`${selector}caret-text-base-strong`));
  }
});
