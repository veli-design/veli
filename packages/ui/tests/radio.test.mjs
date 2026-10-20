import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

test('published Radio entry renders independent option labels and messages on the server', () => {
  const html = renderToStaticMarkup(
    h(
      RadioGroup,
      { 'aria-label': 'Delivery', name: 'delivery', defaultValue: 'email' },
      h(Radio, { value: 'email', description: 'Email help' }, 'Email'),
      h(
        Radio,
        { value: 'sms', description: 'SMS help', isInvalid: true, errorMessage: 'SMS error' },
        'SMS',
      ),
    ),
  );
  const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([input]) => input);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(inputs.length, 2);
  assert.equal(ids.length, new Set(ids).size);
  assert.match(inputs[0], /name="delivery"/);
  assert.match(inputs[0], /checked=""/);
  assert.doesNotMatch(inputs[1], /checked=""/);
  for (const [index, label, description] of [
    [0, 'Email', 'Email help'],
    [1, 'SMS', 'SMS help'],
  ]) {
    const labelId = inputs[index].match(/aria-labelledby="([^"]+)"/)[1];
    assert.ok(html.includes(`id="${labelId}"`));
    assert.match(html.slice(html.indexOf(`id="${labelId}"`)), new RegExp(`>${label}</span>`));
    const descriptionIds = inputs[index].match(/aria-describedby="([^"]+)"/)[1].split(' ');
    assert.ok(
      descriptionIds.some(
        (id) =>
          html.includes(`id="${id}"`) &&
          html
            .slice(html.indexOf(`id="${id}"`))
            .split('</span>')[0]
            .endsWith(`>${description}`),
      ),
    );
  }
});

test('Radio retains numeric labels and caller-supplied accessible names', () => {
  const html = renderToStaticMarkup(
    h(
      RadioGroup,
      { 'aria-label': 'Rating' },
      h(Radio, { value: 'zero' }, 0),
      h(Radio, { value: 'one', 'aria-label': 'One star', isDisabled: true }, '★'),
    ),
  );
  assert.match(html, />0<\/span>/);
  assert.match(html, /aria-label="One star"/);
  assert.match(html, /disabled=""/);
});

for (const size of ['md', 'lg', 'xl']) {
  test(`Radio ${size} preserves selection, disabled state, and localized message associations`, () => {
    for (const [lang, dir, label, description, error] of [
      ['en', 'ltr', 'Label text', 'Description text', 'Error text'],
      ['dv', 'rtl', 'ލޭބަލްގެ ލިޔުން', 'ތަފްޞީލު ލިޔުން', 'އެރަރ ޓެކްސްޓް'],
    ]) {
      const html = renderToStaticMarkup(
        h(
          'div',
          { lang, dir },
          h(
            RadioGroup,
            { 'aria-label': 'Choices', name: 'choice', defaultValue: 'on' },
            ...['on', 'off'].map((value) =>
              h(
                Radio,
                {
                  size,
                  value,
                  isDisabled: true,
                  isInvalid: true,
                  description,
                  errorMessage: error,
                },
                label,
              ),
            ),
          ),
        ),
      );
      const inputs = [...html.matchAll(/<input\b[^>]*>/g)].map(([input]) => input);
      assert.equal(inputs.length, 2);
      assert.match(inputs[0], /checked=""/);
      assert.doesNotMatch(inputs[1], /checked=""/);
      for (const input of inputs) {
        assert.match(input, /disabled=""/);
        assert.match(input, /name="choice"/);
        const labelId = input.match(/aria-labelledby="([^"]+)"/)[1];
        assert.ok(html.includes(`id="${labelId}"`));
        assert.ok(
          html
            .slice(html.indexOf(`id="${labelId}"`))
            .split('</span>')[0]
            .endsWith(`>${label}`),
        );
        const messageIds = input.match(/aria-describedby="([^"]+)"/)[1].split(' ');
        for (const message of [description, error]) {
          assert.ok(
            messageIds.some(
              (id) =>
                html.includes(`id="${id}"`) &&
                html
                  .slice(html.indexOf(`id="${id}"`))
                  .split('</span>')[0]
                  .endsWith(`>${message}`),
            ),
          );
        }
      }
    }
  });
}

test('large and extra-large radios use a 2px ring only when selected and disabled', () => {
  for (const size of ['lg', 'xl']) {
    for (const isDisabled of [false, true]) {
      for (const isSelected of [false, true]) {
        const html = renderToStaticMarkup(
          h(
            RadioGroup,
            { 'aria-label': 'Choices', defaultValue: isSelected ? 'a' : 'b' },
            h(Radio, { value: 'a', size, isDisabled }, 'Option'),
          ),
        );
        const controlClasses = html
          .match(/class="([^"]*bg-radio-container-bg[^"]*)"/)[1]
          .split(' ');
        assert.deepEqual(
          controlClasses.filter((name) => /^border-\d+$/.test(name)),
          [isSelected && isDisabled ? 'border-2' : 'border-3'],
          `${size}: selected=${isSelected}, disabled=${isDisabled}`,
        );
      }
    }
  }
});
