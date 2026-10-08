import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { URL } from 'node:url';
import { format } from 'prettier';
import rehypePreviewCode from './rehype-preview-code.mjs';
import rehypeCodeBlocks from './rehype-code-blocks.mjs';
import { previewCodeGroups } from './docs-preview-examples.mjs';

const text = (node) => node.value ?? (node.children ?? []).map(text).join('');
const findAll = (node, predicate) => [
  ...(predicate(node) ? [node] : []),
  ...(node.children ?? []).flatMap((child) => findAll(child, predicate)),
];
function preview(name) {
  return {
    type: 'mdxJsxFlowElement',
    name: 'div',
    attributes: [{ name: 'className', value: 'preview' }],
    children: [{ type: 'mdxJsxFlowElement', name, children: [] }],
  };
}
function pre() {
  return {
    type: 'element',
    tagName: 'pre',
    properties: { dataLanguage: 'tsx' },
    children: [
      {
        type: 'element',
        tagName: 'code',
        properties: {},
        children: [{ type: 'text', value: 'Original code' }],
      },
    ],
  };
}

test('controls receive isolated highlighted variants and a default code block', async () => {
  const tree = {
    type: 'root',
    children: [preview('AlertVariantsDemo'), pre(), preview('AlertLayoutsDemo'), pre()],
  };
  await rehypePreviewCode()(tree);
  rehypeCodeBlocks()(tree);
  const templates = findAll(tree, (node) => node.tagName === 'template');
  assert.deepEqual(
    templates.map((node) => node.properties.dataDocsPreviewCode),
    [
      'alert-appearance-light',
      'alert-appearance-highContrast',
      'alert-layout-default',
      'alert-layout-stacked',
      'alert-layout-compact',
    ],
  );
  const highContrast = text(templates[1]);
  assert.match(highContrast, /appearance="highContrast"/);
  assert.doesNotMatch(highContrast, /appearance="light"/);
  assert.match(text(templates[4]), /layout="compact"/);
  assert.doesNotMatch(text(templates[4]), /Alert.Description|Remind me later/);
  assert.ok(
    findAll(templates[1], (node) => node.tagName === 'span' && node.properties?.style).length > 0,
  );
  const codeBlocks = findAll(tree, (node) =>
    node.properties?.className?.includes('docs-code-block'),
  );
  assert.equal(codeBlocks.length, 2);
  assert.match(
    text(codeBlocks[0].children.find((node) => node.tagName === 'pre')),
    /appearance="light"/,
  );
});

test('a paragraph between the preview and code still connects, but headings end the association', async () => {
  const paragraph = {
    type: 'element',
    tagName: 'p',
    children: [{ type: 'text', value: 'Instructions' }],
  };
  const tree = {
    type: 'root',
    children: [
      preview('LinkRtlDemo'),
      paragraph,
      pre(),
      preview('AlertVariantsDemo'),
      { type: 'element', tagName: 'h2', children: [] },
      pre(),
    ],
  };
  await rehypePreviewCode()(tree);
  assert.equal(tree.children[2].data.previewCodes.length, 2);
  assert.equal(tree.children[5].data, undefined);
});

test('short dynamic snippets retain an expand mount point for longer variants', async () => {
  const tree = { type: 'root', children: [preview('SwitchRtlDemo'), pre()] };
  await rehypePreviewCode()(tree);
  rehypeCodeBlocks()(tree);
  const block = findAll(tree, (node) => node.properties?.className?.includes('docs-code-block'))[0];
  assert.ok(!block.properties.className.includes('is-collapsible'));
  assert.ok(
    findAll(block, (node) => node.properties?.className?.includes('docs-code-block__expand'))
      .length,
  );
  assert.ok(block.children.find((node) => node.tagName === 'pre').properties.id);
});

test('all default Markdown examples agree with the dynamically displayed source', async () => {
  for (const [name, group] of Object.entries(previewCodeGroups)) {
    const page = name.startsWith('Alert') ? 'alert' : name.replace('RtlDemo', '').toLowerCase();
    const mdx = readFileSync(new URL(`../content/docs/${page}.mdx`, import.meta.url), 'utf8');
    const following = mdx.slice(mdx.indexOf(`<${name}`));
    const source = following.match(/```tsx\n([\s\S]*?)\n```/)[1];
    const normalize = (value) =>
      format(value, { parser: 'typescript', singleQuote: true, printWidth: 100 });
    assert.equal(await normalize(source), await normalize(group.variants[group.defaultKey]), name);
  }
});
