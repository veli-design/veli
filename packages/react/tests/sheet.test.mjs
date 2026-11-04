/**
 * Public exports, server rendering and styling contracts for Sheet.
 * DOM composition regressions run in the existing fixtures/next/probe.test.mjs
 * consumer suite. Native gestures, layout and focus need a real browser.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as sheet from '../dist/sheet.js';
import { Button } from '../dist/button.js';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'sheet.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

const parts = ['Header', 'Title', 'Description', 'Body', 'Footer', 'Handle', 'Close'];

test('Sheet exports its composed parts as named and attached components', () => {
  assert.equal(typeof sheet.Sheet, 'function');
  assert.ok(sheet.Sheet.Trigger);
  for (const part of parts) {
    assert.equal(typeof sheet[`Sheet${part}`], 'function');
    assert.equal(sheet.Sheet[part], sheet[`Sheet${part}`]);
  }
  assert.ok(manifest.exports['./sheet']);
});

test('a closed composed Sheet server-renders its opening control', () => {
  const html = renderToStaticMarkup(
    createElement(
      sheet.Sheet.Trigger,
      null,
      createElement(Button, null, 'Open details'),
      createElement(
        sheet.Sheet,
        null,
        createElement(
          sheet.Sheet.Header,
          null,
          createElement(sheet.Sheet.Title, null, 'Details'),
          createElement(sheet.Sheet.Close),
        ),
        createElement(sheet.Sheet.Body, null, 'Task content'),
      ),
    ),
  );
  assert.match(html, /Open details/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /Task content/);
});

test('composed parts reject usage outside a Sheet', () => {
  for (const part of parts) {
    assert.throws(
      () => renderToStaticMarkup(createElement(sheet.Sheet[part])),
      /Sheet subcomponents must be used within a Sheet/,
    );
  }
});

test('Sheet size variants map to width classes', () => {
  assert.match(source, /sm: 'w-md'/);
  assert.match(source, /md: 'w-xl'/);
  assert.match(source, /lg: 'w-3xl'/);
  assert.match(source, /full: 'w-full'/);
});

test('Sheet position variants produce correct rounding', () => {
  assert.match(source, /bottom: 'rounded-t-4xl'/);
  assert.match(source, /data-\[position=left\]:rounded-r-4xl/);
  assert.match(source, /data-\[position=right\]:rounded-l-4xl/);
});

test('Sheet bottom viewport height compound variant is defined', () => {
  assert.match(
    source,
    /position: 'bottom',\s*height: 'viewport',\s*className: 'h-\[calc\(var\(--visual-viewport-height\)/,
  );
});

test('Sheet backdrop honors reduced motion', () => {
  assert.match(source, /motion-reduce:animate-none!/);
});

test('Sheet forced-colors outline is present', () => {
  assert.match(source, /forced-colors:outline-solid forced-colors:outline-1/);
  assert.match(source, /forced-colors:focus-visible:outline-\[Highlight\]/);
});

test('Sheet wide layout adds responsive padding', () => {
  assert.match(source, /isWide && 'lg:px-14 lg:py-5'/);
  assert.match(source, /isWide && 'lg:px-14 lg:py-8'/);
  assert.match(source, /isWide && 'lg:px-14'/);
});

test('Sheet touch grabber is explicitly composed and only renders at the bottom', () => {
  assert.match(source, /Sheet\.Handle = SheetHandle/);
  assert.match(source, /position !== 'bottom'/);
  assert.match(source, /lg:hidden/);
  assert.match(source, /rounded-full bg-neutral-alpha-600/);
});
