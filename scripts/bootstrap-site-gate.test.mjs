import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { assertBootstrapActive } from './bootstrap-site-gate.mjs';
const source = 'a'.repeat(40);
const api =
  (releases = [], artifacts = []) =>
  async (path) =>
    path.startsWith('/releases') ? releases : { artifacts };
test('bootstrap may deploy only before recurring publication or site evidence exists', async () => {
  await assertBootstrapActive(api());
  await assertBootstrapActive(api([{ assets: [{ name: 'unrelated.txt' }] }]));
  for (const release of [
    { assets: [{ name: 'publication.json' }] },
    { draft: true, prerelease: true, assets: [{ name: 'publication.json' }] },
  ])
    await assert.rejects(assertBootstrapActive(api([release])), /Bootstrap deployment retired/);
  for (const expired of [false, true])
    for (const suffix of ['', '-recovery-1'])
      await assert.rejects(
        assertBootstrapActive(api([], [{ name: `site-deployed-${source}${suffix}`, expired }])),
        /Bootstrap deployment retired/,
      );
});
test('a delayed bootstrap rechecks retirement under the deployment lock', async () => {
  let published = false;
  const live = async (path) =>
    api(published ? [{ assets: [{ name: 'publication.json' }] }] : [])(path);
  await assertBootstrapActive(live);
  published = true;
  await assert.rejects(assertBootstrapActive(live), /Bootstrap deployment retired/);
});
test('retirement checks all pages and fails closed on unavailable or incomplete evidence', async () => {
  await assert.rejects(
    assertBootstrapActive(async () => {
      throw new Error('HTTP 403');
    }),
    /HTTP 403/,
  );
  await assert.rejects(
    assertBootstrapActive(async () => ({})),
    /Incomplete/,
  );
  await assert.rejects(
    assertBootstrapActive(async () => Array(100).fill({ assets: [] })),
    /Incomplete/,
  );
  await assert.rejects(
    assertBootstrapActive(async (path) =>
      path.startsWith('/releases')
        ? path.endsWith('page=1')
          ? Array(100).fill({ assets: [] })
          : [{ assets: [{ name: 'publication.json' }] }]
        : { artifacts: [] },
    ),
    /retired/,
  );
});
test('reusable bootstrap guard runs from trusted controller immediately before deployments', () => {
  const workflow = parse(
    readFileSync(new URL('../.github/workflows/deploy-release-sites.yml', import.meta.url), 'utf8'),
  );
  const job = workflow.jobs.deploy;
  assert.equal(job.concurrency, 'veli-public-release-sites');
  const steps = job.steps;
  assert.equal(steps[0].with.ref, '${{ github.workflow_sha }}');
  assert.equal(steps[1].if, 'inputs.bootstrap-tarballs');
  assert.match(steps[1].run, /cp scripts\/bootstrap-site-gate.mjs/);
  const index = steps.findIndex(
    (s) => s.name === 'Reject retired bootstrap immediately before deployment',
  );
  assert.equal(steps[index].if, '${{ !inputs.verification-only && inputs.bootstrap-tarballs }}');
  assert.match(steps[index].run, /RUNNER_TEMP\/bootstrap-site-gate.mjs/);
  assert.equal(steps[index + 1].name, 'Deploy web docs');
  assert.equal(steps[index + 2].name, 'Deploy Storybook');
  assert.ok(!/publish|id-token/.test(steps[index].run));
});
