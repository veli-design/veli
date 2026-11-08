// Coordinate authenticated main releases; none of the read-only commands publish.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { githubAPI, isReleasePR, verifyCurrentPublication } from './release-ci.mjs';
import { spawnSyncCorepack } from './corepack.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const sha = /^[a-f0-9]{40}$/;
const targets = {
  '@veli-design/react': 'react',
  '@veli-design/tokens': 'tokens',
  '@veli-design/cli': 'cli',
};
export async function preparationFreshness(api, source) {
  assert.match(source, sha);
  const main = (await api('/git/ref/heads/main')).object.sha;
  assert.match(main, sha);
  return { fresh: main === source, catchup: main !== source, main };
}
async function pages(api, path) {
  const result = [];
  for (let page = 1; page <= 20; page++) {
    const items = await api(`${path}&per_page=100&page=${page}`);
    assert.ok(Array.isArray(items));
    result.push(...items);
    if (items.length < 100) return result;
  }
  throw new Error('Incomplete merged-release history');
}
export async function latestMergedRelease(api, repository, main, readGit = git) {
  const rank = new Map(
    readGit('rev-list', '--first-parent', main)
      .split('\n')
      .map((value, index) => [value, index]),
  );
  const owner = repository.split('/')[0];
  const prs = await pages(
    api,
    `/pulls?state=closed&base=main&head=${encodeURIComponent(owner + ':changeset-release/main')}`,
  );
  const releases = prs.filter(
    (pr) => isReleasePR(pr, repository) && pr.merged_at && rank.has(pr.merge_commit_sha),
  );
  releases.sort((a, b) => rank.get(a.merge_commit_sha) - rank.get(b.merge_commit_sha));
  assert.ok(releases.length, 'No authenticated merged release in current main history');
  return releases[0].merge_commit_sha;
}
export async function assertMonotonicPublication(versions, tag, request = fetch) {
  assert.match(tag ?? '', /^[a-z][a-z0-9-]*$/);
  assert.deepEqual(Object.keys(versions).sort(), Object.keys(targets).sort());
  const { default: semver } = await import('semver');
  for (const [name, desired] of Object.entries(versions)) {
    assert.ok(semver.valid(desired));
    const response = await request(`https://registry.npmjs.org/${name}`, {
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: { Accept: 'application/vnd.npm.install-v1+json' },
    });
    assert.equal(response.status, 200, `${name}: cannot establish current public dist-tag`);
    const metadata = await response.json();
    assert.equal(metadata.name, name);
    const active = metadata['dist-tags']?.[tag];
    if (active) {
      assert.ok(semver.valid(active), `${name}: invalid active dist-tag`);
      assert.ok(
        !semver.lt(desired, active),
        `${name}: refuse dist-tag regression ${active} -> ${desired}`,
      );
    }
  }
}
export async function releaseTagCommit(api, tag) {
  assert.match(tag, /^[A-Za-z0-9@_][A-Za-z0-9@._/-]*$/);
  let object = (await api(`/git/ref/tags/${encodeURIComponent(tag)}`)).object;
  for (let depth = 0; object?.type === 'tag' && depth < 5; depth++) {
    assert.match(object.sha, sha);
    object = (await api(`/git/tags/${object.sha}`)).object;
  }
  assert.equal(object?.type, 'commit', 'Tag must resolve to an immutable commit');
  assert.match(object.sha, sha);
  return object.sha;
}
export async function newestPublicationRelease(api, releases, source, readGit = git) {
  const rank = new Map(
    readGit('rev-list', '--first-parent', source)
      .split('\n')
      .map((commit, index) => [commit, index]),
  );
  let selected = null;
  for (const release of releases) {
    const commit = await releaseTagCommit(api, release.tag_name);
    if (!rank.has(commit)) continue;
    if (!selected || rank.get(commit) < rank.get(selected.commit))
      selected = { ...release, commit };
  }
  assert.ok(selected, 'No publication belongs to the selected main history');
  return selected;
}
async function verifySelected(source) {
  assert.match(source ?? '', sha);
  assert.equal(git('rev-parse', 'HEAD'), source);
  assert.equal(
    git('status', '--porcelain', '--untracked-files=all'),
    '',
    'Publication checkout must be clean',
  );
  assert.equal(
    readdirSync('.changeset').some((name) => name.endsWith('.md') && name !== 'README.md'),
    false,
    'Selected release still has pending Changesets',
  );
  await verifyCurrentPublication({ ...process.env, GITHUB_SHA: source });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command] = process.argv.slice(2);
  if (command === 'prepare-check') {
    const state = await preparationFreshness(githubAPI(), process.env.GITHUB_SHA);
    for (const [key, value] of Object.entries(state))
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    console.log(JSON.stringify(state));
  } else if (command === 'publication-source') {
    const api = githubAPI();
    const main = (await api('/git/ref/heads/main')).object.sha;
    assert.match(main, sha);
    assert.match(process.env.GITHUB_SHA, sha);
    git('fetch', '--no-tags', 'origin', main);
    git('merge-base', '--is-ancestor', process.env.GITHUB_SHA, main);
    const source = await latestMergedRelease(api, process.env.GITHUB_REPOSITORY, main);
    appendFileSync(process.env.GITHUB_OUTPUT, `source=${source}\n`);
    appendFileSync(process.env.GITHUB_ENV, `RELEASE_SOURCE=${source}\n`);
  } else if (command === 'verify-selected') {
    await verifySelected(process.env.RELEASE_SOURCE);
  } else if (command === 'publish') {
    const source = process.env.RELEASE_SOURCE;
    await verifySelected(source);
    const versions = Object.fromEntries(
      Object.entries(targets).map(([name, directory]) => [
        name,
        JSON.parse(readFileSync(`packages/${directory}/package.json`)).version,
      ]),
    );
    await assertMonotonicPublication(versions, process.env.VELI_NPM_DIST_TAG);
    const result = spawnSyncCorepack(['pnpm', 'release'], {
      stdio: 'inherit',
      env: { ...process.env, GITHUB_SHA: source },
    });
    assert.equal(result.status, 0, 'Validated publication command failed');
  } else throw new Error('Expected prepare-check, publication-source, verify-selected or publish');
}
