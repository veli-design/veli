import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { parseDate } from '@internationalized/date';
import {
  Calendar,
  RangeCalendar,
  CalendarHeader,
  CalendarGridHeader,
} from '@veli-design/react/calendar';
import { VeliProvider } from '@veli-design/react/provider';

const date = parseDate('2026-10-15');
const render = (Component = Calendar, props = {}, language = 'en') =>
  renderToStaticMarkup(
    h(
      VeliProvider,
      { language, colorScheme: 'light' },
      h(Component, { 'aria-label': 'Booking', defaultFocusedValue: date, ...props }),
    ),
  );

for (const Component of [Calendar, RangeCalendar]) {
  test(`${Component.name} renders a complete seven-day grid and public customizations`, () => {
    const html = render(Component, { gridClassName: 'custom-grid', className: 'custom-root' });
    assert.equal((html.match(/<th\b/g) ?? []).length, 7);
    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
      assert.ok(html.includes(day));
    assert.match(html, /role="application"/);
    assert.match(html, /custom-grid/);
    assert.match(html, /custom-root/);
    assert.match(html, /aria-label="Previous month"/);
    assert.match(html, /aria-label="Year"/);
    assert.doesNotMatch(html, />Today</);
  });
  test(`${Component.name} localizes headers and optional Today control in RTL`, () => {
    const html = render(Component, { showTodayButton: true }, 'dv');
    assert.match(html, /lang="dv" dir="rtl"/);
    for (const label of ['އޮކްޓޯބަރު', 'ބުރާސްފަތި', 'މިއަދު', 'އަހަރު'])
      assert.ok(html.includes(label), label);
    assert.doesNotMatch(html, /aria-label="Previous month"/);
    assert.ok(
      render(Component, {
        showTodayButton: true,
        todayButtonLabel: 'Select current date',
      }).includes('Select current date'),
    );
  });
  test(`${Component.name} keeps validation text associated with the calendar`, () => {
    const html = render(Component, {
      isInvalid: true,
      defaultValue: Component === Calendar ? date : { start: date, end: date },
      errorMessage: 'Choose an available date.',
    });
    const errorId = html.match(/<div[^>]*id="([^"]+)" slot="errorMessage"/)?.[1];
    assert.ok(errorId, 'Error message receives a React Aria slot id');
    assert.ok(
      html.includes(`aria-describedby="${errorId}"`),
      'Selected date references its validation message',
    );
    // React Aria connects the description after the error slot mounts; browser tests verify it.
    assert.match(html, /Choose an available date\./);
  });
}

test('Calendar supports week-start overrides and a six-week month', () => {
  const monday = render(Calendar, { firstDayOfWeek: 'mon' });
  assert.ok(monday.indexOf('>Mon<') < monday.indexOf('>Sun<'));
  const august = render(Calendar, { defaultFocusedValue: parseDate('2026-08-15') });
  assert.equal((august.match(/role="gridcell"/g) ?? []).length, 42);
});

test('Calendar disables unavailable dates and out-of-window dates semantically', () => {
  const html = render(Calendar, {
    minValue: date,
    maxValue: date.add({ days: 4 }),
    isDateUnavailable: (d) => d.day === 16,
  });
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /data-unavailable="true"/);
});

test('RangeCalendar exposes selected endpoints, interior days, and a single-day range', () => {
  const html = render(RangeCalendar, { defaultValue: { start: date, end: date.add({ days: 3 }) } });
  assert.match(html, /data-selection-start="true"/);
  assert.match(html, /data-selection-end="true"/);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 4);
  const single = render(RangeCalendar, { defaultValue: { start: date, end: date } });
  assert.equal((single.match(/aria-selected="true"/g) ?? []).length, 1);
});

test('Calendar composition exports remain available', () => {
  assert.equal(typeof CalendarHeader, 'function');
  assert.equal(typeof CalendarGridHeader, 'function');
});

test('Calendar preserves an explicit caller locale outside Dhivehi mode', async () => {
  const { I18nProvider } = await import('react-aria-components');
  const html = renderToStaticMarkup(
    h(
      I18nProvider,
      { locale: 'fr-FR' },
      h(Calendar, { 'aria-label': 'Booking', defaultValue: date }),
    ),
  );
  assert.match(html, />octobre</);
});
