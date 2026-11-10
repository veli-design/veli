import assert from 'node:assert/strict';
import test from 'node:test';
import { remarkDocsTabs } from './remark-docs-tabs.mjs';
import { remarkComponentTabs } from './remark-component-tabs.mjs';
import { createCanonicalMarkdown } from './remark-docs-markdown.mjs';
import { remarkDocsSearch } from './remark-docs-search.ts';

const text = (value) => ({ type: 'text', value });
const p = (value) => ({ type: 'paragraph', children: [text(value)] });
const h = (value) => ({ type: 'heading', depth: 2, children: [text(value)] });
const jsx = (name, attributes = {}, children = []) => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes: Object.entries(attributes).map(([name, value]) => ({
    type: 'mdxJsxAttribute',
    name,
    value,
  })),
  children,
});
const tab = (id, children) => jsx('DocsTab', { id }, children);
const file = () => ({
  path: '/workspace/src/content/docs/accordion.mdx',
  data: { astro: { frontmatter: { title: 'Accordion', description: 'Collapsible sections.' } } },
});

test('explicit placement survives editorial heading names and keeps search and complete Markdown', () => {
  const tree = {
    type: 'root',
    children: [
      tab('overview', [p('Introduction'), h('Keyboard'), p('Overview copy')]),
      tab('code', [h('Usage'), { type: 'code', lang: 'tsx', value: '<Accordion />' }]),
      tab('design', [h('New editorial heading'), p('Design copy')]),
    ],
  };
  const f = file();
  remarkDocsTabs()(tree, f);
  const md = createCanonicalMarkdown(tree, f);
  assert.match(md, /## Keyboard/);
  assert.match(md, /<Accordion \/>/);
  assert.doesNotMatch(md, /DocsTab/);
  remarkDocsSearch()(tree, f);
  assert.deepEqual(
    f.data.astro.frontmatter.__docsSearch.sections.map((s) => s.title),
    ['Keyboard', 'Usage', 'New editorial heading'],
  );
  remarkComponentTabs()(tree, f);
  const panel = (id) =>
    tree.children.find((n) =>
      n.attributes?.some((a) => a.name === 'data-doc-tab-panel' && a.value === id),
    );
  assert.ok(panel('overview').children.some((n) => n.children?.[0]?.value === 'Keyboard'));
  assert.ok(panel('code').children.some((n) => n.type === 'code'));
  assert.equal(
    tree.children.flatMap((n) => n.children).filter((n) => n.name === 'DocsComponentAnimation')
      .length,
    1,
  );
});

test('rejects ambiguous explicit authoring instead of silently losing or relocating content', () => {
  for (const children of [
    [tab('other', [])],
    [tab('overview', []), tab('overview', [])],
    [tab('overview', [tab('code', [])])],
    [tab('overview', []), p('Outside')],
    [jsx('DocsTab', { id: { type: 'mdxJsxAttributeValueExpression', value: 'dynamic' } })],
  ])
    assert.throws(() => remarkDocsTabs()({ type: 'root', children }, file()), /docs-tabs/);
});

test('legacy documents are unchanged by explicit tab normalization', () => {
  const tree = { type: 'root', children: [h('Usage'), p('Existing prose')] };
  const before = globalThis.structuredClone(tree);
  remarkDocsTabs()(tree, file());
  assert.deepEqual(tree, before);
});

test('nested visual patterns export labels, images, captions, ordered anatomy and prose', () => {
  const figure = {
    src: '/images/anatomy.png',
    alt: 'Numbered anatomy',
    width: '805',
    height: '444',
  };
  const tree = {
    type: 'root',
    children: [
      jsx('DocsFigure', { ...figure, caption: 'Anatomy caption' }),
      jsx('DocsAnatomy', {}, [
        {
          type: 'list',
          ordered: true,
          start: 1,
          children: [{ type: 'listItem', children: [p('Header explanation')] }],
        },
      ]),
      jsx('DocsGrid', {}, [
        jsx('DocsGuideline', { ...figure, kind: 'dont' }, [
          p('Keep essential information visible.'),
        ]),
      ]),
      jsx('DocsExampleFrame', {}, [
        jsx('DocsComparison', { label: 'Medium', value: 'md' }, [p('Example description')]),
      ]),
    ],
  };
  const md = createCanonicalMarkdown(tree, file());
  assert.match(md, /!\[Numbered anatomy\]\(\/images\/anatomy.png\)/);
  assert.match(md, /Anatomy caption/);
  assert.match(md, /1\. Header explanation/);
  assert.match(md, /\*\*Don’t\*\*/);
  assert.match(md, /Keep essential information visible/);
  assert.match(md, /Medium \(md\)/);
  assert.doesNotMatch(md, /Docs(Figure|Anatomy|Grid|Guideline|Comparison)/);
  const f = file();
  remarkDocsSearch()(tree, f);
  assert.match(
    f.data.astro.frontmatter.__docsSearch.preamble,
    /Numbered anatomy.*Anatomy caption.*Header explanation.*Don’t.*Medium md/s,
  );
});

test('figures and guidelines require readable static alternatives', () => {
  for (const node of [
    jsx('DocsFigure', { src: '/image.png' }),
    jsx('DocsGuideline', { src: '/image.png', alt: 'Example', kind: 'maybe' }),
  ]) {
    assert.throws(
      () => createCanonicalMarkdown({ type: 'root', children: [node] }, file()),
      /docs-markdown/,
    );
  }
});

test('dynamic captions cannot silently disappear from Markdown', () => {
  const figure = jsx('DocsFigure', {
    src: '/images/anatomy.png',
    alt: 'Anatomy',
    caption: { type: 'mdxJsxAttributeValueExpression', value: 'caption' },
  });
  assert.throws(
    () => createCanonicalMarkdown({ type: 'root', children: [figure] }, file()),
    /static strings/,
  );
});

test('resource links remain readable and the automatic animation precedes them', () => {
  const resources = jsx('DocsResources', {
    source: 'https://github.com/example',
    storybook: 'https://storybook.example.com/',
  });
  const tree = {
    type: 'root',
    children: [tab('overview', [p('Introduction'), resources, h('When to use')])],
  };
  const f = file();
  remarkDocsTabs()(tree, f);
  const md = createCanonicalMarkdown(tree, f);
  assert.match(md, /\[GitHub\]/);
  assert.match(md, /\[Storybook\]/);
  remarkComponentTabs()(tree, f);
  const overview = tree.children[0].children;
  assert.equal(overview[1].name, 'DocsComponentAnimation');
  assert.equal(overview[2].name, 'DocsResources');
});
