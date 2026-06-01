import type { Decorator, Preview } from '@storybook/react';
import { VeliProvider, type VeliLanguage } from '@tradenetcorp/veli-ui/provider';
import '../src/global.css';

const defaultLanguage: VeliLanguage = 'en';

const isVeliLanguage = (value: unknown): value is VeliLanguage => value === 'en' || value === 'dv';

const withVeliLanguage: Decorator = (Story, context) => {
  const language = isVeliLanguage(context.globals.language)
    ? context.globals.language
    : defaultLanguage;

  return (
    <VeliProvider language={language}>
      <Story />
    </VeliProvider>
  );
};

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
  },
  decorators: [withVeliLanguage],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
