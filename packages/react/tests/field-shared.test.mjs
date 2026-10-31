import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h, Fragment } from 'react';

import { getRenderableMessage, hasRenderableMessage } from '../src/field-shared-variants.ts';

test('hasRenderableMessage treats nullish, booleans, and blank strings as empty', () => {
  assert.equal(hasRenderableMessage(null), false);
  assert.equal(hasRenderableMessage(undefined), false);
  assert.equal(hasRenderableMessage(false), false);
  assert.equal(hasRenderableMessage(true), false);
  assert.equal(hasRenderableMessage(''), false);
  assert.equal(hasRenderableMessage('   '), false);
  assert.equal(hasRenderableMessage('Hello'), true);
});

test('hasRenderableMessage inspects array children', () => {
  assert.equal(hasRenderableMessage(['', '   ', null]), false);
  assert.equal(hasRenderableMessage(['', 'Ready']), true);
});

test('hasRenderableMessage recursively inspects Fragment children', () => {
  assert.equal(hasRenderableMessage(h(Fragment, null, '   ')), false);
  assert.equal(hasRenderableMessage(h(Fragment, null)), false);
  assert.equal(hasRenderableMessage(h(Fragment, null, 'Hello')), true);
  assert.equal(hasRenderableMessage(h(Fragment, null, h(Fragment, null, '   '))), false);
  assert.equal(hasRenderableMessage(h(Fragment, null, ['', '   ', null])), false);
  assert.equal(hasRenderableMessage(h(Fragment, null, ['', h(Fragment, null, 'Ready')])), true);
});

test('hasRenderableMessage still treats non-Fragment elements as renderable', () => {
  assert.equal(hasRenderableMessage(h('span', null)), true);
  assert.equal(hasRenderableMessage(h('span', null, '   ')), true);
});

test('getRenderableMessage returns the node only when it has renderable content', () => {
  const content = h(Fragment, null, 'Hello');
  assert.equal(getRenderableMessage(h(Fragment, null, '   ')), undefined);
  assert.equal(getRenderableMessage(content), content);
});
