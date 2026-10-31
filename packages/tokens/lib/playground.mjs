import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const run = promisify(execFile);
const root = new URL('../', import.meta.url);

/** Shared by Astro and Storybook; development never requires package builds. */
export default function tokenPlayground() {
  const directory = new URL('.cache/playground/', root);
  const sourceUI = fileURLToPath(new URL('../react/src/', root));
  const inputs = ['src/figma.tokens.json', 'src/design.tokens.json', 'src/motion.tokens.json'].map(
    (name) => fileURLToPath(new URL(name, root)),
  );
  async function regenerate() {
    // Keep the token compiler in native Node, outside Vite/Storybook config loaders.
    await run(process.execPath, [fileURLToPath(new URL('build.mjs', root)), 'playground']);
  }
  return {
    name: 'veli-token-playground',
    apply: /** @type {const} */ ('serve'),
    async config() {
      await regenerate();
      return {
        resolve: {
          alias: [
            {
              find: /^@veli-design\/tokens(?:\/tailwind)?$/,
              replacement: fileURLToPath(new URL('tailwind-theme.css', directory)),
            },
            {
              find: '@veli-design/tokens/css',
              replacement: fileURLToPath(new URL('tokens.css', directory)),
            },
            { find: /^@veli-design\/react\/(?!tailwind$)(.+)$/, replacement: `${sourceUI}$1` },
          ],
        },
        server: { fs: { allow: [fileURLToPath(new URL('../../', root))] } },
      };
    },
    configureServer(server) {
      server.watcher.add(inputs);
      let pending = Promise.resolve();
      const update = (filename) => {
        if (!inputs.includes(filename)) return;
        pending = pending.then(async () => {
          try {
            await regenerate();
          } catch (error) {
            server.ws.send({
              type: 'error',
              err: { message: error.message, stack: error.stack, plugin: 'veli-token-playground' },
            });
          }
        });
      };
      server.watcher.on('change', update);
      server.httpServer?.once('close', () => server.watcher.off('change', update));
    },
  };
}
