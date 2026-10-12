import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox, CheckboxGroup } from '@tradenetcorp/veli-ui/checkbox';
import { FieldLabel } from '@tradenetcorp/veli-ui/field';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (props = {}, children = 'Email') =>
  renderToStaticMarkup(h(Checkbox, props, children));

const inputOf = (html) => html.match(/<input\b[^>]*type="checkbox"[^>]*>/)?.[0] ?? '';

test('all public sizes render the spec box, first-line slot, and text scale', () => {
  for (const [size, box, slot, labelStyle, messageStyle] of [
    ['md', 'size-4', 'h-5', 'type-body-sm-regular', 'type-body-sm-regular'],
    ['lg', 'size-5', 'h-6', 'type-body-md-regular', 'type-body-sm-regular'],
    ['xl', 'size-6', 'h-7', 'type-body-lg-regular', 'type-body-md-regular'],
  ]) {
    const html = render({ size, description: 'A short description' });
    assert.match(html, new RegExp(`\\b${box}\\b`), size);
    assert.match(html, new RegExp(`\\b${slot}\\b`), size);
    assert.match(html, new RegExp(`\\b${labelStyle}\\b`), size);
    assert.match(html, new RegExp(`\\b${messageStyle}\\b`), size);
    assert.match(html, /gap-x-3 gap-y-1/, size);
  }
  assert.match(render(), /items-center gap-3/);
});

test('check marks use the Figma vector sizes and grow alongside the dash', () => {
  // Exported Check vectors: 305:8917 (md), 305:8952 (lg), 5219:16933 (xl).
  for (const [size, expectedWidth, expectedHeight, expectedStroke] of [
    ['md', 10.9142, 8.12132, 2],
    ['lg', 13.8149, 10.6772, 2.5],
    ['xl', 16.3713, 12.182, 3],
  ]) {
    const check = render({ size, defaultSelected: true });
    const dash = render({ size, isIndeterminate: true });
    const checkSvg = check.match(/<svg\b[^>]*>/)?.[0] ?? '';
    const dashSvg = dash.match(/<svg\b[^>]*>/)?.[0] ?? '';
    const checkWidth = Number(checkSvg.match(/\bwidth="([^"]+)"/)?.[1]);
    const checkHeight = Number(checkSvg.match(/\bheight="([^"]+)"/)?.[1]);
    const dashWidth = Number(dashSvg.match(/\bwidth="([^"]+)"/)?.[1]);

    assert.equal(checkWidth, expectedWidth, size);
    assert.equal(checkHeight, expectedHeight, size);
    assert.ok(checkWidth > dashWidth, size);
    assert.match(checkSvg, new RegExp(`viewBox="0 0 ${expectedWidth} ${expectedHeight}"`));
    assert.match(check, new RegExp(`stroke-width="${expectedStroke}"`));
  }
});

test('helper and invalid error describe the input without joining its name', () => {
  const html = render({
    isInvalid: true,
    description: 'Sent to your account',
    errorMessage: 'Choose this option',
    'aria-describedby': 'external-help',
  });
  const input = inputOf(html);
  const labelId = input.match(/aria-labelledby="([^"]+)"/)?.[1];
  const describedBy = input.match(/aria-describedby="([^"]+)"/)?.[1]?.split(' ');
  assert.ok(labelId);
  assert.ok(describedBy);
  assert.ok(describedBy.length >= 3);
  assert.ok(describedBy.includes('external-help'));
  assert.match(html, new RegExp(`id="${labelId}"[^>]*>Email<\\/span>`));
  assert.match(html, new RegExp(`id="${describedBy.at(-2)}"[^>]*>Sent to your account<\\/span>`));
  assert.match(
    html,
    new RegExp(`id="${describedBy.at(-1)}"[^>]*role="alert"[^>]*>Choose this option<\\/span>`),
  );
  assert.match(input, /aria-invalid="true"/);
  assert.doesNotMatch(render({ errorMessage: 'Hidden error' }), /Hidden error|role="alert"/);
});

test('caller labels and numeric visible labels remain accessible', () => {
  assert.match(inputOf(render({ 'aria-label': 'Select all' }, null)), /aria-label="Select all"/);
  const numeric = render({}, 0);
  assert.match(numeric, />0<\/span>/);
  assert.match(inputOf(numeric), /aria-labelledby="[^"]+"/);
  assert.match(render({ isIndeterminate: true }), /M0 2H10/);
  assert.match(inputOf(render({ isDisabled: true })), /disabled=""/);
});

test('group connects its visible label and shared message and announces an error', () => {
  const normal = renderToStaticMarkup(
    h(
      CheckboxGroup,
      { name: 'channels', defaultValue: ['email'], description: 'Choose channels' },
      h(FieldLabel, {}, 'Notification channels'),
      h(Checkbox, { value: 'email' }, 'Email'),
      h(Checkbox, { value: 'sms' }, 'SMS'),
    ),
  );
  assert.match(normal, /role="group"/);
  assert.match(normal, /Notification channels/);
  assert.match(normal, /Choose channels/);
  assert.match(inputOf(normal), /checked=""/);
  const invalid = renderToStaticMarkup(
    h(
      CheckboxGroup,
      { 'aria-label': 'Notification channels', isInvalid: true, errorMessage: 'Choose one' },
      h(Checkbox, { value: 'email' }, 'Email'),
    ),
  );
  assert.match(invalid, /role="alert"/);
  assert.match(invalid, /Choose one/);
});

test('published checkbox entry and Dhivehi direction remain available', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(manifest.exports['./checkbox']), ['types', 'import', 'default']);
  const rtl = renderToStaticMarkup(
    h(VeliProvider, { language: 'dv' }, h(Checkbox, {}, 'އީމެއިލް')),
  );
  assert.match(rtl, /lang="dv" dir="rtl"/);
  assert.match(rtl, /އީމެއިލް/);
});
