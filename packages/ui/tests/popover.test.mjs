import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from 'react-aria-components';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
} from '@tradenetcorp/veli-ui/popover';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'popover.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

const renderDialog = (children, provider = {}) =>
  renderToStaticMarkup(h(VeliProvider, provider, h(PopoverDialog, null, children)));

test('Popover exposes the public composition API', () => {
  for (const component of [
    'Popover',
    'PopoverTrigger',
    'PopoverDialog',
    'PopoverHeader',
    'PopoverContent',
    'PopoverFooter',
  ]) {
    assert.match(source, new RegExp(`export function ${component}\\b`));
  }
  assert.match(source, /export type PopoverIntent = 'primary' \| 'secondary' \| 'tertiary';/);
  assert.ok(manifest.exports['./popover']);
});

test('Popover trigger server-renders without the portal content', () => {
  const html = renderToStaticMarkup(
    h(
      PopoverTrigger,
      { defaultOpen: true },
      h(Button, null, 'Open'),
      h(Popover, null, h(PopoverDialog, { 'aria-label': 'Details' }, 'Body')),
    ),
  );
  assert.match(html, /^<button /);
  assert.match(html, />Open<\/button>/);
});

test('PopoverHeader title names the dialog', () => {
  const html = renderDialog(h(PopoverHeader, { title: 'Filters', icon: h('svg') }));
  const dialog = html.match(/<section[^>]*role="dialog"[^>]*>/)?.[0];
  const labelledBy = dialog?.match(/aria-labelledby="([^"]+)"/)?.[1];
  assert.ok(labelledBy, html);
  assert.match(html, new RegExp(`<h2[^>]*id="${labelledBy}"[^>]*>Filters</h2>`));
  assert.match(html, /<span aria-hidden="true" class="inline-flex shrink-0/);
});

test('PopoverHeader accepts a heading level and forwards DOM props', () => {
  const html = renderDialog(
    h(PopoverHeader, { title: 'Filters', titleLevel: 3, id: 'header', 'data-testid': 'header' }),
  );
  assert.match(html, /<h3[^>]*>Filters<\/h3>/);
  assert.match(html, /id="header"/);
  assert.match(html, /data-testid="header"/);
});

test('PopoverHeader close button is localized and overridable', () => {
  const onClose = () => {};
  assert.match(
    renderDialog(h(PopoverHeader, { title: 'Filters', onClose })),
    /aria-label="Close popover"/,
  );
  assert.match(
    renderDialog(h(PopoverHeader, { title: 'ފިލްޓަރސް', onClose }), { language: 'dv' }),
    /aria-label="ޕޮޕްއޯވަރ ބަންދުކުރައްވާ"/,
  );
  assert.match(
    renderDialog(h(PopoverHeader, { title: 'Filters', onClose, closeButtonLabel: 'Dismiss' })),
    /aria-label="Dismiss"/,
  );
});

test('Popover dividers are decorative and optional', () => {
  const withDividers = renderDialog([
    h(PopoverHeader, { key: 'header', title: 'Title' }),
    h(PopoverFooter, { key: 'footer', label: 'Label' }),
  ]);
  assert.equal(withDividers.match(/<div aria-hidden="true" class="h-px/g)?.length, 2);

  const withoutDividers = renderDialog([
    h(PopoverHeader, { key: 'header', title: 'Title', showDivider: false }),
    h(PopoverFooter, { key: 'footer', label: 'Label', showDivider: false }),
  ]);
  assert.doesNotMatch(withoutDividers, /class="h-px/);
});

test('PopoverContent and PopoverFooter forward DOM props', () => {
  const html = renderDialog([
    h(PopoverContent, { key: 'content', id: 'content', className: 'max-h-60' }, 'Body'),
    h(PopoverFooter, { key: 'footer', id: 'footer', label: 'Label' }, h(Button, null, 'Apply')),
  ]);
  assert.match(html, /id="content" class="min-h-0 flex-1 px-4 py-3 max-h-60"/);
  assert.match(html, /id="footer"/);
  assert.match(html, /type-caption-regular text-base-default">Label</);
  assert.match(html, /justify-end gap-2"><button/);
});

test('Popover intents match the Figma surfaces', () => {
  assert.match(source, /rounded-xl bg-clip-padding shadow-lg outline-0/);
  assert.doesNotMatch(source, /shadow-xl/);
  assert.match(source, /primary: 'bg-popover-bg-primary text-popover-fg-on-primary'/);
  assert.match(source, /secondary: 'bg-popover-bg-secondary text-popover-fg-on-secondary'/);
  assert.match(source, /tertiary: 'bg-popover-bg-tertiary text-base-default'/);
  assert.match(source, /tertiary: 'bg-border-base-muted'/);
  assert.match(source, /forced-colors:outline-\[CanvasText\]/);
});

test('Popover propagates height so the body can scroll under a max-height', () => {
  assert.match(source, /group flex min-h-0 flex-col outline-0/);
  assert.match(source, /relative flex max-h-full min-h-0 w-full flex-col overflow-visible/);
  assert.match(source, /flex min-h-0 min-w-0 flex-1 flex-col outline-none/);
  assert.match(source, /flex shrink-0 flex-col px-4/);
  assert.match(source, /min-h-0 flex-1 px-4 py-3/);
  assert.match(source, /flex min-h-0 flex-1 flex-col overflow-hidden rounded-\[inherit\]/);
});

test('Popover arrow uses physical placements and the surface fill', () => {
  assert.doesNotMatch(source, /case 'start'|case 'end'|placement\^=/);
  assert.match(source, /'fill-popover-bg-primary'/);
  assert.match(source, /'fill-popover-bg-secondary'/);
  assert.match(source, /'fill-popover-bg-tertiary'/);
  assert.match(source, /const offset = showArrow \? 12 : 8;/);
});

test('Popover close button keeps hover and focus treatment on each surface', () => {
  assert.match(source, /data-\[hovered\]:bg-popover-fg-on-primary\/10/);
  assert.match(source, /data-\[hovered\]:bg-popover-fg-on-secondary\/10/);
  assert.match(source, /focus-visible:ring-offset-popover-bg-tertiary/);
  assert.doesNotMatch(source, /\bhover:bg-popover|\bactive:bg-popover/);
});

test('Popover honors reduced motion', () => {
  assert.match(source, /transition-\[opacity,scale,translate\] duration-normal ease-out/);
  assert.match(source, /origin-\[var\(--trigger-anchor-point\)\]/);
  assert.match(
    source,
    /'motion-safe:data-\[entering\]:scale-\[0\.96\] motion-safe:data-\[exiting\]:scale-\[0\.96\]'/,
  );
  assert.match(source, /data-\[entering\]:opacity-0 data-\[exiting\]:opacity-0/);
  assert.doesNotMatch(source, /data-\[exiting\]:ease-in/);
  assert.doesNotMatch(source, /group-data-\[/);
  const slides = source.match(/'[^']*translate-[xy]-2'/g) ?? [];
  assert.equal(slides.length, 8);
  for (const slide of slides) assert.match(slide, /^'motion-safe:/);
});
