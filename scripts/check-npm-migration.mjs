import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { getBlocks, sourceArchive } from '../packages/blocks/scripts/catalog.mjs';
import { corepackSpawnTarget } from './corepack.mjs';

// Local tarballs and a localhost registry only; this never publishes or deploys.
const [targetArgument, candidateArgument] = process.argv.slice(2);
assert.ok(
  targetArgument && candidateArgument,
  'Expected new consumer directory and tarball directory',
);
const target = resolve(targetArgument);
const candidate = resolve(candidateArgument);
await mkdir(target); // Refuse to overwrite any existing consumer.
const run = promisify(execFile);
await writeFile(
  resolve(target, 'package.json'),
  JSON.stringify({
    private: true,
    type: 'module',
    packageManager: 'pnpm@11.18.0',
    dependencies: {
      '@veli-design/react': `file:${candidate}/ui.tgz`,
      '@veli-design/tokens': `file:${candidate}/tokens.tgz`,
      '@veli-design/cli': `file:${candidate}/cli.tgz`,
      react: '19.2.6',
      'react-dom': '19.2.6',
      tailwindcss: '4.1.17',
    },
  }),
);
await writeFile(resolve(target, 'pnpm-workspace.yaml'), 'minimumReleaseAge: 1440\n');
const invocation = corepackSpawnTarget(['pnpm', 'install']);
await run(invocation.command, invocation.args, { cwd: target, ...invocation.options });
await run(
  process.execPath,
  [
    '--input-type=module',
    '-e',
    `
  import assert from 'node:assert/strict';
  import fs from 'node:fs';
  import {createRequire} from 'node:module';
  import React from 'react';
  import {renderToString} from 'react-dom/server';
  import {Button} from '@veli-design/react/button';
  const require=createRequire(import.meta.url);
  assert.match(renderToString(React.createElement(Button,null,'Migration')),/Migration/);
  const css=fs.readFileSync(require.resolve('@veli-design/tokens/css'),'utf8');
  assert.match(css,/--veli-/);
  const theme=fs.readFileSync(require.resolve('@veli-design/tokens/tailwind'),'utf8');
  const {compile}=require('tailwindcss');
  const compiler=await compile(theme.replace("@import './tokens.css';",'')+'\\n@tailwind utilities;');
  assert.match(compiler.build(['bg-surface-base']),/bg-surface-base/);
  assert.ok(require.resolve('@veli-design/react/tailwind').includes('node_modules'));
`,
  ],
  { cwd: target },
);
const executable = resolve(target, 'node_modules/.bin/veli');
assert.match((await run(executable, ['--help'], { cwd: target })).stdout, /Veli|veli/);
const provenance = { sourceCommit: 'a'.repeat(40), dirty: false };
const blocks = getBlocks();
const archives = new Map(
  blocks.map((block) => [block.manifest.id, sourceArchive(block, provenance)]),
);
const server = createServer((request, response) => {
  if (request.url === '/api/blocks/v1/catalog.json') {
    response.setHeader('content-type', 'application/json');
    response.end(
      JSON.stringify({
        schemaVersion: 1,
        blocks: blocks.map(({ manifest }) => ({
          manifest,
          documentationUrl: `/blocks/${manifest.id}/`,
          versions: [
            {
              version: manifest.version,
              sourceCommit: provenance.sourceCommit,
              archiveUrl: `/archives/${manifest.id}`,
              archiveSha256: createHash('sha256').update(archives.get(manifest.id)).digest('hex'),
            },
          ],
        })),
      }),
    );
  } else {
    const bytes = archives.get(request.url?.split('/').pop());
    response.statusCode = bytes ? 200 : 404;
    response.end(bytes);
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
  await run(executable, [
    '--cwd',
    target,
    '--web-url',
    `http://127.0.0.1:${server.address().port}`,
    'init',
  ]);
  for (const { manifest, files } of blocks) {
    await run(executable, ['--cwd', target, '--json', 'add', manifest.id, '--yes', '--no-install']);
    for (const file of files) {
      const source = await readFile(resolve(target, 'components/blocks', manifest.id, file.path));
      const baseline = await readFile(resolve(target, '.veli/blocks', manifest.id, file.path));
      assert.deepEqual(source, file.bytes);
      assert.deepEqual(baseline, file.bytes);
    }
  }
  console.log(
    `Installed React, token CSS/Tailwind, CLI executable and ${blocks.length} copied Blocks passed: ${target}`,
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
