import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LinkContext, RouterProvider } from 'react-aria-components';
import { TagButton } from '@veli-design/react/tags';

for (const [name, Component] of [['TagButton', TagButton]]) {
  const render = (props = {}, context) => {
    let child = h(Component, { as: 'a', href: '/guide', ...props }, 'Guide');
    if (context) child = h(LinkContext.Provider, { value: context }, child);
    return renderToStaticMarkup(
      h(RouterProvider, { navigate() {}, useHref: (href) => `/app${href}` }, child),
    );
  };

  test(`${name} uses the consumer's React Aria Components RouterProvider`, () => {
    assert.match(render(), /href="\/app\/guide"/);
    assert.match(render({ href: '/other' }), /href="\/app\/other"/);
  });

  test(`${name} accepts an empty native destination`, () => {
    const html = renderToStaticMarkup(h(Component, { as: 'a', href: '' }, 'Current document'));
    assert.match(html, /^<a /);
    assert.match(html, /href=""/);
    assert.doesNotMatch(html, /role="button"|<span[^>]*role="link"/);
  });

  test(`${name} leaves URL mapping to a custom router renderer`, () => {
    let received;
    const html = render({
      render: (props) => {
        received = props.href;
        return h('a', { ...props, href: `/custom${props.href}` });
      },
    });
    assert.equal(received, '/guide');
    assert.match(html, /href="\/custom\/guide"/);
  });

  test(`${name} keeps disabled native anchors destination-free inside RouterProvider`, () => {
    for (const context of [undefined, { isDisabled: true }]) {
      const html = render(context ? {} : { isDisabled: true }, context);
      assert.match(html, /^<a /);
      assert.match(html, /aria-disabled="true"/);
      assert.match(html, /tabindex="-1"/);
      assert.doesNotMatch(html, /href=/);
    }
  });
}
