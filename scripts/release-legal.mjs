import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Packing is allowed for review; publication must never ship unresolved templates.
export function assertReleaseLegal(root) {
  const documents = [
    'LICENSE',
    'LICENSES/CC-BY-4.0.txt',
    'LICENSING.md',
    'BRAND_POLICY.md',
    'ASSET_LICENSES.md',
    'THIRD_PARTY_NOTICES.md',
    'packaging/LICENSING.md',
  ];
  for (const document of documents) {
    const source = readFileSync(resolve(root, document), 'utf8');
    assert.ok(
      !/TO BE CONFIRMED|\[YEAR\]|draft implementation|draft inventory|engineering draft/i.test(
        source,
      ),
      `${document}: unresolved legal template; confirm rights-holder and artifact scope before publication`,
    );
  }
}
