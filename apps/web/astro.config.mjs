// @ts-check
import process from 'node:process';
import { writeFileSync } from 'node:fs';
import { URL } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import tokenPlayground from '../../packages/tokens/lib/playground.mjs';
import { renderHeaders } from './src/lib/doc-areas.mjs';
import { remarkDocsSearch } from './src/lib/remark-docs-search';
import rehypeCodeBlocks from './src/lib/rehype-code-blocks.mjs';
import rehypeDocTables from './src/lib/rehype-doc-tables.mjs';
import rehypePreviewCode from './src/lib/rehype-preview-code.mjs';
import { remarkDocsMarkdown } from './src/lib/remark-docs-markdown.mjs';
import { remarkComponentTabs } from './src/lib/remark-component-tabs.mjs';
import { remarkFrameworkTabs } from './src/lib/remark-framework-tabs.mjs';

const site = process.env.PUBLIC_SITE_URL?.trim();

/** @returns {import('astro').AstroIntegration} */
function writeHeadersIntegration() {
  return {
    name: 'veli-headers',
    hooks: {
      'astro:build:done': ({ dir }) => {
        writeFileSync(new URL('./_headers', dir), renderHeaders());
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  ...(site ? { site } : {}),
  integrations: [mdx(), react(), writeHeadersIntegration()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        {
          pre(node) {
            const title = this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1];
            if (title) node.properties.dataCodeTitle = title;
          },
        },
      ],
    },
    remarkPlugins: [remarkDocsMarkdown, remarkDocsSearch, remarkComponentTabs, remarkFrameworkTabs],
    rehypePlugins: [rehypePreviewCode, rehypeCodeBlocks, rehypeDocTables],
  },
  vite: {
    ssr: { external: ['@tradenetcorp/veli-blocks/catalog'] },
    plugins: [tokenPlayground(), tailwindcss()],
  },
  output: 'static',
});
