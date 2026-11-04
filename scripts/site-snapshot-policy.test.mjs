import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSnapshotProducer } from './site-snapshot-policy.mjs';
const run = {
  repository: { full_name: 'tradenetcorp/veli' },
  event: 'workflow_dispatch',
  status: 'completed',
  path: '.github/workflows/prepare-site-release.yml',
  head_branch: 'main',
  conclusion: 'success',
};
test('only completed authorized producers can supply deployment bytes', () => {
  assert.doesNotThrow(() => assertSnapshotProducer(run, 'tradenetcorp/veli'));
  for (const change of [
    { repository: { full_name: 'other/repo' } },
    { event: 'pull_request' },
    { status: 'in_progress' },
    { path: '.github/workflows/ci.yml' },
    { head_branch: 'unreviewed' },
    { conclusion: 'failure' },
    { conclusion: 'cancelled' },
  ])
    assert.throws(() => assertSnapshotProducer({ ...run, ...change }, 'tradenetcorp/veli'));
  for (const path of ['release.yml', 'deploy-web.yml'])
    assert.doesNotThrow(() =>
      assertSnapshotProducer(
        { ...run, path: '.github/workflows/' + path, conclusion: 'failure' },
        'tradenetcorp/veli',
      ),
    );
});
