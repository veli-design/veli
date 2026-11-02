import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '@veli-design/react/button';
import { Menu, MenuItem } from '@veli-design/react/menu';
import { VeliProvider } from '@veli-design/react/provider';
import { Tag, TagGroup } from '@veli-design/react/tags';

const BUTTON_CURSORS = [
  'cursor-pointer',
  'data-[disabled]:cursor-not-allowed',
  'data-[pending]:cursor-wait',
  'disabled:cursor-not-allowed',
];

function openingTags(html) {
  return html.match(/<[a-zA-Z][^>]*>/g) ?? [];
}

function classTokens(tag) {
  const match = tag.match(/class="([^"]*)"/);
  return match ? match[1].split(/\s+/).filter(Boolean) : [];
}

function cursorTokens(tag) {
  return classTokens(tag)
    .filter((token) => token.includes('cursor-'))
    .sort();
}

function blockingPointerEvents(tag) {
  return classTokens(tag).filter(
    (token) =>
      token.endsWith('pointer-events-none') &&
      token !== 'before:pointer-events-none' &&
      token !== 'after:pointer-events-none',
  );
}

function hasAttr(tag, name) {
  return new RegExp(`(?:^|\\s)${name}=`).test(tag);
}

function oneHost(html, includes) {
  const found = openingTags(html).filter((tag) => includes.every((part) => tag.includes(part)));
  assert.equal(found.length, 1, found.join('\n') || html);
  return found[0];
}

function assertCursorHost(tag, expected) {
  const cursors = cursorTokens(tag);
  const unprefixed = cursors.filter((token) => token.startsWith('cursor-'));
  assert.deepEqual(unprefixed, [expected.find((token) => token.startsWith('cursor-'))]);
  assert.deepEqual(cursors, [...expected].sort());
  assert.deepEqual(blockingPointerEvents(tag), []);
}

test('disabled link tag keeps a single not-allowed cursor', () => {
  const html = renderToStaticMarkup(
    h(
      VeliProvider,
      null,
      h(
        TagGroup,
        { label: 'Topics' },
        h(Tag, { id: 'guide', href: '/guide', isDisabled: true }, 'Guide'),
      ),
    ),
  );
  const row = oneHost(html, ['role="row"', 'aria-disabled="true"']);
  assertCursorHost(row, ['cursor-not-allowed']);
});

test('disabled button link stays hit-testable with not-allowed state classes', () => {
  const html = renderToStaticMarkup(
    h(VeliProvider, null, h(Button, { as: 'a', href: '/account', isDisabled: true }, 'Account')),
  );
  const host = oneHost(html, ['role="link"', 'data-disabled="true"']);
  assert.equal(host.startsWith('<a'), true);
  assert.equal(hasAttr(host, 'href'), false);
  assert.equal(hasAttr(host, 'disabled'), false);
  assert.equal(hasAttr(host, 'data-disabled'), true);
  assertCursorHost(host, BUTTON_CURSORS);
});

test('pending button keeps the wait cursor class and is not native-disabled', () => {
  const html = renderToStaticMarkup(h(VeliProvider, null, h(Button, { isPending: true }, 'Save')));
  const host = oneHost(html, ['data-pending="true"']);
  assert.equal(host.startsWith('<button'), true);
  assert.equal(hasAttr(host, 'disabled'), false);
  assert.equal(hasAttr(host, 'data-disabled'), false);
  assert.equal(hasAttr(host, 'data-pending'), true);
  assertCursorHost(host, BUTTON_CURSORS);
});

test('disabled menu row keeps the default cursor plus not-allowed', () => {
  const html = renderToStaticMarkup(
    h(
      VeliProvider,
      null,
      h(
        Menu,
        { 'aria-label': 'Actions' },
        h(MenuItem, { id: 'delete', isDisabled: true }, 'Delete'),
      ),
    ),
  );
  const host = oneHost(html, ['role="menuitem"', 'aria-disabled="true"']);
  assertCursorHost(host, ['cursor-default', 'data-[disabled]:cursor-not-allowed']);
});
