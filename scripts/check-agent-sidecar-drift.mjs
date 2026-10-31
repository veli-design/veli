import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir = fileURLToPath(new URL('..', import.meta.url));
const baseRef = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : process.argv[2] || 'origin/main';

function listChangedFiles() {
  const againstBase = spawnSync(
    'git',
    [
      'diff',
      '--name-only',
      `${baseRef}...HEAD`,
      '--',
      'packages/react/src',
      'packages/react/agent/components',
    ],
    { cwd: repoDir, encoding: 'utf8' },
  );
  if (againstBase.status === 0 && againstBase.stdout.trim()) {
    return againstBase.stdout.trim().split(/\r?\n/).filter(Boolean);
  }

  const againstWorktree = spawnSync(
    'git',
    ['diff', '--name-only', 'HEAD', '--', 'packages/react/src', 'packages/react/agent/components'],
    { cwd: repoDir, encoding: 'utf8' },
  );
  if (againstWorktree.status !== 0) {
    console.error(againstWorktree.stderr || 'Unable to list changed UI files');
    process.exit(1);
  }
  return againstWorktree.stdout.trim().split(/\r?\n/).filter(Boolean);
}

const changed = listChangedFiles();
const changedSrcIds = new Set();
const changedSidecarIds = new Set();

for (const filePath of changed) {
  const normalized = filePath.replaceAll('\\', '/');
  const srcMatch = normalized.match(/^packages\/react\/src\/([a-z0-9-]+)\.tsx$/);
  if (srcMatch) changedSrcIds.add(srcMatch[1]);
  const sidecarMatch = normalized.match(/^packages\/react\/agent\/components\/([a-z0-9-]+)\.json$/);
  if (sidecarMatch) changedSidecarIds.add(sidecarMatch[1]);
}

const missing = [...changedSrcIds].filter((id) => {
  const sidecarPath = path.join(repoDir, 'packages/react/agent/components', `${id}.json`);
  return existsSync(sidecarPath) && !changedSidecarIds.has(id);
});

if (missing.length === 0) {
  console.log('Agent sidecar drift check: no unmatched component source changes.');
  process.exit(0);
}

console.warn('Agent sidecar drift warning:');
for (const id of missing) {
  console.warn(
    `- packages/react/src/${id}.tsx changed without packages/react/agent/components/${id}.json`,
  );
}
console.warn(
  'Update the sidecar when public API or agent guidance changed. Soft warning only; does not fail CI.',
);
process.exit(0);
