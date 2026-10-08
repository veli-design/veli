import { spawn } from 'node:child_process';
import { rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const servers = [];
const moved = [];
async function ready(url) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (
      await fetch(url, { signal: AbortSignal.timeout(2000) })
        .then((r) => r.ok)
        .catch(() => false)
    )
      return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Playground did not start: ${url}`);
}
try {
  // Prove cold source development with no pre-existing package build outputs.
  await mkdir(`${root}/.cache/playground-check`, { recursive: true });
  for (const name of ['ui', 'tokens']) {
    const source = `${root}/packages/${name}/dist`;
    const backup = `${root}/.cache/playground-check/${name}`;
    await rename(source, backup);
    moved.push([source, backup]);
  }
  for (const [name, args] of [
    ['veli-web', ['--host', '127.0.0.1', '--port', '4322']],
    ['veli-storybook', ['--host', '127.0.0.1', '--port', '6007', '--ci']],
  ])
    servers.push(
      spawn('corepack', ['pnpm', '--filter', `@tradenetcorp/${name}`, 'dev', ...args], {
        cwd: root,
        stdio: 'inherit',
        detached: true,
      }),
    );
  await Promise.all([
    ready('http://127.0.0.1:4322/docs/button/'),
    ready('http://127.0.0.1:6007/index.json'),
  ]);
  const probe = spawn(process.execPath, ['scripts/verify-playground.mjs', process.argv[2]], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      VELI_DOCS_URL: 'http://127.0.0.1:4322/docs/button/',
      VELI_STORYBOOK_URL:
        'http://127.0.0.1:6007/iframe.html?id=components-button--playground&viewMode=story',
    },
  });
  const status = await new Promise((resolve) => probe.on('exit', resolve));
  if (status !== 0) throw new Error('Cold playground regression failed');
} finally {
  for (const server of servers) {
    try {
      process.kill(-server.pid, 'SIGTERM');
    } catch {
      // The server may have already exited.
    }
  }
  for (const [source, backup] of moved) await rename(backup, source);
}
