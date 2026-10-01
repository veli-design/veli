import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '@tradenetcorp/veli-ui/link';

const render = (props, children = 'Account') =>
  renderToStaticMarkup(createElement(Link, props, children));

test('Link forwards native navigation and accessible labeling', () => {
  const html = render({
    href: '/account',
    target: '_blank',
    rel: 'noreferrer',
    download: 'account.txt',
    'aria-label': 'Download account',
  });
  assert.match(html, /^<a /);
  for (const attribute of [
    'href="/account"',
    'target="_blank"',
    'rel="noreferrer"',
    'download="account.txt"',
    'aria-label="Download account"',
  ]) {
    assert.ok(html.includes(attribute), attribute);
  }
});

test('disabled Link uses a non-navigating element with accessible disabled state', () => {
  const html = render({ href: '/account', isDisabled: true, isHovered: true, isPressed: true });
  assert.match(html, /^<span /);
  assert.match(html, /role="link"/);
  assert.match(html, /aria-disabled="true"/);
  assert.doesNotMatch(html, /<a[\s>]/);
});

test('render-prop children receive current-page and disabled state', () => {
  assert.match(
    render({ href: '/account', 'aria-current': 'page' }, ({ isCurrent }) =>
      isCurrent ? 'Current account' : 'Account',
    ),
    />Current account<\/a>/,
  );
  assert.match(
    render({ href: '/account', isDisabled: true }, ({ isDisabled }) =>
      isDisabled ? 'Unavailable account' : 'Account',
    ),
    />Unavailable account<\/span>/,
  );
});

test('custom render can retain a disabled fallback even when href is forwarded', () => {
  const customRender = (props, state) =>
    createElement(state.isDisabled || !('href' in props) ? 'span' : 'a', props);
  assert.match(render({ href: '/account', render: customRender }), /^<a /);
  const disabled = render({ href: '/account', isDisabled: true, render: customRender });
  assert.match(disabled, /^<span /);
  assert.match(disabled, /aria-disabled="true"/);
});
