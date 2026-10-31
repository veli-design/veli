import { spawn } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const agentDir = fileURLToPath(new URL('.', import.meta.url));
const repoDir = fileURLToPath(new URL('../..', import.meta.url));
const fixtureTemplate = path.join(agentDir, 'fixture');
const conditions = new Set(['baseline', 'discovery', 'metadata']);

function quoteArg(arg) {
  return /[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg;
}

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn([command, ...args].map(quoteArg).join(' '), {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited ${code}`)),
    );
  });
}

async function packWorkspacePackage(packageDir, outFile) {
  const packDir = mkdtempSync(path.join(tmpdir(), 'veli-eval-out-'));
  try {
    await run('corepack', ['pnpm', 'pack', '--pack-destination', packDir], packageDir);
    const packed = readdirSync(packDir).find((name) => name.endsWith('.tgz'));
    if (!packed) {
      throw new Error(`pnpm pack produced no tarball in ${packDir}`);
    }
    mkdirSync(path.dirname(outFile), { recursive: true });
    cpSync(path.join(packDir, packed), outFile);
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

async function stripAgentDocsFromTarball(tarballPath) {
  const tarballDir = path.dirname(tarballPath);
  const extractDir = path.join(tarballDir, '.strip-tmp');
  const outName = 'veli-ui.stripped.tgz';
  rmSync(extractDir, { recursive: true, force: true });
  mkdirSync(extractDir, { recursive: true });
  try {
    await run('tar', ['-xzf', path.basename(tarballPath), '-C', '.strip-tmp'], tarballDir);
    const packageRoot = path.join(extractDir, 'package');
    for (const relative of ['agent', 'AGENT_GUIDE.md']) {
      rmSync(path.join(packageRoot, relative), { recursive: true, force: true });
    }
    const manifestPath = path.join(packageRoot, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.files = (manifest.files ?? []).filter(
      (entry) => !['agent', 'AGENT_GUIDE.md'].includes(entry),
    );
    if (manifest.exports?.['./manifest']) {
      delete manifest.exports['./manifest'];
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await run('tar', ['-czf', outName, '-C', '.strip-tmp', 'package'], tarballDir);
    cpSync(path.join(tarballDir, outName), tarballPath);
    rmSync(path.join(tarballDir, outName), { force: true });
  } finally {
    rmSync(extractDir, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
const bare = args.includes('--bare');
const [condition, targetArg] = args.filter((arg) => arg !== '--bare');
if (!condition || !targetArg || !conditions.has(condition)) {
  console.error(
    'Usage: node evals/agent/prepare.mjs <baseline|discovery|metadata> <target-dir> [--bare]',
  );
  process.exit(1);
}

const target = path.resolve(targetArg);
if (existsSync(target)) {
  console.error(`Target already exists: ${target}`);
  process.exit(1);
}

await run('corepack', ['pnpm', '--filter', '@veli-design/tokens', 'build'], repoDir);
await run('corepack', ['pnpm', '--filter', '@veli-design/react', 'build'], repoDir);

mkdirSync(target, { recursive: true });
cpSync(fixtureTemplate, target, {
  recursive: true,
  filter: (source) => path.basename(source) !== 'vendor',
});
mkdirSync(path.join(target, 'vendor'), { recursive: true });

const uiTarball = path.join(target, 'vendor/veli-ui.tgz');
const tokensTarball = path.join(target, 'vendor/veli-tokens.tgz');
await packWorkspacePackage(path.join(repoDir, 'packages/react'), uiTarball);
await packWorkspacePackage(path.join(repoDir, 'packages/tokens'), tokensTarball);

if (condition === 'baseline') {
  await stripAgentDocsFromTarball(uiTarball);
}

if (bare) {
  const manifestPath = path.join(target, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  delete manifest.dependencies['@veli-design/react'];
  delete manifest.dependencies['@veli-design/tokens'];
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(target, 'src/styles.css'), "@import 'tailwindcss';\n");
}

await run('corepack', ['pnpm', 'install'], target);

writeFileSync(
  path.join(target, 'eval-condition.json'),
  `${JSON.stringify({ condition, bare, preparedAt: new Date().toISOString() }, null, 2)}\n`,
);

console.log(`Prepared ${bare ? 'bare ' : ''}${condition} fixture at ${target}`);
