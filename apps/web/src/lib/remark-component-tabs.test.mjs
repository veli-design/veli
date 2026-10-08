import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { URL } from 'node:url';
import {
  docsTabIds,
  getDocsTabForHeading,
  partitionDocsTabNodes,
  remarkComponentTabs,
} from './remark-component-tabs.mjs';
import { docsMarkdownFrontmatterKey, remarkDocsMarkdown } from './remark-docs-markdown.mjs';
import { docsSearchFrontmatterKey, remarkDocsSearch } from './remark-docs-search.ts';

const heading = (depth, value) => ({
  type: 'heading',
  depth,
  children: [{ type: 'text', value }],
});
const paragraph = (value) => ({ type: 'paragraph', children: [{ type: 'text', value }] });

test('classifies existing developer documentation without dropping unknown implementation sections', () => {
  assert.equal(getDocsTabForHeading('Usage'), 'overview');
  assert.equal(getDocsTabForHeading('Sizes and alignment'), 'design');
  assert.equal(getDocsTabForHeading('RTL and Language'), 'accessibility');
  assert.equal(getDocsTabForHeading('API Reference'), 'code');
  assert.equal(getDocsTabForHeading('Controlled expansion'), 'code');
});

test('keeps only the introduction in overview and moves all authored sections to code', () => {
  const nodes = [
    { type: 'mdxjsEsm', value: "import { Demo } from './demo';" },
    heading(1, 'Button'),
    paragraph('Developer-authored introduction.'),
    heading(2, 'Usage'),
    paragraph('Keep the existing preview.'),
    heading(2, 'API Reference'),
    paragraph('Keep the API table.'),
  ];
  const result = partitionDocsTabNodes(nodes, { title: 'Button' });
  const panels = result.filter((node) => node.name === 'section');

  assert.equal(result[0], nodes[0]);
  assert.deepEqual(
    panels.map(
      (panel) => panel.attributes.find((item) => item.name === 'data-doc-tab-panel').value,
    ),
    docsTabIds,
  );
  assert.equal(panels[0].children.includes(nodes[1]), true);
  assert.equal(panels[0].children.includes(nodes[3]), false);
  assert.equal(panels[2].children.includes(nodes[3]), true);
  assert.equal(panels[0].children.includes(nodes[5]), false);
  assert.equal(panels[2].children.includes(nodes[5]), true);
  assert.match(panels[1].children[0].children[0].value, /to be organized/i);
  assert.match(panels[3].children[0].children[0].value, /to be organized/i);
});

test('preserves the existing section organization for Accordion and Menu', () => {
  for (const slug of ['accordion', 'menu']) {
    const nodes = [
      heading(1, 'Component'),
      paragraph('Developer-authored introduction.'),
      heading(2, 'Usage'),
      paragraph('Keep the existing preview.'),
      heading(2, 'Sizes and alignment'),
      paragraph('Keep the visual guidance.'),
      heading(2, 'Accessibility'),
      paragraph('Keep the accessibility guidance.'),
      heading(2, 'API Reference'),
      paragraph('Keep the API table.'),
    ];
    const tree = { type: 'root', children: nodes };

    remarkComponentTabs()(tree, {
      path: `/workspace/apps/web/src/content/docs/${slug}.mdx`,
      data: { astro: { frontmatter: { title: slug } } },
    });

    const panels = Object.fromEntries(
      tree.children
        .filter((node) => node.name === 'section')
        .map((panel) => [
          panel.attributes.find((item) => item.name === 'data-doc-tab-panel').value,
          panel.children,
        ]),
    );

    assert.equal(panels.overview.includes(nodes[2]), true);
    assert.equal(panels.design.includes(nodes[4]), true);
    assert.equal(panels.accessibility.includes(nodes[6]), true);
    assert.equal(panels.code.includes(nodes[8]), true);
  }
});

test('adds one Storybook action after the final API Reference table', () => {
  const apiFirstTable = { type: 'table', children: [] };
  const apiLastTable = { type: 'table', children: [] };
  const nodes = [
    heading(1, 'TextArea'),
    paragraph('Developer-authored introduction.'),
    heading(2, 'API Reference'),
    heading(3, 'TextArea'),
    apiFirstTable,
    heading(3, 'Native textarea'),
    apiLastTable,
    heading(2, 'Accessibility'),
    paragraph('Keep the existing accessibility guidance.'),
  ];

  const result = partitionDocsTabNodes(nodes, { title: 'TextArea' }, { slug: 'textarea' });
  const codePanel = result.find(
    (node) =>
      node.name === 'section' &&
      node.attributes?.some(
        (attribute) => attribute.name === 'data-doc-tab-panel' && attribute.value === 'code',
      ),
  );
  const actionIndex = codePanel.children.findIndex((node) => node.name === 'DocsStorybookLink');

  assert.equal(actionIndex, codePanel.children.indexOf(apiLastTable) + 1);
  assert.equal(
    codePanel.children[actionIndex].attributes.find((attribute) => attribute.name === 'slug').value,
    'textarea',
  );
  assert.equal(codePanel.children.filter((node) => node.name === 'DocsStorybookLink').length, 1);
});

test('renders configured animation metadata and leaves non-doc collections unchanged', () => {
  const nodes = [heading(1, 'Menu'), paragraph('Menu introduction.')];
  const result = partitionDocsTabNodes(nodes, {
    title: 'Menu',
    animation: { src: '/animations/menu-showcase/', label: 'Menu anatomy animation' },
  });
  const overview = result.find((node) => node.name === 'section');
  const animation = overview.children.find(
    (node) =>
      node.name === 'div' &&
      node.attributes?.some((item) => item.value === 'docs-component-animation'),
  );
  const iframe = animation.children.find((node) => node.name === 'iframe');

  assert.equal(
    iframe.attributes.find((item) => item.name === 'src').value,
    '/animations/menu-showcase/',
  );
  assert.equal(
    iframe.attributes.find((item) => item.name === 'title').value,
    'Menu anatomy animation',
  );

  const tree = { type: 'root', children: nodes };
  remarkComponentTabs()(tree, {
    path: '/workspace/apps/web/src/content/foundations/color.mdx',
    data: { astro: { frontmatter: { title: 'Color' } } },
  });
  assert.equal(tree.children, nodes);
});

test('preserves Markdown and search artifacts produced before the visual reorganization', () => {
  const tree = {
    type: 'root',
    children: [
      heading(1, 'Button'),
      paragraph('Developer-authored introduction.'),
      heading(2, 'API Reference'),
      paragraph('Implementation details.'),
      heading(2, 'Usage'),
      paragraph('Interactive example guidance.'),
    ],
  };
  const file = {
    path: '/workspace/apps/web/src/content/docs/button.mdx',
    data: {
      astro: {
        frontmatter: { title: 'Button', description: 'Accessible button component.' },
      },
    },
  };

  remarkDocsMarkdown()(tree, file);
  remarkDocsSearch()(tree, file);
  const markdown = file.data.astro.frontmatter[docsMarkdownFrontmatterKey];
  const search = globalThis.structuredClone(file.data.astro.frontmatter[docsSearchFrontmatterKey]);

  remarkComponentTabs()(tree, file);

  assert.equal(file.data.astro.frontmatter[docsMarkdownFrontmatterKey], markdown);
  assert.deepEqual(file.data.astro.frontmatter[docsSearchFrontmatterKey], search);
});

test('menu showcase consumes resolved Veli theme tokens instead of fixed presentation colors', () => {
  const showcase = readFileSync(
    new URL('../../public/animations/menu-showcase/index.html', import.meta.url),
    'utf8',
  );

  for (const token of [
    '--veli-color-bg-surface-base',
    '--veli-color-menu-bg',
    '--veli-color-menu-hover',
    '--veli-color-border-base-subtle',
    '--veli-color-text-base-strong',
    '--veli-color-icon-base-muted',
    '--veli-color-text-danger-muted',
  ]) {
    assert.match(showcase, new RegExp(token));
  }

  assert.match(showcase, /veli:animation-theme/);
  assert.doesNotMatch(showcase, /background:\s*#efefef/);
  assert.doesNotMatch(showcase, /fill:\s*['"]#f4f6f3/);
});
