import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const sha = /^[a-f0-9]{40}$/;
export function recoveryReceipt({ source, controller, run, attempt, producer, digest }) {
  const value = {
    schema: 3,
    kind: 'recovery',
    sourceCommit: source,
    controllerCommit: controller,
    run: Number(run),
    attempt: Number(attempt),
    snapshotRun: Number(producer),
    snapshotSha256: digest,
  };
  for (const key of ['sourceCommit', 'controllerCommit']) assert.match(value[key], sha);
  for (const key of ['run', 'attempt', 'snapshotRun'])
    assert.ok(Number.isSafeInteger(value[key]) && value[key] > 0);
  assert.match(value.snapshotSha256, /^[a-f0-9]{64}$/);
  return value;
}
export function validateRecoveryReceipt(value, source, run, readGit) {
  // Old successful deployments remain evidence. Schema 2 records a historical
  // comment ID; schema 3 has no comment dependency. Never rewrite old receipts.
  assert.ok([2, 3].includes(value.schema), 'Unknown recovery receipt schema');
  const expected = recoveryReceipt({
    source: value.sourceCommit,
    controller: value.controllerCommit,
    run: value.run,
    attempt: value.attempt,
    producer: value.snapshotRun,
    digest: value.snapshotSha256,
  });
  if (value.schema === 2) {
    assert.match(value.reviewCommentId, /^[1-9][0-9]*$/);
    expected.schema = 2;
    expected.reviewCommentId = value.reviewCommentId;
  }
  assert.deepEqual(value, expected);
  assert.equal(value.sourceCommit, source);
  assert.equal(value.run, run.id);
  assert.equal(value.attempt, run.run_attempt);
  assert.equal(value.controllerCommit, run.head_sha);
  readGit('merge-base', '--is-ancestor', source, value.controllerCommit);
  return value.sourceCommit;
}
export async function readRecoveryReceipt(api, artifact) {
  assert.ok(
    Number.isSafeInteger(artifact.size_in_bytes) &&
      artifact.size_in_bytes > 0 &&
      artifact.size_in_bytes < 1024 * 1024,
    'Unexpected recovery receipt size',
  );
  const directory = mkdtempSync(join(tmpdir(), 'veli-recovery-receipt-'));
  try {
    const file = join(directory, 'receipt.zip');
    writeFileSync(file, await api(`/actions/artifacts/${artifact.id}/zip`, true));
    return JSON.parse(
      execFileSync('unzip', ['-p', file, 'delivery.json'], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024,
      }),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
