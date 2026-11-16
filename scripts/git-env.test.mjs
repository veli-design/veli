import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { localGitEnv } from './git-env.mjs';

test('foreign Git commands clear hook repository selection without changing transport or caller', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'veli-git-env-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet', root], { env: localGitEnv() });
  const environment = {
    ...process.env,
    GIT_DIR: '/nonexistent/caller/.git',
    GIT_WORK_TREE: '/nonexistent/caller',
    GIT_INDEX_FILE: '/nonexistent/caller/index',
    GIT_SSH_COMMAND: 'ssh -o BatchMode=yes',
  };
  const original = { ...environment };
  const filtered = localGitEnv(environment);
  assert.equal(filtered.GIT_DIR, undefined);
  assert.equal(filtered.GIT_WORK_TREE, undefined);
  assert.equal(filtered.GIT_INDEX_FILE, undefined);
  assert.equal(filtered.GIT_SSH_COMMAND, environment.GIT_SSH_COMMAND);
  assert.equal(
    execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: root,
      env: filtered,
      encoding: 'utf8',
    }).trim(),
    realpathSync(root),
  );
  assert.deepEqual(environment, original);
});
