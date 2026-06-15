import type { Preview } from '@storybook/react';
import { withProviderSwitcher } from './custom-addons/provider';
import '../src/global.css';

const preview: Preview = {
  decorators: [withProviderSwitcher],
  parameters: {
    backgrounds: {
      disable: true,
      grid: {
        disable: false,
      },
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
