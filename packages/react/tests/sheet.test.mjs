/**
 * @file Focused test suite for Veli UI Sheet primitive.
 *
 * Tested behaviours:
 * - Public API exports (`Sheet`, `SheetProps`, `Sheet.Trigger`, package manifest entry)
 * - Accessible name & description wiring (`slot="title"`, `aria-describedby`, non-empty title invariant)
 * - Localization & RTL directionality (Dhivehi close label, `lang`, `dir` forwarding, logical corner radius)
 * - Content slots & composition (`headerActions`, `footer`, close button)
 * - Keyboard & touch affordances (`tabIndex={0}` scrollable body region, swipe grabber handle)
 * - Responsive layout & size variants (`sm`, `md`, `lg`, `full`, wide responsive padding)
 * - Height variants & bottom compound viewport styling
 * - Dismissal configuration (`isDismissable` -> `preventDismissal`)
 * - Reduced motion & high contrast / forced-colors contracts
 *
 * Documented untested limitations (verified manually in Storybook runtime):
 * - Gesture physics & native swipe progress: React Aria's pointer/touch gesture tracking runs
 *   in live browser DOM and cannot be simulated in Node static tests.
 * - Dynamic visual-viewport height tracking: `--visual-viewport-height` and `--page-height`
 *   CSS variables rely on browser window layout engines.
 * - Interactive Escape key and backdrop pointer dismissal dispatch: React Aria's overlay
 *   event loop is exercised via Storybook interactions and browser runtime checks.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(packageDir, 'src', 'sheet.tsx'), 'utf8');
const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));

test('Sheet exposes the public API and package export', () => {
  assert.match(source, /export function Sheet\b/);
  assert.match(source, /export interface SheetProps\b/);
  assert.match(source, /Sheet\.Trigger = SheetTrigger/);
  assert.ok(manifest.exports['./sheet']);
});

test('Sheet heading carries the title as the accessible name', () => {
  assert.match(source, /slot="title"/);
  assert.match(source, /\{accessibleTitle\}/);
});

test('Sheet close button is localized for English and Dhivehi', () => {
  assert.match(source, /aria-label=\{language\.language === 'dv' \? 'ލައްޕާ' : 'Close sheet'\}/);
  assert.match(source, /slot="close"/);
});

test('Sheet overlay forwards lang and dir from provider', () => {
  assert.match(source, /lang=\{language\.lang\}/);
  assert.match(source, /dir=\{language\.direction\}/);
});

test('Sheet description wires aria-describedby only when provided', () => {
  assert.match(source, /aria-describedby=\{description \? descriptionId : undefined\}/);
  assert.match(source, /slot="description"/);
});

test('Sheet footer renders only when provided', () => {
  assert.match(source, /\{footer && \(/);
  assert.match(source, /veli-sheet-footer/);
});

test('Sheet headerActions slot renders in the header', () => {
  assert.match(source, /\{headerActions\}/);
  assert.match(source, /veli-sheet-header/);
});

test('Sheet body region is labelled and keyboard-focusable for scroll', () => {
  assert.match(source, /role="region"/);
  assert.match(source, /aria-label=\{accessibleTitle\}/);
  assert.match(source, /tabIndex=\{0\}/);
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

test('Sheet isDismissable maps to preventDismissal', () => {
  assert.match(source, /preventDismissal=\{!isDismissable\}/);
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

test('Sheet touch grabber handle is conditional on position and showHandle', () => {
  assert.match(source, /position === 'bottom' && showHandle/);
  assert.match(source, /lg:hidden/);
  assert.match(source, /rounded-full bg-neutral-alpha-600/);
});

test('Sheet requires a nonempty title for accessibility', () => {
  assert.match(
    source,
    /invariantDev\(\s*normalizedTitle,\s*'Veli UI: Sheet requires a nonempty title/,
  );
  assert.match(source, /language\.language === 'dv' \? 'ތަފްސީލު' : 'Details'/);
});
