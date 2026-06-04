import type { Decorator, Preview } from '@storybook/react';
import * as React from 'react';
import {
  VeliProvider,
  type VeliColorScheme,
  type VeliLanguage,
  type VeliResolvedColorScheme,
} from '@tradenetcorp/veli-ui/provider';
import '../src/global.css';

const defaultLanguage: VeliLanguage = 'en';
const defaultTheme: VeliColorScheme = 'system';

const isVeliLanguage = (value: unknown): value is VeliLanguage => value === 'en' || value === 'dv';
const isVeliColorScheme = (value: unknown): value is VeliColorScheme =>
  value === 'system' || value === 'light' || value === 'dark';

const withVeliProvider: Decorator = (Story, context) => {
  const language = isVeliLanguage(context.globals.language)
    ? context.globals.language
    : defaultLanguage;
  const theme = isVeliColorScheme(context.globals.theme) ? context.globals.theme : defaultTheme;

  return (
    <StorybookThemeRoot colorScheme={theme}>
      <VeliProvider
        language={language}
        colorScheme={theme}
        className="min-h-screen bg-bg-surface-base text-text-default-default"
      >
        <Story />
      </VeliProvider>
    </StorybookThemeRoot>
  );
};

function StorybookThemeRoot({
  colorScheme,
  children,
}: {
  colorScheme: VeliColorScheme;
  children: React.ReactNode;
}) {
  const resolvedColorScheme = useResolvedStorybookColorScheme(colorScheme);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedColorScheme === 'dark');
    root.dataset.theme = resolvedColorScheme;
    root.dataset.colorScheme = colorScheme;
    root.style.colorScheme = resolvedColorScheme;

    return () => {
      root.classList.remove('dark');
      delete root.dataset.theme;
      delete root.dataset.colorScheme;
      root.style.removeProperty('color-scheme');
    };
  }, [colorScheme, resolvedColorScheme]);

  return (
    <div
      data-theme={resolvedColorScheme}
      data-color-scheme={colorScheme}
      className={resolvedColorScheme === 'dark' ? 'dark' : undefined}
      style={{ colorScheme: resolvedColorScheme }}
    >
      {children}
    </div>
  );
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

const preview: Preview = {
  globalTypes: {
    language: {
      name: 'Language',
      description: 'Veli language and direction mode',
      defaultValue: defaultLanguage,
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English / LTR' },
          { value: 'dv', title: 'Dhivehi / RTL' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Veli color scheme',
      defaultValue: defaultTheme,
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    language: defaultLanguage,
    theme: defaultTheme,
  },
  decorators: [withVeliProvider],
  parameters: {
    backgrounds: {
      default: 'Veli surface',
      values: [
        {
          name: 'Veli surface',
          value: 'var(--color-bg-surface-base)',
        },
        {
          name: 'Veli raised',
          value: 'var(--color-bg-surface-raised)',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
