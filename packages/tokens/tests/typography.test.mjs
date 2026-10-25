import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parse } from '@terrazzo/parser';
import { entries, normalize } from '../lib/normalize.mjs';
import { generate, readJSON, serialize } from '../lib/pipeline.mjs';

const raw = await readJSON('src/figma.tokens.json');
const motion = await readJSON('src/motion.tokens.json');
const rawTokens = new Map(entries(raw));
function resolve(value) {
  return typeof value === 'string' && value.startsWith('{')
    ? resolve(rawTokens.get(value.slice(1, -1)).$value)
    : value;
}
const pixels = ({ value, unit }) => value * (unit === 'rem' ? 16 : 1);

test('DTCG ratios round-trip pixels while both CSS modes retain all Figma metric bindings', async () => {
  const canonical = normalize(raw, motion);
  const parsed = await parse({ src: serialize(canonical) });
  const resolved = parsed.resolver.apply({});
  const styles = entries(canonical).filter(([, token]) => token.$type === 'typography');
  assert.equal(styles.length, 73);
  for (const [id, token] of styles) {
    const value = resolved[id].$value;
    assert.equal(typeof value.lineHeight, 'number', id);
    assert.ok(Number.isFinite(value.lineHeight), id);
    const source = rawTokens.get(token.$extensions['org.veli'].source).$value;
    const size = pixels(resolve(source.fontSize));
    const height = pixels(resolve(source.lineHeight));
    assert.equal(token.$value.lineHeight, height / size, id);
    assert.ok(Math.abs(value.lineHeight * pixels(value.fontSize) - height) < 1e-10, id);
  }
  assert.equal(canonical.typography.en.body.lg.regular.$value.lineHeight, 28 / 18);
  assert.equal(canonical.typography.dv.body.lg.regular.$value.lineHeight, 36 / 19);
  assert.deepEqual(canonical['type-metrics'].en.body.lg['line-height'].$value, {
    value: 28,
    unit: 'px',
  });

  const files = Object.fromEntries(
    (await generate(canonical)).outputFiles.map(({ filename, contents }) => [filename, contents]),
  );
  assert.deepEqual(JSON.parse(files['tokens.json']), JSON.parse(serialize(canonical)));
  for (const [id, token] of styles) {
    const name = `--veli-${id.replaceAll('.', '-')}-line-height`;
    const match = files['tokens.css'].match(new RegExp(`${name}: ([^;]+);`));
    assert.ok(match, id);
    const height = pixels(
      resolve(rawTokens.get(token.$extensions['org.veli'].source).$value.lineHeight),
    );
    const sourceLine = rawTokens.get(token.$extensions['org.veli'].source).$value.lineHeight;
    const metricName = `--veli-${sourceLine.slice(1, -1).replaceAll('.', '-')}`;
    assert.equal(match[1], `var(${metricName})`, id);
    const declarations = [
      ...files['tokens.css'].matchAll(new RegExp(`${metricName}: ([^;]+);`, 'g')),
    ];
    assert.equal(declarations.length, 2, `${id}: Light and Dark`);
    for (const [, value] of declarations) assert.equal(value, `${height}px`, id);
    assert.ok(files['tailwind-theme.css'].includes(`line-height: var(${name});`), id);
  }
  assert.ok(files['tokens.css'].includes('--veli-type-metrics-en-body-lg-line-height: 28px;'));
  assert.ok(
    files['tokens.css'].includes('--veli-type-metrics-dv-body-lg-regular-line-height: 36px;'),
  );
  assert.ok(files['tokens.css'].includes('--veli-leading-normal: 1.5;'));
  for (const [size, ramp] of Object.entries(canonical.text)) {
    const metric = ramp['line-height'].$value.slice(1, -1);
    const metricName = `--veli-${metric.replaceAll('.', '-')}`;
    assert.ok(files['tokens.css'].includes(`--veli-text-${size}-line-height: var(${metricName});`));
    assert.ok(
      files['tailwind-theme.css'].includes(
        `--text-${size}--line-height: var(--veli-text-${size}-line-height);`,
      ),
    );
    const height = pixels(resolve(raw.text[size]['line-height'].$value));
    assert.ok(files['tokens.css'].includes(`${metricName}: ${height}px;`));
  }
  assert.ok(
    files['tailwind-theme.css'].includes(
      '--text-lg--line-height: var(--veli-text-lg-line-height);',
    ),
  );
});

function fixture(fontSize, lineHeight) {
  return {
    'type-metrics': {
      size: { $type: 'dimension', $value: fontSize },
      sizeAlias: { $type: 'dimension', $value: '{type-metrics.size}' },
      height: { $type: 'dimension', $value: lineHeight },
      heightAlias: { $type: 'dimension', $value: '{type-metrics.height}' },
    },
    'Typography-styles': {
      Type: {
        Demo: {
          $type: 'typography',
          $value: {
            fontFamily: 'Inter',
            fontWeight: 400,
            fontSize: '{type-metrics.sizeAlias}',
            lineHeight: '{type-metrics.heightAlias}',
            letterSpacing: '0px',
          },
        },
      },
    },
  };
}

test('chained aliases and compatible px/rem dimensions retain full ratio precision', () => {
  for (const [size, height] of [
    ['18px', '28px'],
    ['1.125rem', '28px'],
    ['18px', '1.75rem'],
    [
      { value: 1.125, unit: 'rem' },
      { value: 1.75, unit: 'rem' },
    ],
    [18, 28],
  ]) {
    const input = fixture(size, height);
    const before = structuredClone(input);
    const style = normalize(input, {}).typography.en.demo;
    assert.equal(style.$value.lineHeight, 28 / 18);
    assert.deepEqual(
      style.$extensions['org.veli'].lineHeight,
      (typeof height === 'string' && height.endsWith('rem')) || height?.unit === 'rem'
        ? { value: 28, unit: 'px' }
        : '{type-metrics.heightalias}',
    );
    assert.deepEqual(input, before);
  }
});

test('literal pixel metadata retains authored precision without multiplying the DTCG ratio back', () => {
  const input = fixture('19px', '36px');
  input['Typography-styles'].Type.Demo.$value.lineHeight = { value: 36, unit: 'px' };
  const style = normalize(input, {}).typography.en.demo;
  assert.equal(style.$value.lineHeight, 36 / 19);
  assert.deepEqual(style.$extensions['org.veli'].lineHeight, { value: 36, unit: 'px' });
});

test('literal and aliased percentage line heights normalize as multipliers', () => {
  for (const percentage of ['155.55555555555557%', { value: 155.55555555555557, unit: '%' }]) {
    const input = fixture('18px', '28px');
    input['Typography-styles'].Type.Demo.$value.lineHeight = percentage;
    assert.equal(
      normalize(input, {}).typography.en.demo.$value.lineHeight,
      155.55555555555557 / 100,
    );
    input.leading = {
      ratio: { $type: 'dimension', $value: { value: 155.55555555555557, unit: '%' } },
    };
    input['Typography-styles'].Type.Demo.$value.lineHeight = '{leading.ratio}';
    assert.equal(
      normalize(input, {}).typography.en.demo.$value.lineHeight,
      155.55555555555557 / 100,
    );
  }
});

test('invalid line heights and nonpositive sizes cannot export nonfinite multipliers', () => {
  for (const size of [0, -18])
    assert.throws(() => normalize(fixture(size, '28px'), {}), /font size/);
  for (const height of ['Infinity%', '12oops%', { value: Infinity, unit: 'px' }]) {
    const input = fixture('18px', '28px');
    input['Typography-styles'].Type.Demo.$value.lineHeight = height;
    assert.throws(() => normalize(input, {}), /line height|dimension/);
  }
});
