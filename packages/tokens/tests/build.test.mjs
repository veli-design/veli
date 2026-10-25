import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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
test('English typography and font-sans share an overridable font token', async () => {
  const styles = entries(canonical.typography.en);
  assert.equal(styles.length, 52);
  for (const [id, token] of styles) assert.equal(token.$value.fontFamily, '{font.sans}', id);

  const css = files['tokens.css'];
  assert.match(
    css,
    /:where\(:root, :host\) \{\s*--veli-font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;/,
  );
  assert.equal([...css.matchAll(/--veli-font-sans:/g)].length, 1);
  assert.match(css, /--veli-typography-en-body-md-regular-font-family: var\(--veli-font-sans\);/);
  assert.match(
    css,
    /--veli-typography-dv-body-md-regular-font-family: var\(--veli-font-dhivehi-faseyha\);/,
  );

  const require = createRequire(new URL('../../../apps/storybook/package.json', import.meta.url));
  const { compile } = require('tailwindcss');
  const compiler = await compile(
    files['tailwind-theme.css'].replace("@import './tokens.css';", '') + '\n@tailwind utilities;',
  );
  const result = compiler.build(['font-sans', 'type-body-md-regular']);
  assert.match(result, /\.font-sans \{\s*font-family: var\(--veli-font-sans\);/);
  assert.match(result, /\.type-body-md-regular \{\s*font-family: var\(--veli-font-sans\);/);
  assert.match(
    result,
    /&:lang\(dv\) \{\s*font-family: var\(--veli-typography-dv-body-md-regular-font-family\);/,
  );
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
  assert.match(css, /--veli-radius-field: 10px;/);
  assert.match(files['tailwind-theme.css'], /--radius-field: var\(--veli-radius-field\);/);
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

test('generic Tailwind text sizes compile with exact English style companions', async () => {
  const mapping = {
    xs: 'caption-regular',
    sm: 'body-sm-regular',
    base: 'body-md-regular',
    lg: 'body-lg-regular',
    xl: 'subtitle-regular',
    '2xl': 'title-2-regular',
    '3xl': 'title-1-regular',
    '4xl': 'heading-4-regular',
    '5xl': 'heading-3-regular',
    '6xl': 'heading-2-regular',
    '7xl': 'heading-1-regular',
    '8xl': 'display-md-regular',
    '9xl': 'display-lg-regular',
  };
  const require = createRequire(new URL('../../../apps/storybook/package.json', import.meta.url));
  const { compile } = require('tailwindcss');
  const compiler = await compile(
    files['tailwind-theme.css'].replace("@import './tokens.css';", '') + '\n@tailwind utilities;',
  );
  const result = compiler.build([
    ...Object.keys(mapping).map((size) => `text-${size}`),
    'text-sm/6',
    'tracking-wide',
    'font-medium',
    'type-body-sm-regular',
  ]);
  for (const [size, style] of Object.entries(mapping)) {
    const rule = [...result.matchAll(new RegExp(`\\.text-${size} \\{([^}]+)\\}`, 'g'))]
      .map((match) => match[1])
      .find((body) => body.includes('font-size:'));
    assert.ok(rule, `Missing size utility: ${size}`);
    for (const field of ['font-size', 'line-height', 'letter-spacing'])
      assert.ok(rule.includes(`--veli-typography-en-${style}-${field}`), `${size}: ${field}`);
    assert.ok(!rule.includes('font-family:') && !rule.includes('font-weight:'));
    assert.ok(!rule.includes('typography-dv-'));
  }
  assert.ok(result.includes('--tw-leading'));
  assert.ok(result.includes('--tw-tracking'));
  assert.ok(result.includes('.font-medium'));
  assert.ok(result.includes('&:lang(dv)'));
  assert.ok(
    files['tokens.css'].includes('--veli-typography-en-caption-regular-letter-spacing: 0.015em;'),
  );
  assert.ok(
    files['tokens.css'].includes('--veli-typography-en-body-sm-regular-line-height: 1.45;'),
  );
});

test('fractional gap utilities reference valid canonical CSS variables', async () => {
  const require = createRequire(new URL('../../../apps/storybook/package.json', import.meta.url));
  const { compile } = require('tailwindcss');
  const compiler = await compile(
    files['tailwind-theme.css'].replace("@import './tokens.css';", '') + '\n@tailwind utilities;',
  );
  const result = compiler.build(['gap-0.5', 'gap-1.5', 'gap-2.5', 'p-1.5']);
  for (const [fraction, pixels] of [
    ['0.5', 2],
    ['1.5', 6],
    ['2.5', 10],
  ]) {
    const name = `--veli-spacing-${fraction.replace('.', '-')}`;
    assert.ok(result.includes(`.gap-${fraction.replace('.', '\\.')}`));
    assert.ok(result.includes(`gap: var(${name});`));
    assert.ok(files['tokens.css'].includes(`${name}: ${pixels}px;`));
  }
  assert.ok(result.includes('padding: var(--veli-spacing-1-5);'));
  for (const [, name] of result.matchAll(/var\((--veli-spacing-[^),\s]+)/g))
    assert.match(name, /^--veli-spacing-[\w-]+$/, `Invalid CSS identifier: ${name}`);
});

test('authored web spacing references resolve against canonical CSS', () => {
  const source = new URL('../../apps/web/src/', root);
  const declared = new Set(
    [...files['tokens.css'].matchAll(/(--veli-spacing-[\w-]+):/g)].map((match) => match[1]),
  );
  let references = 0;
  for (const file of readdirSync(source, { recursive: true })) {
    if (!/\.(?:css|astro|tsx?)$/.test(file)) continue;
    const contents = readFileSync(new URL(file, source), 'utf8');
    for (const [, name] of contents.matchAll(/var\((--veli-spacing-[^),\s]+)\s*[,)]/g)) {
      references++;
      assert.ok(declared.has(name), `${file}: Dangling spacing reference ${name}`);
    }
  }
  assert.ok(references > 0);
});
