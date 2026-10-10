import { readFileSync } from 'node:fs';
import { configFor } from './lib/pipeline.mjs';
export default configFor(
  JSON.parse(readFileSync(new URL('./src/design.tokens.json', import.meta.url), 'utf8')),
);
