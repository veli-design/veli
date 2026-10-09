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
  assert.match(
    source,
    /const breadcrumbTextVariants = cva\([\s\S]*?true: 'type-body-sm-medium text-base-inactive'/,
  );
  assert.match(source, /state\.isDisabled \? undefined : breadcrumbBackLinkLinkClassName/);
  assert.match(
    source,
    /linkClassName=\{isDisabled \? undefined : breadcrumbBackLinkLinkClassName\}/,
  );
});

test('Breadcrumbs use the Figma typography and reduced-motion contracts', () => {
  assert.match(source, /const breadcrumbInteractiveTypographyClassName = 'type-body-sm-medium';/);
  assert.match(source, /text-base-muted hover:text-base-default active:text-base-default/);
  assert.match(source, /breadcrumbItemContentClassName} cursor-pointer/);
  assert.match(
    source,
    /focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2/,
  );
  assert.match(source, /const breadcrumbCurrentTypographyClassName = 'type-body-sm-medium';/);
  assert.match(source, /breadcrumbCurrentTypographyClassName} text-base-default/);
  assert.match(
    source,
    /type-body-sm-regular text-base-default.*aria-expanded:type-body-sm-semibold/,
  );
  assert.match(source, /w-\[29px\] cursor-pointer/);
  assert.match(
    source,
    /focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2/,
  );
  assert.match(source, /inline-flex items-center gap-1\.5 type-body-sm-regular/);
  assert.match(source, /offset=\{2\}/);
  assert.match(source, /min-w-\[155px\] w-\[155px\]/);
  assert.match(source, /motion-safe:transition-colors/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /direction === 'rtl' \? CaretRight : CaretLeft/);
});
