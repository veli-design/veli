import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ButtonContext, LinkContext } from 'react-aria-components';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (props, children = 'Account') => renderToStaticMarkup(h(Button, props, children));

test('Button navigation mode forwards anchor semantics without nested controls', () => {
  const html = render({
    as: 'a',
    href: '/account',
    target: '_blank',
    rel: 'noreferrer',
    download: 'account.txt',
    hrefLang: 'dv',
    'aria-current': 'page',
  });
  assert.match(html, /^<a /);
  for (const attribute of [
    'href="/account"',
    'target="_blank"',
    'rel="noreferrer"',
    'download="account.txt"',
    'hrefLang="dv"',
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

test('navigation composition owns its destination and only renders while enabled', () => {
  for (const state of [{}, { isDisabled: true }, { isLoading: true }, { isPending: true }]) {
    let received;
    const html = render({
      as: 'a',
      ...state,
      render: (props, current) => {
        received = { props, state: current };
        return h('a', { ...props, href: '/account', 'data-router': true });
      },
    });
    if (Object.keys(state).length) {
      assert.equal(received, undefined);
      assert.doesNotMatch(html, /href=|data-router=/);
      assert.match(html, /aria-disabled="true"/);
    } else {
      assert.equal(received.props.href, undefined);
      assert.equal(received.state.isPending, false);
      assert.match(html, /href="\/account"/);
      assert.match(html, /data-router="true"/);
    }
    assert.match(html, /^<a /);
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
          render: () => {
            throw new Error('Disabled context must not render a router link');
          },
        },
        'Account',
      ),
    ),
  );
  assert.match(html, /style="opacity:0.5"/);
  assert.match(html, /context-disabled/);
  assert.doesNotMatch(html, /data-current=/);
});

test('pending navigation preserves an excluded tab stop', () => {
  const html = render({ as: 'a', href: '/account', isPending: true, excludeFromTabOrder: true });
  assert.match(html, /tabindex="-1"/);
  assert.doesNotMatch(html, /href=/);
});

test('custom navigation render owns href mapping while native links use the provider', () => {
  for (const custom of [false, true]) {
    const html = renderToStaticMarkup(
      h(
        VeliProvider,
        { navigate() {}, useHref: (href) => `/base${href}` },
        h(
          Button,
          { as: 'a', href: '/account', ...(custom ? { render: (props) => h('a', props) } : {}) },
          'Account',
        ),
      ),
    );
    assert.match(html, custom ? /href="\/account"/ : /href="\/base\/account"/);
  }
});

test('highContrast is opt-in, secondary-only and never forwarded to the native element', () => {
  for (const mode of [{}, { as: 'a', href: '/account' }]) {
    for (const intent of ['primary', 'secondary', 'danger', 'accent']) {
      for (const appearance of ['fill', 'transparent', 'ghost']) {
        const props = { ...mode, intent, appearance };
        const normal = render(props);
        assert.equal(render({ ...props, highContrast: false }), normal);
        const contrast = render({ ...props, highContrast: true });
        assert.doesNotMatch(contrast, /highcontrast=/i);
        if (intent === 'secondary') {
          assert.match(contrast, /button-onhighcontrast/);
          assert.doesNotMatch(contrast, /bg-button-disabled|text-disabled/);
        } else assert.equal(contrast, normal);
      }
    }
  }
});
