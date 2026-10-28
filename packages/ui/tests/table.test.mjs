import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableResizableContainer,
  TableColumnResizer,
  useDragAndDrop,
} from '@tradenetcorp/veli-ui/table';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

function render({
  language = 'en',
  table = {},
  body = {},
  items = [{ id: 'one', name: 'Tourism licence' }],
} = {}) {
  return renderToStaticMarkup(
    h(
      VeliProvider,
      { language },
      h(
        Table,
        { 'aria-label': 'Permits', ...table },
        h(
          TableHeader,
          null,
          h(TableColumn, { id: 'name', isRowHeader: true, allowsSorting: true }, 'Name'),
        ),
        h(TableBody, { items, ...body }, (item) =>
          h(TableRow, { id: item.id }, h(TableCell, null, item.name)),
        ),
      ),
    ),
  );
}

test('Table exposes named and compound composition through its package entry point', () => {
  for (const [key, part] of Object.entries({
    Header: TableHeader,
    Column: TableColumn,
    Body: TableBody,
    Row: TableRow,
    Cell: TableCell,
    ResizableContainer: TableResizableContainer,
    ColumnResizer: TableColumnResizer,
  }))
    assert.equal(Table[key], part);
  assert.equal(typeof useDragAndDrop, 'function');
});

test('Table renders an accessible named grid with a sortable row heading', () => {
  const html = render({
    table: {
      sortDescriptor: { column: 'name', direction: 'descending' },
      className: 'custom-table',
      stickyHeader: true,
    },
  });
  assert.match(html, /role="grid"/);
  assert.match(html, /aria-label="Permits"/);
  assert.match(html, /aria-sort="descending"/);
  assert.match(html, /Tourism licence/);
  assert.match(html, /custom-table/);
  assert.match(html, /\[&amp;_thead_th\]:sticky/);
});

test('selection inserts exactly one extra header and cell, and marks disabled rows', () => {
  const html = render({
    table: { selectionMode: 'multiple', defaultSelectedKeys: ['one'], disabledKeys: ['one'] },
  });
  assert.match(html, /aria-label="Select all"/);
  assert.match(html, /aria-label="Select row"/);
  assert.match(html, /data-disabled="true"/);
  assert.match(html, /group-data-\[disabled\]\/row:text-disabled/);
  assert.equal((html.match(/<th /g) ?? []).length, 2);
  assert.equal((html.match(/<td /g) ?? []).length, 2);
  assert.doesNotMatch(
    render({ table: { selectionMode: 'multiple', selectionBehavior: 'replace' } }),
    /type="checkbox"/,
  );
});

test('selection and empty fallback follow provider language', () => {
  const html = render({ language: 'dv', table: { selectionMode: 'multiple' } });
  assert.match(html, /aria-label="ހުރިހާ ރޯތަކެއް ޚިޔާރުކުރޭ"/);
  assert.match(html, /aria-label="ރޯ ޚިޔާރުކުރޭ"/);
  assert.match(render({ items: [] }), /No results found\./);
  assert.match(render({ language: 'dv', items: [] }), /ނަތީޖާއެއް ނުފެނުނު/);
});

test('empty-state overrides preserve null and give renderEmptyState priority', () => {
  assert.match(render({ items: [], body: { emptyMessage: 'Nothing here' } }), /Nothing here/);
  assert.doesNotMatch(render({ items: [], body: { emptyMessage: null } }), /No results found/);
  const html = render({
    items: [],
    body: { emptyMessage: 'Fallback', renderEmptyState: () => h('p', null, 'Custom content') },
  });
  assert.match(html, /Custom content/);
  assert.doesNotMatch(html, /Fallback/);
});

test('row feedback respects reduced motion and cells retain visible keyboard focus', () => {
  const html = render();
  assert.match(html, /motion-reduce:transition-none/);
  assert.match(html, /data-\[focus-visible\]:ring-border-focus/);
});

test('rendered Table colour utilities exist in the generated token theme', () => {
  const theme = readFileSync(
    new URL('../../tokens/dist/tailwind-theme.css', import.meta.url),
    'utf8',
  );
  const classes = [
    ...render({ table: { selectionMode: 'multiple', stickyHeader: true } }).matchAll(
      /class="([^"]*)"/g,
    ),
  ]
    .map((match) => match[1])
    .join(' ');
  const nonColours = new Set(['start', 'center', 'white', 'transparent']);
  for (const match of classes.matchAll(
    /(?<![A-Za-z0-9-[,])(text|bg)-([a-z][a-z0-9-]*)(?![A-Za-z0-9[\]-])/g,
  )) {
    const [, kind, value] = match;
    if (nonColours.has(value)) continue;
    assert.ok(
      theme.includes(`--color-${value}:`) ||
        theme.includes(`--${kind === 'text' ? 'text-color' : 'background-color'}-${value}:`),
      `Missing Table colour utility: ${match[0]}`,
    );
  }
});
