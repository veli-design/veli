import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from 'react-aria-components';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';

test('published Tooltip entry supports server rendering an initially open trigger', () => {
  const html = renderToStaticMarkup(
    h(
      TooltipTrigger,
      { defaultOpen: true },
      h(Button, null, 'Help'),
      h(Tooltip, { offset: 0 }, 'Additional help'),
    ),
  );
  assert.match(html, /^<button /);
  assert.match(html, /type="button"/);
  assert.match(html, /aria-describedby="[^"]+"/);
  assert.match(html, />Help<\/button>/);
});

test('closed Tooltip leaves its server-rendered trigger without a stale description', () => {
  const html = renderToStaticMarkup(
    h(TooltipTrigger, null, h(Button, null, 'Help'), h(Tooltip, null, 'Additional help')),
  );
  assert.doesNotMatch(html, /aria-describedby/);
  assert.match(html, />Help<\/button>/);
});
