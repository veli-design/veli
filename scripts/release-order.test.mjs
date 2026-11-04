import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { parse } from 'yaml';
import {
  preparationFreshness,
  latestMergedRelease,
  assertMonotonicPublication,
  newestPublicationRelease,
} from './release-order.mjs';
const repository = 'veli-design/veli';
function fixture(t) {
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-release-order-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const source = resolve(directory, 'source');
  mkdirSync(source);
  const run = (cmd, args, cwd = source) =>
    execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const git = (...args) => run('git', args);
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Fixture');
  git('config', 'user.email', 'fixture@example.invalid');
  const write = (path, value) => {
    mkdirSync(dirname(resolve(source, path)), { recursive: true });
    writeFileSync(resolve(source, path), value);
  };
  const commit = (message) => {
    git('add', '.');
    git('commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  };
  return { directory, source, run, git, write, commit };
}
test('actual Changesets preparation: newer B survives a delayed A; an advance during preparation queues catch-up', async (t) => {
  const f = fixture(t);
  const remote = resolve(f.directory, 'remote.git');
  f.run('git', ['init', '--bare', '-q', remote], f.directory);
  f.git('remote', 'add', 'origin', remote);
  f.write(
    'package.json',
    JSON.stringify({ name: 'fixture', private: true, packageManager: 'pnpm@11.18.0' }),
  );
  f.write('pnpm-workspace.yaml', 'packages:\n - packages/*\n');
  f.write(
    '.changeset/config.json',
    JSON.stringify({
      changelog: false,
      commit: false,
      fixed: [],
      linked: [],
      access: 'public',
      baseBranch: 'main',
      updateInternalDependencies: 'patch',
      ignore: [],
    }),
  );
  for (const name of ['react', 'tokens', 'cli'])
    f.write(
      `packages/${name}/package.json`,
      JSON.stringify({ name: `@veli-design/${name}`, version: '1.0.0' }),
    );
  f.commit('baseline');
  const add = (name) =>
    f.write(
      `.changeset/${name}.md`,
      `---\n"@veli-design/${name}": patch\n---\n\n### Fixed\n\n- Update ${name}.\n`,
    );
  add('react');
  const a = f.commit('React A');
  add('tokens');
  const b = f.commit('Tokens B');
  f.git('push', '-q', 'origin', 'main');
  const api = async () => ({
    object: { sha: f.run('git', ['--git-dir', remote, 'rev-parse', 'main'], f.directory) },
  });
  const prepare = async (source) => {
    const status = await preparationFreshness(api, source);
    if (!status.fresh) return status;
    // Same reset/version/push sequence as changesets/action, guarded BEFORE reset.
    f.git('checkout', '-B', 'changeset-release/main', source);
    f.run(process.execPath, [resolve('node_modules/@changesets/cli/bin.js'), 'version']);
    f.commit('chore: release packages');
    f.git('push', '-q', 'origin', 'HEAD:changeset-release/main', '--force');
    return status;
  };
  assert.equal((await prepare(b)).fresh, true);
  const prepared = f.git('rev-parse', 'HEAD');
  assert.deepEqual(await prepare(a), { fresh: false, catchup: true, main: b });
  assert.equal(
    f.run('git', ['--git-dir', remote, 'rev-parse', 'changeset-release/main'], f.directory),
    prepared,
  );
  assert.equal(
    JSON.parse(f.git('show', `${prepared}:packages/tokens/package.json`)).version,
    '1.0.1',
  );
  f.git('checkout', 'main');
  add('cli');
  const c = f.commit('CLI C');
  f.git('push', '-q', 'origin', 'main');
  assert.equal((await preparationFreshness(api, b)).catchup, true);
  assert.equal((await prepare(c)).fresh, true);
  assert.equal(JSON.parse(f.git('show', 'HEAD:packages/cli/package.json')).version, '1.0.1');
  assert.equal(
    f.git('ls-tree', '-r', '--name-only', 'HEAD', '.changeset'),
    '.changeset/config.json',
  );
});
function release(source, extra = {}) {
  return {
    user: { login: 'github-actions[bot]' },
    merged_at: 'now',
    merge_commit_sha: source,
    head: { ref: 'changeset-release/main', repo: { full_name: repository } },
    base: { ref: 'main', repo: { full_name: repository } },
    ...extra,
  };
}
test('shared publisher selects latest merged main release even when the triggering event is older', async (t) => {
  const f = fixture(t);
  f.write('state', 'base');
  f.commit('base');
  f.write('state', 'R1');
  const r1 = f.commit('R1');
  f.write('state', 'R2');
  const r2 = f.commit('R2');
  f.write('site', 'ordinary successor');
  const main = f.commit('ordinary main');
  const prs = [
    release(r1),
    release(r2),
    release(main, { user: { login: 'human' } }),
    release('a'.repeat(40)),
  ];
  assert.equal(await latestMergedRelease(async () => prs, repository, main, f.git), r2);
});
test('dist-tag guard rejects old publication, bad metadata and failed anonymous reads', async () => {
  const versions = {
    '@veli-design/react': '1.2.0',
    '@veli-design/tokens': '1.1.0',
    '@veli-design/cli': '1.0.0',
  };
  const request =
    (active, status = 200) =>
    async (url, options) => {
      assert.equal(options.headers.Authorization, undefined);
      const name = url.replace('https://registry.npmjs.org/', '');
      return {
        status,
        json: async () => ({ name, 'dist-tags': { latest: active[name] ?? versions[name] } }),
      };
    };
  await assertMonotonicPublication(versions, 'latest', request({}));
  await assertMonotonicPublication(versions, 'latest', request({ '@veli-design/react': '1.1.0' }));
  await assert.rejects(
    assertMonotonicPublication(versions, 'latest', request({ '@veli-design/react': '1.3.0' })),
    /refuse dist-tag regression/,
  );
  await assert.rejects(
    assertMonotonicPublication(versions, 'latest', request({}, 503)),
    /cannot establish/,
  );
});
test('publication baseline follows Git ancestry, not later release creation timestamps', async (t) => {
  const f = fixture(t);
  f.write('state', 'old');
  const old = f.commit('old');
  f.write('state', 'new');
  const newer = f.commit('new');
  const releases = [
    { tag_name: 'react@1.0.1', published_at: '2099-01-01' },
    { tag_name: 'react@1.0.2', published_at: '2020-01-01' },
  ];
  const api = async (path) => ({
    object: { type: 'commit', sha: decodeURIComponent(path).endsWith('1.0.2') ? newer : old },
  });
  assert.equal(
    (await newestPublicationRelease(api, releases, newer, f.git)).tag_name,
    'react@1.0.2',
  );
  assert.equal((await newestPublicationRelease(api, releases, old, f.git)).tag_name, 'react@1.0.1');
});
test('workflow locks and privilege boundaries prevent stale writes and retagging wrong event commits', () => {
  const prep = parse(readFileSync('.github/workflows/prepare-release.yml', 'utf8'));
  assert.equal(prep.jobs.prepare.permissions.actions, undefined);
  assert.deepEqual(prep.jobs.catchup.permissions, { actions: 'write', contents: 'read' });
  const action = prep.jobs.prepare.steps.find((s) => s.uses === 'changesets/action@v1');
  assert.equal(action.if, "steps.before.outputs.fresh == 'true'");
  assert.equal(action.with.publish, undefined);
  assert.match(prep.jobs.catchup.steps[0].with.script, /createWorkflowDispatch/);
  const publisher = parse(readFileSync('.github/workflows/release.yml', 'utf8')).jobs.release;
  assert.equal(publisher.concurrency, 'Release-Publish');
  const select = publisher.steps.findIndex((s) => s.id === 'source');
  const checkout = publisher.steps.findIndex(
    (s) => s.with?.ref === '${{ steps.source.outputs.source }}',
  );
  const publish = publisher.steps.find((s) => s.uses === 'changesets/action@v1');
  assert.ok(select < checkout);
  assert.equal(publish.env.RELEASE_SOURCE, '${{ steps.source.outputs.source }}');
  assert.equal(
    publisher.steps.find((s) => s.run === 'node scripts/release-order.mjs verify-selected').env
      .RELEASE_SOURCE,
    '${{ steps.source.outputs.source }}',
  );
  assert.equal(
    publisher.steps.find((s) => s.name === 'Record published release snapshot').env.RELEASE_SOURCE,
    '${{ steps.source.outputs.source }}',
  );
  assert.equal(publish.with.commitMode, 'git-cli');
  assert.equal(publish.with.publish, 'node scripts/release-order.mjs publish');
});
