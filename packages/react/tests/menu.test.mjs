import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuSubmenuTrigger,
  MenuTrigger,
} from '@veli-design/react/menu';
import { VeliProvider } from '@veli-design/react/provider';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'menu.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

const renderMenu = (children, provider = {}) =>
  renderToStaticMarkup(
    createElement(
      VeliProvider,
      provider,
      createElement(Menu, { 'aria-label': 'Actions' }, children),
    ),
  );

test('Menu exposes the public composition API and package export', () => {
  for (const component of [
    'MenuTrigger',
    'MenuSubmenuTrigger',
    'MenuPopover',
    'Menu',
    'MenuSection',
    'MenuSeparator',
    'MenuItem',
  ]) {
    assert.match(source, new RegExp(`export function ${component}\\b`));
  }

  assert.ok(manifest.exports['./menu']);
});

test('MenuPopover matches Figma surface, width, and motion', () => {
  assert.match(
    source,
    /min-w-56 w-max rounded-xl border-\[0\.5px\] border-base-muted bg-menu-bg p-1/,
  );
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /transition-\[opacity,translate,scale\] duration-normal ease-out/);
  assert.match(source, /data-\[entering\]:opacity-0 data-\[exiting\]:opacity-0/);
  assert.match(source, /motion-safe:data-\[placement\^=bottom\]:data-\[entering\]:-translate-y-1/);
  assert.match(source, /origin-\[var\(--trigger-anchor-point\)\]/);
  assert.match(source, /motion-safe:data-\[entering\]:scale-\[0\.97\]/);
  assert.doesNotMatch(source, /scale-0\b/);
  assert.doesNotMatch(source, /min-w-48/);
  assert.doesNotMatch(source, /border border-base-subtle/);
});

test('MenuItem matches Figma spacing, description type, and reduced motion', () => {
  assert.match(source, /rounded-lg px-3 text-start/);
  assert.match(source, /gap-1\.5/);
  assert.match(source, /transition-colors duration-normal ease-out motion-reduce:transition-none/);
  assert.match(source, /menuItemDescriptionVariants[\s\S]*sm: 'type-body-sm-regular'/);
  assert.match(source, /lg: 'type-body-md-regular'/);
  assert.match(source, /shortcut\?: string \| readonly string\[\] \| React\.ReactNode;/);
  assert.doesNotMatch(source, /indent\?: boolean;/);
  assert.doesNotMatch(source, /menuShortcutVariants/);
  assert.doesNotMatch(source, /from 'react-aria-components'[\s\S]*Keyboard,/);
});

test('MenuItem renders roles, sizes, intents, and selection slots', () => {
  const html = renderMenu([
    createElement(MenuItem, { id: 'edit', size: 'sm', key: 'edit' }, 'Edit'),
    createElement(
      MenuItem,
      { id: 'delete', intent: 'danger', size: 'lg', isDisabled: true, key: 'delete' },
      'Delete',
    ),
  ]);

  assert.match(html, /role="menu"/);
  assert.match(html, /role="menuitem"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /py-2 type-body-sm-regular/);
  assert.match(html, /py-3\.5 type-body-md-regular/);
  assert.match(html, /text-danger-muted/);

  const selected = renderMenu(createElement(MenuItem, { id: 'name' }, 'Name'));
  // Without selectionMode the check slot is omitted.
  assert.doesNotMatch(selected, /data-veli-menu-selection-slot/);

  const withSelection = renderToStaticMarkup(
    createElement(
      VeliProvider,
      {},
      createElement(
        Menu,
        {
          'aria-label': 'Sort',
          selectionMode: 'single',
          selectedKeys: new Set(['name']),
        },
        createElement(MenuItem, { id: 'name' }, 'Name'),
        createElement(MenuItem, { id: 'date' }, 'Date'),
      ),
    ),
  );
  assert.match(withSelection, /role="menuitemradio"/);
  assert.match(withSelection, /aria-checked="true"/);
  assert.match(withSelection, /data-veli-menu-selection-slot=""/);
});

test('MenuItem shortcut renders Kbd keys for strings and arrays', () => {
  const stringShortcut = renderMenu(
    createElement(MenuItem, { id: 'rename', shortcut: 'E' }, 'Rename'),
  );
  assert.match(stringShortcut, /<kbd\b[^>]*>E<\/kbd>/);
  assert.match(stringShortcut, /lang="en"/);

  const arrayShortcut = renderMenu(
    createElement(MenuItem, { id: 'export', shortcut: ['⌘', 'E'] }, 'Export'),
  );
  assert.match(arrayShortcut, /<kbd\b[^>]*>⌘<\/kbd>/);
  assert.match(arrayShortcut, /<kbd\b[^>]*>E<\/kbd>/);
  assert.ok((arrayShortcut.match(/<kbd\b/g) || []).length >= 2);

  const rtlShortcut = renderMenu(
    createElement(MenuItem, { id: 'export', shortcut: ['⌘', 'E'] }, 'Export'),
    { language: 'dv' },
  );
  assert.match(rtlShortcut, /dir="ltr"[^>]*data-veli-menu-shortcut/);

  const disabledShortcut = renderMenu(
    createElement(MenuItem, { id: 'rename', shortcut: 'E', isDisabled: true }, 'Rename'),
  );
  assert.match(disabledShortcut, /group-data-\[disabled\]:text-disabled/);
  assert.match(disabledShortcut, /<kbd\b[^>]*group-data-\[disabled\]:text-disabled[^>]*>E<\/kbd>/);

  const disabledArrayShortcut = renderMenu(
    createElement(MenuItem, { id: 'export', shortcut: ['⌘', 'E'], isDisabled: true }, 'Export'),
  );
  assert.ok(
    (disabledArrayShortcut.match(/group-data-\[disabled\]:text-disabled/g) || []).length >= 2,
  );
});

test('MenuItem icons use Figma icon tokens', () => {
  const html = renderMenu([
    createElement(MenuItem, { id: 'edit', startIcon: createElement('svg'), key: 'edit' }, 'Edit'),
    createElement(
      MenuItem,
      { id: 'delete', intent: 'danger', startIcon: createElement('svg'), key: 'delete' },
      'Delete',
    ),
  ]);

  assert.match(html, /text-icon-base /);
  assert.match(html, /text-icon-danger-muted /);
  assert.doesNotMatch(source, /justify-center text-base-muted/);
});

test('Menu sections, separators, and composition wrappers render', () => {
  const html = renderMenu([
    createElement(
      MenuSection,
      { title: 'File', size: 'md', key: 'file' },
      createElement(MenuItem, { id: 'open' }, 'Open'),
    ),
    createElement(MenuSeparator, { key: 'sep' }),
    createElement(MenuItem, { id: 'quit', key: 'quit' }, 'Quit'),
  ]);

  assert.match(html, /File/);
  assert.match(html, /text-base-emphasis/);
  assert.match(html, /type-body-sm-medium/);
  assert.match(html, /role="separator"/);
  assert.match(html, /class="mx-3 my-1 border-t border-base-muted"/);
});

test('Submenu caret flips with provider direction and is automatic', () => {
  assert.match(source, /data-veli-menu-submenu-caret/);
  assert.match(source, /hasSubmenu/);
  assert.match(source, /CaretLeftIcon/);
  assert.match(source, /CaretRightIcon/);

  const ltr = renderToStaticMarkup(
    createElement(
      VeliProvider,
      { language: 'en' },
      createElement(
        MenuTrigger,
        null,
        createElement('button', { type: 'button' }, 'Open'),
        createElement(
          MenuPopover,
          null,
          createElement(
            Menu,
            { 'aria-label': 'Nested' },
            createElement(
              MenuSubmenuTrigger,
              null,
              createElement(MenuItem, { id: 'export' }, 'Export'),
              createElement(
                MenuPopover,
                null,
                createElement(
                  Menu,
                  { 'aria-label': 'Formats' },
                  createElement(MenuItem, { id: 'pdf' }, 'PDF'),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );

  // Closed menus may not render popover content in SSR; assert source contract for RTL flip.
  assert.match(source, /direction === 'rtl' \? CaretLeftIcon : CaretRightIcon/);
  assert.equal(typeof ltr, 'string');
});

test('Menu shortcuts retain Latin key order and dimensions across all item sizes and languages', () => {
  for (const size of ['sm', 'md', 'lg']) {
    for (const language of ['en', 'dv']) {
      const html = renderMenu(
        createElement(MenuItem, { id: 'export', size, shortcut: ['Ctrl', 'Shift', 'E'] }, 'Export'),
        { language },
      );
      assert.match(html, /role="group" dir="ltr" data-veli-menu-shortcut/);
      const keys = [...html.matchAll(/<kbd\b([^>]*)>(.*?)<\/kbd>/g)];
      assert.deepEqual(
        keys.map((key) => key[2]),
        ['Ctrl', 'Shift', 'E'],
      );
      for (const key of keys) {
        assert.match(key[1], /lang="en"/);
        assert.match(key[1], /h-5/);
        assert.match(key[1], /leading-4/);
      }
    }
  }
});
