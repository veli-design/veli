import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';
import { Switch } from '@tradenetcorp/veli-ui/switch';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

export function SwitchUsageDemo() {
  return <Switch>Notifications</Switch>;
}

export function SwitchRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';

  return (
    <DocsPreview
      codeKey={`switch-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <I18nProvider locale={isDhivehi ? 'dv-MV' : 'en-GB'}>
        <div lang={isDhivehi ? 'dv' : 'en'} dir={isDhivehi ? 'rtl' : 'ltr'}>
          <Switch>{isDhivehi ? 'ނޯޓިފިކޭޝަންސް' : 'Notifications'}</Switch>
        </div>
      </I18nProvider>
    </DocsPreview>
  );
}

export function SwitchAppearancesDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Switch defaultSelected>Default</Switch>
      <Switch appearance="subtle" defaultSelected>
        Subtle
      </Switch>
    </div>
  );
}

export function SwitchStatesDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(['default', 'subtle'] as const).map((appearance) => (
        <div key={appearance} className="flex flex-col gap-4">
          <span className="type-body-sm-medium text-base-muted">
            {appearance === 'default' ? 'Default' : 'Subtle'}
          </span>
          <Switch appearance={appearance}>Off</Switch>
          <Switch appearance={appearance} defaultSelected>
            On
          </Switch>
          <Switch appearance={appearance} isDisabled>
            Disabled off
          </Switch>
          <Switch appearance={appearance} isDisabled defaultSelected>
            Disabled on
          </Switch>
          <Switch appearance={appearance} isReadOnly defaultSelected>
            Read only
          </Switch>
        </div>
      ))}
    </div>
  );
}

export function SwitchSizesDemo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(['default', 'subtle'] as const).map((appearance) => (
        <div key={appearance} className="flex flex-col gap-4">
          <span className="type-body-sm-medium text-base-muted">
            {appearance === 'default' ? 'Default' : 'Subtle'}
          </span>
          <Switch appearance={appearance} size="sm" defaultSelected>
            Small
          </Switch>
          <Switch appearance={appearance} size="md" defaultSelected>
            Medium
          </Switch>
          <Switch appearance={appearance} size="lg" defaultSelected>
            Large
          </Switch>
        </div>
      ))}
    </div>
  );
}
