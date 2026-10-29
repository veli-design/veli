import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tag, TagGroup } from '@tradenetcorp/veli-ui/tags';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (props, ...tags) => renderToStaticMarkup(h(TagGroup, props, ...tags));
const buttons = (html) => [...html.matchAll(/<button\b[^>]*>/g)].map(([button]) => button);
const rows = (html) => [...html.matchAll(/<div\b[^>]*role="row"[^>]*>/g)].map(([row]) => row);

test('Tags preserve numeric labels, accessible descriptions, and error precedence', () => {
  const html = render(
    { label: 0, description: 'Help', errorMessage: 'Choose a tag' },
    h(Tag, { id: 0 }, 0),
  );
  assert.match(html, />0<\/span>/);
  assert.match(rows(html)[0], /aria-label="0"/);
  assert.match(html, /slot="errorMessage"[^>]*>Choose a tag/);
  assert.doesNotMatch(html, />Help</);
  const grid = html.match(/<div\b[^>]*role="grid"[^>]*>/)[0];
  assert.match(grid, /aria-describedby="[^"]+"/);
});

test('Tag remove labels are complete, localized names without a duplicate row reference', () => {
  const html = render(
    { label: 'Topics', onRemove() {} },
    h(Tag, { id: 'tourism' }, h('span', null, ' Tourism ')),
    h(
      Tag,
      { id: 'custom', textValue: 'Custom', removeButtonLabel: (label) => `Dismiss ${label}` },
      () => h('span', null, 'Custom'),
    ),
  );
  assert.match(buttons(html)[0], /aria-label="Remove Tourism"/);
  assert.match(buttons(html)[1], /aria-label="Dismiss Custom"/);
  for (const button of buttons(html)) {
    assert.match(button, /aria-labelledby=""/);
    assert.match(button, /type="button"/);
  }
  const dv = renderToStaticMarkup(
    h(
      VeliProvider,
      { language: 'dv' },
      h(TagGroup, { label: 'ޓެގް', onRemove() {} }, h(Tag, { id: 'topic' }, 'ޓެގް')),
    ),
  );
  assert.match(buttons(dv)[0], /aria-label="ޓެގް އުނިކުރޭ"/);
});

test('disabled selected and linked tags keep disabled colors and remove semantics', () => {
  const html = render(
    {
      label: 'Topics',
      selectionMode: 'multiple',
      defaultSelectedKeys: ['selected'],
      disabledKeys: ['selected'],
      onRemove() {},
    },
    h(Tag, { id: 'selected' }, 'Selected'),
    h(Tag, { id: 'link', href: '/guide', isDisabled: true }, 'Guide'),
  );
  assert.match(rows(html)[0], /data-selected="true"/);
  for (const row of rows(html)) {
    assert.match(row, /aria-disabled="true"/);
    assert.match(row, /bg-button-disabled text-disabled/);
    assert.doesNotMatch(row, /text-links|bg-button-primary-subtle-default/);
  }
  for (const button of buttons(html)) assert.match(button, /disabled=""/);
});

test('TagGroup size defaults and individual overrides retain all five sizes', () => {
  for (const [size, height] of [
    ['xs', 7],
    ['sm', 8],
    ['md', 9],
    ['lg', 10],
    ['xl', 11],
  ]) {
    const html = render(
      { label: 'Sizes', size },
      h(Tag, { id: 'default' }, 'Default'),
      h(Tag, { id: 'override', size: 'xl' }, 'Override'),
    );
    assert.match(rows(html)[0], new RegExp(`\\bh-${height}\\b`));
    assert.match(rows(html)[1], /\bh-11\b/);
  }
});

test('empty collections retain the default or supplied empty state', () => {
  assert.match(render({ label: 'Topics' }), /No tags available\./);
  const html = render({ label: 'Topics', renderEmptyState: () => h('p', null, 'Nothing saved') });
  assert.match(html, /Nothing saved/);
  assert.doesNotMatch(html, /No tags available/);
});
