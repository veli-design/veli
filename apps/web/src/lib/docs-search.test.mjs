import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { URL } from 'node:url';
import { buildCollectionSearchItems } from './docs-search.ts';
import { remarkDocsSearch } from './remark-docs-search.ts';

const fixture = JSON.parse(
  readFileSync(new URL('../../tests/fixtures/search-source.json', import.meta.url), 'utf8'),
);
function entry(id, title = id) {
  return {
    id,
    data: { title, description: `About ${title}` },
  };
}
async function renderEntry() {
  const file = { data: { astro: { frontmatter: {} } } };
  remarkDocsSearch()(globalThis.structuredClone(fixture.tree), file);
  return { headings: fixture.headings, remarkPluginFrontmatter: file.data.astro.frontmatter };
}
const options = (entries, render = renderEntry) => ({
  entries,
  renderEntry: render,
  category: 'Components',
  idPrefix: 'components',
  basePath: '/docs/',
  orderedSlugs: ['button'],
  orderOffset: 100,
});

test('search fixture keeps canonical source metadata, Unicode and repeated-heading anchors', async () => {
  const records = await buildCollectionSearchItems(options([entry('button', 'Button')]));
  assert.deepEqual(records, fixture.expected);
});

test('search renders serializable Content Layer entries through the supplied renderer', async () => {
  const source = globalThis.structuredClone(entry('button', 'Button'));
  const seen = [];
  const records = await buildCollectionSearchItems(
    options([source], async (current) => {
      seen.push(current);
      return renderEntry();
    }),
  );
  assert.deepEqual(Object.keys(source), ['id', 'data']);
  assert.equal(seen.length, 1);
  assert.equal(seen[0], source);
  assert.deepEqual(records, fixture.expected);
});

test('navigation controls search ordering, followed by unlisted entries in title order', async () => {
  const records = await buildCollectionSearchItems(
    options([entry('zebra', 'Zebra'), entry('alpha', 'Alpha'), entry('button', 'Button')]),
  );
  assert.deepEqual(
    records.filter((item) => item.kind === 'page').map(({ href, order }) => ({ href, order })),
    [
      { href: '/docs/button/', order: 100 },
      { href: '/docs/alpha/', order: 200 },
      { href: '/docs/zebra/', order: 300 },
    ],
  );
});

test('missing search metadata fails instead of generating an empty index', async () => {
  await assert.rejects(
    buildCollectionSearchItems(
      options([entry('button')], async () => ({
        headings: fixture.headings,
        remarkPluginFrontmatter: {},
      })),
    ),
    /Missing docs search metadata/,
  );
});

test('missing, extra or renamed headings fail instead of changing deep links silently', async () => {
  for (const headings of [
    fixture.headings.slice(1),
    [...fixture.headings, { depth: 2, slug: 'extra', text: 'Extra' }],
    fixture.headings.map((heading, index) =>
      index === 0 ? { ...heading, text: 'Renamed' } : heading,
    ),
  ]) {
    await assert.rejects(
      buildCollectionSearchItems(
        options([entry('button')], async () => ({ ...(await renderEntry()), headings })),
      ),
      /Docs search heading mismatch/,
    );
  }
});

test('missing descriptions use the preamble excerpt', async () => {
  const source = entry('button');
  delete source.data.description;
  const records = await buildCollectionSearchItems(options([source]));
  assert.equal(records[0].description, 'Accessible ކުރިއަށް controls.');
});

test('long search excerpts are bounded and end at a word boundary', async () => {
  const source = entry('button');
  delete source.data.description;
  const render = async () => {
    const rendered = await renderEntry();
    rendered.remarkPluginFrontmatter.__docsSearch.preamble = 'Accessible Button controls. '.repeat(
      30,
    );
    return rendered;
  };
  const [page] = await buildCollectionSearchItems(options([source], render));
  assert.ok(page.description.length <= 169);
  assert.match(page.description, /(?:Accessible|Button|controls\.)…$/);
  assert.ok(page.content.length > page.description.length);
});

test('Get Started preserves the docs landing URL with a serializable guide ID', async () => {
  const source = entry('get-started', 'Get Started');
  const records = await buildCollectionSearchItems({
    ...options([source]),
    category: 'Overview',
    idPrefix: 'overview',
    orderedSlugs: ['get-started'],
    hrefForSlug: () => '/docs/',
  });
  assert.equal(records[0].href, '/docs/');
  assert.equal(records[0].id, 'overview:get-started');
  assert.ok(records.slice(1).every((record) => record.href.startsWith('/docs/#')));
});
