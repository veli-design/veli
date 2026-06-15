import type { Decorator, StoryContext } from '@storybook/react';
import * as React from 'react';
import { addons } from 'storybook/internal/preview-api';
import {
  VeliProvider,
  type VeliColorScheme,
  type VeliResolvedColorScheme,
} from '@tradenetcorp/veli-ui/provider';
import {
  normalizeProviderSwitcherValues,
  providerSwitcherLanguageQueryParam,
  providerSwitcherReadyEvent,
  providerSwitcherSurfaceQueryParam,
  providerSwitcherThemeQueryParam,
  providerSwitcherUpdatedEvent,
  surfaceOptions,
  type VeliProviderSwitcherValues,
} from './shared';

function readProviderSwitcherValues() {
  const params = new URLSearchParams(document.location.search);

  return normalizeProviderSwitcherValues({
    language: params.get(providerSwitcherLanguageQueryParam) ?? undefined,
    theme: params.get(providerSwitcherThemeQueryParam) ?? undefined,
    surface: params.get(providerSwitcherSurfaceQueryParam) ?? undefined,
  });
}

function ProviderSwitcher({
  children,
  context,
}: {
  children: React.ReactNode;
  context: StoryContext;
}) {
  const [values, setValues] = React.useState(readProviderSwitcherValues);

  /*
   * Keep existing story decorators that read context.globals.language working,
   * without using Storybook's global update path for the toolbar controls.
   */
  /* eslint-disable react-hooks/immutability */
  context.globals.language = values.language;
  context.globals.theme = values.theme;
  context.globals.surface = values.surface;
  /* eslint-enable react-hooks/immutability */

  React.useEffect(() => {
    const channel = addons.getChannel();
    const updateProvider = (nextValues: Partial<VeliProviderSwitcherValues>) => {
      setValues((currentValues) =>
        normalizeProviderSwitcherValues({ ...currentValues, ...nextValues }),
      );
    };

    channel.on(providerSwitcherUpdatedEvent, updateProvider);
    channel.emit(providerSwitcherReadyEvent);

    return () => {
      channel.removeListener(providerSwitcherUpdatedEvent, updateProvider);
    };
  }, []);

  return (
    <StorybookThemeRoot
      colorScheme={values.theme}
      storyId={context.id}
      surface={values.surface}
      viewMode={context.viewMode}
    >
      <VeliProvider
        language={values.language}
        colorScheme={values.theme}
        className="text-text-default-default"
      >
        {children}
      </VeliProvider>
    </StorybookThemeRoot>
  );
}

function StorybookThemeRoot({
  colorScheme,
  storyId,
  surface,
  viewMode,
  children,
}: {
  colorScheme: VeliColorScheme;
  storyId: string;
  surface: VeliProviderSwitcherValues['surface'];
  viewMode: StoryContext['viewMode'];
  children: React.ReactNode;
}) {
  const resolvedColorScheme = useResolvedStorybookColorScheme(colorScheme);
  const surfaceBackground = surfaceOptions.find((option) => option.value === surface)?.background;
  const surfaceSelector = viewMode === 'docs' ? `#anchor--${storyId} .docs-story` : '.sb-show-main';
  const surfaceStyleId = viewMode === 'docs' ? `veli-surface-docs-${storyId}` : 'veli-surface';

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedColorScheme === 'dark');
    root.dataset.theme = resolvedColorScheme;
    root.dataset.colorScheme = colorScheme;
    root.style.colorScheme = resolvedColorScheme;
    if (surfaceBackground) {
      setStyle(
        surfaceStyleId,
        `
          ${surfaceSelector} {
            background: ${surfaceBackground} !important;
          }
        `,
      );
    } else {
      removeStyle(surfaceStyleId);
    }

    return () => {
      root.classList.remove('dark');
      delete root.dataset.theme;
      delete root.dataset.colorScheme;
      root.style.removeProperty('color-scheme');
      removeStyle(surfaceStyleId);
    };
  }, [colorScheme, resolvedColorScheme, surfaceBackground, surfaceSelector, surfaceStyleId]);

  return (
    <div
      data-theme={resolvedColorScheme}
      data-color-scheme={colorScheme}
      className={resolvedColorScheme === 'dark' ? 'dark' : undefined}
      style={{
        colorScheme: resolvedColorScheme,
      }}
    >
      {children}
    </div>
  );
}

function setStyle(id: string, css: string) {
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    if (existingStyle.textContent !== css) existingStyle.textContent = css;
    return;
  }

  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function removeStyle(id: string) {
  document.getElementById(id)?.remove();
}

function useResolvedStorybookColorScheme(colorScheme: VeliColorScheme): VeliResolvedColorScheme {
  const [systemColorScheme, setSystemColorScheme] =
    React.useState<VeliResolvedColorScheme>('light');

  React.useEffect(() => {
    if (colorScheme !== 'system') return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemColorScheme = () => {
      setSystemColorScheme(query.matches ? 'dark' : 'light');
    };

    updateSystemColorScheme();
    query.addEventListener('change', updateSystemColorScheme);

    return () => {
      query.removeEventListener('change', updateSystemColorScheme);
    };
  }, [colorScheme]);

  return colorScheme === 'system' ? systemColorScheme : colorScheme;
}

export const withProviderSwitcher: Decorator = (Story, context) => {
  return (
    <ProviderSwitcher context={context}>
      <Story />
    </ProviderSwitcher>
  );
};
