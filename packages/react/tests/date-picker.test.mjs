import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { parseDate } from '@internationalized/date';
import { DatePicker } from '@veli-design/react/date-picker';
import { VeliProvider } from '@veli-design/react/provider';

function render(props, language = 'en') {
  return renderToStaticMarkup(
    h(
      VeliProvider,
      { language },
      h(DatePicker, {
        label: 'Appointment date',
        defaultValue: parseDate('2026-10-15'),
        ...props,
      }),
    ),
  );
}

test('DatePicker preserves editable segments, submitted ISO values and required precedence', () => {
  const html = render({
    name: 'appointment',
    isRequired: true,
    isOptional: true,
    description: 'Choose a weekday.',
  });
  assert.equal((html.match(/role="spinbutton"/g) ?? []).length, 3);
  assert.match(html, /name="appointment"[^>]*value="2026-10-15"/);
  assert.match(html, /aria-required="true"/);
  assert.ok(!html.includes('>Optional<'));
  assert.match(html, /slot="description"[^>]*>Choose a weekday\./);
});

test('DatePicker read-only/disabled triggers stay unavailable in both languages', () => {
  for (const language of ['en', 'dv'])
    for (const state of ['isReadOnly', 'isDisabled']) {
      const html = render({ [state]: true }, language);
      const trigger = html.match(/<button[^>]*slot="button"[^>]*>/)?.[0];
      assert.ok(trigger?.includes('disabled=""'));
      assert.match(html, state === 'isReadOnly' ? /aria-readonly="true"/ : /aria-disabled="true"/);
      assert.ok(html.includes(language === 'dv' ? 'ކަލަންޑަރު ހުޅުވާ' : 'Open calendar'));
    }
});
