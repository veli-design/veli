import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import {
  recoveryReceipt,
  validateRecoveryReceipt,
  readRecoveryReceipt,
} from './site-recovery-receipt.mjs';
import { latestDelivery, planSiteDelivery, alreadyDelivered } from './site-auto.mjs';
const digest = 'd'.repeat(64);
function fixture(t) {
  // Hooks export GIT_* variables; temporary repositories must not inherit them.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const root = mkdtempSync(resolve(tmpdir(), 'veli-recovery-order-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: root,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git('init', '-q');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  mkdirSync(resolve(root, 'apps/web'), { recursive: true });
  const commit = (text) => {
    writeFileSync(resolve(root, 'apps/web/page'), 'source ' + text);
    git('add', '.');
    git('commit', '-qm', text);
    return git('rev-parse', 'HEAD');
  };
  const base = commit('baseline');
  const site = commit('site update');
  const controller = site;
  return { root, git, commit, base, site, controller };
}
function recoveryAPI(records) {
  const artifacts = records.map((r, index) => ({
    id: index + 1,
    name: `site-deployed-${r.source}`,
    expired: false,
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
    workflow_run: { id: index + 1, head_sha: r.controller ?? r.source },
  }));
  return async (path) => {
    if (path.startsWith('/actions/artifacts')) return { artifacts };
    if (path.startsWith('/actions/runs/')) {
      const id = Number(path.split('/').at(-1)),
        r = records[id - 1];
      return {
        id,
        run_attempt: 1,
        head_sha: r.controller ?? r.source,
        head_branch: 'main',
        status: 'completed',
        conclusion: r.conclusion ?? 'success',
        event: r.recovery ? 'workflow_dispatch' : 'push',
        path: r.recovery
          ? '.github/workflows/deploy-site-snapshot.yml'
          : '.github/workflows/deploy-site-changes.yml',
      };
    }
    throw new Error(path);
  };
}
test('successful manual retry is recognized and does not select a duplicate automatic deployment', async (t) => {
  const h = fixture(t),
    records = [{ source: h.base }, { source: h.site, recovery: true, controller: h.controller }];
  const api = recoveryAPI(records);
  const value = recoveryReceipt({
    source: h.site,
    controller: h.controller,
    run: 2,
    attempt: 1,
    producer: 9,
    digest,
  });
  const read = async () => value;
  assert.equal(await latestDelivery(api, h.site, h.git, read), h.site);
  // Same cumulative policy used by final gate: the verified receipt advances the
  // comparison base, leaving no site delta or publication advance.
  const selected = await planSiteDelivery(
    api,
    { source: h.site, pending: false, release: false, packageSource: h.base, bootstrap: false },
    h.git,
    read,
  );
  assert.equal(selected.eligible, false);
});
test('recovering S after M merges never claims M was deployed, including after a workflow-only successor', async (t) => {
  const h = fixture(t);
  const newer = h.commit('new site M');
  const value = recoveryReceipt({
    source: h.site,
    controller: newer,
    run: 2,
    attempt: 1,
    producer: 9,
    digest,
  });
  const api = recoveryAPI([
    { source: h.base },
    { source: h.site, recovery: true, controller: newer },
  ]);
  assert.equal(
    validateRecoveryReceipt(value, h.site, { id: 2, run_attempt: 1, head_sha: newer }, h.git),
    h.site,
  );
  assert.equal(await latestDelivery(api, newer, h.git, async () => value), h.site);
  const options = {
    source: newer,
    pending: false,
    release: false,
    packageSource: h.base,
    bootstrap: false,
  };
  assert.equal((await planSiteDelivery(api, options, h.git, async () => value)).eligible, true);
  mkdirSync(resolve(h.root, '.github/workflows'), { recursive: true });
  writeFileSync(resolve(h.root, '.github/workflows/ci.yml'), 'workflow-only');
  h.git('add', '.');
  h.git('commit', '-qm', 'workflow successor');
  const workflow = h.git('rev-parse', 'HEAD');
  assert.equal(
    (await planSiteDelivery(api, { ...options, source: workflow }, h.git, async () => value))
      .eligible,
    true,
  );
  assert.throws(() =>
    validateRecoveryReceipt(
      { ...value, acknowledgedMain: newer },
      h.site,
      { id: 2, run_attempt: 1, head_sha: newer },
      h.git,
    ),
  );
});
test('latest physical rollback source wins over an older receipt for newer code; no implicit suppression', async (t) => {
  const h = fixture(t);
  const value = recoveryReceipt({
    source: h.base,
    controller: h.site,
    run: 2,
    attempt: 1,
    producer: 9,
    digest,
  });
  const api = recoveryAPI([
    { source: h.site },
    { source: h.base, recovery: true, controller: h.site },
  ]);
  assert.equal(await latestDelivery(api, h.site, h.git, async () => value), h.base);
  assert.equal(await alreadyDelivered(api, h.site, h.git, async () => value), false);
  assert.equal(
    (
      await planSiteDelivery(
        api,
        { source: h.site, pending: false, release: false, packageSource: h.base, bootstrap: false },
        h.git,
        async () => value,
      )
    ).eligible,
    true,
  );
  for (const change of [
    { run: 3 },
    { attempt: 2 },
    { sourceCommit: h.site },
    { controllerCommit: h.base },
    { snapshotSha256: 'bad' },
    { schema: 1 },
  ])
    assert.throws(() =>
      validateRecoveryReceipt(
        { ...value, ...change },
        h.base,
        { id: 2, run_attempt: 1, head_sha: h.site },
        h.git,
      ),
    );
});
test('receipt ZIP reader only reads bounded JSON and fails on altered identity', async (t) => {
  const h = fixture(t),
    value = recoveryReceipt({
      source: h.site,
      controller: h.controller,
      run: 1,
      attempt: 1,
      producer: 9,
      digest,
    });
  writeFileSync(resolve(h.root, 'delivery.json'), JSON.stringify(value));
  execFileSync('zip', ['-q', 'receipt.zip', 'delivery.json'], { cwd: h.root });
  const bytes = readFileSync(resolve(h.root, 'receipt.zip'));
  assert.deepEqual(
    await readRecoveryReceipt(async () => bytes, { id: 8, size_in_bytes: bytes.length }),
    value,
  );
  await assert.rejects(
    readRecoveryReceipt(async () => bytes, { id: 8, size_in_bytes: 2 * 1024 * 1024 }),
    /Unexpected/,
  );
});
test('new no-comment receipts and historical comment receipts both validate', async (t) => {
  const h = fixture(t);
  const run = { id: 2, run_attempt: 1, head_sha: h.site };
  const current = recoveryReceipt({
    source: h.base,
    controller: h.site,
    run: 2,
    attempt: 1,
    producer: 9,
    digest,
  });
  assert.equal(current.schema, 3);
  assert.equal(Object.hasOwn(current, 'reviewCommentId'), false);
  const historical = { ...current, schema: 2, reviewCommentId: '17' };
  for (const value of [current, historical]) {
    assert.equal(validateRecoveryReceipt(value, h.base, run, h.git), h.base);
    const api = recoveryAPI([
      { source: h.site },
      { source: h.base, recovery: true, controller: h.site },
    ]);
    assert.equal(await latestDelivery(api, h.site, h.git, async () => value), h.base);
    assert.equal(await alreadyDelivered(api, h.site, h.git, async () => value), false);
  }
  for (const value of [
    { ...current, reviewCommentId: '17' },
    { ...current, schema: 2 },
    { ...historical, reviewCommentId: 'invalid' },
    { ...current, schema: 4 },
  ])
    assert.throws(() => validateRecoveryReceipt(value, h.base, run, h.git));
});
test('manual override remains publication-free, compatible-package-only, and records receipt after both deploys', () => {
  const prepare = readFileSync('.github/workflows/prepare-site-release.yml', 'utf8'),
    data = parse(prepare);
  const runs = data.jobs.prepare.steps
    .filter((s) => s.run)
    .map((s) => s.run)
    .join('\n');
  assert.match(runs, /published-packages.mjs verify/);
  assert.match(runs, /release-sites.mjs build/);
  assert.doesNotMatch(runs, /pnpm release|changeset publish|npm publish|site-auto.mjs verify/);
  assert.match(runs, /cannot prove docs\/stories prose/);
  const deploy = parse(readFileSync('.github/workflows/deploy-site-snapshot.yml', 'utf8'));
  assert.equal(deploy.concurrency, 'veli-public-release-sites');
  assert.equal(deploy.permissions['id-token'], undefined);
  const steps = deploy.jobs.deploy.steps,
    receipt = steps.findIndex((s) => s.with?.name?.startsWith('site-deployed-'));
  assert.ok(receipt > steps.findLastIndex((s) => s.uses === 'cloudflare/wrangler-action@v3'));
  assert.deepEqual(Object.keys(deploy.on.workflow_dispatch.inputs), [
    'snapshot-run-id',
    'snapshot-sha256',
  ]);
  assert.doesNotMatch(JSON.stringify(deploy), /review-comment|REVIEW_COMMENT|verify-site-review/);
});

test('a later failed rerun does not invalidate a successful recovery receipt from an earlier attempt', async (t) => {
  const h = fixture(t);
  const value = recoveryReceipt({
    source: h.base,
    controller: h.site,
    run: 7,
    attempt: 1,
    producer: 9,
    digest,
  });
  const artifact = {
    id: 3,
    name: `site-deployed-${h.base}-recovery-1`,
    expired: false,
    created_at: '2026-01-01T00:00:00Z',
    workflow_run: { id: 7, head_sha: h.site },
  };
  const run = {
    id: 7,
    run_attempt: 2,
    head_sha: h.site,
    head_branch: 'main',
    status: 'completed',
    conclusion: 'failure',
    event: 'workflow_dispatch',
    path: '.github/workflows/deploy-site-snapshot.yml',
  };
  const api = async (path) =>
    path.startsWith('/actions/artifacts')
      ? { artifacts: [artifact] }
      : path.endsWith('/attempts/1')
        ? { ...run, run_attempt: 1, conclusion: 'success' }
        : run;
  assert.equal(await latestDelivery(api, h.site, h.git, async () => value), h.base);
  assert.equal(await alreadyDelivered(api, h.site, h.git, async () => value), false);
  const wrong = async (path) =>
    path.startsWith('/actions/artifacts')
      ? { artifacts: [artifact] }
      : path.endsWith('/attempts/1')
        ? { ...run, run_attempt: 1, conclusion: 'failure' }
        : run;
  assert.equal(await latestDelivery(wrong, h.site, h.git, async () => value), null);
});
