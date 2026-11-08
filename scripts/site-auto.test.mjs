import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import {
  packagePaths,
  sitePaths,
  assertCurrent,
  verifyMergedSiteAuthorization,
  selectBaseline,
  packageLockClosure,
  latestDelivery,
  planSiteDelivery,
  assertPublishedSource,
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
  merged: true,
  merge_commit_sha: source,
  base: { ref: 'main', repo: { full_name: 'veli-design/veli' } },
  head: { sha: approved.commit_id, repo: { full_name: 'veli-design/veli' } },
};
const apiFor =
  (reviews, permission = 'write') =>
  async (path) => {
    if (path.startsWith('/commits/')) return [pr];
    if (path === `/pulls/${pr.number}`) return pr;
    if (path.startsWith('/pulls/')) return reviews;
    if (path.startsWith('/collaborators/')) return { permission };
    throw new Error(path);
  };
test('site paths include deployed docs, Storybook and Blocks; contributor prose is inert', () => {
  for (const path of [
    'apps/web/src/content/docs/test.mdx',
    'apps/storybook/src/Sheet.stories.tsx',
    'packages/blocks/src/new-block/manifest.json',
  ])
    assert.equal(sitePaths([path]), true);
  assert.equal(sitePaths(['docs/CI_RELEASE_RUNBOOK.md']), false);
  for (const name of ['react', 'tokens', 'cli'])
    assert.equal(packagePaths([`packages/${name}/package.json`]), true);
});
test('only package-root README prose is excluded from unpublished-source checks', () => {
  for (const name of ['react', 'tokens', 'cli']) {
    assert.equal(packagePaths([`packages/${name}/README.md`]), false);
    for (const path of [
      'package.json',
      'tsconfig.json',
      'src/README.md',
      'src/index.ts',
      'README.mdx',
      'build.mjs',
    ])
      assert.equal(packagePaths([`packages/${name}/${path}`]), true);
    assert.equal(
      packagePaths([`packages/${name}/README.md`, `packages/${name}/src/index.ts`]),
      true,
    );
  }
  for (const path of [
    'package.json',
    'turbo.json',
    'pnpm-workspace.yaml',
    'scripts/build-react.mjs',
  ])
    assert.equal(packagePaths([path]), true);
});
test('site builds default to the established domains while retaining explicit overrides', () => {
  for (const name of ['deploy-site-changes', 'deploy-release-sites']) {
    const workflow = parse(readFileSync(`.github/workflows/${name}.yml`, 'utf8'));
    const env = Object.values(workflow.jobs).find((job) => job.env?.PUBLIC_SITE_URL).env;
    assert.equal(env.PUBLIC_SITE_URL, "${{ vars.VELI_WEB_ORIGIN || 'https://veli.design' }}");
    assert.equal(
      env.STORYBOOK_ORIGIN,
      "${{ vars.VELI_STORYBOOK_ORIGIN || 'https://storybook.veli.design' }}",
    );
  }
  const inputs = parse(readFileSync('.github/workflows/prepare-site-release.yml', 'utf8')).on
    .workflow_dispatch.inputs;
  assert.equal(inputs['web-origin'].default, 'https://veli.design');
  assert.equal(inputs['storybook-origin'].default, 'https://storybook.veli.design');
});
test('ordinary approval requires final head, human, current write permission; no new marker', async () => {
  await verifyMergedSiteAuthorization(apiFor([approved]), 'veli-design/veli', source);
  for (const reviews of [
    [],
    [{ ...approved, commit_id: source }],
    [{ ...approved, user: { login: 'bot', type: 'Bot' } }],
    [approved, { ...approved, state: 'CHANGES_REQUESTED' }],
    [approved, { ...approved, state: 'DISMISSED' }],
  ]) {
    await assert.rejects(
      verifyMergedSiteAuthorization(apiFor(reviews), 'veli-design/veli', source),
    );
  }
  await assert.rejects(
    verifyMergedSiteAuthorization(apiFor([approved], 'read'), 'veli-design/veli', source),
  );
  await verifyMergedSiteAuthorization(
    apiFor([approved, { ...approved, state: 'COMMENTED' }]),
    'veli-design/veli',
    source,
  );
});
test('human repository-admin merge authorizes own PR without a review or marker', async () => {
  const merged = {
    ...pr,
    user: { login: 'solo-admin', type: 'User' },
    merged_by: { login: 'solo-admin', type: 'User' },
  };
  const calls = [];
  await verifyMergedSiteAuthorization(
    async (path) => {
      calls.push(path);
      if (path === `/pulls/${pr.number}`) return merged;
      if (path === '/collaborators/solo-admin/permission') return { permission: 'admin' };
      return apiFor([])(path);
    },
    'veli-design/veli',
    source,
  );
  assert.ok(!calls.some((path) => path.includes('/reviews')));
});
test('merge authority is not inferred from author, bot, writer or unknown permission', async () => {
  for (const [merger, permission] of [
    [null, 'admin'],
    [{ login: 'merger', type: 'Bot' }, 'admin'],
    [{ login: 'merger', type: 'User' }, 'write'],
    [{ login: 'merger', type: 'User' }, 'maintain'],
    [{ login: 'merger', type: 'User', site_admin: true }, 'read'],
    [{ login: 'merger', type: 'User' }, undefined],
  ]) {
    const api = async (path) => {
      if (path === `/pulls/${pr.number}`)
        return { ...pr, user: { login: 'admin-author', type: 'User' }, merged_by: merger };
      if (path.startsWith('/collaborators/')) return { permission };
      return apiFor([])(path);
    };
    await assert.rejects(
      verifyMergedSiteAuthorization(api, 'veli-design/veli', source),
      /approval or a human repository-admin merge/,
    );
  }
});
test('authoritative merged PR must bind exact source, repository and branch', async () => {
  const adminMerge = { ...pr, merged_by: { login: 'admin', type: 'User' } };
  for (const invalid of [
    { ...adminMerge, number: 10 },
    { ...adminMerge, merged: false },
    { ...adminMerge, merged_at: null },
    { ...adminMerge, merge_commit_sha: 'c'.repeat(40) },
    { ...adminMerge, base: { ...pr.base, ref: 'dev' } },
    { ...adminMerge, base: { ...pr.base, repo: { full_name: 'other/veli' } } },
    { ...adminMerge, head: {} },
  ]) {
    await assert.rejects(
      verifyMergedSiteAuthorization(
        async (path) => {
          if (path === `/pulls/${pr.number}`) return invalid;
          return apiFor([], 'admin')(path);
        },
        'veli-design/veli',
        source,
      ),
    );
  }
  await assert.rejects(
    verifyMergedSiteAuthorization(async () => [], 'veli-design/veli', source),
    /requires a PR merged/,
  );
});
test('authorization API failures fail closed rather than using workflow identity', async () => {
  for (const failure of [`/pulls/${pr.number}`, '/collaborators/admin/permission']) {
    await assert.rejects(
      verifyMergedSiteAuthorization(
        async (path) => {
          if (path === failure) throw new Error('HTTP 403');
          if (path === `/pulls/${pr.number}`)
            return { ...pr, merged_by: { login: 'admin', type: 'User' } };
          return apiFor([])(path);
        },
        'veli-design/veli',
        source,
      ),
      /HTTP 403/,
    );
  }
});
test('admin merge does not bypass pending Changesets or published-package validation', async () => {
  const script = readFileSync(new URL('./site-auto.mjs', import.meta.url), 'utf8');
  const verify = script.slice(
    script.indexOf("command === 'verify'"),
    script.indexOf("command === 'guard'"),
  );
  assert.ok(
    verify.indexOf('pendingChangesets()') < verify.indexOf('verifyMergedSiteAuthorization('),
  );
  assert.ok(
    verify.indexOf('assertPublishedSource(') < verify.indexOf('verifyMergedSiteAuthorization('),
  );
  assert.match(verify, /verifyCurrentPublication/);
  const result = await planSiteDelivery(
    async () => {
      throw new Error('must not access evidence');
    },
    { source, pending: true, release: false, packageSource: source, bootstrap: false },
  );
  assert.deepEqual(result, { eligible: false, reason: 'Pending Changesets' });
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
              head_sha: source,
              head_branch: 'main',
            }
          : path === '/git/ref/heads/main'
            ? { object: { sha: source } }
            : {
                artifacts: [
                  {
                    name: `site-deployed-${source}`,
                    expired: false,
                    created_at: '2026-01-01T00:00:00Z',
                    workflow_run: { head_sha: source, id: 42 },
                  },
                ],
              },
      source,
      () => '',
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
  assert.equal(
    await selectBaseline(
      async (path) =>
        path.startsWith('/releases') ? releases : { object: { type: 'commit', sha: source } },
      source,
      () => source,
    ),
    '@veli-design/react@0.19.0',
  );
  assert.equal(await selectBaseline(async () => []), 'bootstrap-2026-11-01');
});
test('automatic workflow validates merged source and installed artifacts, serializes and captures before deploy', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/deploy-site-changes.yml', import.meta.url),
    'utf8',
  );
  const data = parse(workflow);
  assert.equal(data.on.push.branches[0], 'main');
  assert.deepEqual(data.on.workflow_run.workflows, [
    'Release',
    'Deploy reviewed site snapshot',
    'Prepare published site rebuild',
    'Temporary bootstrap site catch-up',
  ]);
  assert.deepEqual(Object.keys(data.jobs), ['deploy']);
  assert.equal(data.jobs.deploy.steps[0].with.ref, 'main');
  assert.ok(
    data.jobs.deploy.steps.findIndex((s) => s.id === 'source') <
      data.jobs.deploy.steps.findIndex((s) => s.id === 'plan'),
  );
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
  assert.equal(
    steps.find((s) => s.id === 'current').run,
    'node scripts/site-auto.mjs gate "$RUNNER_TEMP/site-baseline/publication.json"',
  );
  assert.equal(
    steps.find((s) => s.with?.name?.startsWith('site-deployed-')).with.name,
    'site-deployed-${{ steps.source.outputs.source }}',
  );
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

function historyFixture(t) {
  // Hooks export GIT_* variables; temporary repositories must not inherit them.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const root = mkdtempSync(resolve(tmpdir(), 'veli-site-queue-'));
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
  const commit = (path, text) => {
    mkdirSync(dirname(resolve(root, path)), { recursive: true });
    writeFileSync(resolve(root, path), text);
    git('add', '.');
    git('commit', '-qm', path);
    return git('rev-parse', 'HEAD');
  };
  const baseline = commit('apps/web/src/page.mdx', 'original');
  const site = commit('apps/web/src/page.mdx', 'updated');
  const workflow = commit('.github/workflows/ci.yml', 'workflow-only successor');
  const prose = commit('docs/contributing.md', 'prose successor');
  const pending = commit('.changeset/pending.md', 'package release pending');
  const read = (...args) => (args[0] === 'fetch' ? '' : git(...args));
  return { root, env, git, commit, baseline, site, workflow, prose, pending, read };
}
function deliveryAPI(main, records = []) {
  const artifacts = records.map((r, index) => ({
    name: `site-deployed-${r.source}`,
    expired: r.expired ?? false,
    created_at:
      r.createdAt ?? new Date(Date.UTC(2026, 0, 1, 0, 0, records.length - index)).toISOString(),
    workflow_run: { id: index + 1, head_sha: r.eventSource ?? r.source },
  }));
  return async (path) => {
    if (path === '/git/ref/heads/main') return { object: { sha: main } };
    if (path.startsWith('/actions/artifacts')) {
      const name = new URL('https://example.invalid' + path).searchParams.get('name');
      return { artifacts: name ? artifacts.filter((a) => a.name === name) : artifacts };
    }
    if (path.startsWith('/actions/runs/')) {
      const r = records[Number(path.split('/').at(-1)) - 1];
      return {
        head_sha: r.eventSource ?? r.source,
        head_branch: r.branch ?? 'main',
        status: 'completed',
        conclusion: r.conclusion ?? 'success',
        event: 'push',
        path: r.path ?? '.github/workflows/deploy-site-changes.yml',
      };
    }
    throw new Error(path);
  };
}
test('site update followed by workflow-only/prose commits is carried forward from last successful delivery', async (t) => {
  const h = historyFixture(t);
  const api = deliveryAPI(h.workflow, [{ source: h.baseline }]);
  const options = { pending: false, release: false, packageSource: h.baseline, bootstrap: false };
  assert.equal(
    (await planSiteDelivery(api, { ...options, source: h.site }, h.read)).eligible,
    true,
  );
  await assert.rejects(assertCurrent(api, h.site, h.read), /Superseded source/);
  const latest = await planSiteDelivery(api, { ...options, source: h.workflow }, h.read);
  assert.equal(latest.eligible, true);
  assert.equal(latest.base, h.baseline);
  assert.ok(latest.changed.includes('apps/web/src/page.mdx'));
  assert.equal(
    (await planSiteDelivery(api, { ...options, source: h.prose }, h.read)).eligible,
    true,
  );
  // Once an earlier run actually delivered the site update, a workflow-only or
  // prose successor has no outstanding site delta and final re-selection skips it.
  const delivered = deliveryAPI(h.workflow, [{ source: h.site }, { source: h.baseline }]);
  assert.equal(
    (await planSiteDelivery(delivered, { ...options, source: h.workflow }, h.read)).eligible,
    false,
  );
});
test('pending changesets and release commits without a matching publication hold catch-up', async (t) => {
  const h = historyFixture(t);
  const api = async () => {
    throw new Error('Must not inspect delivery or schedule a deployment');
  };
  for (const state of [
    { pending: true, release: false },
    { pending: false, release: true },
  ])
    assert.equal(
      (
        await planSiteDelivery(
          api,
          { source: h.pending, packageSource: h.baseline, bootstrap: false, ...state },
          h.read,
        )
      ).eligible,
      false,
    );
});
test('queued older event builds latest main; receipt binds actual source and ancestry rather than event SHA', async (t) => {
  const h = historyFixture(t);
  const api = deliveryAPI(h.workflow, [
    { source: h.workflow, eventSource: h.site },
    { source: h.baseline },
  ]);
  assert.equal(await latestDelivery(api, h.workflow, h.read), h.workflow);
  await assert.rejects(assertCurrent(api, h.workflow, h.read), /already deployed/);
  // A delayed publisher can select a newer validated release under its shared lock.
  const wrongRelease = deliveryAPI(h.workflow, [
    { source: h.workflow, eventSource: h.site, path: '.github/workflows/release.yml' },
  ]);
  assert.equal(await latestDelivery(wrongRelease, h.workflow, h.read), h.workflow);
});
test('latest delivery follows actual promotion order and ignores failed/expired/foreign receipts', async (t) => {
  const h = historyFixture(t);
  const api = deliveryAPI(h.prose, [
    { source: h.baseline, createdAt: '2026-01-01T00:00:00Z' },
    { source: h.workflow, createdAt: '2026-03-01T00:00:00Z' },
    { source: h.site, createdAt: '2026-02-01T00:00:00Z' },
  ]);
  assert.equal(await latestDelivery(api, h.prose, h.read), h.workflow);
  const invalid = deliveryAPI(h.prose, [
    { source: h.workflow, conclusion: 'failure' },
    { source: h.prose, expired: true },
    { source: h.site, branch: 'unreviewed' },
    { source: h.workflow, path: '.github/workflows/ci.yml' },
    { source: h.baseline },
  ]);
  assert.equal(await latestDelivery(invalid, h.prose, h.read), h.baseline);
});
test('publication advancement catches up identical app source; bootstrap/no-change fallback stays inert', async (t) => {
  const h = historyFixture(t);
  const options = {
    source: h.workflow,
    pending: false,
    release: false,
    packageSource: h.site,
    bootstrap: false,
  };
  const oldDelivery = deliveryAPI(h.workflow, [{ source: h.baseline }]);
  // Model a library-only publication after the deployed commit: no app delta is
  // needed once a verified package baseline is newer than the delivery receipt.
  const read = (...args) => (args[0] === 'diff' ? '.github/workflows/ci.yml' : h.read(...args));
  const next = await planSiteDelivery(oldDelivery, options, read);
  assert.equal(next.packageAdvanced, true);
  assert.equal(next.eligible, true);
  const noReceipts = deliveryAPI(h.workflow);
  assert.equal(
    (await planSiteDelivery(noReceipts, { ...options, packageSource: h.workflow }, h.read))
      .eligible,
    true,
  );
  assert.equal(
    (
      await planSiteDelivery(
        noReceipts,
        { ...options, packageSource: h.workflow, bootstrap: true },
        h.read,
      )
    ).eligible,
    false,
  );
});
test('source command binds checked-out main even when queued event SHA is older', (t) => {
  const h = historyFixture(t);
  const output = resolve(h.root, 'step-output');
  const envFile = resolve(h.root, 'step-env');
  execFileSync(process.execPath, [new URL('./site-auto.mjs', import.meta.url).pathname, 'source'], {
    cwd: h.root,
    env: {
      ...h.env,
      GITHUB_SHA: h.site,
      GITHUB_TOKEN: 'fixture',
      GITHUB_REPOSITORY: 'veli-design/veli',
      GITHUB_OUTPUT: output,
      GITHUB_ENV: envFile,
    },
  });
  assert.equal(readFileSync(output, 'utf8'), `source=${h.pending}\n`);
  assert.equal(readFileSync(envFile, 'utf8'), `SITE_SOURCE_COMMIT=${h.pending}\n`);
});

test('failed/no-op publication cannot authorize unpublished source; successful baseline permits later catch-up', async (t) => {
  const h = historyFixture(t);
  const importers = Object.fromEntries(
    ['.', 'packages/react', 'packages/tokens', 'packages/cli'].map((name) => [name, {}]),
  );
  h.commit('pnpm-lock.yaml', JSON.stringify({ importers, packages: {}, snapshots: {} }));
  for (const name of ['react', 'tokens', 'cli'])
    h.commit(`packages/${name}/package.json`, JSON.stringify({ version: '1.0.0' }));
  const base = h.git('rev-parse', 'HEAD');
  const publication = (commit, react) => ({
    sourceCommit: commit,
    sourceTree: h.git('rev-parse', `${commit}^{tree}`),
    packages: {
      '@veli-design/react': { version: react },
      '@veli-design/tokens': { version: '1.0.0' },
      '@veli-design/cli': { version: '1.0.0' },
    },
  });
  const old = publication(base, '1.0.0');
  const released = h.commit('packages/react/package.json', JSON.stringify({ version: '2.0.0' }));
  const next = h.commit('apps/web/src/page.mdx', 'post-release site');
  await assert.rejects(assertPublishedSource(old, next, h.read), /Unpublished package source/);
  await assertPublishedSource(publication(released, '2.0.0'), next, h.read);
});

test('a late queued event cannot lose the publication handoff: matching release record recovers sites only', async (t) => {
  const h = historyFixture(t);
  const api = deliveryAPI(h.workflow, [{ source: h.baseline }]);
  const options = { source: h.workflow, pending: false, release: true, bootstrap: false };
  assert.equal(
    (await planSiteDelivery(api, { ...options, packageSource: h.baseline }, h.read)).eligible,
    false,
  );
  assert.equal(
    (await planSiteDelivery(api, { ...options, packageSource: h.workflow }, h.read)).eligible,
    true,
  );
  const deployed = deliveryAPI(h.workflow, [
    { source: h.workflow, path: '.github/workflows/release.yml' },
  ]);
  assert.equal(
    (await planSiteDelivery(deployed, { ...options, packageSource: h.workflow }, h.read)).eligible,
    false,
  );
  // This path must retain full release evidence, while actual
  // registry identity/bytes remain checked before either Cloudflare step.
  const script = readFileSync(new URL('./site-auto.mjs', import.meta.url), 'utf8');
  assert.match(
    script,
    /publication.sourceCommit, source, 'Release has no matching publication record'/,
  );
  assert.match(script, /verifyCurrentPublication\(\{ \.\.\.process.env, GITHUB_SHA: source \}\)/);
});

test('merged fork contribution is accepted only with target-repository identity and a final-head maintainer review', async () => {
  const fork = { ...pr, head: { ...pr.head, repo: { full_name: 'contributor/veli' } } };
  const api = async (path) =>
    path.startsWith('/commits/')
      ? [fork]
      : path === `/pulls/${pr.number}`
        ? fork
        : apiFor([approved])(path);
  await verifyMergedSiteAuthorization(api, 'veli-design/veli', source);
  await assert.rejects(
    verifyMergedSiteAuthorization(
      async (path) => (path.startsWith('/commits/') ? [{ ...fork, merged_at: null }] : api(path)),
      'veli-design/veli',
      source,
    ),
    /merged into this repository/,
  );
  await assert.rejects(
    verifyMergedSiteAuthorization(
      async (path) =>
        path.startsWith('/commits/')
          ? [{ ...fork, base: { ref: 'main', repo: { full_name: 'wrong/repo' } } }]
          : api(path),
      'veli-design/veli',
      source,
    ),
    /merged into this repository/,
  );
});

test('ambiguous or missing receipt creation order fails closed', async (t) => {
  const h = historyFixture(t);
  const same = '2026-01-01T00:00:00Z';
  await assert.rejects(
    latestDelivery(
      deliveryAPI(h.site, [
        { source: h.site, createdAt: same },
        { source: h.baseline, createdAt: same },
      ]),
      h.site,
      h.read,
    ),
    /Ambiguous delivery order/,
  );
  await assert.rejects(
    latestDelivery(deliveryAPI(h.site, [{ source: h.site, createdAt: 'invalid' }]), h.site, h.read),
    /no trustworthy creation time/,
  );
});

test('release handoff receipt gets the built-in token after both deployments with read-only permissions', () => {
  const workflow = parse(
    readFileSync(new URL('../.github/workflows/deploy-release-sites.yml', import.meta.url), 'utf8'),
  );
  assert.deepEqual(workflow.permissions, { contents: 'read', packages: 'read', actions: 'read' });
  assert.equal(workflow.jobs.deploy.concurrency, 'veli-public-release-sites');
  const steps = workflow.jobs.deploy.steps;
  const receipt = steps.find((step) => step.name === 'Record successful paired deployment');
  assert.equal(receipt.env?.GITHUB_TOKEN, '${{ secrets.GITHUB_TOKEN }}');
  assert.equal(
    receipt.if,
    "${{ !inputs.verification-only && !inputs.bootstrap-tarballs && steps.current.outputs.ready == 'true' }}",
  );
  assert.ok(steps.indexOf(receipt) > steps.findIndex((step) => step.name === 'Deploy Storybook'));
  assert.ok(
    steps.indexOf(receipt) <
      steps.findIndex((step) => step.with?.name?.startsWith('site-deployed-')),
  );
});

test('actual receipt CLI token contract writes exact source; successful release receipt skips catch-up, absent/failed/mismatched receipts recover', async (t) => {
  const h = historyFixture(t);
  h.git('checkout', '--detach', h.site);
  const script = fileURLToPath(new URL('./site-auto.mjs', import.meta.url));
  const output = resolve(h.root, 'receipt');
  const env = {
    ...h.env,
    GITHUB_SHA: h.site,
    SITE_SOURCE_COMMIT: h.site,
    GITHUB_REPOSITORY: 'tradenetcorp/veli',
    GITHUB_TOKEN: '',
  };
  const run = (overrides = {}, target = output) =>
    spawnSync(process.execPath, [script, 'receipt', target], {
      cwd: h.root,
      env: { ...env, ...overrides },
      encoding: 'utf8',
    });
  const missing = run();
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /GITHUB_TOKEN is required/);
  const written = run({ GITHUB_TOKEN: 'fixture-not-a-credential' });
  assert.equal(written.status, 0, written.stderr);
  assert.equal(readFileSync(resolve(output, 'source.txt'), 'utf8'), h.site + '\n');
  const mismatch = run(
    { GITHUB_TOKEN: 'fixture-not-a-credential', SITE_SOURCE_COMMIT: h.workflow },
    resolve(h.root, 'wrong-receipt'),
  );
  assert.notEqual(mismatch.status, 0);
  const options = {
    source: h.site,
    pending: false,
    release: true,
    packageSource: h.site,
    bootstrap: false,
  };
  const record = { source: h.site, path: '.github/workflows/release.yml' };
  const success = deliveryAPI(h.site, [record]);
  assert.equal((await planSiteDelivery(success, options, h.read)).eligible, false);
  for (const records of [
    [],
    [{ ...record, conclusion: 'failure' }],
    [{ ...record, eventSource: h.workflow }],
  ])
    assert.equal(
      (await planSiteDelivery(deliveryAPI(h.site, records), options, h.read)).eligible,
      true,
    );
});
