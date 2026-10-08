import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { before, test } from 'node:test';
import { parse } from '@terrazzo/parser';
import { normalize, entries } from '../lib/normalize.mjs';
import { root, readJSON, serializeCanonical, normalizedInput, generate } from '../lib/pipeline.mjs';

const canonicalBytes = readFileSync(new URL('src/design.tokens.json', root), 'utf8');
const raw = JSON.parse(readFileSync(new URL('src/figma.tokens.json', root)));
const motion = JSON.parse(readFileSync(new URL('src/motion.tokens.json', root)));
let canonical, files;
before(async () => {
  canonical = await readJSON('src/design.tokens.json');
  files = Object.fromEntries(
    (await generate(canonical)).outputFiles.map(({ filename, contents }) => [filename, contents]),
  );
});

test('canonical source is fresh and building cannot rewrite it', async () => {
  assert.equal(await serializeCanonical(await normalizedInput()), canonicalBytes);
  assert.equal(readFileSync(new URL('src/design.tokens.json', root), 'utf8'), canonicalBytes);
  const next = Object.fromEntries(
    (await generate(canonical)).outputFiles.map(({ filename, contents }) => [filename, contents]),
  );
  assert.deepEqual(next, files);
});
test('every source token is represented or explicitly excluded, including hybrid children', () => {
  const sources = new Set(
    entries(canonical).map(([, token]) => token.$extensions['org.veli']?.source),
  );
  for (const [id] of entries(raw)) assert.ok(id.startsWith('_docs.') || sources.has(id), id);
  assert.equal(canonical.color.border.base.default.$type, 'color');
  assert.equal(canonical.color.border.base.subtle.$value, '{color.neutral.alpha.300}');
  assert.equal(canonical.shadow['focus-ring'].$type, 'shadow');
  assert.equal(Object.keys(canonical.grid).length, 6);
  assert.equal(entries(canonical.typography).length, entries(raw['Typography-styles']).length);
});
test('DTCG exports contain standard types, typed motion, canonical paths and both modes', async () => {
  const exported = JSON.parse(files['tokens.json']);
  assert.deepEqual(exported, canonical);
  assert.deepEqual(JSON.parse(files['motion.tokens.json']).duration.fast.$value, {
    value: 80,
    unit: 'ms',
  });
  assert.deepEqual(exported.ease.linear.$value, [0, 0, 1, 1]);
  for (const [id, token] of entries(exported)) {
    assert.match(id, /^[a-z0-9_.-]+$/);
    assert.ok(!id.includes('DEFAULT'));
    assert.ok(!['string', 'grid'].includes(token.$type));
  }
  const parsed = await parse({
    src: files['tokens.json'],
    filename: new URL('src/design.tokens.json', root),
  });
  assert.equal(Object.keys(parsed.tokens).length, entries(canonical).length);
  assert.deepEqual(
    parsed.resolver.apply({ tzMode: 'Dark' })['color.alert.high-contrast.info.bg'].$value,
    parsed.resolver.apply({ tzMode: 'Dark' })['color.blue.1000'].$value,
  );
});
test('authored OKLCH survives exactly in canonical CSS, with Light/Dark parity', () => {
  const css = files['tokens.css'];
  assert.ok(css.includes('--veli-color-blue-800: oklch(52.76% 0.2064 255.65);'));
  assert.ok(css.includes('--veli-color-blue-800: oklch(61.18% 0.1814 248.4);'));
  assert.ok(css.includes('.dark {'));
  assert.ok(css.includes(':root:not(.dark)'));
  assert.ok(!css.includes('color(display-p3'));
  assert.ok(!css.includes('--color-'));
  assert.ok(css.includes('--veli-tracking-tight: -0.025em;'));
});
test('normalization rejects missing, malformed and inconsistent chromatic descriptions', () => {
  const input = (description) => ({
    color: {
      primitives: {
        blue: { 800: { $type: 'color', $value: '#0066cc', $description: description } },
      },
    },
  });
  assert.throws(() => normalize(input(''), {}), /missing OKLCH/);
  assert.throws(() => normalize(input('OKLCH light: broken'), {}), /missing OKLCH/);
  assert.throws(() => normalize(input('OKLCH light: oklch(90% 0.1 20)'), {}), /disagrees/);
  assert.throws(
    () => normalize({ alien: { x: { $type: 'number', $value: 1 } } }, {}),
    /Unclassified/,
  );
});
test('normalization rejects aliases, collisions and source mutation', () => {
  const bytes = JSON.stringify(raw);
  normalize(raw, motion);
  assert.equal(JSON.stringify(raw), bytes);
  assert.throws(
    () => normalize({ color: { x: { $type: 'color', $value: '{missing}' } } }, {}),
    /Unresolved/,
  );
  assert.throws(
    () =>
      normalize(
        {
          radius: {
            DEFAULT: { $type: 'dimension', $value: { value: 1, unit: 'px' } },
            default: { $type: 'dimension', $value: { value: 2, unit: 'px' } },
          },
        },
        {},
      ),
    /collision/,
  );
});
test('typography follows Figma composites and produces language counterparts and grids', () => {
  const theme = files['tailwind-theme.css'];
  assert.ok(theme.includes('@utility type-display-1-regular'));
  assert.ok(theme.includes('&:lang(dv)'));
  assert.equal(canonical.typography.en.display.lg.regular.$value.lineHeight, 1.32);
  assert.deepEqual(canonical.typography.en.display.lg.regular.$value.letterSpacing, {
    value: -1.92,
    unit: 'px',
  });
  assert.ok(
    files['tokens.css'].includes(
      '--veli-typography-en-display-lg-regular-letter-spacing: -0.03em;',
    ),
  );
  assert.ok(theme.includes('@utility grid-style-xs'));
  assert.ok(theme.includes('padding-inline: var(--veli-grid-xs-columnmargin)'));
});
test('Tailwind compilation resolves aliases and uses literal query thresholds', async () => {
  const require = createRequire(new URL('../../../apps/storybook/package.json', import.meta.url));
  const { compile } = require('tailwindcss');
  const css = files['tailwind-theme.css'].replace("@import './tokens.css';", '');
  const compiler = await compile(`${css}\n@tailwind utilities;`);
  const result = compiler.build([
    'bg-surface-base',
    'text-base-default',
    'border-base-subtle',
    'type-body-sm-regular',
    'dv:type-body-sm-regular',
    'md:grid-style-md',
    'duration-fast',
    'ease-linear',
    'rounded',
    'rounded-md',
    'p-0.5',
    'md:flex',
    '@sm:flex',
    'max-w-sm',
  ]);
  for (const selector of [
    '.bg-surface-base',
    '.text-base-default',
    '.border-base-subtle',
    '.type-body-sm-regular',
    '.duration-fast',
    '.ease-linear',
    '.rounded-md',
    '.max-w-sm',
    '.p-0\\.5',
  ])
    assert.ok(result.includes(selector), selector);
  assert.ok(result.includes('width >= 768px'));
  assert.ok(result.includes('width >= 384px'));
  assert.ok(!result.includes('width >= var('));
  assert.ok(result.includes('var(--veli-color-bg-surface-base)'));
  assert.ok(result.includes('var(--veli-radius-default)'));
});
test('cycles and invalid dimensions fail validated builds', async () => {
  await assert.rejects(
    generate({ a: { $type: 'number', $value: '{b}' }, b: { $type: 'number', $value: '{a}' } }),
  );
  await assert.rejects(
    generate({ spacing: { bad: { $type: 'dimension', $value: { value: 1, unit: 'em' } } } }),
  );
});

test('every canonical variable reference resolves, including fractional spacing', async () => {
  const files = Object.fromEntries(
    (await generate(await normalizedInput())).outputFiles.map((file) => [
      file.filename,
      file.contents,
    ]),
  );
  const css = files['tokens.css'];
  const declared = new Set([...css.matchAll(/(--veli-[\w-]+):/g)].map((match) => match[1]));
  for (const file of ['tokens.css', 'tailwind-theme.css'])
    for (const [, reference] of files[file].matchAll(/var\((--veli-[\w-]+)/g))
      assert.ok(declared.has(reference), `Dangling reference: ${reference}`);
  assert.match(css, /--veli-spacing-0-5: 2px;/);
  assert.match(files['tailwind-theme.css'], /--spacing-0_5: var\(--veli-spacing-0-5\);/);
});

test('Color styles normalize into the shared graph and ambiguous CSS names fail', async () => {
  const raw = await readJSON('src/figma.tokens.json');
  raw['Color-styles'] = { Demo: { $type: 'color', $value: '#ff0000' } };
  const graph = normalize(raw, await readJSON('src/motion.tokens.json'));
  assert.equal(graph.color.styles.demo.$value.colorSpace, 'oklch');
  const result = await generate(graph);
  assert.ok(
    result.outputFiles
      .find((file) => file.filename === 'tailwind-theme.css')
      .contents.includes('--color-styles-demo: var(--veli-color-styles-demo);'),
  );
  await assert.rejects(
    generate({
      spacing: {
        '0_5': { $type: 'dimension', $value: { value: 2, unit: 'px' } },
        '0-5': { $type: 'dimension', $value: { value: 4, unit: 'px' } },
      },
    }),
    /CSS naming collision/,
  );
});
