// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import rehypeCodeBlocks from './src/lib/rehype-code-blocks.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), react()],
  markdown: {
    rehypePlugins: [rehypeCodeBlocks],
  },
  vite: {
    plugins: [tailwindcss()],
  },
  output: 'static',
});
