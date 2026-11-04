// Main-only site delivery. No publication permissions or workflow input approvals.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubAPI, mergedRelease } from './release-ci.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const paths = (base, head) =>
  git('diff', '--name-only', '--no-renames', base, head).split('\n').filter(Boolean);
export const sitePaths = (files) =>
  files.some((p) => /^(apps\/(web|storybook)|packages\/blocks)\//.test(p));
export const packagePaths = (files) =>
  files.some((p) =>
    /^(packages\/(react|tokens|cli)\/|scripts\/(build|publish|version|prepare-consumer)|(?:turbo|package)\.json$|pnpm-workspace\.yaml$)/.test(
      p,
    ),
  );
export function eligible({ pending, release, changed, unpublished }) {
  return !pending && !release && sitePaths(changed) && !packagePaths(unpublished);
}
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
export async function alreadyDelivered(api, source) {
  const artifacts = await pages(
    api,
    `/actions/artifacts?name=site-deployed-${source}`,
    'artifacts',
  );
  for (const artifact of artifacts) {
    if (artifact.expired || artifact.workflow_run?.head_sha !== source) continue;
    const run = await api(`/actions/runs/${artifact.workflow_run.id}`);
    if (
      run.status === 'completed' &&
      run.conclusion === 'success' &&
      ['.github/workflows/release.yml', '.github/workflows/deploy-site-changes.yml'].includes(
        run.path,
      ) &&
      ['push', 'workflow_run', 'workflow_dispatch'].includes(run.event)
    )
      return true;
  }
  return false;
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
  assert.equal(await alreadyDelivered(api, source), false, 'This source was already deployed');
}
export async function verifyMergedSiteReview(api, repository, source) {
  const prs = await pages(api, `/commits/${source}/pulls`);
  const pr = prs.find(
    (p) =>
      p.merged_at &&
      p.merge_commit_sha === source &&
      p.base?.ref === 'main' &&
      p.head?.repo?.full_name === repository,
  );
  assert.ok(pr, 'Automatic site delivery requires a merged same-repository PR');
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
export async function selectBaseline(api) {
  const releases = (await pages(api, '/releases')).filter(
    (r) =>
      !r.draft &&
      !r.prerelease &&
      r.assets.some((a) => a.name === 'publication.json') &&
      r.assets.some((a) => a.name === 'release-manifest.json'),
  );
  releases.sort((a, b) => b.published_at.localeCompare(a.published_at));
  if (!releases.length) return 'bootstrap-2026-11-01';
  assert.match(releases[0].tag_name, /^[A-Za-z0-9@_][A-Za-z0-9@._/-]*$/);
  return releases[0].tag_name;
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
export async function assertPublishedSource(publication, source) {
  const { parse } = await import('yaml');
  const before = parse(git('show', `${publication.sourceCommit}:pnpm-lock.yaml`));
  const after = parse(git('show', `${source}:pnpm-lock.yaml`));
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
  git('merge-base', '--is-ancestor', publication.sourceCommit, source);
  assert.equal(
    git('rev-parse', `${publication.sourceCommit}^{tree}`),
    publication.sourceTree,
    'Publication source tree mismatch',
  );
  assert.equal(
    packagePaths(paths(publication.sourceCommit, source)),
    false,
    'Unpublished package source or build changes must wait for publication',
  );
  for (const [name, item] of Object.entries(publication.packages)) {
    const directory = name.split('/')[1];
    const current = JSON.parse(git('show', `${source}:packages/${directory}/package.json`));
    assert.equal(current.version, item.version, `${name}: source requires an unpublished version`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, target] = process.argv.slice(2);
  const api = githubAPI();
  const source = process.env.GITHUB_SHA;
  assert.match(source, /^[a-f0-9]{40}$/);
  assert.equal(git('rev-parse', 'HEAD'), source);
  if (command === 'plan') {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH));
    const before =
      process.env.GITHUB_EVENT_NAME === 'push' ? event.before : event.workflow_run?.head_sha;
    assert.match(before, /^[a-f0-9]{40}$/);
    const release = await mergedRelease(api, process.env.GITHUB_REPOSITORY, source);
    const ready = eligible({
      pending: pendingChangesets(),
      release: Boolean(release),
      changed: paths(before, source),
      unpublished: [],
    });
    appendFileSync(process.env.GITHUB_OUTPUT, `eligible=${ready}\n`);
    if (ready) appendFileSync(process.env.GITHUB_OUTPUT, `baseline=${await selectBaseline(api)}\n`);
  } else if (command === 'verify') {
    assert.equal(pendingChangesets(), false, 'A Changeset release is pending');
    // Never use ordinary delivery to recover a failed/no-op release publication.
    assert.equal(await mergedRelease(api, process.env.GITHUB_REPOSITORY, source), null);
    await assertPublishedSource(JSON.parse(readFileSync(target)), source);
    await verifyMergedSiteReview(api, process.env.GITHUB_REPOSITORY, source);
  } else if (command === 'guard') {
    await assertCurrent(api, source);
  } else if (command === 'gate') {
    // Superseded and already delivered are intentional skips, never a request to
    // retry publication. Unexpected API/network failures remain failures.
    try {
      await assertCurrent(api, source);
      appendFileSync(process.env.GITHUB_OUTPUT, 'ready=true\n');
    } catch (error) {
      if (!/Superseded source:|already deployed/.test(error.message)) throw error;
      console.log(error.message);
      appendFileSync(process.env.GITHUB_OUTPUT, 'ready=false\n');
    }
  } else if (command === 'receipt') {
    mkdirSync(target, { recursive: true });
    appendFileSync(resolve(target, 'source.txt'), `${source}\n`);
  } else throw new Error('Expected plan, verify, gate, guard or receipt');
}
