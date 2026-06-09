import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    return {
      ...config,
      plugins: [...(config.plugins || []), tailwindcss()],
      resolve: {
        ...config.resolve,
        conditions: ['veli-source', ...(config.resolve?.conditions || [])],
      },
    };
  },
};

export default config;
