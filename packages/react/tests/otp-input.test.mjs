import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Form } from '@veli-design/react/form';
import { OTPInput, OTPInputSeparator, OTPInputSlot } from '@veli-design/react/otp-input';
import { VeliProvider } from '@veli-design/react/provider';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const render = (props, wrap = (field) => field) =>
  renderToStaticMarkup(wrap(h(OTPInput, { name: 'code', label: 'Code', ...props })));
const inputTag = (html) => html.match(/<input[^>]*>/g) ?? [];
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const slotIndexes = (html) => [...html.matchAll(/data-otp-index="(\d+)"/g)].map(([, i]) => +i);

test('Form validationErrors reach FieldError without an explicit errorMessage', () => {
  const html = render({ isRequired: true }, (field) =>
    h(Form, { validationErrors: { code: 'That code has expired.' } }, field),
  );
  assert.match(html, /slot="errorMessage"[^>]*>That code has expired\.</);
  assert.equal(attr(inputTag(html)[0], 'aria-invalid'), 'true');
});

test('a partial code fails completeness and an empty field is left to isRequired', () => {
  const partial = render({ defaultValue: '123' }, (field) => h(Form, null, field));
  assert.match(partial, />Enter all 6 characters\.</);
  const empty = render({ isRequired: true }, (field) => h(Form, null, field));
  assert.doesNotMatch(empty, /Enter all/);
  assert.equal(attr(inputTag(empty)[0], 'aria-required'), 'true');
  const full = render({ defaultValue: '123456' }, (field) => h(Form, null, field));
  assert.doesNotMatch(full, /slot="errorMessage"/);
});

test('completeness copy follows the Veli language', () => {
  const html = render({ defaultValue: '1' }, (field) =>
    h(VeliProvider, { language: 'dv' }, h(Form, null, field)),
  );
  assert.doesNotMatch(html, /Enter all/);
  assert.match(html, /slot="errorMessage"[^>]*>[^<]*6[^<]*</);
});

test('one named input holds the sanitized code with no separators', () => {
  const html = render({ groups: [3, 3], defaultValue: '12-3a4' });
  const inputs = inputTag(html);
  assert.equal(inputs.length, 1);
  assert.equal(attr(inputs[0], 'name'), 'code');
  assert.equal(attr(inputs[0], 'value'), '1234');
  assert.equal(attr(render({ value: ' 9 8 7 ' }).match(/<input[^>]*>/)[0], 'value'), '987');
});

test('the root maps every slot once, in order, from length or groups', () => {
  assert.deepEqual(slotIndexes(render({})), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(slotIndexes(render({ length: 4 })), [0, 1, 2, 3]);
  assert.deepEqual(slotIndexes(render({ groups: [4, 4, 2] })), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const seen = [];
  render({
    groups: [2, 2],
    defaultValue: '12',
    renderSlot: (slot) => {
      seen.push([slot.index, slot.char]);
      return h(OTPInputSlot, { slot, className: 'font-mono' });
    },
  });
  assert.deepEqual(seen, [
    [0, '1'],
    [1, '2'],
    [2, null],
    [3, null],
  ]);
});

test('separator shows between groups, hides with null, and is absent for one group', () => {
  const glyphs = (html) => (html.match(/>-</g) ?? []).length;
  assert.equal(glyphs(render({ groups: [3, 3] })), 1);
  assert.equal(glyphs(render({ groups: [2, 2, 2] })), 2);
  assert.equal(glyphs(render({ groups: [3, 3], separator: null })), 0);
  assert.equal(glyphs(render({ length: 6 })), 0);
  assert.match(
    render({ groups: [4, 4], separator: h(OTPInputSeparator, null, '·') }),
    /aria-hidden="true"[^>]*>·</,
  );
});

test('the alphabet sets keyboard hints and the code stays left to right', () => {
  const digits = inputTag(render({}))[0];
  assert.equal(attr(digits, 'inputMode'), 'numeric');
  assert.equal(attr(digits, 'autoComplete'), 'one-time-code');
  assert.equal(attr(digits, 'dir'), 'ltr');
  assert.equal(attr(digits, 'spellCheck'), 'false');

  const upper = inputTag(render({ alphabet: 'alphanumeric-upper', defaultValue: 'ab-12' }))[0];
  assert.equal(attr(upper, 'inputMode'), 'text');
  assert.equal(attr(upper, 'autoCapitalize'), 'characters');
  assert.equal(attr(upper, 'value'), 'AB12');

  assert.equal(attr(inputTag(render({ autoComplete: 'off' }))[0], 'autoComplete'), 'off');
});

test('screen readers get one labelled text field; slots are hidden', () => {
  const html = render({ label: 'Verification code' }, (field) =>
    h(VeliProvider, { language: 'dv' }, field),
  );
  const input = inputTag(html)[0];
  const labelId = attr(input, 'aria-labelledby');
  assert.match(html, new RegExp(`id="${labelId}"[^>]*>Verification code<`));
  for (const slot of html.match(/<span[^>]*data-otp-index[^>]*>/g)) {
    assert.match(slot, /aria-hidden="true"/);
  }
  assert.match(html, /<div aria-hidden="true" dir="ltr"/);
});

test('OTPInputSlot only renders inside OTPInput', () => {
  assert.throws(() => renderToStaticMarkup(h(OTPInputSlot, { slot: {} })), /OTPInput/);
});

test('invalid slot counts are rejected', () => {
  assert.throws(() => render({ length: 0 }), RangeError);
  assert.throws(() => render({ groups: [3, 1.5] }), RangeError);
});

test('the package does not depend on input-otp', () => {
  for (const field of ['dependencies', 'peerDependencies', 'devDependencies']) {
    assert.equal(packageJson[field]?.['input-otp'], undefined, field);
  }
});
