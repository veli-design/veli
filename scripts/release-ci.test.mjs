import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { getPackages } from '@manypkg/get-packages';
import {
  approvedReleaseEvent,
  isReleasePR,
  requireReleaseChecks,
  releaseMode,
  validationEvidence,
  verifyEvidence,
  verifyPublication,
} from './release-ci.mjs';

const repository = 'tradenetcorp/veli';
const base = 'a'.repeat(40);
const head = 'b'.repeat(40);
const candidateSHA = 'c'.repeat(40);
const commitSHA = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim();

function releaseJobs() {
  const jobs = Object.fromEntries(
    [
      'build',
      'changes',
      'candidate',
      'next-15',
      'next-16',
      'block-browser',
      'packaged-sites',
      'cold-reload',
    ].map((name) => [name, { result: 'success' }]),
  );
  jobs.changes.outputs = Object.fromEntries(
    ['release', 'candidate', 'next', 'blocks', 'sites', 'cold'].map((name) => [name, 'true']),
  );
  return jobs;
}

test('release evidence rejects missing, skipped or failed suites and incomplete selection', () => {
  requireReleaseChecks(releaseJobs());
  for (const name of Object.keys(releaseJobs())) {
    for (const result of [undefined, 'skipped', 'cancelled', 'failure']) {
      const jobs = releaseJobs();
      jobs[name].result = result;
      assert.throws(() => requireReleaseChecks(jobs), /must succeed/);
    }
  }
  for (const name of Object.keys(releaseJobs().changes.outputs)) {
    const jobs = releaseJobs();
    jobs.changes.outputs[name] = 'false';
    assert.throws(() => requireReleaseChecks(jobs), /must be enabled/);
  }
});

function fixture() {
  const pr = {
    number: 290,
    user: { login: 'github-actions[bot]' },
    head: { ref: 'changeset-release/main', sha: head, repo: { full_name: repository } },
    base: { ref: 'main', repo: { full_name: repository } },
    merged: true,
    merged_at: '2026-10-26T12:00:00Z',
    merge_commit_sha: commitSHA,
  };
  const run = {
    id: 123,
    run_attempt: 2,
    event: 'pull_request',
    status: 'completed',
    conclusion: 'success',
    workflow_id: 42,
    path: '.github/workflows/ci.yml',
    head_repository: { full_name: repository },
    head_branch: 'changeset-release/main',
    actor: { login: 'github-actions[bot]' },
    head_sha: head,
  };
  const commit = { sha: commitSHA, tree: { sha: tree }, parents: [{ sha: base }] };
  const candidate = {
    sha: candidateSHA,
    tree: { sha: tree },
    parents: [{ sha: base }, { sha: head }],
  };
  const env = {
    GITHUB_REPOSITORY: repository,
    GITHUB_ACTOR: 'github-actions[bot]',
    GITHUB_EVENT_NAME: 'pull_request',
    GITHUB_SHA: commitSHA,
    GITHUB_RUN_ID: '123',
    GITHUB_RUN_ATTEMPT: '2',
  };
  const evidence = validationEvidence({ pull_request: pr }, env, {
    commit: candidateSHA,
    tree,
    parents: [base, head],
  });
  const context = { repository, pr, run, commit, candidate, workflowId: 42 };
  const artifact = { id: 456, name: 'release-validation-2', expired: false };
  const responses = {
    [`/git/commits/${commitSHA}`]: commit,
    [`/commits/${commitSHA}/pulls?per_page=100&page=1`]: [pr],
    '/pulls/290': pr,
    '/actions/workflows/ci.yml': { id: 42 },
    [`/actions/workflows/42/runs?event=pull_request&head_sha=${head}&status=success&per_page=100&page=1`]:
      { workflow_runs: [run] },
    '/actions/runs/123/artifacts?per_page=100&page=1': { artifacts: [artifact] },
    [`/git/commits/${candidateSHA}`]: candidate,
  };
  const api = async (path) => {
    assert.ok(Object.hasOwn(responses, path), `Unexpected API request: ${path}`);
    return responses[path];
  };
  return { evidence, context, env, responses, api, artifact };
}

test('release coverage authenticates bot, repository, branch, base and event actor, never title', () => {
  const {
    context: { pr },
  } = fixture();
  assert.ok(isReleasePR(pr, repository));
  assert.ok(approvedReleaseEvent({ pull_request: pr }, repository, 'github-actions[bot]'));
  assert.equal(approvedReleaseEvent({ pull_request: pr }, repository, 'contributor'), false);
  for (const patch of [
    { user: { login: 'contributor' }, title: 'chore: release packages' },
    { head: { ...pr.head, repo: { full_name: 'fork/veli' } } },
    { head: { ...pr.head, ref: 'feature/release' } },
    { base: { ...pr.base, ref: 'other' } },
  ])
    assert.equal(isReleasePR({ ...pr, ...patch }, repository), false);
});

test('squash and merge commits accept the exact tested tree and original base', () => {
  const { evidence, context } = fixture();
  assert.ok(verifyEvidence(evidence, context));
  context.commit.parents.push({ sha: head });
  assert.ok(verifyEvidence(evidence, context));
});

test('head, base, tree, candidate and workflow identity cannot reuse stale success', () => {
  for (const field of ['head', 'base', 'tree', 'candidate']) {
    const { evidence, context } = fixture();
    assert.throws(() => verifyEvidence({ ...evidence, [field]: 'd'.repeat(40) }, context));
  }
  for (const [field, value] of [
    ['run', 124],
    ['attempt', 1],
    ['repository', 'fork/veli'],
    ['pr', 291],
    ['schema', 2],
  ]) {
    const { evidence, context } = fixture();
    assert.throws(() => verifyEvidence({ ...evidence, [field]: value }, context));
  }
  for (const patch of [
    { conclusion: 'failure' },
    { status: 'in_progress' },
    { event: 'push' },
    { actor: { login: 'contributor' } },
    { workflow_id: 99 },
    { path: '.github/workflows/other.yml' },
    { head_sha: base },
    { head_repository: { full_name: 'fork/veli' } },
  ]) {
    const { evidence, context } = fixture();
    assert.throws(() =>
      verifyEvidence(evidence, { ...context, run: { ...context.run, ...patch } }),
    );
  }
  const { evidence, context } = fixture();
  context.candidate.parents[0].sha = head;
  assert.throws(() => verifyEvidence(evidence, context));
});

test('new base invalidates evidence even if merged content happens to be identical', () => {
  const { evidence, context } = fixture();
  context.commit.parents[0].sha = 'e'.repeat(40);
  assert.throws(() => verifyEvidence(evidence, context));
});

test('publication requires actual merged release and successful exact-attempt artifact', async () => {
  const { api, env, evidence, artifact } = fixture();
  await verifyPublication(api, env, async (download) => {
    assert.equal(download.id, artifact.id);
    return evidence;
  });
  for (const update of [
    (f) => {
      f.artifact.expired = true;
    },
    (f) => {
      f.artifact.name = 'release-validation-1';
    },
    (f) => {
      f.evidence.tree = 'e'.repeat(40);
    },
    (f) => {
      f.evidence.base = 'e'.repeat(40);
    },
    (f) => {
      f.context.pr.merge_commit_sha = base;
    },
    (f) => {
      f.context.run.conclusion = 'failure';
    },
    (f) => {
      f.context.pr.merged = false;
    },
  ]) {
    const f = fixture();
    update(f);
    await assert.rejects(() => verifyPublication(f.api, f.env, async () => f.evidence));
  }
});

test('stamp records both real merge parents in a depth-one Actions checkout', () => {
  const directory = mkdtempSync(join(tmpdir(), 'veli-release-stamp-'));
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const source = join(directory, 'source');
  const checkout = join(directory, 'checkout');
  const git = (...args) =>
    execFileSync('git', ['-C', source, ...args], { env, encoding: 'utf8' }).trim();
  try {
    execFileSync('git', ['init', '-q', '-b', 'main', source], { env });
    git('config', 'user.email', 'ci@example.test');
    git('config', 'user.name', 'CI');
    writeFileSync(join(source, 'base'), 'base');
    git('add', '.');
    git('commit', '-qm', 'base');
    const baseSHA = git('rev-parse', 'HEAD');
    git('checkout', '-qb', 'release');
    writeFileSync(join(source, 'release'), 'version');
    git('add', '.');
    git('commit', '-qm', 'release');
    const headSHA = git('rev-parse', 'HEAD');
    git('checkout', '-q', 'main');
    git('merge', '--no-ff', '-qm', 'candidate', 'release');
    const candidateSHA = git('rev-parse', 'HEAD');
    execFileSync('git', ['clone', '-q', '--depth=1', pathToFileURL(source).href, checkout], {
      env,
    });
    const f = fixture();
    f.context.pr.head.sha = headSHA;
    const eventPath = join(directory, 'event.json');
    const output = join(directory, 'release-validation.json');
    writeFileSync(eventPath, JSON.stringify({ pull_request: f.context.pr }));
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL('./release-ci.mjs', import.meta.url)), 'stamp', output],
      {
        cwd: checkout,
        env: {
          ...env,
          ...f.env,
          GITHUB_SHA: candidateSHA,
          GITHUB_EVENT_PATH: eventPath,
          CONSUMER_JOBS: JSON.stringify(releaseJobs()),
        },
      },
    );
    const evidence = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(evidence.head, headSHA);
    assert.equal(evidence.base, baseSHA);
    assert.equal(evidence.candidate, candidateSHA);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('API failures, absent runs and missing evidence fail closed', async () => {
  const f = fixture();
  await assert.rejects(() =>
    verifyPublication(async () => {
      throw new Error('HTTP 403');
    }, f.env),
  );
  f.responses[
    `/actions/workflows/42/runs?event=pull_request&head_sha=${head}&status=success&per_page=100&page=1`
  ].workflow_runs = [];
  await assert.rejects(
    () => verifyPublication(f.api, f.env, async () => f.evidence),
    /Publication blocked/,
  );
});

test('release preparation stays cheap and unrelated main pushes cannot publish', async () => {
  const f = fixture();
  assert.equal(
    await releaseMode(
      true,
      async () => {
        throw new Error('Preparation must not need publication history');
      },
      f.env,
    ),
    'none',
  );
  assert.equal(await releaseMode(false, f.api, f.env), 'publish');
  f.responses[`/commits/${commitSHA}/pulls?per_page=100&page=1`] = [];
  assert.equal(await releaseMode(false, f.api, f.env), 'none');
});

test('preparation workflow can only version the main snapshot with repository bot credentials', async () => {
  const { parse } = await import('yaml');
  const preparation = parse(
    readFileSync(new URL('../.github/workflows/prepare-release.yml', import.meta.url), 'utf8'),
  );
  assert.deepEqual(preparation.on, { push: { branches: ['main'] }, workflow_dispatch: null });
  assert.deepEqual(preparation.permissions, { contents: 'read' });
  assert.equal(preparation.concurrency, 'Release-${{ github.ref }}');
  assert.deepEqual(Object.keys(preparation.jobs), ['prepare', 'catchup']);
  assert.deepEqual(preparation.jobs.catchup.permissions, { actions: 'write', contents: 'read' });
  assert.deepEqual(
    preparation.jobs.catchup.steps.map((s) => s.uses),
    ['actions/github-script@v7'],
  );
  const job = preparation.jobs.prepare;
  assert.equal(job.if, "github.repository_id == '1115705061' && github.ref == 'refs/heads/main'");
  assert.deepEqual(job.permissions, { contents: 'write', 'pull-requests': 'write' });
  assert.equal(preparation.env, undefined);
  assert.equal(job.env, undefined);
  assert.deepEqual(
    job.steps.filter((step) => step.run).map((step) => step.run),
    [
      'node scripts/release-order.mjs prepare-check',
      'corepack pnpm install --frozen-lockfile',
      'node scripts/release-order.mjs prepare-check',
    ],
  );
  assert.deepEqual(
    job.steps.filter((step) => step.uses).map((step) => step.uses),
    [
      'actions/checkout@v4',
      'actions/setup-node@v4',
      'pnpm/action-setup@v6',
      'actions/setup-node@v4',
      'changesets/action@v1',
    ],
  );
  const checkout = job.steps.find((step) => step.uses === 'actions/checkout@v4');
  assert.equal(checkout.with, undefined, 'Checkout must use the restricted event snapshot');
  const action = job.steps.find((step) => step.uses === 'changesets/action@v1');
  assert.deepEqual(action.with, {
    version: 'corepack pnpm version-packages',
    commit: 'chore: release packages',
    title: 'chore: release packages',
  });
  assert.deepEqual(action.env, { GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' });
  for (const step of job.steps)
    assert.ok(
      Object.keys(step.env ?? {}).every((key) => key === 'GITHUB_TOKEN'),
      'Preparation must not receive npm credentials or publication approvals',
    );
});

test('workflow keeps native approval, all release suites and publication ordering', async () => {
  const { parse } = await import('yaml');
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const ci = parse(read('../.github/workflows/ci.yml'));
  const release = parse(read('../.github/workflows/release.yml'));
  assert.deepEqual(Object.keys(ci.on), ['pull_request']);
  assert.deepEqual(release.on, { push: { branches: ['main'] }, workflow_dispatch: null });
  assert.equal(release.jobs.plan.if, "github.repository_id == '1115705061'");
  assert.equal(release.jobs.release.needs, 'plan');
  assert.equal(release.jobs.release.concurrency, 'Release-Publish');
  assert.equal(release.jobs.plan.permissions['id-token'], undefined);
  const gate = ci.jobs['blocks-consumer'];
  assert.ok(gate.needs.includes('build'));
  const record = gate.steps.find((step) => step.run?.includes('release-ci.mjs stamp'));
  assert.equal(record.if, "needs.changes.outputs.release == 'true'");
  const publish = release.jobs.release;
  assert.equal(
    publish.if,
    "needs.plan.outputs.mode == 'publish' && vars.VELI_NPM_PUBLICATION_APPROVED == 'true' && vars.VELI_RELEASE_BRANCH != '' && github.ref_name == vars.VELI_RELEASE_BRANCH",
  );
  assert.equal(publish.permissions.actions, 'read');
  assert.equal(publish.permissions['pull-requests'], 'read');
  assert.equal(publish.permissions['id-token'], 'write');
  const trustIndex = publish.steps.findIndex(
    (step) =>
      step.env?.TRUSTED_PUBLISHING_READY === '${{ vars.VELI_NPM_TRUSTED_PUBLISHING_READY }}',
  );
  assert.ok(trustIndex >= 0);
  assert.equal(publish.steps[trustIndex].if, "needs.plan.outputs.mode == 'publish'");
  assert.equal(publish.steps[trustIndex].run, `test "$TRUSTED_PUBLISHING_READY" = 'true'`);
  const verifyIndex = publish.steps.findIndex((step) =>
    step.run?.includes('release-order.mjs verify-selected'),
  );
  const installIndex = publish.steps.findIndex((step) =>
    step.run?.includes('install --frozen-lockfile'),
  );
  assert.ok(trustIndex < verifyIndex && verifyIndex < installIndex);
  assert.ok(!publish.steps.some((step) => step.run === 'pnpm build'));
  const action = publish.steps.find((step) => step.uses === 'changesets/action@v1');
  assert.equal(action.env.GITHUB_TOKEN, '${{ secrets.GITHUB_TOKEN }}');
  assert.equal(action.env.NPM_TOKEN, undefined);
  assert.equal(action.env.NODE_AUTH_TOKEN, undefined);
  assert.equal(action.env.NPM_CONFIG_PROVENANCE, false);
  assert.equal(action.with.publish, 'node scripts/release-order.mjs publish');
  assert.equal(action.if, "needs.plan.outputs.mode != 'none'");
  const publisher = read('./publish-packages.mjs');
  const { packages } = await getPackages(fileURLToPath(new URL('..', import.meta.url)));
  const publishedPackages = packages
    .filter(({ packageJson }) => !packageJson.private)
    .map(({ packageJson }) => packageJson.name)
    .sort();
  assert.deepEqual(publishedPackages, [
    '@veli-design/cli',
    '@veli-design/react',
    '@veli-design/tokens',
  ]);
  const buildFilters = [...publisher.matchAll(/--filter=(@[^']+)/g)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(buildFilters, publishedPackages, 'Every distributable package must be built');
  assert.ok(
    publisher.indexOf('await verifyCurrentPublication()') < publisher.indexOf("await run(['pnpm'"),
  );
  assert.equal(
    release.jobs['deploy-sites'].if,
    "needs.release.outputs.published == 'true' && vars.VELI_REGISTRY_TRANSITION_APPROVED == 'true'",
  );
});

test('only validated publication disables local hooks for parallel Changesets tag pushes', async () => {
  const { parse } = await import('yaml');
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const release = parse(read('../.github/workflows/release.yml'));
  const publish = release.jobs.release.steps.find(
    (step) => step.name === 'Publish validated packages to npm',
  );
  assert.equal(publish.uses, 'changesets/action@v1');
  assert.equal(publish.with.publish, 'node scripts/release-order.mjs publish');
  assert.equal(publish.env.HUSKY, '0');
  assert.equal(release.env?.HUSKY, undefined, 'Hooks must not be disabled for the workflow');
  for (const job of Object.values(release.jobs)) {
    assert.equal(job.env?.HUSKY, undefined, 'Hooks must not be disabled for a whole job');
    for (const step of job.steps ?? []) {
      if (step !== publish)
        assert.equal(step.env?.HUSKY, undefined, 'Hook bypass belongs only to publication');
    }
  }
  assert.equal(read('../.husky/pre-push').trim(), 'corepack pnpm check');
  assert.equal(read('../.husky/pre-commit').trim(), 'corepack pnpm lint-staged');
});

test('release publication validates exact CI evidence without reading review comments', async () => {
  const f = fixture();
  // The fixture has no review/comment/permission endpoint: any such dependency fails.
  await verifyPublication(f.api, f.env, async () => f.evidence);
});

test('manual recovery uses immutable inputs and verification, with no comment gate', async () => {
  const { parse } = await import('yaml');
  const source = readFileSync(
    new URL('../.github/workflows/deploy-site-snapshot.yml', import.meta.url),
    'utf8',
  );
  const snapshot = parse(source);
  assert.deepEqual(Object.keys(snapshot.on.workflow_dispatch.inputs), [
    'snapshot-run-id',
    'snapshot-sha256',
  ]);
  assert.deepEqual(snapshot.permissions, { contents: 'read', actions: 'read' });
  assert.equal(snapshot.concurrency, 'veli-public-release-sites');
  assert.match(snapshot.jobs.deploy.if, /github.ref == 'refs\/heads\/main'/);
  const steps = snapshot.jobs.deploy.steps;
  const deployment = steps.findIndex((s) => s.uses === 'cloudflare/wrangler-action@v3');
  for (const command of [
    'assertSnapshotProducer(',
    'site-release.mjs verify',
    'prepare-recovery-receipt',
  ]) {
    const index = steps.findIndex((s) => (s.run ?? s.with?.script ?? '').includes(command));
    assert.ok(index >= 0 && index < deployment, command);
  }
  assert.doesNotMatch(
    source,
    /review-comment-id|REVIEW_COMMENT|verify-site-review|issues:|pull-requests:/,
  );
  assert.ok(!steps.some((s) => s.run?.includes('pnpm release')));
});

test('transfer retains authenticated identity while old repository evidence cannot be reused', () => {
  const f = fixture();
  const moved = 'veli-design/veli';
  const pr = {
    ...f.context.pr,
    head: { ...f.context.pr.head, repo: { full_name: moved } },
    base: { ...f.context.pr.base, repo: { full_name: moved } },
  };
  assert.ok(isReleasePR(pr, moved));
  assert.equal(isReleasePR(f.context.pr, moved), false);
  const context = {
    ...f.context,
    repository: moved,
    pr,
    run: { ...f.context.run, head_repository: { full_name: moved } },
  };
  assert.doesNotThrow(() => verifyEvidence({ ...f.evidence, repository: moved }, context));
  assert.throws(() => verifyEvidence(f.evidence, context));
});
