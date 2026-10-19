import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const checks = ['next', 'blocks', 'sites', 'cold'];
export function classify(paths) {
  const selected = Object.fromEntries(checks.map((check) => [check, false]));
  const include = (names = checks) => names.forEach((name) => (selected[name] = true));
  for (const path of paths) {
    // Only known contributor prose is inert. MDX and all app content can execute code.
    if (
      /^(?:docs\/.*\.md|(?:README|CONTRIBUTING|AGENTS|CODE_OF_CONDUCT|SECURITY|LICENSE)(?:\.md)?|\.changeset\/[^/]+\.md)$/.test(
        path,
      )
    )
      continue;
    if (/^packages\/(ui|tokens)\//.test(path)) include();
    else if (/^packages\/blocks\//.test(path)) include(['blocks', 'sites', 'cold']);
    else if (/^apps\/storybook\//.test(path)) include(['blocks', 'sites', 'cold']);
    else if (/^apps\/web\//.test(path)) include(['sites', 'cold']);
    else if (path === 'scripts/check-ui-consumer.mjs') include(['next']);
    else if (path === 'scripts/release-sites.mjs') include(['sites']);
    else if (/^scripts\/(check|verify)-playground\.mjs$/.test(path)) include(['cold']);
    // Unknown paths, shared tooling, metadata, lockfiles and build configs fail open.
    else include();
  }
  return { ...selected, candidate: selected.next || selected.blocks || selected.sites };
}

export function aggregate(selection, jobs) {
  assert.equal(jobs.changes?.result, 'success', 'Change detection must succeed');
  for (const key of [...checks, 'candidate'])
    assert.ok(['true', 'false'].includes(selection[key]), `Invalid selection: ${key}`);
  const required = {
    candidate: selection.candidate,
    'next-15': selection.next,
    'next-16': selection.next,
    'block-browser': selection.blocks,
    'packaged-sites': selection.sites,
    'cold-reload': selection.cold,
  };
  for (const [job, enabled] of Object.entries(required)) {
    const result = jobs[job]?.result;
    assert.equal(
      result,
      enabled === 'true' ? 'success' : 'skipped',
      `${job}: unexpected ${result}`,
    );
  }
}

export function candidateManifest(directory, sha) {
  assert.match(sha, /^[a-f0-9]{40}$/);
  return {
    sha,
    hashes: Object.fromEntries(
      ['ui.tgz', 'tokens.tgz'].map((file) => [
        file,
        createHash('sha256')
          .update(readFileSync(resolve(directory, file)))
          .digest('hex'),
      ]),
    ),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, target] = process.argv.slice(2);
  if (command === 'changes') {
    // Diff both names for renames/deletions. Never use the moving base branch tip as the diff base.
    const base = execFileSync('git', ['merge-base', target, 'HEAD'], { encoding: 'utf8' }).trim();
    const paths = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', base, 'HEAD'], {
      encoding: 'utf8',
    })
      .split('\0')
      .filter(Boolean);
    const selected = classify(paths);
    for (const [key, value] of Object.entries(selected))
      appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    console.log(JSON.stringify({ base, paths, selected }, null, 2));
  } else if (command === 'aggregate') {
    const jobs = JSON.parse(process.env.CONSUMER_JOBS);
    aggregate(jobs.changes?.outputs ?? {}, jobs);
    console.log('All selected consumer checks passed; all other checks intentionally skipped.');
  } else if (command === 'stamp' || command === 'verify') {
    const manifest = candidateManifest(target, process.env.GITHUB_SHA);
    const filename = resolve(target, 'candidate.json');
    if (command === 'stamp') writeFileSync(filename, JSON.stringify(manifest, null, 2) + '\n');
    else
      assert.deepEqual(
        JSON.parse(readFileSync(filename, 'utf8')),
        manifest,
        'Candidate SHA or tarball digest mismatch',
      );
  } else throw new Error('Expected changes, aggregate, stamp or verify');
}
