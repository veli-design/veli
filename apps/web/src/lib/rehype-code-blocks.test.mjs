import assert from 'node:assert/strict';
import test from 'node:test';
import rehypeCodeBlocks from './rehype-code-blocks.mjs';

function codeBlock(source, properties = {}) {
  return {
    type: 'element',
    tagName: 'pre',
    properties: { dataLanguage: 'tsx', ...properties },
    children: [
      {
        type: 'element',
        tagName: 'code',
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { style: 'color:#123456;--shiki-dark:#abcdef' },
            children: [{ type: 'text', value: source }],
          },
        ],
      },
    ],
  };
}

function preview(modifier = '') {
  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [{ type: 'mdxJsxAttribute', name: 'className', value: `preview ${modifier}` }],
    children: [{ type: 'mdxJsxFlowElement', name: 'ButtonUsageDemo', children: [] }],
  };
}

function render(...children) {
  const tree = { type: 'root', children };
  rehypeCodeBlocks()(tree);
  return tree;
}

function findAll(node, predicate) {
  return [
    ...(predicate(node) ? [node] : []),
    ...(node.children ?? []).flatMap((child) => findAll(child, predicate)),
  ];
}

const byRole = (role) => (node) => node.properties?.role === role;
const hasClass = (name) => (node) => node.properties?.className?.includes(name);
const expandControls = (tree) => findAll(tree, hasClass('docs-code-block__expand'));
const lines = (count) =>
  Array.from({ length: count }, (_, index) => `// Line ${index + 1}`).join('\n');

test('install tabs preserve packages and link to their own command panels', () => {
  const packages = '@veli-design/react@0.12.0 react';
  const tree = render(
    ...['bash', 'sh', 'shell'].map((dataLanguage) =>
      codeBlock(`pnpm add ${packages}\n`, { dataLanguage }),
    ),
  );
  const panels = findAll(tree, byRole('tabpanel'));
  assert.equal(panels.length, 3);
  for (const [index, wrapper] of tree.children.entries()) {
    const tabs = findAll(wrapper, byRole('tab'));
    assert.deepEqual(
      tabs.map((tab) => tab.properties.dataCommand),
      ['pnpm add', 'npm install', 'yarn add', 'bun add'].map((prefix) => `${prefix} ${packages}`),
    );
    assert.deepEqual(
      tabs.map((tab) => tab.properties.ariaSelected),
      ['true', 'false', 'false', 'false'],
    );
    assert.deepEqual(
      tabs.map((tab) => tab.properties.tabIndex),
      [0, -1, -1, -1],
    );
    assert.ok(tabs.every((tab) => tab.properties.ariaControls === panels[index].properties.id));
    assert.equal(panels[index].properties.ariaLabelledBy, tabs[0].properties.id);
  }
  const ids = findAll(tree, (node) => node.properties?.id).map((node) => node.properties.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('ordinary commands, multiline scripts, and non-shell code do not become install tabs', () => {
  for (const [source, dataLanguage] of [
    ['pnpm dev', 'bash'],
    ['pnpm add react\npnpm build', 'sh'],
    ['pnpm add react', 'text'],
  ]) {
    const pre = codeBlock(source, { dataLanguage });
    const original = globalThis.structuredClone(pre);
    const tree = render(pre);
    assert.equal(findAll(tree, byRole('tab')).length, 0);
    assert.deepEqual(pre, original);
  }
});

test('filename headers preserve highlighted source, Unicode, whitespace, and literal markup', () => {
  const title = 'src/features/settings/ConfirmPreferencesButton.tsx';
  const source = 'const label = "ކުރިއަށް ✅";\n\n  <Button title="<tag> & text" />\n';
  const pre = codeBlock(source, { dataCodeTitle: title });
  const original = globalThis.structuredClone(pre);
  const tree = render(pre);
  const titles = findAll(tree, hasClass('docs-code-file__name'));
  assert.equal(titles.length, 1);
  assert.deepEqual(titles[0].children, [{ type: 'text', value: title }]);
  assert.deepEqual(pre, original);
});

test('empty and short blocks stay open; 24-line and huge blocks get independent expand controls', () => {
  const sources = ['', lines(23), `${lines(23)}\n`, lines(24), lines(213)];
  const blocks = sources.map((source) => codeBlock(source));
  const tree = render(...blocks);
  assert.deepEqual(
    tree.children.map((wrapper) => expandControls(wrapper).length),
    [0, 0, 0, 1, 1],
  );
  for (const index of [3, 4]) {
    const [control] = expandControls(tree.children[index]);
    assert.equal(control.properties.dataLineCount, index === 3 ? 24 : 213);
    assert.ok(blocks[index].properties.id);
  }
  assert.notEqual(blocks[3].properties.id, blocks[4].properties.id);
  blocks.forEach((block, index) => {
    const text = findAll(block, (node) => node.type === 'text')
      .map((node) => node.value)
      .join('');
    assert.equal(text, sources[index]);
  });
});

test('adjacent previews pair with source across whitespace without changing the demo', () => {
  const demo = preview();
  const originalDemo = globalThis.structuredClone(demo);
  const pre = codeBlock('<Button>Continue</Button>');
  const originalSource = globalThis.structuredClone(pre);
  const tree = render(demo, { type: 'text', value: '\n\n' }, pre);
  const pairs = findAll(tree, hasClass('docs-example'));
  assert.equal(tree.children.length, 1);
  assert.equal(pairs.length, 1);
  assert.ok(findAll(pairs[0], (node) => node === demo || node === pre).length === 2);
  assert.deepEqual(demo, originalDemo);
  assert.deepEqual(pre, originalSource);
});

test('intervening content and standalone previews are not paired with unrelated source', () => {
  for (const tagName of ['h2', 'p']) {
    const tree = render(
      preview(),
      { type: 'element', tagName, children: [] },
      codeBlock('example'),
    );
    assert.equal(findAll(tree, hasClass('docs-example')).length, 0);
    assert.equal(tree.children.length, 3);
  }
  const demo = preview();
  assert.deepEqual(render(demo).children, [demo]);
});

test('explicit preview expansion overrides the threshold without affecting subsequent blocks', () => {
  for (const [modifier, count, expected] of [
    ['preview--collapsible', 2, 1],
    ['preview--expanded', 213, 0],
  ]) {
    const tree = render(preview(modifier), codeBlock(lines(count)), codeBlock(lines(24)));
    assert.equal(findAll(tree, hasClass('docs-example')).length, 1);
    assert.equal(expandControls(tree.children[0]).length, expected);
    assert.equal(expandControls(tree.children[1]).length, 1);
  }
});
