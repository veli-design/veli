import { readFile, writeFile, mkdir } from 'node:fs/promises';
import {
  root,
  serializeCanonical,
  readJSON,
  normalizedInput,
  generate,
  writeArtifacts,
} from './lib/pipeline.mjs';
const command = process.argv[2] ?? 'build';
if (command === 'sync' || command === 'check') {
  const expected = await serializeCanonical(await normalizedInput());
  const filename = new URL('src/design.tokens.json', root);
  if (command === 'sync') await writeFile(filename, expected);
  else if ((await readFile(filename, 'utf8')) !== expected)
    throw new Error(
      'Canonical tokens are stale. Run corepack pnpm --filter @veli-design/tokens tokens:sync.',
    );
} else if (command === 'playground') {
  const directory = new URL('.cache/playground/', root);
  const result = await generate(await normalizedInput());
  await mkdir(directory, { recursive: true });
  for (const { filename, contents } of result.outputFiles) {
    const target = new URL(filename, directory);
    if ((await readFile(target, 'utf8').catch(() => null)) !== contents)
      await writeFile(target, contents);
  }
} else if (command === 'build') {
  await writeArtifacts(
    new URL('dist/', root),
    await generate(await readJSON('src/design.tokens.json')),
  );
} else throw new Error(`Unknown command: ${command}`);
