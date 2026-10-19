import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'input.tsx'), 'utf8');
const fieldVariantsSource = readFileSync(
  join(packageDir, 'src', 'field-shared-variants.ts'),
  'utf8',
);
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('Input exposes the public API reconciled with Figma', () => {
  assert.match(source, /export function Input\b/);
  assert.ok(manifest.exports['./input']);
  assert.match(source, /isOptional\?: boolean;/);
  assert.doesNotMatch(source, /labelSupplementary/);
  assert.match(source, /shouldShowFieldOptional\(isOptional, isRequired\)/);
  assert.match(source, /getFieldOptionalLabel\(languageConfig\.language\)/);
});

test('Input shell matches the Figma states', () => {
  assert.match(source, /relative flex w-full items-center gap-2 rounded-md/);
  assert.match(source, /\{\s*isDisabled: true,\s*className: 'bg-text-input-bg-hover',\s*\}/);
  assert.doesNotMatch(source, /bg-ash-alpha-200|text-input-stroke-disabled|border-\[1\.5px\]/);
  assert.match(source, /outlineFieldStrokeRest\.input/);
  assert.match(source, /outlineFieldStrokeFocusVisibleHide\.input/);
  assert.match(source, /text-base-strong outline-none placeholder:text-base-inactive/);
  assert.match(source, /flex w-full items-center gap-2 pb-2/);
  assert.match(source, /empty:hidden \[&:not\(:empty\)\]:pt-1/);
});

test('Input error icon replaces trailing content and stays decorative', () => {
  assert.match(
    source,
    /\{isInvalid \? \(\s*<div className=\{errorIconVariants\(\{ isDisabled \}\)\} aria-hidden>\s*<WarningCircle[^>]*weight="fill" \/>\s*<\/div>\s*\) : endContent \? \(/,
  );
});

test('Input keeps the shell surface and themed text during browser autofill', () => {
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
    assert.match(
      fieldVariantsSource,
      new RegExp(
        `disabled:${selector}\\[-webkit-text-fill-color:var\\(--veli-color-text-disabled\\)\\]`,
      ),
    );
    assert.match(fieldVariantsSource, new RegExp(`disabled:${selector}caret-text-disabled`));
  }
});

test('Input honors reduced motion and keeps LTR value types', () => {
  assert.match(
    source,
    /transition-\[background-color,box-shadow\] duration-normal ease-out motion-reduce:transition-none/,
  );
  assert.match(source, /new Set\(\['email', 'password', 'tel', 'url'\]\)/);
  assert.match(
    source,
    /placeholder-shown:\[direction:rtl\] \[&:not\(:placeholder-shown\)\]:font-sans!/,
  );
  assert.match(
    source,
    /isLtrValueInRtl:\s*inputValueDirection === 'ltr' && languageConfig\.direction === 'rtl'/,
  );
});
