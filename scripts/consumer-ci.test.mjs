import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { aggregate, candidateManifest, checks, classify } from './consumer-ci.mjs';

const all = { next: true, blocks: true, sites: true, cold: true, candidate: true };
test('shared and transitive package/build dependencies require full coverage', () => {
  for (const path of [
    'packages/react/src/provider.tsx',
    'packages/react/tailwind.css',
    'packages/react/package.json',
    'packages/tokens/src/design.tokens.json',
    'packages/tokens/lib/playground.mjs',
    'packages/tokens/build.mjs',
    'packages/react/tsconfig.build.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'package.json',
    'turbo.json',
    '.npmrc',
    'scripts/corepack.mjs',
    '.github/workflows/ci.yml',
    '.github/actions/consumer-setup/action.yml',
    'unknown/new-build-input.js',
  ])
    assert.deepEqual(classify([path]), all, path);
});
test('known prose skips; executable docs and app build inputs retain their consumers', () => {
  assert.deepEqual(
    classify(['README.md', 'AGENTS.md', 'docs/BLOCKS_VERSIONING.md', '.changeset/fix.md']),
    { next: false, blocks: false, sites: false, cold: false, candidate: false },
  );
  for (const path of [
    'apps/web/src/content/docs/button.mdx',
    'apps/web/src/content/docs/button.md',
    'apps/web/astro.config.mjs',
    'apps/web/src/styles/global.css',
  ])
    assert.deepEqual(classify([path]), {
      next: false,
      blocks: false,
      sites: true,
      cold: true,
      candidate: true,
    });
  for (const path of [
    'packages/blocks/examples/button.tsx',
    'packages/blocks/fixtures/next/package.json',
    'apps/storybook/.storybook/main.ts',
    'apps/storybook/src/button.stories.tsx',
    'apps/storybook/public/font.ttf',
  ])
    assert.deepEqual(classify([path]), {
      next: false,
      blocks: true,
      sites: true,
      cold: true,
      candidate: true,
    });
  assert.deepEqual(classify(['docs/executable.mdx']), all);
  assert.deepEqual(classify(['docs/guide.md', 'packages/react/src/button.tsx']), all);
  assert.deepEqual(classify(['scripts/check-ui-consumer.mjs']), {
    next: true,
    blocks: false,
    sites: false,
    cold: false,
    candidate: true,
  });
  assert.deepEqual(classify(['scripts/verify-playground.mjs']), {
    next: false,
    blocks: false,
    sites: false,
    cold: true,
    candidate: false,
  });
});
const jobKeys = [
  'candidate',
  'next-15',
  'next-16',
  'block-browser',
  'packaged-sites',
  'cold-reload',
];
function jobsFor(selection) {
  const mapping = ['candidate', 'next', 'next', 'blocks', 'sites', 'cold'];
  return Object.fromEntries([
    ['changes', { result: 'success' }],
    ...jobKeys.map((name, i) => [
      name,
      { result: selection[mapping[i]] === 'true' ? 'success' : 'skipped' },
    ]),
  ]);
}
test('aggregation accepts every intentional selection and rejects any failed/cancelled/unexpectedly skipped job', () => {
  for (let mask = 0; mask < 16; mask++) {
    const selection = Object.fromEntries(
      checks.map((key, i) => [key, String(Boolean(mask & (1 << i)))]),
    );
    selection.candidate = String(
      ['next', 'blocks', 'sites'].some((key) => selection[key] === 'true'),
    );
    const jobs = jobsFor(selection);
    aggregate(selection, jobs);
    for (const key of jobKeys)
      for (const result of [
        'failure',
        'cancelled',
        undefined,
        jobs[key].result === 'success' ? 'skipped' : 'success',
      ])
        assert.throws(() => aggregate(selection, { ...jobs, [key]: { result } }), /unexpected/);
    for (const result of ['failure', 'cancelled', 'skipped', undefined])
      assert.throws(() => aggregate(selection, { ...jobs, changes: { result } }), /detection/);
    assert.throws(() => aggregate({ ...selection, cold: '' }, jobs), /Invalid selection/);
  }
});
test('candidate identity includes exact commit and all three immutable tarball digests', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-candidate-test-'));
  try {
    writeFileSync(resolve(directory, 'ui.tgz'), 'ui');
    writeFileSync(resolve(directory, 'tokens.tgz'), 'tokens');
    writeFileSync(resolve(directory, 'cli.tgz'), 'cli');
    const original = candidateManifest(directory, 'a'.repeat(40));
    assert.notDeepEqual(candidateManifest(directory, 'b'.repeat(40)), original);
    writeFileSync(resolve(directory, 'cli.tgz'), 'different');
    assert.notDeepEqual(candidateManifest(directory, 'a'.repeat(40)), original);
    assert.throws(() => candidateManifest(directory, 'main'));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
test('change detection uses merge base and retains deleted and renamed dependency paths', () => {
  const directory = mkdtempSync(resolve(tmpdir(), 'veli-diff-test-'));
  // Hooks export GIT_DIR/GIT_INDEX_FILE; never let a temporary-repository test
  // modify the caller's repository or configuration.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')),
  );
  const git = (...args) =>
    execFileSync('git', args, { cwd: directory, encoding: 'utf8', env }).trim();
  try {
    git('init', '-q');
    git('config', 'user.email', 'ci@example.test');
    git('config', 'user.name', 'CI');
    writeFileSync(resolve(directory, 'README.md'), 'initial');
    git('add', '.');
    git('commit', '-qm', 'base');
    const base = git('rev-parse', 'HEAD');
    git('checkout', '-qb', 'base-advanced');
    writeFileSync(resolve(directory, 'unknown-config'), 'base-only');
    git('add', '.');
    git('commit', '-qm', 'base advanced');
    const advanced = git('rev-parse', 'HEAD');
    git('checkout', '-qb', 'feature', base);
    git('mv', 'README.md', 'CONTRIBUTING.md');
    git('commit', '-qm', 'rename prose');
    const output = resolve(directory, 'outputs');
    const run = () =>
      JSON.parse(
        execFileSync(
          process.execPath,
          [fileURLToPath(new URL('./consumer-ci.mjs', import.meta.url)), 'changes', advanced],
          {
            cwd: directory,
            encoding: 'utf8',
            env: { ...env, GITHUB_OUTPUT: output },
          },
        ),
      );
    const result = run();
    assert.equal(result.base, base);
    assert.deepEqual(result.paths, ['CONTRIBUTING.md', 'README.md']);
    assert.equal(result.selected.candidate, false);
    const feature = git('rev-parse', 'HEAD');
    git('merge', '--no-edit', advanced);
    const fromMergeCheckout = JSON.parse(
      execFileSync(
        process.execPath,
        [
          fileURLToPath(new URL('./consumer-ci.mjs', import.meta.url)),
          'changes',
          advanced,
          feature,
        ],
        { cwd: directory, encoding: 'utf8', env: { ...env, GITHUB_OUTPUT: output } },
      ),
    );
    assert.equal(fromMergeCheckout.base, base);
    assert.deepEqual(fromMergeCheckout.paths, result.paths);
    assert.equal(fromMergeCheckout.selected.candidate, false);
    writeFileSync(resolve(directory, 'pnpm-lock.yaml'), 'lock');
    git('add', 'pnpm-lock.yaml');
    git('commit', '-qm', 'lock');
    git('rm', 'pnpm-lock.yaml');
    git('commit', '-qm', 'remove lock');
    // Compare the deletion to the commit that contained the lockfile.
    const deleted = JSON.parse(
      execFileSync(
        process.execPath,
        [fileURLToPath(new URL('./consumer-ci.mjs', import.meta.url)), 'changes', 'HEAD~1'],
        {
          cwd: directory,
          encoding: 'utf8',
          env: { ...env, GITHUB_OUTPUT: output },
        },
      ),
    );
    assert.deepEqual(deleted.selected, all);
    assert.match(readFileSync(output, 'utf8'), /candidate=true/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('workflow syntax, dependency graph, conditions and unchanged coverage wiring', async () => {
  const { parse } = await import('yaml');
  const workflow = parse(
    readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'),
  );
  const setup = parse(
    readFileSync(new URL('../.github/actions/consumer-setup/action.yml', import.meta.url), 'utf8'),
  );
  assert.equal(workflow.jobs['blocks-consumer'].name, 'Published-package block consumer');
  assert.equal(workflow.jobs['blocks-consumer'].if, 'always()');
  assert.deepEqual(workflow.jobs['blocks-consumer'].needs, ['changes', ...jobKeys]);
  assert.equal(workflow.concurrency['cancel-in-progress'], true);
  assert.match(workflow.concurrency.group, /pull_request.number/);
  assert.equal(setup.runs.using, 'composite');
  for (const [job, check] of Object.entries({
    candidate: 'candidate',
    'next-15': 'next',
    'next-16': 'next',
    'block-browser': 'blocks',
    'packaged-sites': 'sites',
    'cold-reload': 'cold',
  })) {
    assert.equal(workflow.jobs[job].if, `needs.changes.outputs.${check} == 'true'`);
    assert.ok([workflow.jobs[job].needs].flat().includes('changes'));
  }
  assert.deepEqual(workflow.jobs['cold-reload'].needs, 'changes');
  const browser = readFileSync(
    new URL('../packages/blocks/fixtures/next/playwright.config.ts', import.meta.url),
    'utf8',
  );
  assert.match(browser, /workers: 1/);
  assert.match(browser, /name: 'firefox'/);
  assert.match(browser, /name: 'webkit'/);
  const candidate = workflow.jobs.candidate.steps.find(
    (step) => step.uses === 'actions/upload-artifact@v4',
  );
  const download = setup.runs.steps.find((step) => step.uses === 'actions/download-artifact@v4');
  assert.equal(download.with['artifact-ids'], '${{ inputs.candidate-artifact-id }}');
  // By-ID downloads otherwise nest even a single artifact beneath its name.
  assert.equal(download.with['merge-multiple'], true);
  assert.equal(
    workflow.jobs.candidate.outputs['artifact-id'],
    '${{ steps.upload.outputs.artifact-id }}',
  );
  assert.match(candidate.with.name, /github.sha/);
  assert.match(candidate.with.name, /github.run_attempt/);
  assert.ok(setup.runs.steps.some((step) => step.run?.includes('consumer-ci.mjs verify')));
});
