import assert from 'node:assert/strict';
import test from 'node:test';
import rehypeDocTables from './rehype-doc-tables.mjs';

const element = (tagName, children = [], properties = {}) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const heading = (label) => element('h3', [{ type: 'text', value: label }]);
const table = (columns = 4, properties = {}) =>
  element(
    'table',
    [
      element('thead', [
        element(
          'tr',
          Array.from({ length: columns }, (_, index) =>
            element('th', [{ type: 'text', value: `Column ${index}` }]),
          ),
        ),
      ]),
      element('tbody', [element('tr', [element('td', [{ type: 'text', value: 'Content' }])])]),
    ],
    properties,
  );
function transform(children, path = '/workspace/apps/web/src/content/docs/toast.mdx') {
  const tree = { type: 'root', children };
  rehypeDocTables()(tree, { path });
  return tree;
}

test('scrolling API tables are keyboard reachable and named by their own section', () => {
  const region = table();
  const action = table(3);
  const originalRows = globalThis.structuredClone(region.children);
  const section = element('section', [heading('ToastRegion'), region, heading('Actions'), action]);
  transform([section]);
  const regionWrapper = section.children[1];
  const actionWrapper = section.children[3];
  assert.equal(regionWrapper.properties.tabIndex, 0);
  assert.equal(regionWrapper.properties.ariaLabel, 'ToastRegion table');
  assert.equal(actionWrapper.properties.tabIndex, 0);
  assert.equal(actionWrapper.properties.ariaLabel, 'Actions table');
  assert.equal(regionWrapper.tagName, 'div');
  assert.equal(regionWrapper.properties.role, 'region');
  assert.equal(regionWrapper.children[0], region);
  assert.equal(region.tagName, 'table');
  assert.equal(region.properties.role, undefined);
  assert.deepEqual(region.children, originalRows);
});

test('existing author-provided names are preserved', () => {
  const named = table(4, { ariaLabel: 'Queue options' });
  const labelled = table(4, { ariaLabelledBy: 'queue-heading' });
  const { children: wrappers } = transform([named, labelled]);
  assert.equal(wrappers[0].properties.ariaLabel, 'Queue options');
  assert.equal(wrappers[1].properties.ariaLabelledBy, 'queue-heading');
  assert.equal(named.properties.ariaLabel, 'Queue options');
  assert.equal(labelled.properties.ariaLabelledBy, 'queue-heading');
  assert.equal(labelled.properties.ariaLabel, undefined);
});

test('only column counts covered by the scroll styles gain keyboard stops', () => {
  const tables = [table(2), table(3), table(4), table(5)];
  const { children } = transform(tables);
  assert.deepEqual(
    children.map((node) => node.properties.tabIndex),
    [undefined, 0, 0, undefined],
  );
});

test('foundation and pattern tables share the behavior while non-doc pages remain unchanged', () => {
  const foundation = table();
  const { children } = transform(
    [foundation],
    '/workspace/apps/web/src/content/foundations/color.mdx',
  );
  assert.equal(children[0].properties.tabIndex, 0);

  const pattern = table(3);
  const patternTree = transform([pattern], '/workspace/apps/web/src/content/patterns/forms.mdx');
  assert.equal(patternTree.children[0].properties.tabIndex, 0);

  const other = table();
  const original = globalThis.structuredClone(other);
  transform([other], '/workspace/apps/web/src/pages/index.mdx');
  assert.deepEqual(other, original);
});
