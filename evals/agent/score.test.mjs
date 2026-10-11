import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { judgmentFromChecks, loadEvalConfig, scoreDirectory, scoreSource } from './score.mjs';

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

test('failing date sample is caught for DateField', async () => {
  const result = await scoreSample('fail-07-date', '07-date');
  assert.equal(result.checks.forbiddenImports, false);
});

test('DatePicker calendarButtonLabel is a public prop, not a forbidden API', async () => {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const task = prompts.tasks.find((item) => item.id === '07-date');
  const result = scoreSource({
    task: { ...task, sharedForbidSnippets: prompts.sharedForbidSnippets },
    codeSource: `
      import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';
      export function AppointmentForm() {
        return <DatePicker label="Appointment date" calendarButtonLabel="Choose date" />;
      }
    `,
    proseSource: '',
    allowedSlugs,
  });
  assert.equal(result.checks.forbiddenApis, true);
  assert.equal(result.mechanical, 1);
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

test('DropzoneField with acceptedFileTypes is an approved composition', async () => {
  const result = await scoreSample('pass-08-dropzone-field', '08-files');
  assert.equal(result.checks.requiredSnippets, true);
  assert.equal(result.checks.forbiddenApis, true);
  assert.equal(result.mechanical, 1);
});

test('static Table.Header satisfies the table header check', async () => {
  const result = await scoreSample('pass-04-table-static', '04-tabs-table');
  assert.equal(result.checks.requiredSnippets, true);
  assert.equal(result.mechanical, 1);
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

test('empty output does not get inflated by not-applicable checks', async () => {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const task = prompts.tasks.find((item) => item.id === '02-action-nav');
  const result = scoreSource({
    task: { ...task, sharedForbidSnippets: prompts.sharedForbidSnippets },
    codeSource: '',
    proseSource: '',
    allowedSlugs,
  });
  assert.equal(result.mechanical, 0);
  assert.equal(result.checks.hasCode, false);
  assert.equal(result.checks.provider, null);
  assert.equal(result.checks.refusal, null);
});

test('prose refusal mentioning DateRangePicker is not treated as invented usage', async () => {
  const result = await scoreSample('pass-11-range-prose', '11-range');
  assert.equal(result.inventedRange, false);
  assert.equal(result.checks.refusal, true);
  assert.equal(result.mechanical, 1);
});

test('single DatePicker is not an accepted range workaround', async () => {
  const result = await scoreSample('fail-11-range-single', '11-range');
  assert.equal(result.checks.refusal, false);
});

test('judgment notes are not scanned as code for forbidden APIs', async () => {
  const result = await scoreSample('pass-02-judgment-notes', '02-action-nav');
  assert.equal(result.mechanical, 1);
});

test('raw palette utilities fail the token check', async () => {
  const { prompts, allowedSlugs } = await loadEvalConfig();
  const task = prompts.tasks.find((item) => item.id === '02-action-nav');
  const result = scoreSource({
    task: { ...task, sharedForbidSnippets: prompts.sharedForbidSnippets },
    codeSource: `
      import { Button } from '@tradenetcorp/veli-ui/button';
      import { Link } from '@tradenetcorp/veli-ui/link';
      export function CreateHelp() {
        return (
          <div className="bg-blue-500 text-slate-700" style={{ color: '#ff0000' }}>
            <Button onPress={() => {}}>Create</Button>
            <Link href="/help">Learn more</Link>
          </div>
        );
      }
    `,
    proseSource: '',
    allowedSlugs,
  });
  assert.equal(result.checks.tokens, false);
  assert.ok(result.hexColorHits > 0);
});

test('requirePackages reads package.json when present', async () => {
  const result = await scoreSample('pass-01-setup', '01-setup');
  assert.equal(result.checks.packages, true);
  assert.equal(result.mechanical, 1);
});

test('radio group sample requires FieldLabel and forbids RadioGroup label', async () => {
  const pass = await scoreSample('pass-12-radio-group', '12-radio-group');
  assert.equal(pass.mechanical, 1);
  const fail = await scoreSample('fail-12-radio-group', '12-radio-group');
  assert.equal(fail.checks.forbiddenApis, false);
});

test('radio group sample is caught for repeating description through RadioGroup props', () => {
  const pattern = '<RadioGroup[^>]*\\b(?:description|errorMessage)=';
  assert.ok(new RegExp(pattern).test('<RadioGroup isRequired description="Pick one">'));
});

for (const [taskId, failingCheck] of [
  ['15-form-setting', 'forbiddenImports'],
  ['16-undo-toast', 'forbiddenApis'],
  ['17-help-link', 'forbiddenApis'],
  ['18-tile-links', 'forbiddenApis'],
  ['19-sticky-table', 'requiredSnippets'],
  ['20-loading-form', 'forbiddenApis'],
]) {
  test(`signal task ${taskId} passes the docs-aligned sample and catches the trap`, async () => {
    const pass = await scoreSample(`pass-${taskId}`, taskId);
    assert.equal(pass.mechanical, 1);
    const fail = await scoreSample(`fail-${taskId}`, taskId);
    assert.equal(fail.checks[failingCheck], false);
  });
}

test('checklist judgment scales yes answers to 0-2 and zeroes invented APIs', () => {
  assert.equal(judgmentFromChecks([true, true, false], false), 1.33);
  assert.equal(judgmentFromChecks([true, true], false), 2);
  assert.equal(judgmentFromChecks([true, true], true), 0);
  assert.equal(judgmentFromChecks([], false), 0);
});

test('every task has judge checks and signal tasks exist', async () => {
  const { prompts } = await loadEvalConfig();
  for (const task of prompts.tasks) {
    assert.ok(task.judgeChecks?.length, `${task.id} has no judgeChecks`);
  }
  for (const id of prompts.signalTasks) {
    assert.ok(
      prompts.tasks.some((task) => task.id === id),
      `unknown signal task ${id}`,
    );
  }
});

test('quote-style and breakpoint patterns still pass setup and rtl tasks', async () => {
  const setup = await scoreSample('pass-01-setup', '01-setup');
  assert.equal(setup.checks.requiredSnippets, true);
  const rtl = await scoreSample('pass-10-rtl', '10-rtl');
  assert.equal(rtl.mechanical, 1);
});
