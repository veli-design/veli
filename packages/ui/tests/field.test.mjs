import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { getErrorMessages } from '../src/form-shared.ts';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'field.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('Field exports the composable public API', () => {
  for (const component of [
    'Field',
    'FieldSet',
    'FieldLegend',
    'FieldGroup',
    'FieldContent',
    'FieldLabel',
    'FieldTitle',
    'FieldDescription',
    'FieldError',
    'FieldSeparator',
    'FieldControl',
    'useFieldControlProps',
  ]) {
    assert.match(source, new RegExp(`export (function|const|type|interface) ${component}\\b|export function ${component}\\b`));
  }

  assert.ok(manifest.exports['./field']);
  assert.deepEqual(Object.keys(manifest.exports['./field']), ['types', 'import', 'default']);
});

test('FieldLabel and messages are built on react-aria-components Label and Text', () => {
  assert.match(source, /Label as AriaLabel/);
  assert.match(source, /Text as AriaText/);
  assert.match(source, /slot="description"/);
  assert.match(source, /slot="errorMessage"/);
  assert.match(source, /LabelContext/);
  assert.match(source, /useIsInsideRacLabelable/);
});

test('Field wires control props through FieldContext without RAC Provider injection', () => {
  assert.match(source, /const FieldContext = React\.createContext/);
  assert.match(source, /export function useFieldControlProps/);
  assert.match(source, /'aria-labelledby': field\.labelId/);
  assert.match(source, /'aria-describedby': joinIds/);
  assert.match(source, /registerDescriptionId/);
  assert.match(source, /registerErrorId/);
  assert.match(source, /unregisterDescriptionId/);
  assert.match(source, /unregisterErrorId/);
  assert.doesNotMatch(source, /TextFieldContext|SelectContext|CheckboxContext|Provider\s+values=/);
});

test('FieldError normalizes form-library and Standard Schema errors', () => {
  assert.match(source, /getErrorMessages\(errors\)/);
  assert.deepEqual(getErrorMessages([{ message: 'Required' }, 'Too short']), [
    'Required',
    'Too short',
  ]);
  assert.match(source, /messages\.length === 1/);
  assert.match(source, /<ul className="list-disc ps-4">/);
});

test('Field documents RadioGroup and CheckboxGroup composition via RAC slots', () => {
  // Composition contract: FieldLabel/Description remain usable as RAC slot children.
  assert.match(source, /htmlFor=\{htmlFor \?\? \(!insideRac \? field\?\.controlId : undefined\)\}/);
  assert.match(source, /id=\{id \?\? \(!insideRac \? field\?\.labelId : undefined\)\}/);
});
