import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');
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
      resolve: {
        ...config.resolve,
        alias: [
          ...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : []),
          {
            find: /^@tradenetcorp\/veli-ui\/(?!tailwind$)(.+)$/,
            replacement: path.resolve(repoRoot, 'packages/ui/src/$1'),
          },
        ],
      },
    };
  },
};

export default config;
