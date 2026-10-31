import { URL } from 'node:url';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertCloseButton,
} from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (
  props = {},
  children = [
    h(Alert.Title, { key: 'title' }, 'Permit review'),
    h(Alert.Description, { key: 'description' }, 'Application details'),
  ],
) => renderToStaticMarkup(h(Alert, props, children));
const slotClasses = (html, slot) =>
  html.match(new RegExp(`data-slot="${slot}"[^>]*class="([^"]*)"`))?.[1] ?? '';

test('Alert defaults to a persistent neutral light message and forwards native attributes', () => {
  const html = render({
    id: 'permit',
    lang: 'en',
    dir: 'rtl',
    'aria-label': 'Application status',
    'aria-describedby': 'details',
    'data-owner': 'permits',
  });
  for (const attribute of [
    'role="status"',
    'id="permit"',
    'lang="en"',
    'dir="rtl"',
    'aria-label="Application status"',
    'aria-describedby="details"',
    'data-owner="permits"',
  ])
    assert.ok(html.includes(attribute), attribute);
  assert.match(slotClasses(html, 'alert'), /bg-alert-light-neutral-bg/);
  assert.match(slotClasses(html, 'alert-title'), /text-base-emphasis/);
  assert.match(slotClasses(html, 'alert-description'), /text-base-strong/);
  assert.doesNotMatch(html, /data-slot="alert-icon"|<button|tabindex/);
});

test('announcement roles can be overridden without changing visuals', () => {
  const base = slotClasses(render(), 'alert');
  assert.match(render({ live: 'alert' }), /role="alert"/);
  const region = render({ live: 'alert', role: 'region', 'aria-label': 'Permit' });
  assert.match(region, /role="region"/);
  assert.equal(slotClasses(region, 'alert'), base);
});

test('controlled visibility takes precedence over the initial uncontrolled value', () => {
  assert.equal(render({ defaultVisible: false }), '');
  assert.equal(render({ isVisible: false, defaultVisible: true }), '');
  assert.notEqual(render({ isVisible: true, defaultVisible: false }), '');
});

test('all compound parts remain available as named and attached exports', () => {
  assert.equal(Alert.Title, AlertTitle);
  assert.equal(Alert.Description, AlertDescription);
  assert.equal(Alert.Actions, AlertActions);
  assert.equal(Alert.CloseButton, AlertCloseButton);
  const dts = readFileSync(new URL('../dist/alert.d.ts', import.meta.url), 'utf8');
  assert.match(dts, /AlertAppearance = 'light' \| 'highContrast'/);
  assert.match(dts, /AlertLayout = 'default' \| 'stacked' \| 'compact'/);
});

test('icons are decorative and each slot has its own semantic colour', () => {
  const html = render({
    appearance: 'highContrast',
    intent: 'danger',
    leadingIcon: h('svg', { 'data-custom-icon': true }),
  });
  assert.match(html, /aria-hidden="true" data-slot="alert-icon"/);
  assert.match(slotClasses(html, 'alert-title'), /text-alert-high-contrast-danger-foreground/);
  assert.match(
    slotClasses(html, 'alert-description'),
    /text-alert-high-contrast-danger-description/,
  );
  assert.match(slotClasses(html, 'alert-icon'), /text-alert-high-contrast-danger-foreground/);
  assert.doesNotMatch(slotClasses(html, 'alert'), /\[&_svg\]/);
});

test('the close Button has a localized name and never submits a form', () => {
  const content = h(Alert.CloseButton);
  const en = render({}, content);
  assert.match(en, /type="button"/);
  assert.match(en, /aria-label="Dismiss alert"/);
  assert.match(en, /data-\[hovered\]:text-base-strong/);
  const highContrast = render({ appearance: 'highContrast', intent: 'neutral' }, content);
  assert.match(highContrast, /text-alert-high-contrast-neutral-foreground/);
  assert.doesNotMatch(highContrast, /data-\[hovered\]:text-base-strong/);
  const dv = renderToStaticMarkup(h(VeliProvider, { language: 'dv' }, h(Alert, {}, content)));
  assert.match(dv, /lang="dv" dir="rtl"/);
  assert.match(dv, /aria-label="އެލާޓް ލައްޕާ"/);
  assert.match(
    render({}, h(Alert.CloseButton, { 'aria-label': 'Close maintenance notice' })),
    /aria-label="Close maintenance notice"/,
  );
});

test('highContrast applies foreground to Veli ghost actions without tinting other controls', () => {
  const html = render(
    { appearance: 'highContrast', intent: 'info' },
    h(
      Alert.Actions,
      {},
      h(
        Button,
        { size: 'sm', intent: 'secondary', appearance: 'transparent', 'data-test': 'primary' },
        'Track',
      ),
      h(
        Fragment,
        {},
        h(
          Button,
          {
            size: 'sm',
            intent: 'secondary',
            appearance: 'ghost',
            'data-test': 'ghost',
            isDisabled: true,
          },
          'Later',
        ),
      ),
      h('a', { href: '/track', className: 'text-primary' }, 'Track link'),
    ),
  );
  const primary = html.match(/<button[^>]*data-test="primary"[^>]*>/)?.[0];
  const ghost = html.match(/<button[^>]*data-test="ghost"[^>]*>/)?.[0];
  assert.doesNotMatch(primary, /text-alert-/);
  assert.match(ghost, /text-alert-high-contrast-info-foreground/);
  assert.doesNotMatch(ghost, /data-\[hovered\]:text-base-strong/);
  assert.match(ghost, /disabled/);
  assert.match(html, /<a href="\/track" class="text-primary">/);
});

test('compact renders every supplied child; consumers own content composition', () => {
  const html = render({ layout: 'compact' });
  assert.match(html, /Permit review/);
  assert.match(html, /Application details/);
  assert.doesNotMatch(html, /hidden|truncate/);
});
