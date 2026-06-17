import { addons, type API, types } from 'storybook/internal/manager-api';
import { IconButton, Icons, TooltipLinkList, WithTooltip } from 'storybook/internal/components';
import * as React from 'react';
import {
  normalizeProviderSwitcherValues,
  providerSwitcherLanguageQueryParam,
  providerSwitcherReadyEvent,
  providerSwitcherSurfaceQueryParam,
  providerSwitcherThemeQueryParam,
  providerSwitcherUpdatedEvent,
  surfaceOptions,
  themeOptions,
  type VeliProviderSwitcherValues,
} from './shared';

type ProviderSwitcherToolbarProps = {
  api: {
    getQueryParam: (name: string) => string | undefined;
    setQueryParams: (params: Record<string, string>) => void;
  };
};

function readProviderSwitcherValues(
  api: ProviderSwitcherToolbarProps['api'],
): VeliProviderSwitcherValues {
  return normalizeProviderSwitcherValues({
    language: api.getQueryParam(providerSwitcherLanguageQueryParam),
    theme: api.getQueryParam(providerSwitcherThemeQueryParam),
    surface: api.getQueryParam(providerSwitcherSurfaceQueryParam),
  });
}

function ProviderSwitcherToolbar({ api }: ProviderSwitcherToolbarProps) {
  const [values, setValues] = React.useState(() => readProviderSwitcherValues(api));
  const channel = addons.getChannel();

  const updateValues = React.useCallback(
    (nextValues: Partial<VeliProviderSwitcherValues>) => {
      setValues((currentValues) => {
        const valuesToEmit = normalizeProviderSwitcherValues({
          ...currentValues,
          ...nextValues,
        });
        channel.emit(providerSwitcherUpdatedEvent, valuesToEmit);
        return valuesToEmit;
      });
    },
    [channel],
  );

  React.useEffect(() => {
    const syncPreview = () => {
      channel.emit(providerSwitcherUpdatedEvent, values);
    };

    channel.on(providerSwitcherReadyEvent, syncPreview);
    return () => {
      channel.removeListener(providerSwitcherReadyEvent, syncPreview);
    };
  }, [channel, values]);

  React.useEffect(() => {
    api.setQueryParams({
      [providerSwitcherLanguageQueryParam]: values.language,
      [providerSwitcherThemeQueryParam]: values.theme,
      [providerSwitcherSurfaceQueryParam]: values.surface,
    });
  }, [api, values.language, values.surface, values.theme]);

  return (
    <>
      <ProviderSwitcherDropdown
        icon={values.surface === 'raised' ? 'box' : 'circlehollow'}
        label={`Surface: ${
          surfaceOptions.find((option) => option.value === values.surface)?.label
        }`}
        value={values.surface}
        valueLabel={
          surfaceOptions.find((option) => option.value === values.surface)?.label ?? 'Surface'
        }
        options={surfaceOptions}
        onChange={(surface) => updateValues({ surface })}
      />
      <ProviderSwitcherDropdown
        icon={values.theme === 'dark' ? 'moon' : values.theme === 'light' ? 'sun' : 'mirror'}
        label={`Theme: ${themeOptions.find((option) => option.value === values.theme)?.label}`}
        value={values.theme}
        valueLabel={themeOptions.find((option) => option.value === values.theme)?.label ?? 'Theme'}
        options={themeOptions}
        onChange={(theme) => updateValues({ theme })}
      />
      <IconButton
        active={values.language === 'dv'}
        title={`Switch to ${values.language === 'dv' ? 'English / LTR' : 'Dhivehi / RTL'}`}
        onClick={() => updateValues({ language: values.language === 'dv' ? 'en' : 'dv' })}
      >
        <Icons icon="globe" />
        <span style={{ marginLeft: 4 }}>{values.language === 'dv' ? 'RTL' : 'LTR'}</span>
      </IconButton>
    </>
  );
}

type ProviderSwitcherDropdownProps<TValue extends string> = {
  icon: React.ComponentProps<typeof Icons>['icon'];
  label: string;
  value: TValue;
  valueLabel: string;
  options: Array<{ label: string; value: TValue }>;
  onChange: (value: TValue) => void;
};

function ProviderSwitcherDropdown<TValue extends string>({
  icon,
  label,
  value,
  valueLabel,
  options,
  onChange,
}: ProviderSwitcherDropdownProps<TValue>) {
  return (
    <WithTooltip
      closeOnOutsideClick
      placement="top"
      trigger="click"
      tooltip={({ onHide }) => (
        <TooltipLinkList
          links={options.map((option) => ({
            id: option.value,
            title: option.label,
            active: option.value === value,
            onClick: () => {
              onChange(option.value);
              onHide();
            },
          }))}
        />
      )}
    >
      <IconButton active={value !== options[0]?.value} title={label}>
        <Icons icon={icon} />
        <span style={{ marginLeft: 4 }}>{valueLabel}</span>
      </IconButton>
    </WithTooltip>
  );
}

addons.register('veli/provider-switcher', (api: API) => {
  addons.add('veli/provider-switcher/tool', {
    title: 'Veli provider',
    type: types.TOOL,
    match: ({ viewMode }: { viewMode?: string }) => viewMode === 'story' || viewMode === 'docs',
    render: () => <ProviderSwitcherToolbar api={api} />,
  });
});
