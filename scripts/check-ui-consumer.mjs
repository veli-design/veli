import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';
import { setTimeout } from 'node:timers/promises';

const [directory, tarball, nextVersion = '15.5.18'] = process.argv.slice(2);
assert.ok(
  directory && tarball,
  'Usage: node scripts/check-ui-consumer.mjs <new-directory> <ui-tarball> [next-version]',
);
const target = resolve(directory);
assert.ok(!existsSync(target), 'Use a new directory for an isolated package consumer');
cpSync(fileURLToPath(new URL('../packages/ui/fixtures/next/', import.meta.url)), target, {
  recursive: true,
});
cpSync(resolve(tarball), resolve(target, 'ui.tgz'));
const manifestPath = resolve(target, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.dependencies.next = nextVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' };
function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('corepack', ['pnpm', ...args], { cwd: target, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`pnpm ${args.join(' ')} exited ${code}`)),
    );
  });
}
await run(['install', '--ignore-scripts']);
await run(['exec', 'vitest', 'run']);
await run([
  'exec',
  'next',
  'build',
  ...(Number(nextVersion.split('.')[0]) >= 16 ? ['--webpack'] : []),
]);
const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const server = spawn('corepack', ['pnpm', 'exec', 'next', 'start', '-p', String(port)], {
  cwd: target,
  env,
  stdio: 'inherit',
});
let serverError;
server.on('error', (error) => {
  serverError = error;
});
try {
  let response;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) throw new Error(`Next server exited ${server.exitCode}`);
    try {
      response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1000) });
      break;
    } catch {
      await setTimeout(250);
    }
  }
  assert.ok(response, 'Next server did not start');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Veli ESM probe/);
  assert.match(html, /Name/);
  assert.match(html, /Password/);
  console.log(
    `Next ${nextVersion} Pages SSR and Vitest passed without Veli transpilation, inlining, aliases or mocks.`,
  );
} finally {
  server.kill('SIGTERM');
  if (server.exitCode === null) await new Promise((resolve) => server.once('exit', resolve));
}
