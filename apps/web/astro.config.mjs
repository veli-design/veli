// @ts-check
import process from 'node:process';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { remarkDocsSearch } from './src/lib/remark-docs-search';
import rehypeCodeBlocks from './src/lib/rehype-code-blocks.mjs';
import { remarkDocsMarkdown } from './src/lib/remark-docs-markdown.mjs';

const site = process.env.PUBLIC_SITE_URL?.trim();

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : {}),
  integrations: [mdx(), react()],
  markdown: {
    remarkPlugins: [remarkDocsMarkdown, remarkDocsSearch],
    rehypePlugins: [rehypeCodeBlocks],
  },
  vite: {
    ssr: { external: ['@tradenetcorp/veli-blocks/catalog'] },
    plugins: [tailwindcss()],
  },
  output: 'static',
});
