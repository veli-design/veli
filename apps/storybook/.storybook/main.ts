import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tokenPlayground from '../../../packages/tokens/lib/playground.mjs';
import type { StorybookConfig } from '@storybook/react-vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const localAddon = (relativePath: string) => path.resolve(dirname, relativePath);

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    localAddon('./custom-addons/provider/preset.ts'),
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
      plugins: [
        ...(config.plugins || []),
        tokenPlayground(),
        tailwindcss(),
        {
          name: 'veli-preview-styles',
          // preview-head.html is inserted too late for Vite to bundle CSS links.
          transformIndexHtml: {
            order: 'pre',
            handler: () => [
              {
                tag: 'link',
                attrs: { rel: 'stylesheet', href: '/src/global.css' },
                injectTo: 'head',
              },
            ],
          },
        },
      ],
    };
  },
};

export default config;
