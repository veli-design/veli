import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Search } from '@tradenetcorp/veli-ui/search';
import { Form } from '@tradenetcorp/veli-ui/form';
import { Field, FieldLabel } from '@tradenetcorp/veli-ui/field';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const render = (props = {}, provider = {}) =>
  renderToStaticMarkup(
    createElement(
      VeliProvider,
      provider,
      createElement(Search, { 'aria-label': 'Search services', ...props }),
    ),
  );

test('Search forwards native attributes to its search input', () => {
  const html = render({
    name: 'query',
    form: 'services',
    autoCapitalize: 'none',
    autoComplete: 'on',
    autoCorrect: 'off',
    enterKeyHint: 'go',
    inputMode: 'search',
    maxLength: 40,
    minLength: 2,
    pattern: '.*',
    spellCheck: false,
  });
  const input = html.match(/<input\b[^>]*>/)?.[0];
  assert.ok(input);
  for (const attribute of [
    'type="search"',
    'aria-label="Search services"',
    'name="query"',
    'form="services"',
    'autoCapitalize="none"',
    'autoComplete="on"',
    'autoCorrect="off"',
    'enterKeyHint="go"',
    'inputMode="search"',
    'maxLength="40"',
    'minLength="2"',
    'pattern=".*"',
    'spellCheck="false"',
  ])
    assert.ok(input.includes(attribute), attribute);
});

test('Search localizes defaults and allows an empty placeholder', () => {
  assert.match(render(), /placeholder="Search"/);
  assert.match(render({ defaultValue: 'Veli' }), /aria-label="Clear search"/);
  const dhivehi = render({ defaultValue: 'ހޯދާ' }, { language: 'dv' });
  assert.match(dhivehi, /placeholder="ހޯދާ"/);
  assert.match(dhivehi, /aria-label="ހޯދުން ފޮހެލާ"/);
  assert.match(render({ placeholder: '' }), /placeholder=""/);
});

test('Search only offers clearing for a nonempty editable value', () => {
  assert.doesNotMatch(render(), /<button\b/);
  assert.match(render({ value: 'Query', onChange() {} }), /<button\b[^>]*type="button"/);
  for (const flags of [
    { isDisabled: true },
    { isReadOnly: true },
    { isDisabled: true, isReadOnly: true, isInvalid: true },
  ]) {
    const html = render({ defaultValue: 'Query', ...flags });
    assert.doesNotMatch(html, /<button\b/);
    assert.match(html, /value="Query"/);
  }
});

test('Search exposes helper and error associations with validation semantics', () => {
  const helper = render({ description: 'Search by name' });
  assert.match(helper, /aria-describedby="[^"]+"/);
  assert.match(helper, /class="[^"]*text-base-muted"[^>]*slot="description"/);
  assert.match(helper, /slot="description"[^>]*>Search by name/);
  const disabledHelper = render({
    label: 'Unavailable',
    description: 'Unavailable hint',
    isDisabled: true,
    isRequired: true,
  });
  assert.match(disabledHelper, /<label[^>]*text-base-muted/);
  assert.match(disabledHelper, /class="[^"]*text-disabled"[^>]*slot="description"/);
  assert.match(disabledHelper, /text-danger-muted[^>]*>\*/);
  const error = render({
    isInvalid: true,
    description: 'Hidden helper',
    errorMessage: 'Try another query',
  });
  assert.match(error, /aria-invalid="true"/);
  assert.match(error, /aria-describedby="[^"]+"/);
  assert.match(error, /Try another query/);
  assert.doesNotMatch(error, /Hidden helper/);
});

test('Search supports external accessible names and native required fields', () => {
  const html = render({
    'aria-label': undefined,
    'aria-labelledby': 'query-label',
    'aria-describedby': 'query-hint',
    isRequired: true,
  });
  assert.match(html, /aria-labelledby="query-label"/);
  assert.match(html, /aria-describedby="[^"]*query-hint[^"]*"/);
  assert.match(html, /<input[^>]*required=""/);
});

test('Search associates its optional visible label and shares Veli required indicators', () => {
  const html = render({ 'aria-label': undefined, label: 'Find a service', isRequired: true });
  const labelId = html.match(/<label[^>]*id="([^"]+)"/)?.[1];
  assert.ok(labelId);
  assert.ok(html.includes(`aria-labelledby="${labelId}"`));
  assert.match(
    html,
    /<label[^>]*type-body-sm-regular[^>]*data-slot="field-label"[^>]*>Find a service/,
  );
  assert.match(html, /aria-hidden="true">\*<\/span>/);
  assert.doesNotMatch(
    render({ label: 'Find a service', isRequired: true, showRequiredIndicator: false }),
    />\*<\/span>/,
  );
  assert.doesNotMatch(render(), /<label\b/);
  assert.match(render({ label: 'Unavailable', isDisabled: true }), /<label[^>]*text-base-muted/);
});

test('Search inherits Veli Form validation behavior and named server errors', () => {
  const renderForm = (formProps = {}) =>
    renderToStaticMarkup(
      createElement(
        VeliProvider,
        {},
        createElement(
          Form,
          formProps,
          createElement(Search, {
            name: 'query',
            'aria-label': 'Search services',
            isRequired: true,
          }),
        ),
      ),
    );
  const aria = renderForm();
  assert.match(aria, /<input[^>]*aria-required="true"/);
  assert.doesNotMatch(aria, /<input[^>]*\srequired=""/);
  assert.match(renderForm({ validationBehavior: 'native' }), /<input[^>]*\srequired=""/);
  const invalid = renderForm({ validationErrors: { query: 'No matching service' } });
  assert.match(invalid, /<input[^>]*aria-invalid="true"/);
  assert.match(invalid, /<input[^>]*aria-describedby="[^"]+"/);
  assert.match(invalid, /No matching service/);
});

test('FieldLabel supports explicit control state without losing Field context defaults', () => {
  const renderLabel = (props) =>
    renderToStaticMarkup(
      createElement(
        VeliProvider,
        {},
        createElement(
          Field,
          { isDisabled: true, isRequired: true },
          createElement(FieldLabel, props, 'Query'),
        ),
      ),
    );
  assert.match(renderLabel({}), /<label[^>]*text-base-muted/);
  assert.match(renderLabel({}), /text-danger-muted[^>]*>\*/);
  assert.match(renderLabel({}), /aria-hidden="true">\*/);
  const overridden = renderLabel({ isDisabled: false, isRequired: false });
  assert.match(overridden, /<label[^>]*text-base-default/);
  assert.doesNotMatch(overridden, /aria-hidden="true">\*/);
});
