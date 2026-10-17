import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'tabs.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

const defaultItems = [
  { id: 'overview', label: 'Overview', panel: 'Overview panel' },
  { id: 'services', label: 'Services', panel: 'Services panel' },
  { id: 'pricing', label: 'Pricing', panel: 'Pricing panel' },
];

const render = (props = {}, provider = {}) =>
  renderToStaticMarkup(
    createElement(
      VeliProvider,
      provider,
      createElement(Tabs, {
        listAriaLabel: 'Service sections',
        items: defaultItems,
        ...props,
      }),
    ),
  );

test('Tabs exposes the public API and package export', () => {
  assert.match(source, /export function Tabs\b/);
  assert.match(source, /export function TabsOverflow\b/);
  assert.match(source, /Prefer configuring overflow through `Tabs`/);
  assert.ok(manifest.exports['./tabs']);
});

test('Tabs matches the Figma spacing model', () => {
  assert.match(source, /sm: 'p-2'/);
  assert.match(source, /md: 'px-2 py-2\.5'/);
  assert.match(source, /lg: 'px-2 py-2\.5'/);
  assert.match(source, /sm: 'px-1\.5'/);
  assert.match(source, /md: 'px-2'/);
  assert.doesNotMatch(source, /gap-2 rounded-lg whitespace-nowrap/);
  assert.match(source, /inline-flex shrink-0 items-center p-0\.5/);
});

test('Tabs hugs the tab group and scrolls when narrow', () => {
  assert.match(source, /relative inline-flex w-max items-end border-b-2/);
  assert.match(source, /w-full max-w-full overflow-x-auto/);
  assert.match(source, /overflow-x-auto overscroll-x-contain p-1/);
  assert.match(source, /scrollbar-width:none/);
  assert.match(source, /container\.scrollBy\(\{ left:/);
  assert.doesNotMatch(source, /\.scrollIntoView\s*\(/);
  assert.match(source, /motion-safe:scroll-smooth/);
});

test('Tabs honors reduced motion and logical selection indicator placement', () => {
  assert.match(
    source,
    /motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-in-out motion-reduce:transition-none/,
  );
  assert.match(source, /absolute -bottom-1 start-0 h-0\.5 w-full/);
  assert.doesNotMatch(source, /inset-inline-start-0/);
});

test('Tabs renders tablist semantics and a single tabIndex=0', () => {
  const html = render();
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label="Service sections"/);
  assert.match(html, /role="tab"/);
  assert.match(html, /role="tabpanel"/);

  const tabIndexes = [...html.matchAll(/tabindex="(-?\d+)"/g)].map((match) => match[1]);
  assert.equal(tabIndexes.filter((value) => value === '0').length, 1);
});

test('Tabs aria-controls resolves to a panel id', () => {
  const html = render();
  const tabMatch = html.match(
    /aria-controls="([^"]+)"[^>]*role="tab"|role="tab"[^>]*aria-controls="([^"]+)"/,
  );
  assert.ok(tabMatch);
  const panelId = tabMatch[1] ?? tabMatch[2];
  assert.match(
    html,
    new RegExp(`id="${panelId}"[^>]*role="tabpanel"|role="tabpanel"[^>]*id="${panelId}"`),
  );
});

test('Tabs keeps aria-controls resolving in overflow mode', () => {
  const html = render({
    overflowItems: [
      { id: 'billing', label: 'Billing', panel: 'Billing panel' },
      { id: 'integrations', label: 'Integrations', panel: 'Integrations panel' },
    ],
  });

  assert.equal([...html.matchAll(/role="tablist"/g)].length, 1);
  assert.match(html, /role="tabpanel"/);
  assert.match(html, />More</);

  const tabMatch = html.match(
    /aria-controls="([^"]+)"[^>]*role="tab"|role="tab"[^>]*aria-controls="([^"]+)"/,
  );
  assert.ok(tabMatch);
  const panelId = tabMatch[1] ?? tabMatch[2];
  assert.match(
    html,
    new RegExp(`id="${panelId}"[^>]*role="tabpanel"|role="tabpanel"[^>]*id="${panelId}"`),
  );
});

test('Tabs still renders a hidden panel when panel content is omitted', () => {
  const html = render({
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'services', label: 'Services' },
    ],
  });

  assert.match(html, /role="tabpanel"/);
  assert.match(html, /clip-path:inset\(50%\)/);
});

test('Tabs selects the first enabled tab by default', () => {
  const html = render({
    items: [
      { id: 'disabled', label: 'Disabled', isDisabled: true, panel: 'Disabled panel' },
      { id: 'overview', label: 'Overview', panel: 'Overview panel' },
      { id: 'services', label: 'Services', panel: 'Services panel' },
    ],
  });

  assert.match(html, /aria-selected="true"[^>]*>[\s\S]*Overview/);
  assert.doesNotMatch(html, /aria-selected="true"[^>]*>[\s\S]*Disabled/);
});

test('Tabs applies size classes', () => {
  assert.match(render({ size: 'sm' }), /p-2/);
  assert.match(render({ size: 'md' }), /px-2 py-2\.5/);
  assert.match(render({ size: 'lg' }), /px-2 py-2\.5/);
  assert.match(render({ size: 'sm' }), /type-body-sm-regular|type-body-sm-medium/);
  assert.match(render({ size: 'md' }), /type-body-md-regular|type-body-md-medium/);
  assert.match(render({ size: 'lg' }), /type-body-lg-regular|type-body-lg-medium/);
});

test('Tabs defaults keyboardActivation to manual when any item has an href', () => {
  assert.match(
    source,
    /keyboardActivation: keyboardActivation \?\? \(hasLinkItems \? 'manual' : undefined\)/,
  );

  const html = render({
    items: [
      { id: '/overview', label: 'Overview', href: '/overview' },
      { id: '/services', label: 'Services', href: '/services' },
    ],
  });

  assert.match(html, /href="\/overview"/);
  assert.match(html, /href="\/services"/);
});

test('Tabs localizes the overflow More label from language', () => {
  assert.match(source, /tabsOverflowDefaultLabels/);
  assert.match(source, /language === 'dv'/);
  assert.doesNotMatch(source, /const defaultLabel = direction === 'rtl' \? 'އިތުރު' : 'More'/);

  const english = render({
    overflowItems: [{ id: 'billing', label: 'Billing', panel: 'Billing panel' }],
  });
  assert.match(english, />More</);

  const dhivehi = render(
    {
      overflowItems: [{ id: 'billing', label: 'ބިލިންގ', panel: 'ބިލިންގ panel' }],
    },
    { language: 'dv' },
  );
  assert.match(dhivehi, />އިތުރު</);
});

test('Tabs uses a single AriaTabs tree for overflow', () => {
  assert.match(source, /const tree = \(/);
  assert.doesNotMatch(source, /const tree = !hasOverflow \?/);
  assert.match(source, /Keep overflow tabs in the collection for panels\/selection/);
});
