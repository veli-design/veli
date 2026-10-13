import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nProvider } from 'react-aria-components';
import { ComboBox, ComboBoxItem } from '@tradenetcorp/veli-ui/combobox';
import { Input } from '@tradenetcorp/veli-ui/input';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (props = {}, wrapper = (node) => node) =>
  renderToStaticMarkup(
    wrapper(
      h(ComboBox, { label: 'Location', ...props }, h(ComboBoxItem, { id: 'mv' }, 'Maldives')),
    ),
  );
const liveMarkup = (html) => html.replace(/<template>[\s\S]*?<\/template>/g, '');

test('ComboBox optional copy is explicit, localized, and suppressed by required', () => {
  assert.doesNotMatch(liveMarkup(render()), />Optional</);
  assert.match(liveMarkup(render({ isOptional: true })), />Optional</);
  for (const showRequiredIndicator of [true, false]) {
    const html = liveMarkup(render({ isOptional: true, isRequired: true, showRequiredIndicator }));
    assert.doesNotMatch(html, />Optional</);
    assert.equal(html.includes('>*</span>'), showRequiredIndicator);
    assert.match(html, /required=""/);
  }
  assert.match(liveMarkup(render({ isOptional: true, lang: 'dv' })), /އިޚްތިޔާރީ/);
  assert.match(
    liveMarkup(render({ isRequired: true, labelSupplementary: 'VAT included' })),
    /VAT included/,
  );
});

test('ComboBox info trigger has independent identity and no disclosure attributes', () => {
  const html = liveMarkup(render({ infoTooltip: 'Choose a supported location' }));
  const info = html.match(/<button[^>]*aria-label="More information"[^>]*>/)?.[0];
  assert.ok(info);
  assert.doesNotMatch(
    info,
    /aria-expanded|aria-haspopup|aria-controls|aria-labelledby|tabindex="-1"/,
  );
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(html, /aria-label="Show suggestions"/);
});

test('ComboBox locale overrides update field direction and localized marker independently of provider', () => {
  const dv = liveMarkup(
    render({ lang: 'dv', isOptional: true }, (node) => h(VeliProvider, { language: 'en' }, node)),
  );
  assert.match(dv, /lang="dv" dir="rtl"/);
  assert.match(dv, /އިޚްތިޔާރީ/);
  const en = liveMarkup(
    render({ lang: 'en', dir: 'ltr', isOptional: true }, (node) =>
      h(VeliProvider, { language: 'dv' }, node),
    ),
  );
  assert.match(en, /lang="en" dir="ltr"/);
  assert.match(en, />Optional</);
  const external = liveMarkup(
    render({ isOptional: true }, (node) => h(I18nProvider, { locale: 'dv-MV' }, node)),
  );
  assert.match(external, /lang="dv-MV" dir="rtl"/);
  assert.match(external, /އިޚްތިޔާރީ/);
});

test('ComboBox disabled and read-only states preserve selection and match shell fill', () => {
  for (const state of [{ isDisabled: true }, { isReadOnly: true }]) {
    const html = liveMarkup(render({ ...state, defaultValue: 'mv', appearance: 'outline' }));
    assert.match(html, /bg-text-input-bg-hover/);
    assert.match(html, /value="Maldives"/);
    assert.doesNotMatch(html, /shadow-\[inset|hover:border|focus-within:border/);
    assert.match(html, state.isDisabled ? /<input[^>]*disabled=""/ : /<input[^>]*readOnly=""/);
  }
});

test('ComboBox helper tone is muted without changing other fields or validation association', () => {
  const html = liveMarkup(render({ description: 'Search locations' }));
  assert.match(html, /class="[^"]*text-base-muted"[^>]*slot="description"/);
  const descriptionId = html.match(/id="([^"]+)" slot="description"/)?.[1];
  assert.ok(descriptionId);
  assert.ok(
    html
      .match(/aria-describedby="([^"]+)"/)?.[1]
      .split(' ')
      .includes(descriptionId),
  );
  const disabled = liveMarkup(render({ isDisabled: true, description: 'Disabled help' }));
  assert.match(disabled, /class="[^"]*text-disabled"[^>]*slot="description"/);
  const input = renderToStaticMarkup(h(Input, { label: 'Name', description: 'Enter name' }));
  assert.match(input, /class="[^"]*text-base-subtle"[^>]*slot="description"/);
  const invalid = liveMarkup(
    render({ isInvalid: true, description: 'Hidden helper', errorMessage: 'Choose a location' }),
  );
  assert.doesNotMatch(invalid, /Hidden helper/);
  assert.match(invalid, /text-danger-muted/);
  assert.match(invalid, /Choose a location/);
});
