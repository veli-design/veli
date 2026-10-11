import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ButtonContext, LinkContext } from 'react-aria-components';
import { Button } from '@tradenetcorp/veli-ui/button';

const render = (props, children = 'Account') => renderToStaticMarkup(h(Button, props, children));

test('Button navigation mode forwards anchor semantics without nested controls', () => {
  const html = render({
    as: 'a',
    href: '/account',
    target: '_blank',
    rel: 'noreferrer',
    download: 'account.txt',
    'aria-current': 'page',
  });
  assert.match(html, /^<a /);
  for (const attribute of [
    'href="/account"',
    'target="_blank"',
    'rel="noreferrer"',
    'download="account.txt"',
    'aria-current="page"',
  ])
    assert.ok(html.includes(attribute), attribute);
  assert.doesNotMatch(html, /<button|type="button"|role="button"/);
});

test('disabled and pending navigation keep an anchor without a native destination', () => {
  for (const state of [{ isDisabled: true }, { isLoading: true }, { isPending: true }]) {
    const html = render({ as: 'a', href: '/account', ...state });
    assert.match(html, /^<a /);
    assert.match(html, /role="link"/);
    assert.match(html, /aria-disabled="true"/);
    assert.doesNotMatch(html, /href=|<button|disabled=""/);
    assert.match(html, />Account<\/span>/);
    if (!state.isDisabled) {
      assert.match(html, /aria-busy="true"/);
      assert.match(html, /data-pending="true"/);
      assert.match(html, /tabindex="0"/);
    }
  }
});

test('navigation composition receives guarded destination and pending state', () => {
  for (const isPending of [false, true]) {
    let received;
    const html = render({
      as: 'a',
      href: '/account',
      isPending,
      render: (props, state) => {
        received = { props, state };
        return h('a', { ...props, 'data-adapter': true });
      },
    });
    assert.equal(received.state.isPending, isPending);
    assert.equal(received.props.href, isPending ? undefined : '/account');
    assert.match(html, /data-adapter="true"/);
    assert.doesNotMatch(html, /<button/);
  }
});

test('default Button retains button context and form semantics', () => {
  const html = renderToStaticMarkup(
    h(
      ButtonContext.Provider,
      { value: { isPending: true, type: 'submit' } },
      h(Button, { name: 'save', value: 'account' }, 'Save'),
    ),
  );
  assert.match(html, /^<button /);
  assert.match(html, /type="submit"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /name="save"/);
  assert.doesNotMatch(html, /<a /);
});

test('navigation inherits disabled LinkContext and respects explicit overrides and slots', () => {
  const context = { slots: { account: { isDisabled: true, 'aria-label': 'Context account' } } };
  const renderContext = (props) =>
    renderToStaticMarkup(
      h(
        LinkContext.Provider,
        { value: context },
        h(Button, { as: 'a', href: '/account', slot: 'account', ...props }, 'Account'),
      ),
    );
  const disabled = renderContext({});
  assert.match(disabled, /aria-disabled="true"/);
  assert.match(disabled, /aria-label="Context account"/);
  assert.match(disabled, /data-disabled="true"/);
  assert.doesNotMatch(disabled, /href=/);
  assert.match(renderContext({ isDisabled: false }), /href="\/account"/);
  assert.match(renderContext({ slot: null }), /href="\/account"/);
});

test('navigation context styles resolve against state and false current is not current', () => {
  let state;
  const html = renderToStaticMarkup(
    h(
      LinkContext.Provider,
      {
        value: {
          style: ({ isDisabled }) => ({ opacity: isDisabled ? 0.5 : 1 }),
          className: ({ isDisabled }) => (isDisabled ? 'context-disabled' : 'context-enabled'),
          isDisabled: true,
        },
      },
      h(
        Button,
        {
          as: 'a',
          href: '/account',
          'aria-current': 'false',
          render: (props, current) => {
            state = current;
            return h('a', props);
          },
        },
        'Account',
      ),
    ),
  );
  assert.equal(state.isCurrent, false);
  assert.match(html, /style="opacity:0.5"/);
  assert.match(html, /context-disabled/);
  assert.doesNotMatch(html, /data-current=/);
});

test('pending navigation preserves an excluded tab stop', () => {
  const html = render({ as: 'a', href: '/account', isPending: true, excludeFromTabOrder: true });
  assert.match(html, /tabindex="-1"/);
  assert.doesNotMatch(html, /href=/);
});
