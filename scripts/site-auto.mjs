// Main-only site delivery. No publication permissions or workflow input approvals.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubAPI, mergedRelease, verifyCurrentPublication } from './release-ci.mjs';
import { newestPublicationRelease } from './release-order.mjs';
import {
  recoveryReceipt,
  validateRecoveryReceipt,
  readRecoveryReceipt,
} from './site-recovery-receipt.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
export const sitePaths = (files) =>
  files.some((p) => /^(apps\/(web|storybook)|packages\/blocks)\//.test(p));
export const packagePaths = (files) =>
  files.some((p) =>
    /^(packages\/(react|tokens|cli)\/|scripts\/(build|publish|version|prepare-consumer)|(?:turbo|package)\.json$|pnpm-workspace\.yaml$)/.test(
      p,
    ),
  );
export function pendingChangesets() {
  return readdirSync('.changeset').some((name) => name.endsWith('.md') && name !== 'README.md');
}
async function pages(api, path, key) {
  const result = [];
  for (let page = 1; page <= 20; page++) {
    const body = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    const items = key ? body[key] : body;
    result.push(...items);
    if (items.length < 100) return result;
  }
  throw new Error('Incomplete site-delivery evidence');
}
async function deliveryAnchor(
  api,
  artifact,
  source,
  readGit = git,
  readReceipt = readRecoveryReceipt,
) {
  if (artifact.expired || !/^[a-f0-9]{40}$/.test(artifact.workflow_run?.head_sha ?? ''))
    return false;
  const run = await api(`/actions/runs/${artifact.workflow_run.id}`);
  if (
    run.head_branch !== 'main' ||
    run.head_sha !== artifact.workflow_run.head_sha ||
    ![
      '.github/workflows/release.yml',
      '.github/workflows/deploy-site-changes.yml',
      '.github/workflows/deploy-site-snapshot.yml',
    ].includes(run.path) ||
    !['push', 'workflow_run', 'workflow_dispatch'].includes(run.event)
  )
    return false;
  if (run.path === '.github/workflows/deploy-site-snapshot.yml') {
    assert.equal(run.event, 'workflow_dispatch');
    const receipt = await readReceipt(api, artifact);
    const attempt =
      receipt.attempt === run.run_attempt
        ? run
        : await api(`/actions/runs/${run.id}/attempts/${receipt.attempt}`);
    if (attempt.status !== 'completed' || attempt.conclusion !== 'success') return false;
    const namedAttempt = /-recovery-([1-9][0-9]*)$/.exec(artifact.name)?.[1];
    if (namedAttempt) assert.equal(Number(namedAttempt), receipt.attempt);
    return validateRecoveryReceipt(receipt, source, attempt, readGit);
  }
  if (run.status !== 'completed' || run.conclusion !== 'success') return false;
  // Ordinary delivery resolves current main AFTER acquiring the lock. The event
  // commit can be older than the actual built/deployed source named by its receipt.
  if (run.head_sha !== source) {
    try {
      readGit('merge-base', '--is-ancestor', run.head_sha, source);
    } catch (error) {
      if (error.status === 1) return false;
      throw error;
    }
  }
  return source;
}
export async function alreadyDelivered(
  api,
  source,
  readGit = git,
  readReceipt = readRecoveryReceipt,
) {
  const latest = await latestDelivery(api, source, readGit, readReceipt);
  if (!latest) return false;
  // Only the latest actual promotion counts. A historical success for this SHA
  // cannot mask a later rollback/recovery to older bytes.
  try {
    readGit('merge-base', '--is-ancestor', source, latest);
    return true;
  } catch (error) {
    if (error.status === 1) return false;
    throw error;
  }
}
export async function latestDelivery(
  api,
  source,
  readGit = git,
  readReceipt = readRecoveryReceipt,
) {
  const artifacts = await pages(api, '/actions/artifacts', 'artifacts');
  const successful = [];
  for (const artifact of artifacts) {
    const commit = /^site-deployed-([a-f0-9]{40})(?:-recovery-[1-9][0-9]*)?$/.exec(
      artifact.name ?? '',
    )?.[1];
    if (!commit) continue;
    const deployed = await deliveryAnchor(api, artifact, commit, readGit, readReceipt);
    if (!deployed) continue;
    try {
      readGit('merge-base', '--is-ancestor', deployed, source);
    } catch (error) {
      if (error.status === 1) continue;
      throw error;
    }
    const time = Date.parse(artifact.created_at);
    assert.ok(Number.isFinite(time), 'Delivery receipt has no trustworthy creation time');
    successful.push({ source: deployed, time });
  }
  // Receipts are uploaded after both deployments under the same non-cancelling
  // lock. Use completed promotion order, not the greatest historical main SHA:
  // the most recent promotion may intentionally have restored an older source.
  successful.sort((a, b) => b.time - a.time);
  if (!successful.length) return null;
  assert.ok(
    successful
      .filter((item) => item.time === successful[0].time)
      .every((item) => item.source === successful[0].source),
    'Ambiguous delivery order; refusing to infer which source is live',
  );
  return successful[0].source;
}
export async function planSiteDelivery(
  api,
  { source, pending, release, packageSource, bootstrap },
  readGit = git,
  readReceipt = readRecoveryReceipt,
) {
  if (pending) return { eligible: false, reason: 'Pending Changesets' };
  if (release && packageSource !== source)
    return { eligible: false, reason: 'Release has no matching publication record' };
  assert.match(packageSource, /^[a-f0-9]{40}$/);
  readGit('merge-base', '--is-ancestor', packageSource, source);
  const delivered = await latestDelivery(api, source, readGit, readReceipt);
  const base = delivered ?? packageSource;
  const changed = readGit('diff', '--name-only', '--no-renames', base, source)
    .split('\n')
    .filter(Boolean);
  // A new publication can change the rendered library even with identical app
  // source. Without a recurring receipt, only bootstrap is assumed previously live.
  const packageAdvanced = delivered
    ? readGit('merge-base', packageSource, delivered) !== packageSource
    : !bootstrap;
  return {
    eligible: sitePaths(changed) || packageAdvanced,
    delivered,
    base,
    changed,
    packageAdvanced,
  };
}
async function baselineSource(tag, repository) {
  if (tag === 'bootstrap-2026-11-01')
    return JSON.parse(readFileSync('releases/npm-bootstrap-2026-11-01.json')).sourceCommit;
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-site-baseline-'));
  try {
    execFileSync(
      'gh',
      [
        'release',
        'download',
        tag,
        '--repo',
        repository,
        '--pattern',
        'publication.json',
        '--dir',
        directory,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return JSON.parse(readFileSync(resolve(directory, 'publication.json'))).sourceCommit;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
export async function assertCurrent(api, source, readGit = git) {
  const main = await api('/git/ref/heads/main');
  if (main.object.sha !== source) {
    // A prose-only successor may not start another deployment. It is safe to
    // finish this source only if no executable/site/package/release input moved.
    readGit('fetch', '--no-tags', 'origin', main.object.sha);
    readGit('merge-base', '--is-ancestor', source, main.object.sha);
    const changed = readGit('diff', '--name-only', '--no-renames', source, main.object.sha)
      .split('\n')
      .filter(Boolean);
    assert.ok(
      changed.every((p) =>
        /^(docs\/.*\.md|(?:README|CONTRIBUTING|AGENTS|CODE_OF_CONDUCT|SECURITY|LICENSE)(?:\.md)?)$/.test(
          p,
        ),
      ),
      'Superseded source: newer main requires fresh site/release validation',
    );
  }
  assert.equal(
    await alreadyDelivered(api, source, readGit),
    false,
    'This source was already deployed',
  );
}
export async function verifyMergedSiteReview(api, repository, source) {
  const prs = await pages(api, `/commits/${source}/pulls`);
  const pr = prs.find(
    (p) =>
      p.merged_at &&
      p.merge_commit_sha === source &&
      p.base?.ref === 'main' &&
      p.base?.repo?.full_name === repository,
  );
  assert.ok(pr, 'Automatic site delivery requires a PR merged into this repository');
  const reviews = await pages(api, `/pulls/${pr.number}/reviews`);
  const latest = new Map();
  for (const r of reviews)
    if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(r.state))
      latest.set(r.user?.login, r);
  for (const r of latest.values()) {
    if (r.state !== 'APPROVED' || r.commit_id !== pr.head.sha || r.user?.type !== 'User') continue;
    const permission = await api(`/collaborators/${encodeURIComponent(r.user.login)}/permission`);
    if (['write', 'maintain', 'admin'].includes(permission.permission)) return;
  }
  throw new Error('A pre-merge human approval of the final PR head is required');
}
export async function selectBaseline(api, source = git('rev-parse', 'HEAD'), readGit = git) {
  const releases = (await pages(api, '/releases')).filter(
    (r) =>
      !r.draft &&
      !r.prerelease &&
      r.assets.some((a) => a.name === 'publication.json') &&
      r.assets.some((a) => a.name === 'release-manifest.json'),
  );
  if (!releases.length) return 'bootstrap-2026-11-01';
  return (await newestPublicationRelease(api, releases, source, readGit)).tag_name;
}
export function packageLockClosure(lock) {
  const result = {};
  const visit = (name, version) => {
    if (version.startsWith('link:')) return;
    assert.ok(!/^(file:|https?:|git)/.test(version), 'Non-registry package build dependency');
    const key = `${name}@${version}`;
    if (Object.hasOwn(result, key)) return;
    const snapshot = lock.snapshots?.[key];
    const metadata = lock.packages?.[key.split('(')[0]];
    assert.ok(snapshot && metadata, `Missing locked build dependency: ${key}`);
    result[key] = { snapshot, metadata };
    for (const section of ['dependencies', 'optionalDependencies'])
      for (const [child, resolved] of Object.entries(snapshot[section] ?? {}))
        visit(child, resolved);
  };
  for (const directory of ['.', 'packages/react', 'packages/tokens', 'packages/cli']) {
    const importer = lock.importers[directory];
    assert.ok(importer, `Missing package build importer ${directory}`);
    result[directory] = importer;
    for (const section of ['dependencies', 'devDependencies', 'optionalDependencies'])
      for (const [name, dependency] of Object.entries(importer[section] ?? {}))
        visit(name, dependency.version);
  }
  return result;
}
export async function assertPublishedSource(publication, source, readGit = git) {
  const { parse } = await import('yaml');
  const before = parse(readGit('show', `${publication.sourceCommit}:pnpm-lock.yaml`));
  const after = parse(readGit('show', `${source}:pnpm-lock.yaml`));
  for (const name of ['react', 'tokens', 'cli'])
    assert.deepEqual(
      after.importers[`packages/${name}`],
      before.importers[`packages/${name}`],
      'Unpublished package dependency changes',
    );
  assert.deepEqual(after.catalogs, before.catalogs, 'Shared package catalog changed');
  assert.deepEqual(
    packageLockClosure(after),
    packageLockClosure(before),
    'Unpublished package build dependency closure changed',
  );
  readGit('merge-base', '--is-ancestor', publication.sourceCommit, source);
  assert.equal(
    readGit('rev-parse', `${publication.sourceCommit}^{tree}`),
    publication.sourceTree,
    'Publication source tree mismatch',
  );
  assert.equal(
    packagePaths(
      readGit('diff', '--name-only', '--no-renames', publication.sourceCommit, source)
        .split('\n')
        .filter(Boolean),
    ),
    false,
    'Unpublished package source or build changes must wait for publication',
  );
  for (const [name, item] of Object.entries(publication.packages)) {
    const directory = name.split('/')[1];
    const current = JSON.parse(readGit('show', `${source}:packages/${directory}/package.json`));
    assert.equal(current.version, item.version, `${name}: source requires an unpublished version`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, target] = process.argv.slice(2);
  const api = githubAPI();
  const source =
    command === 'source'
      ? git('rev-parse', 'HEAD')
      : process.env.SITE_SOURCE_COMMIT || process.env.GITHUB_SHA;
  assert.match(source, /^[a-f0-9]{40}$/);
  assert.equal(git('rev-parse', 'HEAD'), source);
  if (command === 'source') {
    appendFileSync(process.env.GITHUB_ENV, `SITE_SOURCE_COMMIT=${source}\n`);
    appendFileSync(process.env.GITHUB_OUTPUT, `source=${source}\n`);
  } else if (command === 'plan') {
    const pending = pendingChangesets();
    const release = await mergedRelease(api, process.env.GITHUB_REPOSITORY, source);
    let selected = { eligible: false };
    if (!pending) {
      const baseline = await selectBaseline(api);
      selected = await planSiteDelivery(api, {
        source,
        pending,
        release: Boolean(release),
        packageSource: await baselineSource(baseline, process.env.GITHUB_REPOSITORY),
        bootstrap: baseline === 'bootstrap-2026-11-01',
      });
      appendFileSync(process.env.GITHUB_OUTPUT, `baseline=${baseline}\n`);
    }
    console.log(JSON.stringify({ source, pending, release: Boolean(release), ...selected }));
    appendFileSync(process.env.GITHUB_OUTPUT, `eligible=${selected.eligible}\n`);
  } else if (command === 'verify') {
    assert.equal(pendingChangesets(), false, 'A Changeset release is pending');
    const publication = JSON.parse(readFileSync(target));
    await assertPublishedSource(publication, source);
    const release = await mergedRelease(api, process.env.GITHUB_REPOSITORY, source);
    if (release) {
      // An older queued site event can displace the release handoff. Recover
      // sites ONLY from a publication record for this exact release; re-check
      // the original full CI and release-specific visual approval. Never publish.
      assert.equal(publication.sourceCommit, source, 'Release has no matching publication record');
      await verifyCurrentPublication({ ...process.env, GITHUB_SHA: source });
    } else await verifyMergedSiteReview(api, process.env.GITHUB_REPOSITORY, source);
  } else if (command === 'guard') {
    await assertCurrent(api, source);
  } else if (command === 'gate') {
    // Superseded and already delivered are intentional skips, never a request to
    // retry publication. Unexpected API/network failures remain failures.
    try {
      await assertCurrent(api, source);
      let ready = true;
      if (target) {
        const publication = JSON.parse(readFileSync(target));
        const selected = await planSiteDelivery(api, {
          source,
          pending: pendingChangesets(),
          release: Boolean(await mergedRelease(api, process.env.GITHUB_REPOSITORY, source)),
          packageSource: publication.sourceCommit,
          bootstrap: process.env.PACKAGE_RELEASE_TAG === 'bootstrap-2026-11-01',
        });
        ready = selected.eligible;
        console.log(JSON.stringify(selected));
      }
      appendFileSync(process.env.GITHUB_OUTPUT, `ready=${ready}\n`);
    } catch (error) {
      if (!/Superseded source:|already deployed/.test(error.message)) throw error;
      console.log(error.message);
      appendFileSync(process.env.GITHUB_OUTPUT, 'ready=false\n');
    }
  } else if (command === 'prepare-recovery-receipt') {
    const { verifySiteBundle } = await import('./site-release.mjs');
    const snapshot = await verifySiteBundle(target, process.argv[4]);
    assert.equal(snapshot.plan.siteRelease.mode, 'published');
    assert.ok(snapshot.plan.siteRelease.publication);
    const value = recoveryReceipt({
      source: snapshot.plan.sourceCommit,
      controller: git('rev-parse', 'HEAD'),
      run: process.env.GITHUB_RUN_ID,
      attempt: process.env.GITHUB_RUN_ATTEMPT,
      producer: process.env.SNAPSHOT_RUN_ID,
      digest: process.argv[4],
      review: process.env.REVIEW_COMMENT_ID,
    });
    validateRecoveryReceipt(
      value,
      value.sourceCommit,
      {
        id: Number(process.env.GITHUB_RUN_ID),
        run_attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
        head_sha: process.env.GITHUB_SHA,
      },
      git,
    );
    mkdirSync(process.argv[5], { recursive: true });
    writeFileSync(resolve(process.argv[5], 'delivery.json'), JSON.stringify(value, null, 2) + '\n');
    appendFileSync(process.env.GITHUB_OUTPUT, `source-commit=${value.sourceCommit}\n`);
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `Recovery deploys source ${value.sourceCommit}. It does not acknowledge or suppress newer main work. An intentional rollback hold requires separate authorization and coordination of automatic delivery.\n`,
    );
  } else if (command === 'receipt') {
    mkdirSync(target, { recursive: true });
    appendFileSync(resolve(target, 'source.txt'), `${source}\n`);
  } else throw new Error('Expected source, plan, verify, gate, guard or receipt');
}
