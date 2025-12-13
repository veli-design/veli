// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  vite: {
    plugins: [
      tailwindcss({
        content: [
          './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
          '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
        ],
      }),
    ],
  },
  output: 'static',
});
