// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { remarkDocsSearch } from './src/lib/remark-docs-search';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react()],
  markdown: {
    remarkPlugins: [remarkDocsSearch],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
