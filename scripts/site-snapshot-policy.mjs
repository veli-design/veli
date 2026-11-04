import assert from 'node:assert/strict';

// Keep this dependency-free so the workflow can check provenance before
// installing packages, downloading artifacts or exposing deployment secrets.
export function assertSnapshotProducer(run, repository, releaseBranch = 'main') {
  assert.equal(run.repository?.full_name, repository, 'Snapshot must come from this repository');
  assert.equal(run.event, 'workflow_dispatch', 'Select an explicitly prepared snapshot');
  assert.equal(run.status, 'completed', 'Snapshot producer is still running');
  const preparation = run.path === '.github/workflows/prepare-site-release.yml';
  const release = run.path === '.github/workflows/release.yml';
  const redeploy = run.path === '.github/workflows/deploy-web.yml';
  assert.ok(preparation || release || redeploy, 'Unexpected snapshot producer');
  assert.equal(run.head_branch, release ? releaseBranch : 'main', 'Unexpected producer branch');
  assert.ok(
    run.conclusion === 'success' || (!preparation && run.conclusion === 'failure'),
    'Cancelled, unapproved or failed preparation cannot supply a snapshot',
  );
}
