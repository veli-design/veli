import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCanonicalMarkdown,
  docsMarkdownFrontmatterKey,
  remarkDocsMarkdown,
} from './remark-docs-markdown.mjs';

function createFile(
  path = '/workspace/apps/web/src/content/docs/button.mdx',
  frontmatter = {
    title: 'Button',
    description: 'Accessible button component.',
  },
) {
  return {
    path,
    data: { astro: { frontmatter: { ...frontmatter } } },
  };
}

function importNode(importedName = 'ButtonUsageDemo') {
  return {
    type: 'mdxjsEsm',
    value: `import { ${importedName} } from './examples';`,
    data: {
      estree: {
        type: 'Program',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportSpecifier',
                local: { type: 'Identifier', name: importedName },
                imported: { type: 'Identifier', name: importedName },
              },
            ],
            source: { type: 'Literal', value: './examples' },
          },
        ],
      },
    },
  };
}

function previewNode(componentName = 'ButtonUsageDemo') {
  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: 'preview p-4' }],
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: componentName,
        attributes: [{ type: 'mdxJsxAttribute', name: 'client:visible', value: null }],
        children: [],
      },
    ],
  };
}

test('creates clean GFM Markdown without changing the render tree', () => {
  const tree = {
    type: 'root',
    children: [
      importNode(),
      { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Button' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'Use a button for actions.' }] },
      { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Usage' }] },
      previewNode(),
      { type: 'code', lang: 'tsx', value: "import { Button } from '@veli/ui';\n\n<Button />" },
      {
        type: 'table',
        align: [null, 'left'],
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'Prop' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'Description' }] },
            ],
          },
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'inlineCode', value: 'size' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'Button size.' }] },
            ],
          },
        ],
      },
    ],
  };
  const originalTree = globalThis.structuredClone(tree);
  const file = createFile();

  remarkDocsMarkdown()(tree, file);

  const markdown = file.data.astro.frontmatter[docsMarkdownFrontmatterKey];
  assert.deepEqual(tree, originalTree);
  assert.equal(markdown.match(/^# /gm)?.length, 1);
  assert.match(markdown, /^# Button\n\nAccessible button component\./);
  assert.match(
    markdown,
    /\[View the interactive example in the rendered page\.\]\(\/docs\/button\/\)/,
  );
  assert.match(markdown, /```tsx\nimport \{ Button \} from '@veli\/ui';/);
  assert.match(markdown, /\| Prop/);
  assert.match(markdown, /`size`/);
  assert.doesNotMatch(markdown, /from '\.\/examples'/);
  assert.equal(markdown.endsWith('\n'), true);
  assert.equal(markdown.endsWith('\n\n'), false);
});

test('exports eagerly hydrated previews without changing their hydration directive', () => {
  const preview = previewNode('AccordionUsageDemo');
  preview.children[0].attributes[0].name = 'client:load';
  const tree = { type: 'root', children: [importNode('AccordionUsageDemo'), preview] };
  const originalTree = globalThis.structuredClone(tree);
  const markdown = createCanonicalMarkdown(tree, createFile());

  assert.match(markdown, /View the interactive example in the rendered page/);
  assert.deepEqual(tree, originalTree);
});

test('supports pages without an authored H1 and explicit visual-only omissions', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Color guidance.' }],
      },
      {
        type: 'mdxJsxFlowElement',
        name: 'div',
        attributes: [{ type: 'mdxJsxAttribute', name: 'data-docs-markdown', value: 'omit' }],
        children: [{ type: 'mdxJsxFlowElement', name: 'span', attributes: [], children: [] }],
      },
    ],
  };
  const file = createFile('/workspace/apps/web/src/content/foundations/color.mdx', {
    title: 'Color',
    description: 'Semantic color guidance.',
  });

  const markdown = createCanonicalMarkdown(tree, file);

  assert.match(markdown, /^# Color\n\nSemantic color guidance\./);
  assert.match(markdown, /Color guidance\./);
  assert.doesNotMatch(markdown, /span|data-docs-markdown/);
});

test('fails closed for an unrecognized JSX block', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'mdxJsxFlowElement',
        name: 'CustomCallout',
        attributes: [],
        children: [],
        position: { start: { line: 12, column: 1 } },
      },
    ],
  };

  assert.throws(
    () => createCanonicalMarkdown(tree, createFile()),
    /button\.mdx:12: unsupported MDX JSX element <CustomCallout>/,
  );
});

test('fails when an authored H1 does not match frontmatter', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Different title' }] },
    ],
  };

  assert.throws(
    () => createCanonicalMarkdown(tree, createFile()),
    /the authored H1 must match frontmatter\.title/,
  );
});

test('fails instead of silently removing executable MDX ESM', () => {
  const node = importNode();
  node.data.estree.body = [{ type: 'ExportNamedDeclaration', specifiers: [] }];
  const tree = { type: 'root', children: [node] };

  assert.throws(
    () => createCanonicalMarkdown(tree, createFile()),
    /only top-level imports may be omitted from Markdown/,
  );
});
