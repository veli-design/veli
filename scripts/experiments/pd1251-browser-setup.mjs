import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

const mode = process.argv[2];
assert.ok(['baseline', 'container'].includes(mode));
const image =
  'mcr.microsoft.com/playwright:v1.58.2-noble@sha256:65cefd09a5e943921ecd3a6e5414c603db2eb161e9eb48f2e2ccc63486dc7dc0';
const fixture = JSON.parse(readFileSync('packages/blocks/fixtures/next/package.json', 'utf8'));
assert.equal(fixture.devDependencies['@playwright/test'], '1.58.2');
assert.equal(fixture.packageManager, 'pnpm@11.18.0');
assert.equal(process.arch, 'x64');
const root = join(process.env.RUNNER_TEMP, 'pd1251-browser-runtime');
const results = join(process.env.RUNNER_TEMP, 'pd1251-browser-results');
const probe = resolve('scripts/experiments/pd1251-browser-probe.mjs');
mkdirSync(root);
mkdirSync(results);
writeFileSync(
  join(root, 'package.json'),
  JSON.stringify({
    private: true,
    packageManager: fixture.packageManager,
    devDependencies: { '@playwright/test': '1.58.2' },
  }),
);
const report = {
  mode,
  image: mode === 'container' ? image : null,
  node: process.version,
  architecture: process.arch,
  os: readFileSync('/etc/os-release', 'utf8'),
  started: new Date().toISOString(),
  phases: [],
  note: 'Provisioning/launch sample, not the Veli browser regression suite. No workspace outputs or browser cache restored.',
};
const persist = () =>
  writeFileSync(join(results, 'timings.json'), JSON.stringify(report, null, 2) + '\n');
function measure(name, seconds, command, args, options = {}) {
  const phase = {
    name,
    started: new Date().toISOString(),
    status: 'running',
    boundSeconds: seconds,
  };
  report.phases.push(phase);
  persist();
  console.log(`Starting ${name}; bound ${seconds}s`);
  const start = performance.now();
  const child = spawnSync('timeout', ['--kill-after=10s', `${seconds}s`, command, ...args], {
    cwd: root,
    env: process.env,
    stdio: 'inherit',
    ...options,
  });
  phase.seconds = (performance.now() - start) / 1000;
  phase.exitCode = child.status;
  phase.status = child.status === 0 && !child.error ? 'success' : 'failed';
  persist();
  assert.equal(phase.status, 'success', `${name} failed or exceeded its bound`);
}
try {
  // The same pinned package install and host Node binary are used in both jobs.
  // The container includes browsers/OS libraries, not the Playwright npm package.
  measure('package-install-no-cache-restore', 60, 'corepack', [
    'pnpm',
    'install',
    '--ignore-scripts',
  ]);
  if (mode === 'baseline') {
    const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: join(root, 'browsers') };
    measure(
      'cold-os-and-browser-install',
      300,
      'corepack',
      ['pnpm', 'exec', 'playwright', 'install', '--with-deps', 'chromium', 'firefox', 'webkit'],
      { env },
    );
    measure(
      'cold-launch-three-browsers',
      30,
      process.execPath,
      [probe, root, join(results, 'cold-probe.json')],
      { env },
    );
    measure(
      'warm-os-and-browser-install',
      90,
      'corepack',
      ['pnpm', 'exec', 'playwright', 'install', '--with-deps', 'chromium', 'firefox', 'webkit'],
      { env },
    );
    measure(
      'warm-launch-three-browsers',
      30,
      process.execPath,
      [probe, root, join(results, 'warm-probe.json')],
      { env },
    );
  } else {
    report.imagePresentBeforePull =
      spawnSync('docker', ['image', 'inspect', image], { stdio: 'ignore' }).status === 0;
    persist();
    measure('cold-image-pull-and-extraction', 300, 'docker', [
      'pull',
      '--platform=linux/amd64',
      image,
    ]);
    const launch = (phase) =>
      measure(`${phase}-container-start-and-three-browser-launch`, 30, 'docker', [
        'run',
        '--rm',
        '--init',
        '--ipc=host',
        '--network=none',
        '--platform=linux/amd64',
        '-v',
        `${root}:/experiment:ro`,
        '-v',
        `${probe}:/probe.mjs:ro`,
        '-v',
        `${process.execPath}:/node24:ro`,
        '-v',
        `${results}:/results`,
        '-e',
        'PLAYWRIGHT_BROWSERS_PATH=/ms-playwright',
        image,
        '/node24',
        '/probe.mjs',
        '/experiment',
        `/results/${phase}-probe.json`,
      ]);
    launch('cold');
    measure('warm-image-pull', 45, 'docker', ['pull', '--platform=linux/amd64', image]);
    launch('warm');
    report.imageSizeBytes = Number(
      spawnSync('docker', ['image', 'inspect', image, '--format={{.Size}}'], {
        encoding: 'utf8',
      }).stdout.trim(),
    );
  }
} finally {
  report.finished = new Date().toISOString();
  persist();
  const rows = report.phases
    .map(
      (phase) =>
        `| ${phase.name} | ${phase.seconds?.toFixed(2) ?? 'incomplete'} | ${phase.status} |`,
    )
    .join('\n');
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Browser provisioning: ${mode}\n\n| Phase | Seconds | Result |\n| --- | ---: | --- |\n${rows}\n\nIncludes package install, pull/extract and browser launch. Warm phases reuse this job's OS/browser/image state only. Full job times include Actions setup and artifact overhead.\n`,
  );
}
