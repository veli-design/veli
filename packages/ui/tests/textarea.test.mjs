import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'textarea.tsx'), 'utf8');
const fieldVariantsSource = readFileSync(
  join(packageDir, 'src', 'field-shared-variants.ts'),
  'utf8',
);
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('TextArea exposes the public API', () => {
  assert.match(source, /export function TextArea\b/);
  assert.ok(manifest.exports['./textarea']);
});

test('TextArea keeps the shell surface and themed text during browser autofill', () => {
  assert.match(source, /rounded-md overflow-hidden/);
  assert.match(source, /disabled:text-disabled \$\{fieldInputAutofill\} \[&:lang\(dv\)\]/);

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
    assert.match(
      fieldVariantsSource,
      new RegExp(
        `disabled:${selector}\\[-webkit-text-fill-color:var\\(--veli-color-text-disabled\\)\\]`,
      ),
    );
    assert.match(fieldVariantsSource, new RegExp(`disabled:${selector}caret-text-disabled`));
  }
});
