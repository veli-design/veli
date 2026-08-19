import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { loadEvalConfig, scoreDirectory } from './score.mjs';

const samplesDir = fileURLToPath(new URL('./samples/', import.meta.url));

async function scoreSample(sampleName, taskId) {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const task = prompts.tasks.find((item) => item.id === taskId);
  assert.ok(task, taskId);
  return scoreDirectory(
    path.join(samplesDir, sampleName),
    task,
    allowedSlugs,
    prompts.sharedForbidSnippets,
  );
}

test('passing action/nav sample uses Button and Link', async () => {
  const result = await scoreSample('pass-02-action-nav', '02-action-nav');
  assert.equal(result.mechanical, 1);
  assert.deepEqual(result.importedSlugs.sort(), ['button', 'link']);
});

test('failing action/nav sample is caught for onClick and missing Link', async () => {
  const result = await scoreSample('fail-02-action-nav', '02-action-nav');
  assert.ok(result.mechanical < 1);
  assert.equal(result.checks.requiredImports, false);
  assert.equal(result.checks.forbiddenApis, false);
});

test('passing date sample uses DatePicker', async () => {
  const result = await scoreSample('pass-07-date', '07-date');
  assert.equal(result.mechanical, 1);
});

test('failing date sample is caught for DateField and removed calendarButtonLabel', async () => {
  const result = await scoreSample('fail-07-date', '07-date');
  assert.equal(result.checks.forbiddenImports, false);
  assert.equal(result.checks.forbiddenApis, false);
});

test('passing dropzone sample uses the compound API', async () => {
  const result = await scoreSample('pass-08-files', '08-files');
  assert.equal(result.mechanical, 1);
});

test('failing dropzone sample is caught for the stale flat API', async () => {
  const result = await scoreSample('fail-08-files', '08-files');
  assert.equal(result.checks.requiredSnippets, false);
  assert.equal(result.checks.forbiddenApis, false);
});

test('passing range sample refuses the unsupported control', async () => {
  const result = await scoreSample('pass-11-range', '11-range');
  assert.equal(result.mechanical, 1);
  assert.equal(result.refused, true);
});

test('failing range sample is caught for an invented picker', async () => {
  const result = await scoreSample('fail-11-range', '11-range');
  assert.equal(result.checks.refusal, false);
});
