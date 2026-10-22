import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { Kbd, KbdGroup } from '@tradenetcorp/veli-ui/kbd';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const keys = (html) => [...html.matchAll(/<kbd\b([^>]*)>(.*?)<\/kbd>/g)];

test('Kbd renders native, noninteractive keyboard semantics and forwards attributes', () => {
  const html = render(h(Kbd, { id: 'escape', title: 'Escape', 'aria-label': 'Escape key' }, 'Esc'));
  assert.match(html, /^<kbd /);
  for (const attribute of [
    'id="escape"',
    'title="Escape"',
    'aria-label="Escape key"',
    'lang="en"',
  ]) {
    assert.ok(html.includes(attribute), attribute);
  }
  assert.doesNotMatch(html, /tabindex|role="button"/);
});

test('Latin keys retain their default language inside a Dhivehi provider', () => {
  const html = render(h(VeliProvider, { language: 'dv' }, h(Kbd, null, 'Ctrl')));
  assert.equal(keys(html).length, 1);
  assert.match(keys(html)[0][1], /lang="en"/);
  const latin = render(h(Kbd, { lang: 'en-GB', dir: 'ltr' }, 'Ctrl'));
  assert.match(latin, /lang="en-GB"/);
  assert.match(latin, /dir="ltr"/);
});

test('KbdGroup has nameable group semantics and preserves direct-child variant overrides', () => {
  const html = render(
    h(
      KbdGroup,
      { variant: 'inverted', 'aria-label': 'Control K', dir: 'ltr' },
      h(Kbd, null, 'Ctrl'),
      h(Kbd, { variant: 'default' }, 'K'),
      h('span', null, 'then'),
      h('span', null, h(Kbd, null, 'Enter')),
    ),
  );
  assert.match(html, /^<div role="group" aria-label="Control K" dir="ltr"/);
  assert.match(keys(html)[0][1], /bg-button-secondary-subtle/);
  assert.match(keys(html)[1][1], /bg-menu-shortcut-bg/);
  assert.match(keys(html)[2][1], /bg-menu-shortcut-bg/);
  assert.match(html, /<span>then<\/span>/);
});

test('KbdGroup supports default/null treatment, arbitrary content, and explicit direction', () => {
  for (const variant of [undefined, null, 'default']) {
    const html = render(
      h(
        KbdGroup,
        { variant, dir: 'rtl', className: 'gap-2', title: 'Shortcut' },
        h(Kbd, null, 'A'),
      ),
    );
    assert.match(html, /dir="rtl"/);
    assert.match(html, /title="Shortcut"/);
    assert.match(keys(html)[0][1], /bg-menu-shortcut-bg/);
    assert.match(html, /gap-2/);
    assert.doesNotMatch(html, /gap-0\.5/);
  }
});

test('consumer classes override key geometry without discarding variant styling', () => {
  const html = render(
    h(Kbd, { variant: 'inverted', className: 'h-6 px-2 leading-5' }, 'Page Down'),
  );
  assert.match(html, /h-6/);
  assert.match(html, /px-2/);
  assert.match(html, /leading-5/);
  assert.doesNotMatch(html, /\bh-5\b|\bpx-1\b|\bleading-4\b/);
  assert.match(html, /bg-button-secondary-subtle/);
  assert.match(html, /whitespace-nowrap/);
});
