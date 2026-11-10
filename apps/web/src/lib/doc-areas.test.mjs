import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertHeadersCover,
  defineDocAreas,
  docAreas,
  documentHref,
  headerRuleMatches,
  matchContentPath,
  pageHref,
  pageId,
  pageMarkdownPath,
  proseCollections,
  renderHeaders,
} from './doc-areas.mjs';

test('prose collections follow the registry and skip blocks', () => {
  assert.deepEqual(proseCollections(), ['foundations', 'docs', 'patterns']);
  assert.deepEqual(
    docAreas.map((area) => area.id),
    ['foundations', 'components', 'patterns', 'blocks'],
  );
});

test('component URLs use the docs segment while the section id stays components', () => {
  const components = docAreas.find((area) => area.id === 'components');
  assert.equal(pageHref(components), '/docs/');
  assert.equal(pageHref(components, 'button'), '/docs/button/');
  assert.equal(pageId(components), 'docs');
  assert.equal(pageId(components, 'button'), 'docs/button');
  assert.equal(pageMarkdownPath(components, 'button'), '/docs/button/index.md');
});

test('content paths resolve for every prose collection, including Windows separators', () => {
  assert.deepEqual(matchContentPath('/workspace/apps/web/src/content/patterns/forms.mdx'), {
    collection: 'patterns',
    slug: 'forms',
  });
  assert.equal(
    documentHref('C:\\workspace\\apps\\web\\src\\content\\foundations\\color.mdx'),
    '/foundations/color/',
  );
  assert.equal(documentHref('/workspace/apps/web/src/content/docs/button.md'), '/docs/button/');
  assert.equal(matchContentPath('/workspace/apps/web/src/content/blog/post.mdx'), null);
  assert.equal(documentHref('/workspace/apps/web/src/pages/index.astro'), null);
});

test('markdown header rules cover nested paths and the patterns section', () => {
  const headers = renderHeaders();
  assert.match(headers, /\/patterns\/\*\.md\n {2}Content-Type: text\/markdown; charset=utf-8/);
  assert.match(headers, /\/docs\/\*\.md\n {2}Content-Type: text\/markdown; charset=utf-8/);
  assert.match(headers, /\/foundations\/\*\.md\n {2}Content-Type: text\/markdown; charset=utf-8/);
  assert.match(headers, /\/blocks\/\*\.md\n {2}Content-Type: text\/markdown; charset=utf-8/);
  assert.match(
    headers,
    /\/blocks\/\*\/source\.tar\.gz\n {2}Content-Type: application\/gzip\n {2}Content-Disposition: attachment/,
  );
  assert.match(headers, /\/llms\.txt\n {2}Content-Type: text\/plain; charset=utf-8\n$/);

  const paths = [
    '/foundations/index.md',
    '/foundations/color/index.md',
    '/docs/button/index.md',
    '/patterns/forms/index.md',
    '/blocks/index.md',
    '/blocks/notification-tray/index.md',
  ];
  assert.doesNotThrow(() => assertHeadersCover(headers, paths));
  assert.equal(headerRuleMatches('/docs/*.md', '/docs/button/index.md'), true);
  assert.throws(
    () => assertHeadersCover(headers, ['/getting-started/installation/index.md']),
    /getting-started\/installation\/index\.md/,
  );
  assert.throws(() => assertHeadersCover(headers, ['/docs.md']), /\/docs\.md/);
});

test('a duplicate section id fails before build', () => {
  const foundations = {
    id: 'foundations',
    title: 'Foundations',
    segment: 'foundations',
    collection: 'foundations',
    membership: 'inventory',
    catalogOverview: true,
    searchBand: 0,
  };
  const blocks = {
    id: 'blocks',
    title: 'Blocks',
    segment: 'blocks',
    membership: 'blocks',
    catalogOverview: false,
    searchBand: 1,
  };
  assert.doesNotThrow(() => defineDocAreas([foundations, blocks]));
  assert.throws(
    () => defineDocAreas([foundations, { ...blocks, id: 'foundations', segment: 'other' }]),
    /duplicate id "foundations"/,
  );
  assert.throws(
    () =>
      defineDocAreas([
        foundations,
        {
          ...blocks,
          collection: 'blocks',
        },
      ]),
    /cannot declare a collection/,
  );
});
