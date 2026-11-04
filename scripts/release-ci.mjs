import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha = /^[a-f0-9]{40}$/;
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

// Native workflow approval applies to GITHUB_TOKEN events from the bot. Do not
// identify this privileged coverage boundary by a user-editable PR title/label.
export function isReleasePR(pr, repository) {
  return Boolean(
    repository &&
    pr?.user?.login === 'github-actions[bot]' &&
    pr.head?.repo?.full_name === repository &&
    pr.base?.repo?.full_name === repository &&
    pr.head?.ref === 'changeset-release/main' &&
    pr.base?.ref === 'main',
  );
}

export function approvedReleaseEvent(event, repository, actor) {
  return isReleasePR(event.pull_request, repository) && actor === 'github-actions[bot]';
}

export function requireReleaseChecks(jobs) {
  // Evidence issuance is stricter than the ordinary selective PR aggregate.
  // A future selector regression must not turn an omitted release suite green.
  for (const name of [
    'build',
    'changes',
    'candidate',
    'next-15',
    'next-16',
    'block-browser',
    'packaged-sites',
    'cold-reload',
  ])
    assert.equal(jobs[name]?.result, 'success', `Release check ${name} must succeed`);
  for (const name of ['release', 'candidate', 'next', 'blocks', 'sites', 'cold'])
    assert.equal(jobs.changes.outputs?.[name], 'true', `Release selection ${name} must be enabled`);
}

export function validationEvidence(event, env, candidate) {
  const pr = event.pull_request;
  assert.ok(approvedReleaseEvent(event, env.GITHUB_REPOSITORY, env.GITHUB_ACTOR));
  assert.equal(env.GITHUB_EVENT_NAME, 'pull_request');
  assert.equal(candidate.parents.length, 2, 'Validate the synthetic merge candidate');
  assert.equal(candidate.parents[1], pr.head.sha, 'Candidate must contain the event head');
  for (const value of [candidate.commit, candidate.tree, ...candidate.parents])
    assert.match(value, sha);
  return {
    schema: 1,
    repository: env.GITHUB_REPOSITORY,
    pr: pr.number,
    head: pr.head.sha,
    base: candidate.parents[0],
    candidate: candidate.commit,
    tree: candidate.tree,
    run: Number(env.GITHUB_RUN_ID),
    attempt: Number(env.GITHUB_RUN_ATTEMPT),
  };
}

export function verifyEvidence(evidence, { repository, pr, commit, run, workflowId, candidate }) {
  assert.ok(isReleasePR(pr, repository), 'Not the authenticated Changesets release PR');
  assert.equal(pr.merged, true);
  assert.equal(pr.merge_commit_sha, commit.sha, 'Release must be the actual merged commit');
  assert.equal(run.event, 'pull_request');
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'success');
  assert.equal(run.workflow_id, workflowId);
  assert.equal(run.path, '.github/workflows/ci.yml');
  assert.equal(run.head_repository?.full_name, repository);
  assert.equal(run.head_branch, 'changeset-release/main');
  assert.equal(run.actor?.login, 'github-actions[bot]');
  assert.equal(run.head_sha, pr.head.sha);
  assert.deepEqual(
    evidence,
    {
      schema: 1,
      repository,
      pr: pr.number,
      head: pr.head.sha,
      base: commit.parents[0]?.sha,
      candidate: candidate.sha,
      tree: commit.tree.sha,
      run: run.id,
      attempt: run.run_attempt,
    },
    'Validation does not match this merged tree, base, head, run and attempt',
  );
  assert.equal(candidate.tree.sha, commit.tree.sha);
  assert.deepEqual(
    candidate.parents.map((parent) => parent.sha),
    [evidence.base, evidence.head],
  );
  return true;
}

export function githubAPI(env = process.env) {
  assert.ok(env.GITHUB_TOKEN, 'GITHUB_TOKEN is required for release validation');
  const root = `https://api.github.com/repos/${env.GITHUB_REPOSITORY}`;
  return async (path, binary = false) => {
    const response = await fetch(`${root}${path}`, {
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    assert.ok(response.ok, `GitHub ${path}: HTTP ${response.status}`);
    return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
  };
}

async function pages(api, path, key) {
  const result = [];
  for (let page = 1; page <= 20; page++) {
    const body = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    const items = key ? body[key] : body;
    assert.ok(Array.isArray(items));
    result.push(...items);
    if (items.length < 100) return result;
  }
  throw new Error('Pagination limit reached; refusing incomplete release evidence');
}

export async function mergedRelease(api, repository, commit) {
  const associated = await pages(api, `/commits/${commit}/pulls`);
  const releases = associated.filter(
    (pr) => isReleasePR(pr, repository) && pr.merged_at && pr.merge_commit_sha === commit,
  );
  assert.ok(releases.length <= 1, 'Ambiguous merged release PR');
  return releases.length ? api(`/pulls/${releases[0].number}`) : null;
}

export async function releaseMode(pending, api, env) {
  if (pending) return 'none';
  return (await mergedRelease(api, env.GITHUB_REPOSITORY, env.GITHUB_SHA)) ? 'publish' : 'none';
}

export async function verifyVisualApproval(api, pr) {
  const reviews = await pages(api, `/pulls/${pr.number}/reviews`);
  const latest = new Map();
  for (const review of reviews) {
    // A comment does not revoke an existing approval; decisive later reviews do.
    if (['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(review.state))
      latest.set(review.user?.login, review);
  }
  for (const review of latest.values()) {
    if (
      review.user?.type !== 'User' ||
      review.state !== 'APPROVED' ||
      review.commit_id !== pr.head.sha ||
      !(review.body ?? '').split(/\r?\n/).some((line) => line.trim() === 'Visual review approved.')
    )
      continue;
    const permission = await api(
      `/collaborators/${encodeURIComponent(review.user.login)}/permission`,
    );
    if (['admin', 'maintain', 'write'].includes(permission.permission)) return;
  }
  throw new Error(
    'Publication requires a human write-access review of the final release head containing: Visual review approved.',
  );
}

// The comment ID locates evidence; its input value is never approval by itself.
export async function verifySiteReview(
  api,
  { repository, sourceCommit, snapshotSha256, commentId },
) {
  assert.match(sourceCommit, sha);
  assert.match(snapshotSha256, /^[a-f0-9]{64}$/);
  assert.match(commentId ?? '', /^[1-9][0-9]*$/);
  const comment = await api(`/issues/comments/${commentId}`);
  assert.equal(comment.user?.type, 'User', 'A human must approve the site snapshot');
  const issue = new URL(comment.issue_url);
  assert.equal(issue.origin, 'https://api.github.com');
  const prefix = `/repos/${repository}/issues/`;
  assert.ok(issue.pathname.startsWith(prefix));
  assert.match(issue.pathname.slice(prefix.length), /^[1-9][0-9]*$/);
  const lines = (comment.body ?? '').split(/\r?\n/).map((line) => line.trim());
  for (const line of [
    'Site visual review approved.',
    `Source: ${sourceCommit}`,
    `Snapshot: ${snapshotSha256}`,
  ])
    assert.ok(
      lines.includes(line),
      'Human review must identify the exact source and snapshot digest',
    );
  const access = await api(`/collaborators/${encodeURIComponent(comment.user.login)}/permission`);
  assert.ok(
    ['admin', 'maintain', 'write'].includes(access.permission),
    'Site reviewer needs write access',
  );
}

// This runs before installing dependencies or invoking any publication command.
// Evidence is JSON data, never an executable artifact or build-output cache.
export async function verifyPublication(api, env, readEvidence) {
  const commit = await api(`/git/commits/${env.GITHUB_SHA}`);
  assert.equal(git('rev-parse', 'HEAD'), env.GITHUB_SHA);
  assert.equal(git('rev-parse', 'HEAD^{tree}'), commit.tree.sha);
  const pr = await mergedRelease(api, env.GITHUB_REPOSITORY, env.GITHUB_SHA);
  assert.ok(pr, 'Publication requires a merged Changesets release PR');
  const workflow = await api('/actions/workflows/ci.yml');
  const runs = await pages(
    api,
    `/actions/workflows/${workflow.id}/runs?event=pull_request&head_sha=${pr.head.sha}&status=success`,
    'workflow_runs',
  );
  for (const run of runs) {
    const artifacts = await pages(api, `/actions/runs/${run.id}/artifacts`, 'artifacts');
    const artifact = artifacts.find(
      (item) => item.name === `release-validation-${run.run_attempt}` && !item.expired,
    );
    if (!artifact) continue;
    // A mismatched older successful candidate may coexist with the current one.
    const evidence = await readEvidence(artifact);
    if (evidence.tree !== commit.tree.sha || evidence.base !== commit.parents[0]?.sha) continue;
    assert.match(evidence.candidate, sha);
    const candidate = await api(`/git/commits/${evidence.candidate}`);
    verifyEvidence(evidence, {
      repository: env.GITHUB_REPOSITORY,
      pr,
      commit,
      run,
      workflowId: workflow.id,
      candidate,
    });
    await verifyVisualApproval(api, pr);
    console.log(
      `Release PR #${pr.number}: validated tree ${commit.tree.sha} in run ${run.id}, attempt ${run.run_attempt}`,
    );
    return;
  }
  throw new Error(
    'No successful approved release validation matches the merged tree and base. Publication blocked.',
  );
}

async function readArtifact(api, artifact) {
  assert.ok(artifact.size_in_bytes < 1024 * 1024, 'Unexpected release evidence size');
  const directory = mkdtempSync(join(tmpdir(), 'veli-release-evidence-'));
  try {
    const archive = join(directory, 'evidence.zip');
    writeFileSync(archive, await api(`/actions/artifacts/${artifact.id}/zip`, true));
    return JSON.parse(
      execFileSync('unzip', ['-p', archive, 'release-validation.json'], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024,
      }),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export async function verifyCurrentPublication() {
  const api = githubAPI();
  await verifyPublication(api, process.env, (artifact) => readArtifact(api, artifact));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, target] = process.argv.slice(2);
  if (command === 'stamp') {
    requireReleaseChecks(JSON.parse(process.env.CONSUMER_JOBS));
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const commit = git('rev-parse', 'HEAD');
    assert.equal(commit, process.env.GITHUB_SHA);
    const evidence = validationEvidence(event, process.env, {
      commit,
      tree: git('rev-parse', 'HEAD^{tree}'),
      // Log/rev-list hide parents at checkout's depth-one shallow boundary.
      // The raw commit object retains the real merge parents.
      parents: [...git('cat-file', '-p', 'HEAD').matchAll(/^parent ([a-f0-9]{40})$/gm)].map(
        (match) => match[1],
      ),
    });
    writeFileSync(target, JSON.stringify(evidence, null, 2) + '\n');
  } else if (command === 'plan') {
    const pending = readdirSync('.changeset').some(
      (name) => name.endsWith('.md') && name !== 'README.md',
    );
    const api = githubAPI();
    const mode = await releaseMode(pending, api, process.env);
    appendFileSync(process.env.GITHUB_OUTPUT, `mode=${mode}\n`);
    console.log(`Release mode: ${mode}`);
  } else if (command === 'verify-site-review') {
    const { verifySiteBundle } = await import('./site-release.mjs');
    const snapshot = await verifySiteBundle(target, process.argv[4]);
    assert.equal(snapshot.plan.siteRelease.mode, 'published');
    await verifySiteReview(githubAPI(), {
      repository: process.env.GITHUB_REPOSITORY,
      sourceCommit: snapshot.plan.sourceCommit,
      snapshotSha256: process.argv[4],
      commentId: process.argv[5],
    });
  } else if (command === 'verify') {
    await verifyCurrentPublication();
  } else throw new Error('Expected stamp, plan, verify or verify-site-review');
}
