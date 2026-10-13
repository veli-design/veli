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
