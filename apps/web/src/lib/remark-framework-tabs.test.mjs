import assert from 'node:assert/strict';
import test from 'node:test';
import { frameworkGuideTabs } from './doc-areas.mjs';
import { partitionFrameworkTabNodes, remarkFrameworkTabs } from './remark-framework-tabs.mjs';

const heading = (depth, value) => ({
  type: 'heading',
  depth,
  children: [{ type: 'text', value }],
});
const paragraph = (value) => ({ type: 'paragraph', children: [{ type: 'text', value }] });

test('partitions framework H2s into icon-tab panels and keeps the intro above the chrome', () => {
  const nodes = [
    { type: 'mdxjsEsm', value: "import { Demo } from './demo';" },
    paragraph('Install packages first.'),
    ...frameworkGuideTabs.flatMap((tab) => [heading(2, tab.label), paragraph(`${tab.label} setup.`)]),
  ];

  const result = partitionFrameworkTabNodes(nodes);
  const chrome = result.find((node) => node.name === 'DocsFrameworkTabs');
  const panels = result.filter((node) => node.name === 'section');

  assert.equal(result[0], nodes[0]);
  assert.equal(result[1], nodes[1]);
  assert.ok(chrome);
  assert.deepEqual(
    panels.map(
      (panel) => panel.attributes.find((item) => item.name === 'data-framework-tab-panel').value,
    ),
    frameworkGuideTabs.map((tab) => tab.id),
  );
  assert.equal(panels[0].attributes.some((item) => item.name === 'hidden'), false);
  assert.equal(panels[1].attributes.some((item) => item.name === 'hidden'), true);
  assert.equal(panels[0].children[0].data.hProperties.className.includes('docs-framework-panel__title'), true);
});

test('only transforms the getting-started frameworks page', () => {
  const tree = {
    type: 'root',
    children: [paragraph('Leave component docs alone.'), heading(2, 'Usage')],
  };
  const before = structuredClone(tree.children);

  remarkFrameworkTabs()(tree, {
    path: '/workspace/apps/web/src/content/docs/button.mdx',
  });
  assert.deepEqual(tree.children, before);

  const frameworks = {
    type: 'root',
    children: [
      paragraph('Intro'),
      ...frameworkGuideTabs.flatMap((tab) => [heading(2, tab.label), paragraph(tab.label)]),
    ],
  };
  remarkFrameworkTabs()(frameworks, {
    path: '/workspace/apps/web/src/content/getting-started/frameworks.mdx',
  });
  assert.ok(frameworks.children.some((node) => node.name === 'DocsFrameworkTabs'));
  assert.equal(
    frameworks.children.filter((node) => node.name === 'section').length,
    frameworkGuideTabs.length,
  );
});
