import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tag, TagGroup, TagButton, TagDropdown } from '@tradenetcorp/veli-ui/tags';
import { TagGroupContext } from 'react-aria-components';
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
    assert.match(row, /bg-tag-disabled-bg text-tag-disabled-foreground/);
    assert.doesNotMatch(row, /text-tag-link|bg-tag-fill-selected-bg/);
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

test('standalone tags use native action and navigation semantics', () => {
  const action = renderToStaticMarkup(
    h(TagButton, { isSelected: true, appearance: 'outline' }, 'Tourism'),
  );
  assert.match(action, /^<button/);
  assert.match(action, /type="button"/);
  assert.match(action, /aria-pressed="true"/);
  assert.match(action, /border-tag-outline-selected-border/);
  assert.doesNotMatch(renderToStaticMarkup(h(TagButton, null, 'Action')), /aria-pressed/);
  const link = renderToStaticMarkup(
    h(TagButton, { as: 'a', href: '/guide', target: '_blank', rel: 'noreferrer' }, 'Guide'),
  );
  assert.match(link, /^<a/);
  assert.match(link, /href="\/guide"/);
  assert.match(link, /target="_blank" rel="noreferrer"/);
  assert.doesNotMatch(link, /aria-pressed|role="row"|<button/);
});

test('link tags never gain selection styling or remove controls', () => {
  const html = render(
    { label: 'Links', selectionMode: 'multiple', defaultSelectedKeys: ['guide'], onRemove() {} },
    h(Tag, { id: 'guide', href: '/guide' }, 'Guide'),
  );
  assert.equal(buttons(html).length, 0);
  assert.doesNotMatch(
    rows(html)[0],
    /bg-tag-fill-selected-bg|aria-selected|data-selected|data-allows-removing/,
  );
});

test('dropdown separates deselection from menu activation and disables both controls', () => {
  for (const isDisabled of [false, true]) {
    const html = renderToStaticMarkup(
      h(TagDropdown, {
        label: 'Tourism',
        dropdownLabel: 'Choose areas',
        isDisabled,
        defaultSelectedKeys: [0],
        renderSelection: (keys) => (keys === 'all' ? 'All' : keys.size),
        onDeselect() {},
      }),
    );
    const controls = buttons(html);
    assert.equal(controls.length, 2);
    assert.match(controls[0], /aria-pressed="true"/);
    assert.doesNotMatch(controls[0], /aria-haspopup/);
    assert.match(controls[1], /aria-haspopup="(?:menu|true)"/);
    assert.match(controls[1], /aria-label="Choose areas"/);
    for (const control of controls) assert.equal(/disabled=""/.test(control), isDisabled);
  }
});

test('disabled navigation tags suppress destinations and router renderers, including inherited state', async () => {
  const { LinkContext } = await import('react-aria-components');
  let rendered = 0;
  const props = {
    as: 'a',
    href: '/guide',
    render: (domProps) => {
      rendered++;
      return h('a', { ...domProps, href: '/router' });
    },
  };
  for (const tree of [
    h(TagButton, { ...props, isDisabled: true }, 'Guide'),
    h(LinkContext.Provider, { value: { isDisabled: true } }, h(TagButton, props, 'Guide')),
  ]) {
    const html = renderToStaticMarkup(tree);
    assert.match(html, /^<a/);
    assert.match(html, /aria-disabled="true"/);
    assert.doesNotMatch(html, / href=|aria-pressed|<button/);
  }
  assert.equal(rendered, 0);
  const html = renderToStaticMarkup(h(TagButton, props, 'Guide'));
  assert.equal(rendered, 1);
  assert.match(html, / href="\/router"/);
});

test('unselected dropdown retains a plain filter and an inaccessible inert caret', () => {
  const html = renderToStaticMarkup(
    h(TagDropdown, {
      label: 'Tourism',
      isSelected: false,
      onSelect() {},
      onDeselect() {},
      renderSelection: () => 'Hidden selection',
    }),
  );
  assert.match(buttons(html)[0], /aria-pressed="false"/);
  assert.match(html, /inert="" aria-hidden="true"/);
  assert.doesNotMatch(html, /Hidden selection/);
});

for (const property of ['selectedKeys', 'defaultSelectedKeys']) {
  test(`TagGroup resolves ${property} from React Aria context before its selection facade`, () => {
    const html = renderToStaticMarkup(
      h(
        TagGroupContext.Provider,
        {
          value: { selectionMode: 'multiple', [property]: ['a'] },
        },
        h(TagGroup, { 'aria-label': 'Context filters' }, h(Tag, { id: 'a' }, 'Alpha')),
      ),
    );
    assert.match(rows(html)[0], /aria-selected="true"/);
  });
}

test('TagGroup keeps named context slots and root classes after resolving context', () => {
  const html = renderToStaticMarkup(
    h(
      TagGroupContext.Provider,
      {
        value: {
          slots: {
            filters: {
              selectionMode: 'multiple',
              selectedKeys: ['a'],
              className: 'context-marker',
            },
          },
        },
      },
      h(TagGroup, { slot: 'filters', 'aria-label': 'Filters' }, h(Tag, { id: 'a' }, 'Alpha')),
    ),
  );
  assert.match(html, /slot="filters"/);
  assert.match(html, /context-marker/);
  assert.match(rows(html)[0], /aria-selected="true"/);
});
