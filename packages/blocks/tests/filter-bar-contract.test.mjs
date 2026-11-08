import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ts from 'typescript';

const directory = new URL('../src/filter-bar/', import.meta.url);
for (const filename of readdirSync(directory).filter((name) => name.endsWith('.tsx'))) {
  test(`${filename} composes Veli without component style overrides`, () => {
    const path = new URL(filename, directory);
    const source = ts.createSourceFile(
      path.pathname,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const components = new Set();
    for (const statement of source.statements) {
      if (
        ts.isImportDeclaration(statement) &&
        statement.moduleSpecifier.text.startsWith('@veli-design/react/')
      ) {
        for (const element of statement.importClause?.namedBindings?.elements ?? [])
          components.add(element.name.text);
      }
    }
    const forbidden = new Set([
      'className',
      'style',
      'contentClassName',
      'inputClassName',
      'popoverClassName',
      'calendarClassName',
      'gridClassName',
      'listClassName',
      'triggerClassName',
      'panelClassName',
      'itemClassName',
      'overlayClassName',
    ]);
    function visit(node) {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        components.has(node.tagName.getText(source))
      ) {
        for (const attr of node.attributes.properties) {
          if (ts.isJsxAttribute(attr))
            assert.ok(
              !forbidden.has(attr.name.getText(source)),
              `${node.tagName.getText(source)} must use supported variants and block-owned layout, not ${attr.name.getText(source)}`,
            );
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  });
}

test('the public entry point explicitly exports composition APIs without internal helpers', () => {
  const source = ts.createSourceFile(
    'filter-bar.tsx',
    readFileSync(new URL('filter-bar.tsx', directory), 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const exported = new Set();
  for (const statement of source.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    assert.ok(
      statement.exportClause && ts.isNamedExports(statement.exportClause),
      'Use explicit public exports',
    );
    for (const element of statement.exportClause.elements) exported.add(element.name.text);
  }
  for (const name of [
    'FilterBarRoot',
    'FilterBarAppliedFilters',
    'FilterCheckboxSection',
    'useFilterBar',
    'FilterBarValue',
    'FilterExtension',
  ]) {
    assert.ok(exported.has(name), `Missing consumer API: ${name}`);
  }
  for (const name of [
    'getFilterLabelIds',
    'normalizeFilterValue',
    'FilterBarController',
    'useFilterBarMobile',
    'FilterDatePicker',
    'FilterDatePickerProps',
    'FilterDateRange',
    'FilterDateRangeConfig',
  ]) {
    assert.ok(!exported.has(name), `Internal or example-only export: ${name}`);
  }
});

test('normalization preserves advanced mode and remembered scope while removing stale selections', async () => {
  const source = ts.transpileModule(readFileSync(new URL('state.ts', directory), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const { normalizeFilterValue } = await import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  );
  const categories = [{ id: 'reports', children: [{ id: 'annual' }] }, { id: 'resources' }];
  const initial = {
    categoryId: null,
    selections: { reports: ['annual', 'stale'] },
    mode: 'advanced',
    query: 'Annual',
  };
  const one = normalizeFilterValue(categories, initial);
  assert.equal(one.mode, 'advanced');
  assert.equal(one.categoryId, null);
  assert.deepEqual(one.selections.reports, ['annual']);
  const cleared = normalizeFilterValue(categories, { ...one, selections: {} });
  assert.equal(cleared.mode, 'browse');
  assert.equal(cleared.categoryId, null);
  assert.equal(cleared.query, 'Annual');
  const remembered = normalizeFilterValue(categories, { ...initial, categoryId: 'resources' });
  assert.equal(remembered.categoryId, 'resources');
  assert.equal(normalizeFilterValue(categories, { ...initial, mode: 'browse' }).mode, 'browse');
});
