import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  eligible,
  packagePaths,
  sitePaths,
  assertCurrent,
  verifyMergedSiteReview,
  selectBaseline,
  packageLockClosure,
} from './site-auto.mjs';

const source = 'a'.repeat(40);
const approved = {
  user: { login: 'reviewer', type: 'User' },
  state: 'APPROVED',
  commit_id: 'b'.repeat(40),
};
const pr = {
  number: 9,
  merged_at: 'now',
  merge_commit_sha: source,
  base: { ref: 'main' },
  head: { sha: approved.commit_id, repo: { full_name: 'veli-design/veli' } },
};
const apiFor =
  (reviews, permission = 'write') =>
  async (path) => {
    if (path.startsWith('/commits/')) return [pr];
    if (path.startsWith('/pulls/')) return reviews;
    if (path.startsWith('/collaborators/')) return { permission };
    throw new Error(path);
  };
test('site delivery excludes pending, mixed and release/no-op-publication commits', () => {
  const base = {
    pending: false,
    release: false,
    changed: ['apps/web/src/content/docs/test.mdx'],
    unpublished: [],
  };
  assert.equal(eligible(base), true);
  assert.equal(eligible({ ...base, pending: true }), false);
  assert.equal(eligible({ ...base, release: true }), false);
  assert.equal(eligible({ ...base, unpublished: ['packages/react/src/Sheet.tsx'] }), false);
  assert.equal(eligible({ ...base, changed: ['docs/CI_RELEASE_RUNBOOK.md'] }), false);
  assert.equal(eligible({ ...base, changed: ['apps/storybook/src/Sheet.stories.tsx'] }), true);
  assert.equal(
    eligible({ ...base, changed: ['packages/blocks/src/new-block/manifest.json'] }),
    true,
  );
  for (const name of ['react', 'tokens', 'cli'])
    assert.equal(packagePaths([`packages/${name}/package.json`]), true);
  assert.equal(sitePaths(['apps/web/src/styles/global.css']), true);
});
test('ordinary approval requires final head, human, current write permission; no new marker', async () => {
  await verifyMergedSiteReview(apiFor([approved]), 'veli-design/veli', source);
  for (const reviews of [
    [],
    [{ ...approved, commit_id: source }],
    [{ ...approved, user: { login: 'bot', type: 'Bot' } }],
    [approved, { ...approved, state: 'CHANGES_REQUESTED' }],
    [approved, { ...approved, state: 'DISMISSED' }],
  ]) {
    await assert.rejects(verifyMergedSiteReview(apiFor(reviews), 'veli-design/veli', source));
  }
  await assert.rejects(
    verifyMergedSiteReview(apiFor([approved], 'read'), 'veli-design/veli', source),
  );
  await verifyMergedSiteReview(
    apiFor([approved, { ...approved, state: 'COMMENTED' }]),
    'veli-design/veli',
    source,
  );
});
test('duplicate guard is checked inside deployment lock', async () => {
  const api = async (path) =>
    path === '/git/ref/heads/main' ? { object: { sha: source } } : { artifacts: [] };
  await assertCurrent(api, source);
  await assert.rejects(
    assertCurrent(
      async (path) =>
        path === '/actions/runs/42'
          ? {
              status: 'completed',
              conclusion: 'success',
              path: '.github/workflows/deploy-site-changes.yml',
              event: 'push',
            }
          : path === '/git/ref/heads/main'
            ? { object: { sha: source } }
            : { artifacts: [{ expired: false, workflow_run: { head_sha: source, id: 42 } }] },
      source,
    ),
    /already deployed/,
  );
});
test('baseline chooses durable non-draft non-prerelease snapshot, bootstrap only if absent', async () => {
  const asset = (name) => ({ name });
  const releases = [
    {
      draft: false,
      prerelease: false,
      tag_name: '@veli-design/react@0.19.0',
      published_at: '2026-11-04',
      assets: [asset('publication.json'), asset('release-manifest.json')],
    },
    {
      draft: false,
      prerelease: true,
      tag_name: 'bad',
      published_at: '2026-11-05',
      assets: [asset('publication.json'), asset('release-manifest.json')],
    },
  ];
  assert.equal(await selectBaseline(async () => releases), '@veli-design/react@0.19.0');
  assert.equal(await selectBaseline(async () => []), 'bootstrap-2026-11-01');
});
test('automatic workflow validates merged source and installed artifacts, serializes and captures before deploy', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/deploy-site-changes.yml', import.meta.url),
    'utf8',
  );
  const data = parse(workflow);
  assert.equal(data.on.push.branches[0], 'main');
  assert.deepEqual(data.on.workflow_run.workflows, ['Release']);
  assert.equal(data.jobs.deploy.concurrency, 'veli-public-release-sites');
  assert.equal(data.permissions.contents, 'read');
  const steps = data.jobs.deploy.steps;
  const commands = steps
    .filter((s) => s.run)
    .map((s) => s.run)
    .join('\n');
  assert.match(commands, /corepack pnpm check/);
  assert.match(commands, /published-packages.mjs verify/);
  assert.equal(steps.filter((s) => s.run?.includes('site-auto.mjs verify')).length, 1);
  assert.equal(steps.find((s) => s.id === 'current').run, 'node scripts/site-auto.mjs gate');
  for (const step of steps.filter((s) => s.uses?.startsWith('cloudflare/')))
    assert.equal(step.if, "steps.current.outputs.ready == 'true'");
  assert.ok(
    steps.findIndex((s) => s.with?.name?.startsWith('site-snapshot-')) <
      steps.findIndex((s) => s.uses?.startsWith('cloudflare/')),
  );
  assert.doesNotMatch(workflow, /id-token:|publish:|visual-review-approved|review-comment-id/);
});

test('package lock closure rejects transitive package changes but permits unrelated app lock changes', () => {
  const lock = {
    importers: Object.fromEntries(
      ['.', 'packages/react', 'packages/tokens', 'packages/cli'].map((p) => [
        p,
        { dependencies: { a: { specifier: '1', version: '1.0.0' } } },
      ]),
    ),
    snapshots: { 'a@1.0.0': { dependencies: { b: '2.0.0' } }, 'b@2.0.0': {} },
    packages: {
      'a@1.0.0': { resolution: { integrity: 'a' } },
      'b@2.0.0': { resolution: { integrity: 'b' } },
    },
  };
  const changed = structuredClone(lock);
  changed.packages['b@2.0.0'].resolution.integrity = 'different';
  assert.notDeepEqual(packageLockClosure(changed), packageLockClosure(lock));
  const app = structuredClone(lock);
  app.importers['apps/web'] = { dependencies: { c: { version: '3.0.0' } } };
  app.packages['c@3.0.0'] = {};
  app.snapshots['c@3.0.0'] = {};
  assert.deepEqual(packageLockClosure(app), packageLockClosure(lock));
});

test('concurrent successors permit only contributor prose; package/release/site successors skip stale source', async () => {
  const api = async (path) =>
    path === '/git/ref/heads/main' ? { object: { sha: 'c'.repeat(40) } } : { artifacts: [] };
  const read =
    (changed) =>
    (...args) =>
      args[0] === 'diff' ? changed : '';
  await assertCurrent(api, source, read('docs/CONTRIBUTING.md'));
  for (const changed of [
    'apps/web/src/page.astro',
    'packages/react/src/Sheet.tsx',
    '.changeset/new.md',
    'packages/react/package.json',
    '.github/workflows/release.yml',
  ]) {
    await assert.rejects(assertCurrent(api, source, read(changed)), /Superseded source/);
  }
  await assert.rejects(
    assertCurrent(async () => {
      throw new Error('HTTP 503');
    }, source),
    /HTTP 503/,
  );
});
