import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { spawnCorepack } from './corepack.mjs';

export async function withLocalSitePreviews({ root, configRoot = root, evidence }, action) {
  await mkdir(evidence, { recursive: true });
  const children = [];
  async function stop() {
    for (const child of children) {
      if (child.exitCode !== null || child.signalCode !== null || !child.pid) continue;
      try {
        if (process.platform === 'win32') child.kill();
        else process.kill(-child.pid, 'SIGTERM');
      } catch (error) {
        if (error.code !== 'ESRCH') throw error;
      }
    }
    await Promise.all(
      children.map(async (child) => {
        if (child.exitCode !== null || child.signalCode !== null || !child.pid) return;
        let timer;
        const ended = await Promise.race([
          new Promise((resolve) => child.once('exit', () => resolve(true))),
          new Promise((resolve) => {
            timer = setTimeout(() => resolve(false), 5000);
          }),
        ]);
        clearTimeout(timer);
        if (!ended && child.exitCode === null && child.signalCode === null) {
          try {
            if (process.platform === 'win32') child.kill('SIGKILL');
            else process.kill(-child.pid, 'SIGKILL');
          } catch (error) {
            if (error.code !== 'ESRCH') throw error;
          }
        }
      }),
    );
  }
  async function ready(url, child) {
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      if (child.startError) throw child.startError;
      assert.equal(child.signalCode, null, `Local Wrangler was signalled: ${url}`);
      assert.equal(child.exitCode, null, `Local Wrangler exited: ${url}`);
      if (
        await fetch(url, { signal: AbortSignal.timeout(2000) })
          .then((r) => r.ok)
          .catch(() => false)
      )
        return;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`Local preview did not start: ${url}`);
  }
  async function portAvailable(port) {
    const server = createServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
    await new Promise((resolve) => server.close(resolve));
  }

  const interrupt = async () => {
    await stop();
    process.exit(130);
  };
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, interrupt);
  try {
    for (const [app, port, inspector] of [
      ['web', 8787, 9237],
      ['storybook', 8788, 9238],
    ]) {
      await portAvailable(port);
      await portAvailable(inspector);
      const config = await readFile(resolve(configRoot, 'apps', app, 'wrangler.jsonc'), 'utf8');
      assert.ok(config.includes('"assets"'), `Missing static assets configuration: ${app}`);
      const child = spawnCorepack(
        [
          'pnpm',
          '--filter',
          `@tradenetcorp/veli-${app}`,
          'exec',
          'wrangler',
          'dev',
          '--config',
          resolve(configRoot, 'apps', app, 'wrangler.jsonc'),
          '--local',
          '--ip',
          '127.0.0.1',
          '--port',
          String(port),
          '--inspector-port',
          String(inspector),
          '--persist-to',
          resolve(evidence, `state-${app}`),
          '--show-interactive-dev-session=false',
        ],
        {
          cwd: root,
          stdio: 'inherit',
          detached: process.platform !== 'win32',
          env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
        },
      );
      child.once('error', (error) => {
        child.startError = error;
      });
      children.push(child);
      await ready(`http://127.0.0.1:${port}/`, child);
    }

    return await action({
      web: 'http://127.0.0.1:8787',
      storybook: 'http://127.0.0.1:8788',
      run: async (script, args, env = process.env) => {
        const child = spawn(process.execPath, [script, ...args], {
          cwd: root,
          stdio: 'inherit',
          env,
          detached: process.platform !== 'win32',
        });
        children.push(child);
        return await new Promise((resolve, reject) => {
          child.once('error', reject);
          child.once('exit', resolve);
        });
      },
    });
  } finally {
    for (const signal of ['SIGINT', 'SIGTERM']) process.removeListener(signal, interrupt);
    await stop();
  }
}
