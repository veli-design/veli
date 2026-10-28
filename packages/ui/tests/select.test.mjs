import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'select.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('Select exposes the public composition API', () => {
  for (const component of ['Select', 'SelectItem', 'SelectSection']) {
    assert.match(source, new RegExp(`export function ${component}\\b`));
  }

  assert.ok(manifest.exports['./select']);
  assert.match(source, /isOptional\?: boolean;/);
  assert.doesNotMatch(source, /labelSupplementary/);
  assert.match(source, /triggerRef\?: React\.Ref<HTMLButtonElement>;/);
  assert.match(source, /'Veli UI: SelectItem with complex content/);
});

test('Select trigger matches the Figma states', () => {
  assert.match(source, /relative flex w-full items-center gap-2 rounded-md text-start/);
  assert.match(source, /\{\s*isDisabled: true,\s*className: 'bg-text-input-bg-hover',\s*\}/);
  assert.doesNotMatch(source, /bg-ash-alpha-200|text-input-stroke-disabled|border-\[1\.5px\]/);
  assert.match(source, /shadow-\[inset_0_0_0_1px_var\(--color-text-input-stroke\)\]/);
  assert.match(source, /ring-offset-bg-surface-raised/);
  assert.match(source, /true: 'text-icon-disabled',\s*false: 'text-icon-base',/);
  assert.match(source, /<CaretDownIcon aria-hidden size=\{20\} weight="regular" \/>/);
  assert.match(source, /isPlaceholder \? defaultChildren : selectedText/);
  assert.match(source, /flex w-full items-center gap-2 pb-2/);
  assert.match(source, /empty:hidden \[&:not\(:empty\)\]:pt-1/);
});

test('Select options follow the Figma menu treatment', () => {
  assert.match(source, /rounded-xl border-\[0\.5px\] border-base-muted bg-menu-bg p-1/);
  assert.match(source, /rounded-lg px-4 py-2 text-start text-base-strong/);
  assert.match(source, /isFocused: \{\s*true: 'bg-menu-hover'/);
  assert.match(source, /isPressed: \{\s*true: 'bg-menu-pressed'/);
  assert.doesNotMatch(source, /bg-button-primary-subtle/);
  assert.match(source, /px-4 py-2 type-body-sm-medium text-base-emphasis/);
  assert.doesNotMatch(source, /uppercase/);
  assert.match(source, /not-first:before:bg-border-base-subtle/);
  assert.match(source, /type-body-sm-regular text-base-muted/);
});

test('Select honors reduced motion', () => {
  assert.match(
    source,
    /transition-\[background-color,box-shadow\] duration-normal ease-out motion-reduce:transition-none/,
  );
  assert.match(
    source,
    /transition-transform duration-normal ease-in-out motion-reduce:transition-none/,
  );
  assert.match(source, /transition-colors duration-normal ease-out motion-reduce:transition-none/);
});

test('locked Select substitute submits the option id, not the label', () => {
  const sidecar = JSON.parse(
    readFileSync(join(packageDir, 'agent', 'components', 'select.json'), 'utf8'),
  );
  const locked = sidecar.avoidWhen.find((entry) => entry.useInstead?.includes('input'));
  assert.ok(locked);
  assert.match(locked.guidance, /hidden input/i);
  assert.match(locked.guidance, /option id/i);
  assert.match(locked.guidance, /no name/i);
  assert.match(locked.guidance, /disabled Select/i);
  assert.ok(
    sidecar.approvedPatterns.some(
      (pattern) => /nameless read-only Input/.test(pattern) && /hidden input/.test(pattern),
    ),
  );

  const recipe = readFileSync(
    join(packageDir, 'agent', 'recipes', 'locked-select-value.tsx'),
    'utf8',
  );
  assert.match(recipe, /value=\{atoll\.name\}/);
  assert.match(recipe, /isReadOnly/);
  assert.match(recipe, /type="hidden"/);
  assert.match(recipe, /name="atollId"/);
  assert.match(recipe, /value=\{atoll\.id\}/);
  assert.doesNotMatch(recipe, /<Input[^>]*\bname=/);

  const docs = readFileSync(
    join(packageDir, '..', '..', 'apps', 'web', 'src', 'content', 'docs', 'select.mdx'),
    'utf8',
  );
  assert.match(docs, /## Locked value/);
  assert.match(docs, /type="hidden" name="atollId" value=\{atoll\.id\}/);
  assert.match(docs, /value=\{atoll\.name\} isReadOnly/);

  const atoll = { id: '26', name: 'Kaafu Atoll' };
  const wrong = new FormData();
  wrong.set('atollId', atoll.name);
  assert.equal(wrong.get('atollId'), 'Kaafu Atoll');

  const right = new FormData();
  right.set('atollId', atoll.id);
  assert.equal(right.get('atollId'), '26');
  assert.notEqual(right.get('atollId'), atoll.name);
});
