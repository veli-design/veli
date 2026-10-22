import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { warnAccessibilityViolations } from '../fixtures/next/tests/accessibility.mjs';

const violation = {
  id: 'color-contrast',
  impact: 'serious',
  help: 'Elements must have sufficient color contrast',
  helpUrl: 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
  nodes: [{ target: ['nav > p'], html: '<p>Jump to</p>', failureSummary: '3.08:1 < 4.5:1' }],
};

test('axe violations emit advisory annotations with rule, impact and affected nodes', async () => {
  const warnings = [];
  await warnAccessibilityViolations(Promise.resolve({ violations: [violation] }), (warning) =>
    warnings.push(warning),
  );
  assert.equal(warnings.length, 1);
  assert.ok(warnings[0].startsWith('::warning title=Accessibility (axe)::'));
  const details = JSON.parse(warnings[0].split('::')[2]);
  assert.deepEqual(details, {
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    url: violation.helpUrl,
    nodes: violation.nodes,
  });
});

test('clean scans emit no warnings', async () => {
  await warnAccessibilityViolations(Promise.resolve({ violations: [] }), () =>
    assert.fail('Unexpected warning'),
  );
});

test('annotation content escapes percent signs and line breaks', async () => {
  const warnings = [];
  await warnAccessibilityViolations(
    Promise.resolve({ violations: [{ ...violation, help: '100%\r\n::error::injected' }] }),
    (warning) => warnings.push(warning),
  );
  assert.ok(warnings[0].includes('100%25'));
  assert.equal(warnings[0].split('\n').length, 1);
});

test('scan execution errors propagate unchanged', async () => {
  const error = new Error('Browser closed while scanning');
  await assert.rejects(
    warnAccessibilityViolations(Promise.reject(error)),
    (actual) => actual === error,
  );
});

test('violations exit successfully while scan errors and functional failures exit nonzero', () => {
  const helper = new URL('../fixtures/next/tests/accessibility.mjs', import.meta.url).href;
  const run = (source) =>
    spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `import { warnAccessibilityViolations } from ${JSON.stringify(helper)};\n${source}`,
      ],
      { encoding: 'utf8' },
    );
  const advisory = `await warnAccessibilityViolations(Promise.resolve({ violations: [${JSON.stringify(violation)}] }));`;
  const warning = run(advisory);
  assert.equal(warning.status, 0, warning.stderr);
  assert.match(warning.stderr, /::warning.*color-contrast/);
  const scanError = run(
    "await warnAccessibilityViolations(Promise.reject(new Error('scan failed')));",
  );
  assert.equal(scanError.status, 1);
  assert.match(scanError.stderr, /scan failed/);
  const functionalError = run(
    `${advisory}\nimport assert from 'node:assert/strict'; assert.equal(1, 2);`,
  );
  assert.equal(functionalError.status, 1);
  assert.match(functionalError.stderr, /AssertionError/);
});
