import type { Decorator, Preview } from '@storybook/react';
import { CoralProvider, type CoralLanguage } from '@tradenetcorp/coral-ui/provider';
import '../src/global.css';

const defaultLanguage: CoralLanguage = 'en';

const isCoralLanguage = (value: unknown): value is CoralLanguage =>
  value === 'en' || value === 'dv';

const withCoralLanguage: Decorator = (Story, context) => {
  const language = isCoralLanguage(context.globals.language)
    ? context.globals.language
    : defaultLanguage;

  return (
    <CoralProvider language={language}>
      <Story />
    </CoralProvider>
  );
};

const preview: Preview = {
  globalTypes: {
    language: {
      name: 'Language',
      description: 'Coral language and direction mode',
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
  decorators: [withCoralLanguage],
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
